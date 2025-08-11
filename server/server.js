require('dotenv').config();

const createApp = require('./src/config/app');
const initializationService = require('./src/services/initialization');

const PORT = process.env.PORT || 3000;

// Initialize application
const startServer = async () => {
  try {
    // Initialize database and admin user
    await initializationService.initialize();
    
    // Create Express app
    const app = createApp();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();