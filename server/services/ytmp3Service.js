const puppeteer = require('puppeteer');
const { loadProxies, getRandomProxy, parseProxy } = require('../utils/proxyUtils');
const { extractVideoId } = require('../utils/youtubeUtils');

/**
 * Main scraping function using network interception
 * @param {string} youtubeUrl - YouTube URL to scrape
 * @returns {Object} Scraping result with success status and data
 */
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
      if (url.includes('/convert')) {
        try {
          const responseText = await response.text();
          // Try to parse as JSON
          const data = JSON.parse(responseText);
          const maybeDownloadURL = data.downloadURL;
          if (maybeDownloadURL && maybeDownloadURL.length > 2) {
            title = data.title;
            downloadUrl = maybeDownloadURL;
            console.log('🔍 Found download URL:', downloadUrl);
          }
        } catch (error) {
          console.log('Error parsing response:', error.message);
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
          title: title,
          method: 'ytmp3'
        };
      }
      
      // If no download URL found yet, wait a bit more and check again
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      if (downloadUrl) {
        return {
          success: true,
          downloadUrl: downloadUrl,
          title: title,
          method: 'ytmp3'
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

module.exports = {
  scrapeYtmp3
};