@echo off
title LinkedIn Company Website - Backend Setup
echo 🚀 LinkedIn Company Website Backend Setup
echo ==========================================
echo.

:: Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Error: package.json not found!
    echo Please run this script from the backend directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo.

:: Step 1: Clean up
echo 🧹 Step 1: Cleaning up old installation...
if exist "node_modules" (
    echo Removing old node_modules...
    rmdir /s /q "node_modules" 2>nul
)
if exist "package-lock.json" (
    echo Removing package-lock.json...
    del "package-lock.json" 2>nul
)

:: Clear npm cache
echo Clearing npm cache...
call npm cache clean --force
echo.

:: Step 2: Install missing cloudinary
echo 📦 Step 2: Installing Cloudinary package...
call npm install cloudinary@^1.40.0
if %errorlevel% neq 0 (
    echo ❌ Failed to install cloudinary
    echo Trying alternative installation...
    call npm install cloudinary --timeout=60000
)
echo.

:: Step 3: Install security packages
echo 📦 Step 3: Installing security packages...
call npm install express-mongo-sanitize@^2.2.0 xss-clean@^0.1.4 hpp@^0.2.3
echo.

:: Step 4: Install all dependencies
echo 📦 Step 4: Installing all backend dependencies...
call npm install express@^4.21.2 mongoose@^7.8.7 cors@^2.8.5 dotenv@^16.6.1
call npm install bcryptjs@^2.4.3 jsonwebtoken@^9.0.2 multer@^1.4.5-lts.1
call npm install express-validator@^7.2.1 helmet@^7.2.0 express-rate-limit@^6.11.2
call npm install nodemailer@^6.10.1

if %errorlevel% neq 0 (
    echo ❌ Failed to install some dependencies
    echo Trying with legacy peer deps...
    call npm install --legacy-peer-deps
)
echo.

:: Step 5: Install dev dependencies
echo 📦 Step 5: Installing development dependencies...
call npm install --save-dev nodemon@^3.1.10
echo.

:: Step 6: Create necessary directories
echo 📁 Step 6: Creating directories...
if not exist "uploads" mkdir uploads
if not exist "uploads\images" mkdir uploads\images
if not exist "logs" mkdir logs
echo ✅ Directories created
echo.

:: Step 7: Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Step 7: Creating .env file...
    (
        echo NODE_ENV=development
        echo PORT=8000
        echo.
        echo # MongoDB Configuration
        echo MONGODB_URI=mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/linkedin-company?retryWrites=true^&w=majority^&appName=ZEYA-7
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-minimum-32-characters-long
        echo JWT_EXPIRE=30d
        echo.
        echo # Frontend URL
        echo CLIENT_URL=http://localhost:5001
        echo.
        echo # Cloudinary Configuration ^(optional - for image uploads to cloud^)
        echo CLOUDINARY_CLOUD_NAME=
        echo CLOUDINARY_API_KEY=
        echo CLOUDINARY_API_SECRET=
        echo.
        echo # File Upload Configuration
        echo MAX_FILE_SIZE=10485760
        echo MAX_FILES=10
        echo.
        echo # Email Configuration ^(optional - for contact form emails^)
        echo EMAIL_HOST=
        echo EMAIL_PORT=587
        echo EMAIL_USER=
        echo EMAIL_PASS=
        echo EMAIL_FROM=
        echo ADMIN_EMAIL=
        echo.
        echo # Logging
        echo LOG_LEVEL=info
        echo LOG_FILE=logs/app.log
        echo.
        echo # Security
        echo BCRYPT_ROUNDS=12
        echo RATE_LIMIT_WINDOW=900000
        echo RATE_LIMIT_MAX=100
    ) > .env
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)
echo.

:: Step 8: Verify installation
echo 🔍 Step 8: Verifying installation...
call npm list cloudinary --depth=0 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Cloudinary package installed successfully
) else (
    echo ⚠️  Cloudinary package may not be installed properly
)

call npm list express --depth=0 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Express package installed successfully
) else (
    echo ❌ Express package installation failed
)
echo.

:: Step 9: Final setup
echo 🎯 Step 9: Running database setup...
call node scripts/fullSetup.js
echo.

echo 🎉 Backend setup completed successfully!
echo ==========================================
echo.
echo 📋 Next Steps:
echo 1. Start the backend server:
echo    npm start
echo.
echo 2. Or start in development mode:
echo    npm run dev
echo.
echo 3. Access your API at:
echo    http://localhost:8000
echo.
echo 4. Health check:
echo    http://localhost:8000/health
echo.
echo 5. Admin login credentials:
echo    Email: admin@example.com
echo    Password: admin123
echo.
echo ⚠️  Important Notes:
echo • Change the admin password after first login
echo • Update JWT_SECRET in .env for production
echo • Configure Cloudinary credentials for image uploads
echo.
pause