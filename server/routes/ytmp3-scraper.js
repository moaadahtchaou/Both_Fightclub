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
    let networkRequests = [];
    let allResponses = [];
    
    await page.setRequestInterception(true);
    
    // Capture all network activity for debugging
    page.on('request', (request) => {
      const url = request.url();
      console.log(`📤 Request: ${request.method()} ${url}`);
      // Log all requests for debugging
      if (url.includes('download') || url.includes('.mp3') || url.includes('convert')) {
        console.log('🔍 Intercepted request:', url);
        capturedRequests.push(url);
      }
      request.continue();
    });
    
    page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      const contentType = headers['content-type'] || '';
      
      // Log all network requests for debugging
      networkRequests.push({ url, status, timestamp: new Date().toISOString() });
      allResponses.push({ url, status, headers });
      
      console.log(`📡 Network response: ${status} ${url}`);
      console.log(`📋 Response headers:`, JSON.stringify(headers, null, 2));
      
      // Look for MP3 download URLs in responses
      if (contentType.includes('audio/mpeg') || 
          url.includes('.mp3') || 
          (contentType.includes('application/octet-stream') && url.includes('download'))) {
        console.log('🎵 Found potential download URL:', url);
        console.log('📋 Content-Type:', contentType);
        downloadUrl = url;
      }
      
      // Check for convert API responses
      if (url.includes('/convert') || url.includes('/api/convert') || url.includes('ytmp3.as')) {
        try {
          const responseText = await response.text();
          console.log(`🔍 Convert API response from ${url}:`, responseText.substring(0, 500));
          
          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(responseText);
            console.log(`📊 Parsed JSON data:`, JSON.stringify(jsonData, null, 2));
            
            // Check various possible fields for download URL
            const possibleFields = ['downloadUrl', 'download_url', 'url', 'link', 'file', 'mp3', 'audio', 'redirectURL', 'redirect_url'];
            
            for (const field of possibleFields) {
              if (jsonData[field] && typeof jsonData[field] === 'string' && 
                  (jsonData[field].includes('.mp3') || jsonData[field].includes('download') || jsonData[field].includes('blob:'))) {
                downloadUrl = jsonData[field];
                console.log(`✅ Download URL found in ${field}:`, downloadUrl);
                break;
              }
            }
            
            // Check for progress URL that might need polling
            if (jsonData.progressURL || jsonData.progress_url) {
              console.log('📊 Progress URL found, might need polling:', jsonData.progressURL || jsonData.progress_url);
            }
            
          } catch (parseError) {
            // Not JSON, check if the response text itself contains a download URL
            if (responseText.includes('.mp3') || responseText.includes('download')) {
              console.log('🔍 Non-JSON response might contain download info:', responseText.substring(0, 200));
            }
          }
        } catch (error) {
          console.log('❌ Error processing convert response:', error.message);
        }
      }
      
      // Check for download API responses
      if (url.includes('/download') || url.includes('ytmp3.as/download') || url.includes('.mp3')) {
        try {
          const responseText = await response.text();
          console.log(`🎵 Download API response from ${url}:`, responseText.substring(0, 300));
          
          // Check if this URL itself is the download link
          if (url.includes('.mp3') && status === 200) {
            downloadUrl = url;
            console.log(`✅ Direct download URL found:`, downloadUrl);
          } else {
            // Try to parse response for download URL
            try {
              const jsonData = JSON.parse(responseText);
              const possibleFields = ['downloadUrl', 'download_url', 'url', 'link', 'file'];
              
              for (const field of possibleFields) {
                if (jsonData[field] && typeof jsonData[field] === 'string') {
                  downloadUrl = jsonData[field];
                  console.log(`✅ Download URL found in download response ${field}:`, downloadUrl);
                  break;
                }
              }
            } catch (parseError) {
              // Check for direct URL in response text
              const urlMatch = responseText.match(/https?:\/\/[^\s"'<>]+\.mp3[^\s"'<>]*/i);
              if (urlMatch) {
                downloadUrl = urlMatch[0];
                console.log(`✅ Download URL extracted from text:`, downloadUrl);
              }
            }
          }
        } catch (error) {
          console.log('❌ Error processing download response:', error.message);
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
      
      // Capture page source for debugging
      console.log('🔍 Capturing page source for debugging...');
      const pageSource = await page.content();
      console.log('📋 Page source length:', pageSource.length);
      console.log('📋 Page source (first 2000 chars):', pageSource.substring(0, 2000));
      
      // Check current URL
      const currentUrl = page.url();
      console.log('🌐 Current URL:', currentUrl);
      
      // Summary of network activity
      console.log('📊 Network Activity Summary:');
      console.log(`📡 Total network requests: ${networkRequests.length}`);
      console.log(`📋 All responses:`, allResponses.map(r => `${r.status} ${r.url}`).join('\n'));
      
      // Check for any JavaScript errors
      const jsErrors = await page.evaluate(() => {
        const errors = [];
        const originalError = console.error;
        console.error = function(...args) {
          errors.push(args.join(' '));
          originalError.apply(console, args);
        };
        return errors;
      });
      
      if (jsErrors.length > 0) {
        console.log('⚠️ JavaScript errors found:', jsErrors);
      }
      
      // Check if page has any forms or interactive elements
      const pageElements = await page.evaluate(() => {
        return {
          forms: document.querySelectorAll('form').length,
          inputs: document.querySelectorAll('input').length,
          buttons: document.querySelectorAll('button').length,
          scripts: document.querySelectorAll('script').length,
          title: document.title,
          bodyText: document.body ? document.body.textContent.substring(0, 500) : 'No body'
        };
      });
      
      console.log('🔍 Page elements:', JSON.stringify(pageElements, null, 2));
      
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