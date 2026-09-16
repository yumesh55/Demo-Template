# 🗄️ MongoDB Setup Guide

## Issue: 500 Internal Server Error - MongoDB Not Connected

Your API is returning **500 errors** because **MongoDB is not running** or not accessible.

## ✅ Solution: Choose One Option

### Option 1: Install MongoDB Locally (Recommended for Development)
---

#### **On macOS with Homebrew:**

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running
brew services list | grep mongo
# Should show: mongodb-community ... started

# Test connection
mongosh --eval "db.adminCommand('ping')"
# Should return: { ok: 1 }
# (Note: use 'mongosh' not 'mongo' for newer MongoDB versions)

# Stop MongoDB when done
brew services stop mongodb-community
```

#### **Manual MongoDB startup (macOS):**

```bash
# Create data directory
mkdir -p /Users/$(whoami)/mongodb-data

# Run mongod manually
mongod --dbpath /Users/$(whoami)/mongodb-data --port 27017

# In another terminal, test connection
mongosh
> db.adminCommand('ping')
```

---

### Option 2: MongoDB Atlas (Cloud - Free Tier)
---

Best if you don't want to install locally.

#### **Step 1: Create Free Account**
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" or "Sign In"
3. Create account with email/password or use Google/GitHub

#### **Step 2: Create Free Cluster**
1. Click "Create" → Choose free tier (M0 - free forever)
2. Name: `equipment-rental`
3. Region: Select closest to you (N. Virginia, Ireland, Singapore, etc.)
4. Click "Create Cluster" - wait 5-10 minutes

#### **Step 3: Create Database User**
1. In left sidebar: "Security" → "Database Access"
2. Click "Add New Database User"
3. Username: `testuser`
4. Password: `testpass123`
5. Built-in Role: `readWriteAnyDatabase`
6. Click "Add User"

#### **Step 4: Get Connection String**
1. Go to "Database" → "Databases"
2. Click "Connect" on your cluster
3. Choose "Application Code"
4. Copy the connection string (MongoDB Drivers)
5. Replace `<password>` with your password: `testpass123`

Connection string format:
```
mongodb+srv://testuser:testpass123@equipment-rental.mongodb.net/equipment-rental?retryWrites=true&w=majority
```

#### **Step 5: Update Backend .env**
```bash
# Edit backend/.env
MONGODB_URI=mongodb+srv://testuser:testpass123@equipment-rental.mongodb.net/equipment-rental?retryWrites=true&w=majority
```

#### **Step 6: Whitelist IP Address**
1. In Atlas: "Security" → "Network Access"
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (for development)
   - Or add your specific IP
4. Click "Add Entry"

---

### Option 3: Docker (Alternative)
---

If you have Docker installed:

```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Stop when done
docker stop mongodb

# Remove container
docker rm mongodb
```

Then update `.env`:
```
MONGODB_URI=mongodb://localhost:27017/equipment-rental
```

---

## ✅ Verify MongoDB Connection

### Test 1: MongoDB Direct Connection
```bash
# For local MongoDB
mongosh
> use equipment-rental
> db.users.find()
# Should return empty array: []
```

### Test 2: Your API
```bash
# Start backend
cd backend
npm start

# In another terminal, register user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"testpass123",
    "phone":"555-1234",
    "role":"user"
  }'

# Should return: token and user object (no error)
```

---

## 📋 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:27017"
**Problem:** MongoDB not running locally
**Solution:** 
- macOS: `brew services start mongodb-community`
- Verify with: `brew services list`

### Error: "querySrv ENOTFOUND _mongodb._tcp..."
**Problem:** Invalid MongoDB Atlas connection string
**Solution:**
- Copy exact string from MongoDB Atlas dashboard
- Ensure password is URL-encoded (special chars: `%40` for @, etc.)
- Check IP whitelist in Atlas Network Access

### Error: "authentication failed"
**Problem:** Wrong username/password
**Solution:**
- Verify credentials in MongoDB Atlas "Database Access"
- Ensure password matches (it's case-sensitive)
- Reset password if forgotten

### Timeout: "Operation `users.findOne()` buffering timed out"
**Problem:** MongoDB connection lost
**Solution:**
- Check MongoDB is running: `brew services list`
- Restart MongoDB: `brew services restart mongodb-community`
- Check firewall settings

---

## 🚀 Quickest Setup (5 Minutes)

**If you want to get running in 5 minutes:**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create free cluster (M0)
4. Add Database User: `testuser` / `testpass123`
5. Get connection string, update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://testuser:testpass123@equipment-rental.mongodb.net/equipment-rental?retryWrites=true&w=majority
   ```
6. Add IP to whitelist
7. Start backend: `cd backend && npm start`
8. Test API: `curl http://localhost:5001/`

Done! ✅

---

## 📊 Current Backend Status

After setting up MongoDB:

```bash
# Tab 1: Start Backend
cd backend
npm start
# Should log: "Server running on port 5001"
# And: "MongoDB connected"

# Tab 2: Start Frontend
cd frontend
npm run dev
# Should log: "Local: http://localhost:3000/"

# Tab 3: Test Registration
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Your Name",
    "email":"you@example.com",
    "password":"yourpass123",
    "phone":"555-1234",
    "role":"user"
  }'
```

---

## ✨ Next Steps After MongoDB Works

1. ✅ Register new user via API or UI
2. ✅ Login to app at http://localhost:3000/login
3. ✅ Access dashboard features
4. ✅ Create equipment listings
5. ✅ Make bookings

---

## 💡 Pro Tips

- **Keep MongoDB running** while developing
- **Use MongoDB Compass** (free GUI) to view database
  ```bash
  # Install: https://www.mongodb.com/products/compass
  # Connect: mongodb://localhost:27017
  ```

- **View logs:**
  ```bash
  # Show MongoDB logs (if using brew)
  brew --prefix mongodb-community  # shows install path
  tail -f /usr/local/var/log/mongodb/mongo.log
  ```

- **Reset database** (delete all data):
  ```bash
  mongosh
  > use equipment-rental
  > db.dropDatabase()
  > exit
  ```
