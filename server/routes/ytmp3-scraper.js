/**
 * YouTube MP3 Scraper with Proxy Support
 * 
 * This script scrapes ytmp3.as to convert YouTube videos to MP3 format.
 * It includes comprehensive proxy support for enhanced reliability and anonymity.
 * 
 * Proxy Features:
 * - Loads proxy addresses from '../validiadress.txt'
 * - Randomly selects a proxy for each scraping session
 * - Supports HTTP proxies with authentication (username:password)
 * - Configures Puppeteer browser to use the selected proxy
 * - Handles proxy authentication automatically
 * - Falls back to direct connection if no proxies are available
 * - Logs proxy usage for monitoring and debugging
 * 
 * Requirements:
 * - validiadress.txt file in the parent directory with proxy addresses
 * - Proxy format: http://username:password@host:port (one per line)
 * - All dependencies installed via npm install
 * 
 * Usage:
 * The proxy functionality is automatically integrated into the scraping process.
 * No additional configuration is required beyond having valid proxy addresses.
 */

const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const pipeline = promisify(require('stream').pipeline);
const fetch = require('node-fetch');

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
    let capturedRequests = [];
    let networkRequests = [];
    let allResponses = [];
    
    await page.setRequestInterception(true);
    
    // Capture all network activity for debugging
    page.on('request', (request) => {
      const url = request.url();
      // console.log(`📤 Request: ${request.method()} ${url}`);
      // Log all requests for debugging
      if (url.includes('download') || url.includes('.mp3') || url.includes('convert')) {
        // console.log('🔍 Intercepted request:', url);
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
      
      // console.log(`📡 Network response: ${status} ${url}`);
      
      // // Look for MP3 download URLs in responses
      // if (contentType.includes('audio/mpeg') || 
      //     url.includes('.mp3') || 
      //     (contentType.includes('application/octet-stream') && url.includes('download'))) {

      //   downloadUrl = url;
      // }
      
      // Check for convert API responses and XHR responses
      if (url.includes('/convert')) {
        try {
          const responseText = await response.text();
          // Try to parse as JSON
          const data = JSON.parse(responseText);
          const maybeDownloadURL = data.downloadURL;
          if (maybeDownloadURL.length > 2) {
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
          title: sanitizeFilename(`youtube_${videoId}`)
        };
      }
      
      // If no download URL found yet, wait a bit more and check again
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      if (downloadUrl) {
        return {
          success: true,
          downloadUrl: downloadUrl,
          title: sanitizeFilename(`youtube_${videoId}`)
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
  

  
  try {
    // Set a timeout for the entire operation (5 minutes)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout after 5 minutes')), 300000);
    });
    
    const conversionPromise = (async () => {
      // Scrape ytmp3.as to get download link
      const result = await scrapeYtmp3(url);
      
      if (!result.success) {
        throw new Error(result.error || 'Conversion failed for unknown reason');
      }
      
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
    

    
  } catch (error) {

    
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