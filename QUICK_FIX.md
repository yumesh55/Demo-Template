# ⚡ Quick Reference Card

## 🔴 Problem
```
POST http://localhost:5001/api/auth/register 500 (Internal Server Error)
```

## ✅ Solution: Start MongoDB

### Option A: Local MongoDB (Terminal 1)
```bash
brew tap mongodb/brew && brew install mongodb-community
brew services start mongodb-community
```

### Option B: MongoDB Atlas (Cloud - Free)
1. https://www.mongodb.com/cloud/atlas → Sign up
2. Create M0 cluster
3. Add user: `testuser` / `testpass123`
4. Get connection string
5. Update `backend/.env`
6. Add IP to network access

### Option C: Docker
```bash
docker run -d -p 27017:27017 mongo:latest
```

---

## 🚀 Start Application

### Terminal 1: Backend
```bash
cd backend
npm start
# Should see: "Server running on port 5001"
#            "MongoDB connected"
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Should see: "Local: http://localhost:3000/"
```

### Terminal 3: Test
```bash
# Option 1: Test API
curl http://localhost:5001/

# Option 2: Register via API
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test",
    "email":"test@example.com",
    "password":"test123",
    "phone":"555-1234",
    "role":"user"
  }'

# Option 3: Open browser
# http://localhost:3000/ → Register via UI
```

---

## 📋 Checklist

- [ ] Choose MongoDB setup (Local / Atlas / Docker)
- [ ] MongoDB running (verify with: `lsof -i :27017` or MongoDB Atlas dashboard)
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] Can open http://localhost:3000/
- [ ] Can register new user
- [ ] Can login
- [ ] Navbar shows authenticated links

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration (MongoDB URI, JWT_SECRET) |
| `MONGODB_SETUP.md` | Complete MongoDB setup guide |
| `GETTING_STARTED.md` | Full getting started guide |
| `FIX_500_ERROR.md` | This error's detailed explanation |
| `verify-setup.sh` | Automated setup checker |

---

## 🆘 Still Getting 500 Error?

1. **Check MongoDB** - Is it running?
   ```bash
   # Local: brew services list | grep mongo
   # Should show: ✓ running
   
   # Atlas: Check dashboard and connection string
   ```

2. **Check .env** - Is MongoDB URI correct?
   ```bash
   cat backend/.env | grep MONGODB_URI
   ```

3. **Restart backend** - Fresh start often fixes it
   ```bash
   pkill -f "node server.js"
   cd backend && npm start
   ```

4. **Check logs** - What errors appear?
   ```bash
   # Backend terminal should show:
   # "MongoDB connected" ✅
   # Not: "MongoDB connection error" ❌
   ```

5. **Clear data** - Fresh start
   ```bash
   mongosh  # or: mongo
   > use equipment-rental
   > db.dropDatabase()
   > exit
   ```

---

## ✨ Success Signs

- ✅ Backend logs: "Server running on port 5001"
- ✅ Backend logs: "MongoDB connected"
- ✅ Frontend loads at http://localhost:3000
- ✅ Can register without error
- ✅ Redirects to home after register
- ✅ Navbar shows "My Bookings", "Profile", "Logout"

---

## 🔗 Full Documentation

- 📖 **GETTING_STARTED.md** - Complete 15-minute setup guide
- 🗄️ **MONGODB_SETUP.md** - Database setup deep dive
- 🔐 **AUTH_TROUBLESHOOTING.md** - Authentication debugging
- 📝 **FIX_500_ERROR.md** - Detailed error explanation

---

**Choose MongoDB option → Start servers → Done! 🎉**
