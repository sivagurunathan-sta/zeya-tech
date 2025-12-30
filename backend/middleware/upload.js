// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created upload directory: ${dirPath}`);
  }
};

// Initialize upload directories
const uploadDir = path.join(__dirname, '..', 'uploads');
const imagesDir = path.join(uploadDir, 'images');
const documentsDir = path.join(uploadDir, 'documents');

ensureDirectoryExists(uploadDir);
ensureDirectoryExists(imagesDir);
ensureDirectoryExists(documentsDir);

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on file type
    const isImage = file.mimetype.startsWith('image/');
    const subfolder = isImage ? 'images' : 'documents';
    const uploadPath = path.join(__dirname, '..', 'uploads', subfolder);

    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, extension)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 20);

    const fileName = `${baseName}-${uniqueSuffix}${extension}`;
    const fileType = file.mimetype.startsWith('image/') ? '🖼️' : '📄';
    console.log(`${fileType} Uploading file: ${fileName}`);
    cb(null, fileName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log('📁 Processing file:', {
    originalname: file.originalname,
    mimetype: file.mimetype
  });

  // Allowed image types
  const allowedImageMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
    'image/svg+xml'
  ];

  // Allowed document types
  const allowedDocumentMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const allowedImageExtensions = /\.(jpeg|jpg|png|gif|webp|heic|heif|svg)$/i;
  const allowedDocumentExtensions = /\.(pdf|doc|docx|txt)$/i;

  const extension = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  const isValidImage = allowedImageMimes.includes(mimeType) && allowedImageExtensions.test(extension);
  const isValidDocument = allowedDocumentMimes.includes(mimeType) && allowedDocumentExtensions.test(extension);

  if (isValidImage || isValidDocument) {
    const fileType = isValidImage ? 'image' : 'document';
    console.log(`✅ File accepted as ${fileType}: ${file.originalname}`);
    cb(null, true);
  } else {
    const error = new Error(
      `Invalid file type. Allowed types:
      Images: JPEG, PNG, GIF, WebP
      Documents: PDF, DOC, DOCX, TXT
      Received: ${mimeType}`
    );
    error.code = 'INVALID_FILE_TYPE';
    console.log(`❌ File rejected: ${file.originalname} - Invalid type: ${mimeType}`);
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit for documents
    files: 10 // Maximum 10 files at once
  },
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  console.error('📁 Upload error:', error);
  
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size allowed is 15MB.',
          error: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.',
          error: 'TOO_MANY_FILES'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field. Please check your form field names.',
          error: 'UNEXPECTED_FILE_FIELD'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error: ' + error.message,
          error: 'UPLOAD_ERROR'
        });
    }
  }
  
  if (error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      success: false,
      message: error.message,
      error: 'INVALID_FILE_TYPE'
    });
  }
  
  // Pass other errors to the next middleware
  next(error);
};

// Log successful uploads
const logUploadSuccess = (req, res, next) => {
  if (req.file) {
    console.log(`✅ Single file uploaded successfully: ${req.file.filename}`);
    console.log(`📏 File size: ${req.file.size} bytes`);
  }

  if (req.files) {
    // Handle upload.fields() format
    if (typeof req.files === 'object' && !Array.isArray(req.files)) {
      let totalFiles = 0;
      Object.keys(req.files).forEach(fieldName => {
        const files = req.files[fieldName];
        if (Array.isArray(files)) {
          totalFiles += files.length;
          console.log(`✅ ${files.length} files uploaded for field '${fieldName}':`);
          files.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file.filename} (${file.size} bytes)`);
          });
        }
      });
      if (totalFiles > 0) {
        console.log(`✅ Total files uploaded: ${totalFiles}`);
      }
    }
    // Handle upload.array() format
    else if (Array.isArray(req.files) && req.files.length > 0) {
      console.log(`✅ ${req.files.length} files uploaded successfully:`);
      req.files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.filename} (${file.size} bytes)`);
      });
    }
  }

  next();
};

// Utility function to clean up uploaded files in case of error
const cleanupFiles = (files) => {
  if (!files) return;
  
  const filesToClean = Array.isArray(files) ? files : [files];
  
  filesToClean.forEach(file => {
    if (file && file.path) {
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error(`❌ Error deleting file ${file.path}:`, err);
        } else {
          console.log(`🗑️ Cleaned up file: ${file.path}`);
        }
      });
    }
  });
};

// Export the main upload object
module.exports = upload;

// Export additional utilities
module.exports.handleError = handleUploadError;
module.exports.logSuccess = logUploadSuccess;
module.exports.cleanup = cleanupFiles;
