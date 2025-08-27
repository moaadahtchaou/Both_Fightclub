const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const fetch = require('node-fetch');
const axios = require('axios');
const FormData = require('form-data');
const { Audio } = require('../models');
const User = require('../models/User');
const { verifyToken } = require('./auth');

const router = express.Router();

// Function to load and parse proxy addresses
function loadProxies() {
  try {
    const proxyFile = path.join(__dirname, '..', 'validiadress.txt');
    const proxyData = fs.readFileSync(proxyFile, 'utf8');
    const proxies = proxyData.split('\n')
      .map(line => line.trim())
      .filter(line => line && line.startsWith('http'));
    return proxies;
  } catch (error) {
    console.log('⚠️ Could not load proxies:', error.message);
    return [];
  }
}

// Function to get a random proxy
function getRandomProxy() {
  const proxies = loadProxies();
  if (proxies.length === 0) {
    console.log('⚠️ No proxies available, running without proxy');
    return null;
  }
  const randomProxy = proxies[Math.floor(Math.random() * proxies.length)];
  console.log('🔄 Using proxy:', randomProxy.replace(/:\/\/[^@]+@/, '://***:***@')); // Hide credentials in log
  return randomProxy;
}

// Function to parse proxy URL and extract components
function parseProxy(proxyUrl) {
  try {
    const url = new URL(proxyUrl);
    return {
      host: url.hostname,
      port: parseInt(url.port),
      username: url.username,
      password: url.password
    };
  } catch (error) {
    console.log('⚠️ Error parsing proxy URL:', error.message);
    return null;
  }
}

// Helper function to extract YouTube video ID from URL
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}




// Function to upload file to Catbox
async function uploadToCatbox(fileUrl) {
  try {
    console.log('🔄 Starting Catbox upload for:', fileUrl);
    
    // Get the file stream from the download URL
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    
    // Prepare form data
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', response.data, {
      filename: 'upload.mp3'
    });
    
    // Upload to Catbox
    const uploadResponse = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
      timeout: 60000 // 60 second timeout
    });
    
    console.log('✅ Catbox upload successful:', uploadResponse.data);
    return uploadResponse.data;
  } catch (error) {
    console.error('❌ Catbox upload failed:', error.message);
    throw new Error(`Catbox upload failed: ${error.message}`);
  }
}

// Main scraping function using network interception
async function scrapeYtmp3(youtubeUrl) {
  let browser;
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL - could not extract video ID');
  }
  
  // Log proxy status
  const proxies = loadProxies();
  console.log(`🌐 Loaded ${proxies.length} available proxies`);
  
  try {
    // Get random proxy configuration
    const proxyUrl = getRandomProxy();
    const proxyConfig = proxyUrl ? parseProxy(proxyUrl) : null;
    
    // Prepare launch options with proxy configuration
    const launchOptions = {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-pings',
        '--single-process',
        '--disable-features=HttpsFirstBalancedModeAutoEnable'
      ],
      headless: true, // Use standard headless mode for better compatibility
      timeout: 30000 // 30 second timeout for browser launch
    };
    
    // Add proxy server argument if proxy is configured
    if (proxyConfig) {
      launchOptions.args.push(`--proxy-server=${proxyConfig.host}:${proxyConfig.port}`);
      console.log('🔧 Proxy configured for browser:', `${proxyConfig.host}:${proxyConfig.port}`);
    }
    
    // Launch Puppeteer browser with enhanced error handling
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    
    // Configure proxy authentication if credentials are provided
    if (proxyConfig && proxyConfig.username && proxyConfig.password) {
      await page.authenticate({
        username: proxyConfig.username,
        password: proxyConfig.password
      });
      console.log('🔐 Proxy authentication configured');
    }
    
    // Set page timeout and user agent
    await page.setDefaultTimeout(30000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport for consistency
    await page.setViewport({ width: 1280, height: 720 });
    
    // Set up network interception to capture download URLs
    let downloadUrl = null;
    let title = null;
    await page.setRequestInterception(true);
    
    // Continue all requests
    page.on('request', (request) => {
      request.continue();
    });
    
    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      const contentType = headers['content-type'] || '';
      
      
      // Check for convert API responses and XHR responses
      console
      if (url.includes('/convert')) {
        try {
          const responseText = await response.text();
          // Try to parse as JSON
          const data = JSON.parse(responseText);
          const maybeDownloadURL = data.downloadURL;
          if (maybeDownloadURL.length > 2) {
            title=data.title
            downloadUrl = maybeDownloadURL;
            console.log('🔍 Found download URL:', downloadUrl);
          }

        } catch (error) {
          console.log(error);
        }
      }
      
    });
    
    // Use direct URL approach with network interception
    try {
      await page.goto(`https://ytmp3.as/AOPR/#${videoId}/mp3`, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      
      // Wait longer for API calls and network requests to complete
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      if (downloadUrl) {
        return {
          success: true,
          downloadUrl: downloadUrl,
          title: title
        };
      }
      
      // If no download URL found yet, wait a bit more and check again
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      if (downloadUrl) {
        return {
          success: true,
          downloadUrl: downloadUrl,
          title: title
        };
      }
      
    } catch (error) {
      throw error;
    }
    
    // If we reach here, no download URL was captured via network interception
    throw new Error('No download URL was captured through network interception. The video might be unavailable or the service might be down.');
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}



// Test route without authentication
router.get('/test-no-auth', async (req, res) => {
  console.log('🔓 Test route accessed without authentication');
  res.json({ success: true, message: 'No auth required' });
});

// New route for complete download and upload workflow
router.get('/download-and-upload', verifyToken, async (req, res) => {
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
      // Step 1: Get download URL from YouTube
      console.log('📥 Step 1: Getting YouTube download URL...');
      const downloadResult = await scrapeYtmp3(url);
      
      if (!downloadResult.success) {
        throw new Error(downloadResult.error || 'YouTube download failed');
      }
      
      console.log('✅ Step 1 completed: Download URL obtained');
      
      // Step 2: Upload to Catbox
      console.log('📤 Step 2: Uploading to Catbox...');
      const catboxUrl = await uploadToCatbox(downloadResult.downloadUrl);
      
      console.log('✅ Step 2 completed: File uploaded to Catbox');
      
      return {
        downloadUrl: downloadResult.downloadUrl,
        catboxUrl: catboxUrl,
        title: downloadResult.title
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
});

module.exports = router;