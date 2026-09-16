const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@rento.com' });
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Email: admin@rento.com');
      console.log('Password: Admin@123');
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // Create admin user
    const admin = new User({
      name: 'Admin',
      email: 'admin@rento.com',
      password: hashedPassword,
      phone: '9876543210',
      role: 'Admin',
      isActive: true,
    });

    await admin.save();

    console.log('✅ Admin account created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: admin@rento.com');
    console.log('Password: Admin@123');
    console.log('\n⚠️  Please change the password after first login!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
