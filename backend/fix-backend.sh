# Backend Fix Script
# Run this in the backend directory

# 1. Clean npm cache and node_modules
echo "🧹 Cleaning npm cache and node_modules..."
npm cache clean --force
rm -rf node_modules package-lock.json

# 2. Install missing dependencies
echo "📦 Installing missing dependencies..."
npm install cloudinary@^1.40.0
npm install express-mongo-sanitize@^2.2.0
npm install xss-clean@^0.1.4
npm install hpp@^0.2.3

# 3. Install all required dependencies
echo "📦 Installing all backend dependencies..."
npm install express@^4.21.2 mongoose@^7.8.7 cors@^2.8.5 dotenv@^16.6.1
npm install bcryptjs@^2.4.3 jsonwebtoken@^9.0.2 multer@^1.4.5-lts.1
npm install express-validator@^7.2.1 helmet@^7.2.0 express-rate-limit@^6.11.2
npm install nodemailer@^6.10.1

# 4. Install dev dependencies
echo "📦 Installing dev dependencies..."
npm install --save-dev nodemon@^3.1.10

# 5. Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads/images
mkdir -p logs

# 6. Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOL'
NODE_ENV=development
PORT=8000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/linkedin-company?retryWrites=true&w=majority&appName=ZEYA-7

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-minimum-32-characters-long
JWT_EXPIRE=30d

# Frontend URL
CLIENT_URL=http://localhost:5001

# Cloudinary Configuration (optional - for image uploads to cloud)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# File Upload Configuration
MAX_FILE_SIZE=10485760
MAX_FILES=10

# Email Configuration (optional - for contact form emails)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
ADMIN_EMAIL=

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
EOL
    echo "✅ Created .env file"
fi

echo "🎉 Backend setup completed!"
echo "Next steps:"
echo "1. Run: npm run full-setup (to initialize database)"
echo "2. Run: npm start (to start the server)"