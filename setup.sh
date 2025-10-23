#!/bin/bash

echo "🎨 Setting up Canvas Design Editor..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

# Install E2E test dependencies
echo "📦 Installing E2E test dependencies..."
cd e2e && npm install && cd ..

# Create server environment file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server environment file..."
    cat > server/.env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/canvas-editor
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
NODE_ENV=development
EOF
    echo "✅ Created server/.env file"
else
    echo "✅ Server environment file already exists"
fi

# Check if MongoDB is running
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB is running"
    else
        echo "⚠️  MongoDB is installed but not running. Please start MongoDB:"
        echo "   - On macOS with Homebrew: brew services start mongodb-community"
        echo "   - On Ubuntu/Debian: sudo systemctl start mongod"
        echo "   - On Windows: net start MongoDB"
    fi
else
    echo "⚠️  MongoDB is not installed. Please install MongoDB:"
    echo "   - Visit: https://docs.mongodb.com/manual/installation/"
    echo "   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
fi

echo ""
echo "🚀 Setup complete! To start the application:"
echo "   1. Make sure MongoDB is running"
echo "   2. Run: npm run dev"
echo ""
echo "📚 Available commands:"
echo "   npm run dev          - Start development servers"
echo "   npm run build        - Build for production"
echo "   npm run test         - Run all tests"
echo "   npm run test:e2e     - Run E2E tests"
echo ""
echo "🌐 Application will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo ""
echo "Happy designing! 🎨"
