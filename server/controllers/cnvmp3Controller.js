const { Audio } = require('../models');
const User = require('../models/User');
const { extractVideoId, cleanYouTubeUrl } = require('../utils/youtubeUtils');
const { downloadAndUploadWithCnvMp3Database } = require('../services/cnvmp3DatabaseService');

/**
 * Main controller for handling cnvmp3 download and upload workflow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function cnvmp3DownloadAndUpload(req, res) {
  const startTime = Date.now();
  
  console.log(`🔐 Authentication check - User ID: ${req.user?.id}, Username: ${req.user?.username}`);
  
  const { url } = req.query;
   
  // Validate YouTube URL
  if (!url) {
    return res.status(400).json({ 
      error: 'YouTube URL is required',
      code: 'MISSING_URL'
    });
  }
  
  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ 
      error: 'Invalid YouTube URL format. Please provide a valid YouTube video URL.',
      code: 'INVALID_URL'
    });
  }
  
  try {
    // Check user credits before processing
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    if (user.credits < 1) {
      return res.status(402).json({ 
        error: 'Insufficient credits. You need at least 1 credit to download audio.',
        code: 'INSUFFICIENT_CREDITS',
        currentCredits: user.credits
      });
    }
    
    // Check for existing audio with the same YouTube video ID
    console.log(`🔍 Checking for duplicate YouTube video ID: ${videoId}`);
    const existingAudio = await Audio.findOne({ youtubeVideoId: videoId });
    
    if (existingAudio) {
      console.log(`📋 Found existing audio for video ID: ${videoId}`);
      
      // Check if user is already in sharedUsers array
      const isAlreadyShared = existingAudio.sharedUsers.includes(user._id);
      
      if (!isAlreadyShared) {
        // Add user to sharedUsers array
        existingAudio.sharedUsers.push(user._id);
        await existingAudio.save();
        console.log(`✅ Added user ${user.username} to shared users for existing audio`);
      } else {
        console.log(`ℹ️ User ${user.username} already has access to this audio`);
      }
      
      // Return existing audio without deducting credits
      const processingTime = Date.now() - startTime;
      return res.json({
        success: true,
        isShared: true,
        message: isAlreadyShared ? 'You already have access to this audio file.' : 'This audio already exists and has been shared with you.',
        data: {
          videoId,
          title: existingAudio.originalName,
          audioUrl: existingAudio.uploadUrl,
          source: 'cnvmp3-shared',
          processingTime: `${processingTime}ms`,
          creditsRemaining: user.credits // No credits deducted
        }
      });
    }
    
    console.log(`🚀 Starting cnvmp3 download for video ID: ${videoId}`);
    
    // Clean the YouTube URL
    const cleanUrl = cleanYouTubeUrl(url);
    
    // Set timeout for the entire operation (5 minutes)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout after 5 minutes')), 5 * 60 * 1000);
    });
    
    // Perform download and upload with cnvmp3
    const downloadPromise = downloadAndUploadWithCnvMp3Database(cleanUrl);
    
    const result = await Promise.race([downloadPromise, timeoutPromise]);
    
    if (!result.success) {
      throw new Error('cnvmp3 download failed');
    }
    
    console.log(`✅ cnvmp3 download successful for video ID: ${videoId}`);
    
    // Deduct credit after successful download
    await User.findByIdAndUpdate(req.user.userId, { 
      $inc: { credits: -1 } 
    });
    
    // Save audio to database
    const audioRecord = new Audio({
      user: req.user.userId,
      originalName: result.title || 'Unknown Title',
      source: 'cnvmp3',
      sourceUrl: cleanUrl,
      youtubeVideoId: videoId,
      uploadUrl: result.catboxUrl,
      ipAddress: req.ip || req.connection.remoteAddress || 'unknown'
    });
    
    await audioRecord.save();
    console.log(`💾 Audio saved to database for video ID: ${videoId}`);
    
    const processingTime = Date.now() - startTime;
    
    res.json({
      success: true,
      message: 'Audio downloaded and uploaded successfully using cnvmp3',
      data: {
        videoId,
        title: result.title,
        audioUrl: result.catboxUrl,
        source: 'cnvmp3',
        processingTime: `${processingTime}ms`,
        creditsRemaining: user.credits - 1
      }
    });
    
  } catch (error) {
    console.error(`❌ cnvmp3 download failed for video ID ${videoId}:`, error.message);
    
    const processingTime = Date.now() - startTime;
    
    // Return appropriate error response
    if (error.message.includes('timeout')) {
      return res.status(408).json({
        error: 'Request timeout. The download took too long to complete.',
        code: 'TIMEOUT',
        processingTime: `${processingTime}ms`
      });
    }
    
    if (error.message.includes('Insufficient credits')) {
      return res.status(402).json({
        error: error.message,
        code: 'INSUFFICIENT_CREDITS'
      });
    }
    
    res.status(500).json({
      error: 'Failed to download audio using cnvmp3. Please try again later.',
      code: 'DOWNLOAD_FAILED',
      details: error.message,
      processingTime: `${processingTime}ms`
    });
  }
}

/**
 * Test endpoint for cnvmp3 functionality (no authentication required)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function testCnvmp3NoAuth(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ 
      error: 'YouTube URL is required',
      code: 'MISSING_URL'
    });
  }
  
  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ 
      error: 'Invalid YouTube URL format',
      code: 'INVALID_URL'
    });
  }
  
  try {
    console.log(`🧪 Testing cnvmp3 for video ID: ${videoId}`);
    
    const cleanUrl = cleanYouTubeUrl(url);
    const result = await downloadAndUploadWithCnvMp3Database(cleanUrl);
    
    res.json({
      success: true,
      message: 'cnvmp3 test successful',
      data: {
        videoId,
        title: result.title,
        audioUrl: result.catboxUrl,
        source: 'cnvmp3-test'
      }
    });
    
  } catch (error) {
    console.error(`❌ cnvmp3 test failed:`, error.message);
    
    res.status(500).json({
      error: 'cnvmp3 test failed',
      code: 'TEST_FAILED',
      details: error.message
    });
  }
}

module.exports = {
  cnvmp3DownloadAndUpload,
  testCnvmp3NoAuth
};
