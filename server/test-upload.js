// Test script to verify upload route works with in-memory storage
const express = require('express');
const uploadRouter = require('./src/routes/upload');
const corsMiddleware = require('./src/middleware/cors');

const app = express();
app.use(corsMiddleware);
app.use(express.json());
app.use('/upload', uploadRouter);

app.get('/test', (req, res) => {
  res.json({ message: 'Upload test server is running', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Upload test server running on port ${PORT}`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`📤 Upload endpoint: http://localhost:${PORT}/upload`);
  console.log('\n📋 To test upload:');
  console.log('curl -X POST -F "fileToUpload=@your-file.txt" http://localhost:' + PORT + '/upload');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Server shutting down gracefully...');
  process.exit(0);
});