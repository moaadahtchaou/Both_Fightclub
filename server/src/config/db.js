const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Try local MongoDB first, then Atlas as fallback
    const localUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fightclub';
    const atlasUri = 'mongodb+srv://mdahtchao:7z2S8BG11VtEK23V@cluster0.qxbu7fl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    try {
      await mongoose.connect(localUri);
      console.log('MongoDB connected (local)');
    } catch (localError) {
      console.log('Local MongoDB not available, trying Atlas...');
      await mongoose.connect(atlasUri);
      console.log('MongoDB connected (Atlas)');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    // Don't exit process - let the app handle fallback to in-memory storage
    throw error;
  }
};

module.exports = connectDB;