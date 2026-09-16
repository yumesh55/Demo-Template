# MongoDB IP Whitelist Setup Guide

## Your Current IP: `61.2.54.237`

---

## ✅ LOCAL DEVELOPMENT - MongoDB Atlas Setup

### Step 1: Add IP to MongoDB Atlas Whitelist

1. Go to **https://cloud.mongodb.com/** and login
2. Select your project (`equipment-rental` or similar)
3. In left sidebar → **Security** → **Network Access**
4. Click **+ Add IP Address**
5. Enter your IP: **`61.2.54.237`**
6. (Optional) Add description: "Local Development Machine"
7. Click **Confirm**
8. Wait 1-2 minutes for update to take effect

### Step 2: Verify Connection

```bash
cd backend
npm start
```

You should see:
```
Server running on port 5001
MongoDB connected ✅
```

---

## 🔒 PRODUCTION SETUP - Two Options

### Option A: Static Production IP (Recommended for stable servers)

**If you have a fixed production server IP:**

1. Get your production server's public IP
2. Add to MongoDB Atlas whitelist (same steps as above)
3. Use same connection string in production `.env`

**In your production server's `.env`:**
```
MONGODB_URI=mongodb+srv://yumeshjayasutha_db_user:yumesh%401234@domino-dashboard.5ojaljo.mongodb.net/domino_dashboard
```

---

### Option B: Allow All IPs (Easiest for cloud deployment)

**If deploying to cloud (Heroku, AWS, DigitalOcean, etc.):**

1. Go to **Network Access** in MongoDB Atlas
2. Click **+ Add IP Address**
3. Enter: **`0.0.0.0/0`** (allows all IPs)
4. ⚠️ **WARNING**: Less secure, only for development or trusted networks
5. Click **Confirm**

**Use same connection string:**
```
MONGODB_URI=mongodb+srv://yumeshjayasutha_db_user:yumesh%401234@domino-dashboard.5ojaljo.mongodb.net/domino_dashboard
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Pushing to Production:

- [ ] Add production server IP to Atlas whitelist
- [ ] Update `.env` variables in production server
  ```bash
  MONGODB_URI=your_connection_string
  JWT_SECRET=strong_secret_key
  PORT=5001
  NODE_ENV=production
  ```

- [ ] Test connection from production server:
  ```bash
  cd backend
  npm install --production
  npm start
  ```

- [ ] Monitor logs for connection issues:
  ```bash
  tail -f logs/server.log
  ```

---

## 📝 MongoDB Atlas Connection String Format

**Your current connection string:**
```
mongodb+srv://yumeshjayasutha_db_user:yumesh%401234@domino-dashboard.5ojaljo.mongodb.net/domino_dashboard
```

**Components:**
- `yumeshjayasutha_db_user` - Database username
- `yumesh%401234` - Password (URL encoded: `@` = `%40`)
- `domino-dashboard.5ojaljo.mongodb.net` - Cluster name
- `domino_dashboard` - Database name

---

## 🔧 Troubleshooting Connection Issues

### Error: "Could not connect to any servers in your MongoDB Atlas cluster"

**Solutions (in order):**

1. **Check IP is whitelisted:**
   - Go to MongoDB Atlas → Network Access
   - Verify your IP appears in the list
   - If not → Add it

2. **Check connection string is correct:**
   ```bash
   # Verify in your .env file
   cat backend/.env | grep MONGODB_URI
   ```

3. **Check password doesn't have special characters:**
   - If it does, URL encode it
   - Example: `@` → `%40`, `:` → `%3A`

4. **Check database credentials:**
   - Username: `yumeshjayasutha_db_user`
   - Password: Should match what you set in Atlas
   - Go to Atlas → Security → Database Access to verify

5. **Test connection directly:**
   ```bash
   # Use mongosh (MongoDB shell)
   mongosh "mongodb+srv://yumeshjayasutha_db_user:yumesh%401234@domino-dashboard.5ojaljo.mongodb.net/domino_dashboard"
   ```

---

## 📋 Production Deployment Steps (Example - AWS EC2)

### 1. Get Production Server IP
```bash
# On your production server
curl https://api.ipify.org
# Example output: 3.45.67.89
```

### 2. Add to MongoDB Atlas
- Go to MongoDB Atlas → Network Access
- Add IP: `3.45.67.89`

### 3. Deploy Backend
```bash
# On production server
cd backend
npm install
npm start  # or use PM2/systemd for auto-restart
```

### 4. Verify Connection
```bash
# Should see:
# Server running on port 5001
# MongoDB connected ✅
```

---

## 🛡️ Security Best Practices

1. **Production:**
   - ❌ Never use `0.0.0.0/0` for long-term production
   - ✅ Use specific IP whitelisting
   - ✅ Rotate credentials regularly
   - ✅ Use strong JWT_SECRET

2. **Credentials:**
   - ❌ Never commit `.env` to git
   - ✅ Use `.gitignore` for `.env`
   - ✅ Store secrets in environment variables only

3. **Monitoring:**
   - Set up MongoDB Atlas alerts
   - Monitor connection logs
   - Track failed authentication attempts

---

## 📞 Quick Reference

| Scenario | Action |
|----------|--------|
| Local dev | Whitelist your IP: `61.2.54.237` |
| Production (fixed IP) | Whitelist prod IP |
| Production (cloud) | Whitelist `0.0.0.0/0` (less secure) |
| Connection fails | Check IP whitelisted + test with mongosh |
| Change password | Update in Atlas + update `.env` |

---

## ✅ Current Status

- ✅ Local IP identified: `61.2.54.237`
- ⏳ Next: Add to MongoDB Atlas whitelist
- ⏳ Then: Restart backend and test
