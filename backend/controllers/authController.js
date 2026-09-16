const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'Staff',
    });

    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = (username || email || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    let user = await User.findOne({
      $or: [{ email: loginIdentifier }, { name: loginIdentifier }],
    });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Check if user account is locked
    if (user.isLocked && user.lockedUntil && new Date() < user.lockedUntil) {
      const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60); // minutes
      return res.status(403).json({ 
        error: `Account is locked. Try again in ${remainingTime} minute(s).` 
      });
    }

    // Unlock account if lock period has expired
    if (user.isLocked && user.lockedUntil && new Date() >= user.lockedUntil) {
      user.isLocked = false;
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;

      // Lock account after 3 failed attempts
      if (user.failedLoginAttempts >= 3) {
        user.isLocked = true;
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        await user.save();
        return res.status(403).json({ 
          error: 'Account locked due to 3 failed login attempts. Try again after 30 minutes.' 
        });
      }

      await user.save();
      return res.status(400).json({ 
        error: `Invalid credentials. ${3 - user.failedLoginAttempts} attempt(s) remaining before account lock.` 
      });
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockedUntil = null;
    await user.save();

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
