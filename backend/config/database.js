const mongoose = require('mongoose');
const { logger } = require('../middleware/logger');

const connectDB = async () => {
  try {
    mongoose.set('bufferCommands', false);

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      maxIdleTimeMS: 30000,
      family: 4,
      retryWrites: true
    };

    const mongoUri = process.env.MONGODB_URI || "mongodb+srv://ZEYA-7:sWRq7BajFCvHu4hQ@zeya-7.3ahhl0x.mongodb.net/?retryWrites=true&w=majority&appName=ZEYA-7";

    const conn = await mongoose.connect(mongoUri, options);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    logger.error('Database connection error:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logger.warn('Continuing without database in development mode');
    }
  }
};

module.exports = connectDB;