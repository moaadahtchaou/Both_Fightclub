const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const { downloadAndUpload, testNoAuth } = require('../controllers/downloadController');

// Main route for downloading and uploading YouTube audio
router.get('/download-and-upload', verifyToken, downloadAndUpload);

// Test route without authentication
router.get('/test-no-auth', testNoAuth);

module.exports = router;