const { Audio } = require('../models');
const User = require('../models/User');
const { extractVideoId } = require('../utils/youtubeUtils');
const { downloadWithEzConvAPI } = require('../services/ezconvService');
const { uploadToCatbox } = require('../services/catboxService');
const { scrapeYtmp3 } = require('../services/ytmp3Service');

/**
 * Main controller for handling download and upload workflow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function downloadAndUpload(req, res) {
  const startTime = Date.now();
  
  console.log(`🔐 Authentication check - User ID: ${req.user?.id}, Username: ${req.user?.username}`);
  
  const { url, method = 'auto' } = req.query; // Default to 'auto' for fallback
   
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
      return res.json({
        success: true,
        isShared: true,
        downloadUrl: null, // Not applicable for shared content
        catboxUrl: existingAudio.uploadUrl,
        title: existingAudio.originalName,
        videoId: videoId,
        processingTime: 0,
        user: {
          username: user.username,
          remainingCredits: user.credits // No credits deducted
        },
        message: isAlreadyShared ? 'You already have access to this audio file.' : 'This audio already exists and has been shared with you.'
      });
    }
    
    console.log(`🚀 Starting complete workflow for: ${url} (User: ${user.username}, Credits: ${user.credits})`);
    
    // Set a timeout for the entire operation (8 minutes)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout after 8 minutes')), 480000);
    });
    
    const workflowPromise = (async () => {
      // Step 1: Get download URL from YouTube using selected method
      console.log(`📥 Step 1: Getting YouTube download URL using method: ${method}...`);
      
      let downloadResult;
      
      if (method === 'ezconv') {
        // Use EzConv API only
        downloadResult = await downloadWithEzConvAPI(url);
      } else if (method === 'ytmp3') {
        // Use Ytmp3 scraping only
        downloadResult = await scrapeYtmp3(url);
      } else {
        // Auto mode: Try EzConv first, fallback to Ytmp3
        console.log('🔄 Trying EzConv API first...');
        downloadResult = await downloadWithEzConvAPI(url);
        
        if (!downloadResult.success) {
          console.log('⚠️ EzConv API failed, falling back to Ytmp3 scraping...');
          downloadResult = await scrapeYtmp3(url);
          
          if (!downloadResult.success) {
            throw new Error(`Both methods failed. EzConv: ${downloadResult.error}. Ytmp3: ${downloadResult.error}`);
          }
        }
      }
      
      if (!downloadResult.success) {
        throw new Error(downloadResult.error || 'YouTube download failed');
      }
      
      console.log(`✅ Step 1 completed: Download URL obtained using ${downloadResult.method || method}`);
      
      // Step 2: Upload to Catbox
      console.log('📤 Step 2: Uploading to Catbox...');
      const catboxUrl = await uploadToCatbox(downloadResult.downloadUrl);
      
      console.log('✅ Step 2 completed: File uploaded to Catbox');
      
      return {
        downloadUrl: downloadResult.downloadUrl,
        catboxUrl: catboxUrl,
        title: downloadResult.title,
        method: downloadResult.method || method,
        format: downloadResult.format
      };
    })();
    
    const result = await Promise.race([workflowPromise, timeoutPromise]);
    
    // Deduct credits and save to database
    try {
      console.log(`🔍 Before credit deduction - User: ${user.username}, Credits: ${user.credits}`);
      // Deduct 1 credit from user
      await user.useCredits(1, `YouTube audio download: ${result.title || 'Unknown title'}`);
      
      // Refresh user data to get updated credits
      const updatedUser = await User.findById(user._id);
      console.log(`💳 Deducted 1 credit from ${user.username}. Remaining: ${updatedUser.credits}`);
      
      // Save audio record to database
      const audioRecord = new Audio({
        user: user._id,
        originalName: result.title || `YouTube Video ${videoId}`,
        source: 'youtube',
        sourceUrl: url,
        youtubeVideoId: videoId,
        uploadUrl: result.catboxUrl,
        sharedUsers: [user._id], // Initialize with the original uploader
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        tags: ['youtube', 'download'],
        isPublic: false
      });
      
      await audioRecord.save();
      console.log('✅ Audio record saved to database');
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
      // Continue with response even if database save fails, but credits were deducted
    }
    
    // Return the final result with Catbox URL and user info
    res.json({
      success: true,
      downloadUrl: result.downloadUrl,
      catboxUrl: result.catboxUrl,
      title: result.title,
      videoId: videoId,
      method: result.method,
      format: result.format,
      processingTime: Date.now() - startTime,
      user: {
        username: user.username,
        remainingCredits: user.credits - 1
      }
    });
    
    console.log('🎉 Complete workflow finished successfully');
    
  } catch (error) {
    console.error('❌ Workflow error:', error.message);
    
    // Determine appropriate error response
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let userMessage = 'An unexpected error occurred during processing.';
    
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      statusCode = 504;
      errorCode = 'TIMEOUT';
      userMessage = 'The process is taking too long. Please try again with a shorter video.';
    } else if (error.message.includes('Catbox upload failed')) {
      statusCode = 502;
      errorCode = 'UPLOAD_FAILED';
      userMessage = 'Failed to upload the file. Please try again.';
    } else if (error.message.includes('YouTube download failed')) {
      statusCode = 422;
      errorCode = 'DOWNLOAD_FAILED';
      userMessage = 'Unable to download from YouTube. The video may be private or unavailable.';
    }
    
    res.status(statusCode).json({ 
      error: userMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Test route without authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
function testNoAuth(req, res) {
  console.log('🔓 Test route accessed without authentication');
  res.json({ success: true, message: 'No auth required' });
}

module.exports = {
  downloadAndUpload,
  testNoAuth
};