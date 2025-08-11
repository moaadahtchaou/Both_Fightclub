const express = require('express');
const corsMiddleware = require('../middleware/cors');
const uploadRouter = require('../routes/upload');
const usersRouter = require('../routes/users');
const downloadRouter = require('../routes/download');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(corsMiddleware);
  app.use(express.json());

  // Routes
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Welcome to the Fight Club API',
      version: '1.0.0',
      endpoints: {
        download: '/download',
        upload: '/upload',
        users: '/api/users'
      }
    });
  });

  app.use('/download', downloadRouter);
  app.use('/upload', uploadRouter);
  app.use('/api/users', usersRouter);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
};

module.exports = createApp;