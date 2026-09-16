#!/bin/bash

# 🧪 Equipment Rental Platform - Setup Verification Script

echo "======================================"
echo "🧪 Equipment Rental Setup Checker"
echo "======================================"
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "  ✅ Node.js: $NODE_VERSION"
else
    echo "  ❌ Node.js not found - Install from https://nodejs.org/"
    exit 1
fi

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "  ✅ npm: $NPM_VERSION"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Check backend dependencies
echo ""
echo "✓ Checking backend dependencies..."
if [ -d "backend/node_modules" ]; then
    echo "  ✅ Backend packages installed"
else
    echo "  ⚠️  Backend packages not installed"
    echo "    Run: cd backend && npm install"
fi

# Check frontend dependencies
echo ""
echo "✓ Checking frontend dependencies..."
if [ -d "frontend/node_modules" ]; then
    echo "  ✅ Frontend packages installed"
else
    echo "  ⚠️  Frontend packages not installed"
    echo "    Run: cd frontend && npm install"
fi

# Check MongoDB
echo ""
echo "✓ Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo "  ✅ MongoDB installed"
    # Check if running
    if lsof -i :27017 &> /dev/null; then
        echo "  ✅ MongoDB running on port 27017"
    else
        echo "  ⚠️  MongoDB not running"
        echo "    Start with: brew services start mongodb-community"
    fi
else
    echo "  ⚠️  MongoDB not installed locally"
    echo "    Options:"
    echo "    1. Install: brew tap mongodb/brew && brew install mongodb-community"
    echo "    2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
    echo "    3. See MONGODB_SETUP.md for details"
fi

# Check ports
echo ""
echo "✓ Checking ports..."
if ! lsof -i :5001 &> /dev/null; then
    echo "  ✅ Port 5001 available (backend)"
else
    echo "  ❌ Port 5001 in use - Kill process or use different port"
fi

if ! lsof -i :3000 &> /dev/null; then
    echo "  ✅ Port 3000 available (frontend)"
else
    echo "  ❌ Port 3000 in use - Kill process or use different port"
fi

# Check environment files
echo ""
echo "✓ Checking environment files..."
if [ -f "backend/.env" ]; then
    echo "  ✅ backend/.env exists"
else
    echo "  ❌ backend/.env not found"
fi

if [ -f "frontend/.env" ]; then
    echo "  ✅ frontend/.env exists"
else
    echo "  ⚠️  frontend/.env not found (optional)"
fi

# Summary
echo ""
echo "======================================"
echo "✨ Setup Verification Complete"
echo "======================================"
echo ""
echo "📋 Next Steps:"
echo "1. Ensure MongoDB is running (local or MongoDB Atlas)"
echo "2. Start backend:  cd backend && npm start"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Visit: http://localhost:3000"
echo ""
echo "📖 Documentation:"
echo "   - See: MONGODB_SETUP.md - Database setup guide"
echo "   - See: AUTH_TROUBLESHOOTING.md - Authentication guide"
echo "   - See: backend/README.md - Backend documentation"
echo "   - See: frontend/README.md - Frontend documentation"
echo ""
