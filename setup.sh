#!/bin/bash

# Equipment Rental Platform - Quick Start Script
# This script helps you set up and run the application

echo "🚀 Equipment Rental Platform - Quick Start"
echo "==========================================="
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Backend Setup"
echo "================"
cd backend

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
else
    echo "Backend dependencies already installed ✅"
fi

echo ""
echo "Backend setup complete! ✅"
echo "To start backend: cd backend && npm run dev"
echo ""

# Go back to root
cd ..

echo "📦 Frontend Setup"
echo "================"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed ✅"
fi

echo ""
echo "Frontend setup complete! ✅"
echo "To start frontend: cd frontend && npm run dev"
echo ""

# Go back to root
cd ..

echo "==========================================="
echo "🎉 Setup Complete!"
echo ""
echo "Next Steps:"
echo "==========="
echo "1. Ensure MongoDB is running"
echo "2. Start the backend:  cd backend && npm run dev"
echo "3. In another terminal, start frontend: cd frontend && npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "- Main README: ./README.md"
echo "- Backend docs: ./backend/README.md"
echo "- Frontend docs: ./frontend/README.md"
echo ""
