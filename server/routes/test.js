const express = require('express');
const { User, Audio } = require('../models');
const router = express.Router();

// Test database connection
router.get('/db-status', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections)
    };
    
    res.json({
      success: true,
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test creating a sample audio record
router.post('/test-file', async (req, res) => {
  try {
    const testAudio = new Audio({
      originalName: 'test-audio.mp3',
      source: 'direct_upload',
      sourceUrl: null,
      uploadUrl: 'https://example.com/test-audio.mp3',
      ipAddress: req.ip || 'unknown',
      tags: ['test', 'audio'],
      isPublic: true
    });
    
    const savedAudio = await testAudio.save();
    
    res.json({
      success: true,
      audio: savedAudio,
      message: 'Test audio record created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Get recent audio files
router.get('/recent-files', async (req, res) => {
  try {
    const audioFiles = await Audio.findRecent(5);
    
    res.json({
      success: true,
      audioFiles: audioFiles,
      count: audioFiles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;