# 🚀 Getting Started with Equipment Rental Platform

## 🎯 Quick Start (15 minutes)

### Prerequisites
- Node.js v14+ (`node -v`)
- npm or yarn (`npm -v`)
- MongoDB (local or Atlas cloud)

---

## 📋 Step 1: Verify Your Setup

```bash
cd /Users/yummesh/Desktop/dominodahsboard

# Run verification script
chmod +x verify-setup.sh
./verify-setup.sh
```

---

## 🗄️ Step 2: Setup MongoDB

**Choose ONE option:**

### Option A: Local MongoDB (Recommended)
```bash
# Install (if needed)
brew tap mongodb/brew
brew install mongodb-community

# Start
brew services start mongodb-community

# Verify
brew services list | grep mongo  # Should show 'started'
```

### Option B: MongoDB Atlas (Cloud - Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free account)
3. Create cluster (free M0 tier)
4. Add user: `testuser` / `testpass123`
5. Get connection string
6. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://testuser:testpass123@equipment-rental.mongodb.net/equipment-rental?retryWrites=true&w=majority
   ```
7. Add your IP to network access

**See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions**

---

## 🔧 Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

---

## 🚀 Step 4: Start the Application

### Terminal 1: Backend API
```bash
cd backend
npm start

# Should log:
# Server running on port 5001
# MongoDB connected
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev

# Should log:
# Local: http://localhost:3000/
```

### Terminal 3: Test API (Optional)
```bash
# Check if API is responding
curl http://localhost:5001/

# Output:
# {"message":"Equipment Rental API"}
```

---

## ✨ Step 5: Test Authentication

### Via UI (Recommended)
1. Open http://localhost:3000/
2. Click "Register" in navbar
3. Fill form:
   - Name: Your Name
   - Email: your@example.com
   - Phone: 555-1234
   - Role: Renter
   - Password: testpass123
4. Click "Register"
5. Should redirect to home page
6. Navbar should show authenticated links

### Via API (Testing)
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"testpass123",
    "phone":"555-1234",
    "role":"user"
  }'

# Response: { "token": "...", "user": { ... } }

# Login with same email/password
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"testpass123"
  }'
```

---

## 📚 Explore Features

### Available Pages
- **Home** - `http://localhost:3000/`
- **Browse Equipment** - `http://localhost:3000/browse`
- **Register** - `http://localhost:3000/register`
- **Login** - `http://localhost:3000/login`
- **Profile** - `http://localhost:3000/profile` (after login)
- **My Bookings** - `http://localhost:3000/bookings` (after login)
- **List Equipment** - `http://localhost:3000/list-equipment` (after login)
- **Admin Dashboard** - `http://localhost:3000/admin` (admin only)

### Test Admin Dashboard
1. Register as admin (change role in database or via API)
2. Navigate to `/admin` to see dashboard

---

## 🛠️ Common Tasks

### Stop Servers
```bash
# Backend: Press Ctrl+C in backend terminal
# Frontend: Press Ctrl+C in frontend terminal

# Stop MongoDB
brew services stop mongodb-community
```

### Restart Everything
```bash
# Backend
brew services restart mongodb-community

# Kill any running processes
pkill -f "node server.js"
pkill -f "vite"

# Start fresh
# (follow Step 4 above)
```

### Clear All Data
```bash
# Access MongoDB
mongosh  # or: mongo

# In MongoDB shell
use equipment-rental
db.dropDatabase()
exit
```

### View Backend Logs
```bash
# Backend is already running in Terminal 1
# All console.log output appears there

# To view MongoDB logs
tail -f /usr/local/var/log/mongodb/mongo.log
```

---

## 🔍 Debugging

### 500 Error on Register/Login
**Cause:** MongoDB not connected
**Fix:** 
- Ensure MongoDB is running: `brew services list`
- Check MongoDB connection string in `backend/.env`
- Restart backend: `npm start`

### Cannot Connect to http://localhost:3000
**Cause:** Frontend not running or wrong port
**Fix:**
- Check frontend terminal for errors
- Verify port 3000 is free: `lsof -i :3000`
- Restart frontend: `npm run dev`

### Port Already in Use
```bash
# Find what's using the port
lsof -i :5001  # backend
lsof -i :3000  # frontend

# Kill the process
kill -9 <PID>
```

### "Cannot find module" errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Documentation

- **[MONGODB_SETUP.md](./MONGODB_SETUP.md)** - Complete MongoDB setup guide
- **[AUTH_TROUBLESHOOTING.md](./AUTH_TROUBLESHOOTING.md)** - Authentication issues
- **[backend/README.md](./backend/README.md)** - Backend API documentation
- **[frontend/README.md](./frontend/README.md)** - Frontend architecture

---

## 🎮 Features to Try

1. **Browse Equipment** - See all available equipment
2. **Search & Filter** - Find equipment by category, price, location
3. **Equipment Details** - View full details and reviews
4. **User Profile** - Edit profile and view booking history
5. **Make Booking** - Book equipment for specific dates
6. **My Bookings** - View active and completed bookings
7. **List Equipment** - Add your own equipment to rent
8. **Admin Dashboard** - Manage all bookings and equipment

---

## 🚨 Troubleshooting Checklist

- [ ] Node.js installed (`node -v`)
- [ ] npm installed (`npm -v`)
- [ ] MongoDB running locally or MongoDB Atlas configured
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Backend running on port 5001 (`npm start` in backend folder)
- [ ] Frontend running on port 3000 (`npm run dev` in frontend folder)
- [ ] Can visit http://localhost:3000
- [ ] Can register/login
- [ ] Redux DevTools shows correct state
- [ ] Token appears in localStorage

---

## 📞 Still Need Help?

1. **Check log output** - See what errors are displayed in terminals
2. **Run verify script** - `./verify-setup.sh`
3. **Read documentation** - Check files listed under "Documentation"
4. **Check browser console** - Open DevTools (F12) and check Console tab
5. **Check Redux state** - Install Redux DevTools extension

---

## ✅ Success Indicators

You're all set when:
- ✅ Both backend and frontend running without errors
- ✅ Can open http://localhost:3000
- ✅ Can register and login
- ✅ Dashboard shows stats and data
- ✅ Can see authenticated navbar

---

## 🎉 Next Steps

After successful setup:
1. Explore different pages and features
2. Create test equipment listings
3. Make test bookings
4. Check admin dashboard
5. Review Redux store state
6. Customize styles and features
7. Connect to real database (production setup)

**Happy coding! 🚀**
