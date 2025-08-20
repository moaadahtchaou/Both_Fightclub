const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const router = express.Router();

// Configure multer to store files in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only MP3 files
    if (file.mimetype === 'audio/mpeg' || file.originalname.toLowerCase().endsWith('.mp3')) {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files are allowed'), false);
    }
  }
});

// Upload endpoint
router.post('/', upload.single('fileToUpload'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create FormData for Catbox API
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Upload to Catbox
    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    });

    if (response.ok) {
      const url = await response.text();
      res.send(url);
    } else {
      console.error('Catbox upload failed:', response.status, response.statusText);
      res.status(500).json({ error: 'Upload failed' });
    }
  } catch (error) {
    console.error('Upload error:', error);
    if (error.message === 'Only MP3 files are allowed') {
      res.status(400).json({ error: 'Only MP3 files are allowed' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;