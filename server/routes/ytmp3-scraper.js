const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const fetch = require('node-fetch');

const router = express.Router();

// Helper function to extract YouTube video ID from URL
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Helper function to sanitize filename
function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

// Helper function to extract YouTube video ID
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Main scraping function using network interception
async function scrapeYtmp3(youtubeUrl) {
  let browser;
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube URL - could not extract video ID');
  }
  
  try {
    // Launch Puppeteer browser with enhanced error handling
    browser = await puppeteer.launch({
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
    });

    const page = await browser.newPage();
    
    // Set page timeout and user agent
    await page.setDefaultTimeout(30000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport for consistency
    await page.setViewport({ width: 1280, height: 720 });
    
    // Set up network interception to capture download URLs
    let downloadUrl = null;
    let capturedRequests = [];
    
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      const url = request.url();
      // Log all requests for debugging
      if (url.includes('download') || url.includes('.mp3') || url.includes('convert')) {
        console.log('🔍 Intercepted request:', url);
        capturedRequests.push(url);
      }
      request.continue();
    });
    
    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      
      // Look for MP3 download URLs in responses
      if (contentType.includes('audio/mpeg') || 
          url.includes('.mp3') || 
          (contentType.includes('application/octet-stream') && url.includes('download'))) {
        console.log('🎵 Found potential download URL:', url);
        console.log('📋 Content-Type:', contentType);
        downloadUrl = url;
      }
      
      // Check convert API responses for download URLs
      if (url.includes('/convert') || url.includes('/api/v1/convert')) {
        try {
          const responseText = await response.text();
          console.log('🔄 Convert API Response:', responseText);
          
          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(responseText);
            console.log('📄 Parsed JSON:', jsonData);
            
            // Look for download URL in various possible fields
            if (jsonData.downloadURL) {
              downloadUrl = jsonData.downloadURL;
              console.log('🔗 Found downloadURL:', downloadUrl);
            } else if (jsonData.download_url) {
              downloadUrl = jsonData.download_url;
              console.log('🔗 Found download_url:', downloadUrl);
            } else if (jsonData.url) {
              downloadUrl = jsonData.url;
              console.log('🔗 Found url:', downloadUrl);
            } else if (jsonData.link) {
              downloadUrl = jsonData.link;
              console.log('🔗 Found link:', downloadUrl);
            }
          } catch (parseError) {
            // Not JSON, check if it's a direct URL
            if (responseText.includes('http') && (responseText.includes('.mp3') || responseText.includes('download'))) {
              // Extract URL from text response
              const urlMatch = responseText.match(/(https?:\/\/[^\s"'<>]+)/g);
              if (urlMatch && urlMatch[0]) {
                downloadUrl = urlMatch[0];
                console.log('🔗 Extracted URL from text response:', downloadUrl);
              }
            }
          }
        } catch (e) {
          console.log('⚠️ Error reading convert API response:', e.message);
        }
      }
      
      // Also check for JSON responses that might contain download URLs
      if (contentType.includes('application/json')) {
        try {
          const responseText = await response.text();
          if (responseText.includes('downloadURL') || responseText.includes('download') || responseText.includes('.mp3')) {
            console.log('📄 JSON Response with download info:', responseText);
            const jsonData = JSON.parse(responseText);
            if (jsonData.downloadURL) {
              downloadUrl = jsonData.downloadURL;
              console.log('🔗 Extracted download URL from JSON:', downloadUrl);
            }
          }
        } catch (e) {
          // Not JSON or couldn't parse, ignore
        }
      }
    });
    
    // Use direct URL approach with network interception
    console.log('🚀 Using direct URL approach with video ID:', videoId);
    
    try {
      await page.goto(`https://ytmp3.as/AOPR/#${videoId}/mp3`, { 
        waitUntil: 'networkidle2', 
        timeout: 30000 
      });
      console.log(`https://ytmp3.as/AOPR/#${videoId}/mp3`);
      console.log('📄 Page loaded, waiting for network requests to capture download URL...');
      
      // Wait longer for API calls and network requests to complete
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      if (downloadUrl) {
        console.log('✅ Successfully obtained download URL via network interception:', downloadUrl);
        return {
          success: true,
          downloadUrl: downloadUrl,
          title: sanitizeFilename(`youtube_${videoId}`)
        };
      }
      
      // If no download URL found yet, wait a bit more and check again
      console.log('⏳ No download URL found yet, waiting additional time...');
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      if (downloadUrl) {
        console.log('✅ Download URL found after extended wait:', downloadUrl);
        return {
          success: true,
          downloadUrl: downloadUrl,
          title: sanitizeFilename(`youtube_${videoId}`)
        };
      }
      
    } catch (error) {
      console.log('⚠️ Direct URL approach failed:', error.message);
      throw error;
    }
    
    // If we reach here, no download URL was captured via network interception
    throw new Error('No download URL was captured through network interception. The video might be unavailable or the service might be down.');
    
  } catch (error) {
    console.error('Scraping error:', error);
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

// Note: downloadFile function removed since we now return download URLs instead of downloading files

// Main route handler with comprehensive error handling
router.get('/', async (req, res) => {
  const startTime = Date.now();
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
  
  console.log(`[${new Date().toISOString()}] Starting conversion for video ID: ${videoId}`);
  
  try {
    // Set a timeout for the entire operation (5 minutes)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout after 5 minutes')), 300000);
    });
    
    const conversionPromise = (async () => {
      // Scrape ytmp3.as to get download link
      console.log('Step 1: Starting web scraping...');
      const result = await scrapeYtmp3(url);
      
      if (!result.success) {
        throw new Error(result.error || 'Conversion failed for unknown reason');
      }
      
      console.log('Step 2: Conversion successful, got download URL:', result.downloadUrl);
      
      return { downloadUrl: result.downloadUrl, title: result.title };
    })();
    
    const { downloadUrl, title } = await Promise.race([conversionPromise, timeoutPromise]);
    
    // Validate the download URL
    if (!downloadUrl) {
      throw new Error('Download URL is empty or invalid');
    }
    
    // Return the download URL in JSON response
    res.json({
      success: true,
      downloadUrl: downloadUrl,
      title: title,
      videoId: videoId
    });
    
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] Conversion completed successfully in ${duration}ms for: ${title}`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Conversion failed after ${duration}ms:`, error.message);
    
    // Determine appropriate error response based on error type
    let statusCode = 500;
    let errorCode = 'INTERNAL_ERROR';
    let userMessage = 'An unexpected error occurred while processing your request.';
    
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      statusCode = 504;
      errorCode = 'TIMEOUT';
      userMessage = 'The conversion is taking too long. Please try again with a shorter video.';
    } else if (error.message.includes('navigate') || error.message.includes('network')) {
      statusCode = 503;
      errorCode = 'SERVICE_UNAVAILABLE';
      userMessage = 'The conversion service is currently unavailable. Please try again later.';
    } else if (error.message.includes('Download link not found') || error.message.includes('Could not find download URL')) {
      statusCode = 422;
      errorCode = 'CONVERSION_FAILED';
      userMessage = 'Unable to convert this video. It may be private, restricted, or unavailable.';
    } else if (error.message.includes('Download URL is empty')) {
      statusCode = 502;
      errorCode = 'URL_EXTRACTION_FAILED';
      userMessage = 'Failed to extract the download URL. Please try again.';
    }
    
    res.status(statusCode).json({ 
      error: userMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;