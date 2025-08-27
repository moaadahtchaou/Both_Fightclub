const express = require('express');
const router = express.Router();
const Audio = require('../models/Audio');
const User = require('../models/User');
const {verifyToken} = require('./auth');


// GET /api/audio/public - Get all public audio files
router.get('/public', async (req, res) => {
  try {
    const publicAudioFiles = await Audio.findPublic()
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(publicAudioFiles);
  } catch (error) {
    console.error('Error fetching public audio files:', error);
    res.status(500).json({ message: 'Failed to fetch public audio files', error: error.message });
  }
});

// GET /api/audio/user - Get user's audio files (requires authentication)
// Includes both owned files and files shared with the user
router.get('/user', verifyToken, async (req, res) => {
  try {
    // Find audio files where user is either the owner OR in the sharedUsers array
    const userAudioFiles = await Audio.find({
      $or: [
        { user: req.user.userId }, // Files owned by the user
        { sharedUsers: req.user.userId } // Files shared with the user
      ]
    })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(userAudioFiles);
  } catch (error) {
    console.error('Error fetching user audio files:', error);
    res.status(500).json({ message: 'Failed to fetch user audio files', error: error.message });
  }
});

// GET /api/audio/recent - Get recent audio files
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recentAudioFiles = await Audio.findRecent(limit)
      .populate('user', 'username');
    
    res.json(recentAudioFiles);
  } catch (error) {
    console.error('Error fetching recent audio files:', error);
    res.status(500).json({ message: 'Failed to fetch recent audio files', error: error.message });
  }
});

// GET /api/audio/:id - Get specific audio file
router.get('/:id', async (req, res) => {
  try {
    const audioFile = await Audio.findById(req.params.id)
      .populate('user', 'username');
    
    if (!audioFile) {
      return res.status(404).json({ message: 'Audio file not found' });
    }
    
    // Check if audio is public or user owns it
    if (!audioFile.isPublic && (!req.user || audioFile.user._id.toString() !== req.user.userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(audioFile);
  } catch (error) {
    console.error('Error fetching audio file:', error);
    res.status(500).json({ message: 'Failed to fetch audio file', error: error.message });
  }
});

// Audio creation is handled by the allinone route

// PATCH /api/audio/:id/toggle-public - Toggle isPublic status (requires authentication)
router.patch('/:id/toggle-public', verifyToken, async (req, res) => {
  try {
    const audioFile = await Audio.findById(req.params.id);
    
    if (!audioFile) {
      return res.status(404).json({ message: 'Audio file not found' });
    }
    
    // Check if user owns the audio file
    if (audioFile.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied - you can only modify your own audio files' });
    }
    
    // Toggle the isPublic status
    audioFile.isPublic = !audioFile.isPublic;
    await audioFile.save();
    
    // Return the updated audio file with user info populated
    const updatedAudioFile = await Audio.findById(audioFile._id)
      .populate('user', 'username');
    
    res.json({
      message: `Audio file is now ${audioFile.isPublic ? 'public' : 'private'}`,
      audioFile: updatedAudioFile
    });
  } catch (error) {
    console.error('Error toggling audio public status:', error);
    res.status(500).json({ message: 'Failed to toggle audio public status', error: error.message });
  }
});

// Audio deletion is not supported in this interface

// GET /api/audio/search/:query - Search audio files
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const limit = parseInt(req.query.limit) || 20;
    
    // Search in public audio files only
    const searchResults = await Audio.find({
      isPublic: true,
      $or: [
        { originalName: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { source: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    .limit(limit);
    
    res.json(searchResults);
  } catch (error) {
    console.error('Error searching audio files:', error);
    res.status(500).json({ message: 'Failed to search audio files', error: error.message });
  }
});

module.exports = router;