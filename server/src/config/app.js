const express = require('express');
const path = require('path');
const corsMiddleware = require('../middleware/cors');
const uploadRouter = require('../routes/upload');
const usersRouter = require('../routes/users');
const downloadRouter = require('../routes/download');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(corsMiddleware);
  app.use(express.json());

  // Serve static files from client build
  const clientBuildPath = path.join(__dirname, '../../../client/dist');
  app.use(express.static(clientBuildPath));

  // API Routes
  app.use('/download', downloadRouter);
  app.use('/upload', uploadRouter);
  app.use('/api/users', usersRouter);

  // API health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      message: 'Fight Club API is running',
      version: '1.0.0',
      endpoints: {
        download: '/download',
        upload: '/upload',
        users: '/api/users'
      }
    });
  });

  // Serve React app for all non-API routes (client-side routing)
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/download') || req.path.startsWith('/upload')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    
    // Serve React app
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

  // Error handler
  app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

module.exports = createApp;