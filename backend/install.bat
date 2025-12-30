#!/bin/bash

# install-dependencies.sh
echo "🚀 Installing LinkedIn Company Website Dependencies..."
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Node.js
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check for npm
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
NODE_ENV=development
PORT=8000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/linkedin-company?retryWrites=true&w=majority&appName=ZEYA-7

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
JWT_EXPIRE=30d

# Frontend URL
CLIENT_URL=http://localhost:5001

# File Upload Configuration
MAX_FILE_SIZE=10485760
MAX_FILES=10

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
EOL
    echo "✅ Created .env file with default configuration"
fi

# Install backend dependencies
echo "⏳ Installing backend packages..."
npm install express mongoose bcryptjs jsonwebtoken multer cors dotenv express-validator helmet express-rate-limit express-mongo-sanitize hpp xss-clean nodemailer

# Install dev dependencies
npm install --save-dev nodemon

echo "✅ Backend dependencies installed!"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend

if [ -f package.json ]; then
    echo "⏳ Installing frontend packages..."
    npm install
    echo "✅ Frontend dependencies installed!"
else
    echo "⚠️  Frontend package.json not found, skipping frontend installation"
fi

echo ""
echo "🎉 Installation completed successfully!"
echo "=================================================="
echo ""
echo "🚀 Next steps:"
echo "1. Run the complete setup:"
echo "   cd backend && node scripts/completeSetup.js"
echo ""
echo "2. Start the backend:"
echo "   cd backend && npm start"
echo ""
echo "3. Start the frontend (in new terminal):"
echo "   cd frontend && npm start"
echo ""
echo "4. Access your application:"
echo "   Frontend: http://localhost:5001"
echo "   Admin Panel: http://localhost:5001/admin"
echo "   Backend API: http://localhost:8000"
echo ""
echo "5. Admin login credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "⚠️  Remember to change the admin password after first login!"