const createApp = require('../src/config/app');
const initializationService = require('../src/services/initialization');

// Initialize the app once
let app;
let initialized = false;

const initializeApp = async () => {
  if (!initialized) {
    try {
      // Initialize database and admin user
      await initializationService.initialize();
      
      // Create Express app
      app = createApp();
      initialized = true;
      console.log('✅ App initialized for Vercel');
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      throw error;
    }
  }
  return app;
};

// Export the handler for Vercel
module.exports = async (req, res) => {
  try {
    const app = await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};