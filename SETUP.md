# SETUP.md - Equipment Rental Platform Setup Guide

## 🎯 Quick Setup (5 minutes)

### Step 1: Prerequisites Check
Ensure you have:
- ✅ Node.js v14 or higher (`node -v`)
- ✅ npm or yarn (`npm -v`)
- ✅ MongoDB running locally or MongoDB Atlas account

### Step 2: Install Dependencies

```bash
# Option A: Using the setup script (macOS/Linux)
chmod +x setup.sh
./setup.sh

# Option B: Manual setup
# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### Step 3: Configure Environment

Backend `.env` is already set up with defaults:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/equipment-rental
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

**If using MongoDB Atlas (Cloud):**
Edit `backend/.env` and change:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/equipment-rental
```

### Step 4: Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew services start mongodb-community

# Windows
# Run mongod.exe from Program Files

# Linux
sudo service mongod start
```

**Option B: MongoDB Atlas (Cloud)**
- No action needed, already configured in `.env`

### Step 5: Start the Application

**Terminal 1 - Backend**
```bash
cd backend
npm run dev
```
Backend will be available at: `http://localhost:5000`

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```
Frontend will be available at: `http://localhost:3000`

### Step 6: Access the Application
Open your browser and go to: **http://localhost:3000**

## 🧪 Test the Application

### Create Test Account
1. Go to http://localhost:3000
2. Click "Register"
3. Fill in the form:
   - Name: John Doe
   - Email: john@test.com
   - Password: test123456
   - Account Type: Choose Renter or Owner
4. Click Register

### Test Features
- **Browse Equipment**: Go to Browse page to see featured items
- **List Equipment**: If you're an owner, go to "List Equipment" to add items
- **Make Booking**: Click on any equipment and book it
- **Manage Bookings**: View your bookings in "My Bookings"

## 📁 File Locations Reference

### Important Configuration Files
- `backend/.env` - Backend environment variables
- `backend/server.js` - Express server entry point
- `frontend/vite.config.js` - Vite configuration (proxies to backend)
- `frontend/src/services/api.js` - All API calls

### Key Directories
- `backend/models/` - Database schemas
- `backend/routes/` - API endpoints
- `backend/controllers/` - Business logic
- `frontend/src/pages/` - Page components
- `frontend/src/components/` - Reusable components
- `frontend/src/store/` - Redux state management

## 🔍 Debugging & Troubleshooting

### MongoDB Not Connecting
```bash
# Check if MongoDB is running
# macOS: brew services list
# Windows: Check Services or Task Manager
# Linux: sudo service mongod status

# If not running, start it
# macOS: brew services start mongodb-community
```

### Port Already in Use
```bash
# Backend - Change port in .env or use:
npm run dev -- --port 5001

# Frontend - Change port in vite.config.js or use:
npm run dev -- --port 3001
```

### Node Modules Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Clear Browser Cache
- Open DevTools (F12)
- Right-click refresh button → "Empty cache and hard refresh"
- Or press: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

## 📊 API Testing

### Using REST Client (VS Code Extension)
Install "REST Client" extension, then create test.rest:
```
### Register User
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "user"
}

### Login
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

### Get Equipment
GET http://localhost:5000/api/equipment
```

### Using Postman
1. Download Postman from postman.com
2. Import the API collection
3. Set environment base URL to http://localhost:5000
4. Test endpoints

## 🎓 Development Workflow

### Making Changes

**Frontend Changes:**
- Files auto-reload with Vite HMR
- Check browser console for errors
- Redux DevTools (browser extension) for state debugging

**Backend Changes:**
- Nodemon auto-restarts server
- Check terminal for errors
- Test API endpoints with Postman

### Adding New Features

**New Database Entity:**
1. Create model in `backend/models/Entity.js`
2. Create controller in `backend/controllers/entityController.js`
3. Create route in `backend/routes/entity.js`
4. Add route to `backend/server.js`

**New Frontend Page:**
1. Create component in `frontend/src/pages/NewPage.jsx`
2. Add route in `frontend/src/App.jsx`
3. Add navigation link in `frontend/src/components/Navbar.jsx`

## 🚀 Production Deployment

### Backend (Heroku/Render)
1. Add `Procfile`: `web: node server.js`
2. Set production environment variables
3. Use MongoDB Atlas (cloud database)
4. Deploy to Heroku or Render

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist` folder
3. Set backend API URL in environment
4. Auto-deploy from Git

## 📚 Next Steps

1. **Explore the codebase** - Start with README.md files
2. **Modify features** - Try adding new equipment categories
3. **Customize styling** - Update colors in CSS files
4. **Add authentication** - Implement email verification
5. **Deploy** - Put your app on the internet

## 📞 Common Commands

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev             # Start with auto-reload
npm start               # Start production server

# Frontend  
cd frontend
npm install              # Install dependencies
npm run dev             # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
mongod                  # Start MongoDB locally
```

## ✅ Verification Checklist

- [ ] Node.js installed and running
- [ ] MongoDB running (local or cloud)
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can create an account
- [ ] Can browse equipment
- [ ] No errors in browser console
- [ ] No errors in terminal

## 🎉 You're All Set!

Your Equipment Rental Platform is now ready for development and testing. Happy coding!

For issues, check the main README.md or specific README files in backend/frontend folders.
