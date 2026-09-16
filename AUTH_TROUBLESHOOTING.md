# Authentication Troubleshooting Guide

## ✅ Pre-flight Checks

### Backend Server Status
- Port: 5001 ✅
- API responding: `http://localhost:5001/` returns `{"message":"Equipment Rental API"}`

### Frontend Server Status  
- Port: 3000 ✅
- Running Vite dev server

### Environment Setup
- Backend .env: CONFIGURED ✅
  - PORT=5001
  - MONGODB_URI=mongodb://localhost:27017/equipment-rental
  - JWT_SECRET configured
  - NODE_ENV=development

## 🔧 Recent Fixes Applied

### 1. Fixed Redux Auth Actions
- Created `/src/store/actions/authActions.js`
- Implemented proper async thunks with Redux dispatch
- Proper error handling and return values

### 2. Updated Login & Register Pages
- Now using `redux-thunk` for async operations
- Better state management with Redux selectors
- Cleaner error handling

### 3. Enhanced Auth Reducer
- Already supports: AUTH_START, AUTH_SUCCESS, AUTH_FAIL, LOGOUT
- Properly manages loading, error, and authentication states
- Stores token in localStorage

## 🚀 How to Test Authentication

### Option 1: Direct API Test (cURL)
```bash
# Register
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Your Name",
    "email":"yourtest@example.com",
    "password":"testpass123",
    "phone":"1234567890",
    "role":"user"
  }'

# Response should be:
# {
#   "token": "eyJhbGc...",
#   "user": {
#     "id": "...",
#     "name": "Your Name",
#     "email": "yourtest@example.com",
#     "role": "user"
#   }
# }
```

### Option 2: Frontend UI
1. Open `http://localhost:3000/`
2. Click "Register" in navbar
3. Fill in: Name, Email, Password, Phone, Role
4. Click "Register"
5. Should redirect to home page
6. Check navbar - should show "My Bookings", "List Equipment", "Profile", "Logout"

### Option 3: Check Redux State (DevTools)
Install Redux DevTools extension to see state changes:
- auth.isAuthenticated
- auth.user
- auth.token
- auth.loading
- auth.error

## 📋 Common Issues & Solutions

### Issue: "Cannot POST /api/auth/register"
**Cause:** Backend not running or API endpoint not available
**Solution:** 
```bash
cd backend
npm install
node server.js
# Should log: "Server running on port 5001"
```

### Issue: Login button doesn't work or shows "Network Error"
**Cause:** CORS or port mismatch
**Current Configuration:**
- Backend runs on: PORT 5001
- Frontend API calls: http://localhost:5001/api

**Verify in:** `frontend/src/services/api.js`
```javascript
const API_BASE = 'http://localhost:5001/api'  // ✅ Correct
```

### Issue: "MongoDB connection error"
**Cause:** MongoDB not running
**Solution:**
```bash
# Check if mongod is running
brew services start mongodb-community  # macOS
# or start MongoDB manually
```

### Issue: Token not persisting after refresh
**Cause:** localStorage not working correctly
**Solution:**
- Check browser DevTools > Application > Local Storage
- Token should be saved as key "token"
- Value should be JWT string starting with "eyJ..."

## 🔐 Authentication Flow

1. **Register/Login Form Submit**
   - Form data sent to Redux action creator
   - Dispatch AUTH_START action

2. **API Call**
   - axios POST to backend API
   - Backend validates credentials
   - Returns {token, user} object

3. **Redux State Update**
   - AUTH_SUCCESS action dispatched
   - Token saved to localStorage
   - User data stored in Redux
   - isAuthenticated set to true

4. **Navigation**
   - Component detects isAuthenticated=true
   - Redirects to home page
   - Navbar shows authenticated links

5. **Subsequent Requests**
   - Auth service includes token in Authorization header
   - Format: `Authorization: Bearer ${token}`

## 📝 Updated Files

### Created/Modified:
1. ✅ `/frontend/src/store/actions/authActions.js` - NEW
2. ✅ `/frontend/src/pages/Login.jsx` - UPDATED
3. ✅ `/frontend/src/pages/Register.jsx` - UPDATED
4. ✅ `/frontend/src/store/reducers/authReducer.js` - Already correct

## 🧪 Testing Checklist

- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] MongoDB running and accessible
- [ ] Can call API directly: `curl http://localhost:5001/`
- [ ] Register new user via UI
- [ ] Login with registered user
- [ ] Navbar shows authenticated state
- [ ] Token appears in localStorage
- [ ] Redux DevTools shows correct state
- [ ] Can navigate to /profile
- [ ] Logout works correctly

## 🆘 Debug Commands

```bash
# Check if ports are in use
lsof -i :5001  # Backend
lsof -i :3000  # Frontend

# Check MongoDB
brew services list | grep mongo

# View Redux action history
# Open browser DevTools → Redux extension

# Check localStorage
# Browser DevTools → Application → Local Storage → http://localhost:3000
# Look for 'token' key

# Test backend directly
curl -s http://localhost:5001/ | head
```

## 📞 Still Having Issues?

Check the following in order:
1. ✅ Both servers running
2. ✅ Port numbers correct (5001 backend, 3000 frontend)
3. ✅ MongoDB accessible
4. ✅ No CORS errors in browser console
5. ✅ Redux state has correct values
6. ✅ Token in localStorage after login
