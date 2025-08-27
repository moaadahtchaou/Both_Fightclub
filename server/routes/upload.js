const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const { Audio, User } = require('../models');
const { verifyToken } = require('./auth');
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
router.post('/', verifyToken, upload.single('fileToUpload'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get authenticated user and validate credits
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.credits < 1) {
      return res.status(402).json({
        error: 'Insufficient credits',
        code: 'INSUFFICIENT_CREDITS',
        currentCredits: user.credits
      });
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
      
      try {
        // Deduct 1 credit from user
        await user.useCredits(1, `File upload: ${req.file.originalname}`);
        console.log(`💳 Deducted 1 credit from ${user.username}. Remaining: ${user.credits - 1}`);
        
        // Save audio record to database
        const audioRecord = new Audio({
          user: user._id,
          originalName: req.file.originalname,
          source: 'upload',
          sourceUrl: null,
          uploadUrl: url,
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          tags: ['upload', 'mp3'],
          isPublic: true
        });
        
        await audioRecord.save();
        console.log('✅ Audio record saved to database');
        
        // Return success response with user info
        res.json({
          success: true,
          uploadUrl: url,
          filename: req.file.originalname,
          user: {
            username: user.username,
            remainingCredits: user.credits - 1
          }
        });
      } catch (dbError) {
        console.error('⚠️ Failed to save to database or deduct credits:', dbError.message);
        // If credit deduction fails, we should not continue
        if (dbError.message.includes('Insufficient credits')) {
          return res.status(402).json({
            error: 'Insufficient credits',
            code: 'INSUFFICIENT_CREDITS',
            currentCredits: user.credits
          });
        }
        // If database save fails but credits were deducted, still return the URL
        res.json({
          success: true,
          uploadUrl: url,
          filename: req.file.originalname,
          warning: 'File uploaded but database save failed',
          user: {
            username: user.username,
            remainingCredits: user.credits - 1
          }
        });
      }
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