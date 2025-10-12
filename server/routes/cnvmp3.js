const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const { cnvmp3DownloadAndUpload, testCnvmp3NoAuth } = require('../controllers/cnvmp3Controller');

// Main route for cnvmp3 downloading and uploading YouTube audio
router.get('/download-and-upload', verifyToken, cnvmp3DownloadAndUpload);

// Test route without authentication for cnvmp3
router.get('/test-no-auth', testCnvmp3NoAuth);

module.exports = router;