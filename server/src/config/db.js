const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI || 'mongodb://localhost:27017/fightclub';
    
    // Optimized settings for serverless deployment
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000, // Shorter timeout for serverless
      socketTimeoutMS: 30000, // Shorter socket timeout
      maxPoolSize: 5, // Limit connection pool for serverless
      minPoolSize: 0, // Allow connections to scale down to 0
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📍 Connected to: ${mongoUri.includes('mongodb+srv') ? 'Atlas Cloud' : 'Local MongoDB'}`);
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    // Don't exit process - let the app handle fallback to in-memory storage
    throw error;
  }
};

module.exports = connectDB;