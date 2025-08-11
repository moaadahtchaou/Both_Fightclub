const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use environment variable for MongoDB URI
    const mongoUri = process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URI || 'mongodb://localhost:27017/fightclub';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
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