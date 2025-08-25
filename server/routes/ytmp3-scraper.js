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
  return filename.replace(/[^a-zA-Z0-9\s\-_]/g, '').trim();
}

// Main scraping function
async function scrapeYtmp3(youtubeUrl) {
  let browser;
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
      headless: 'new', // Use new headless mode
      timeout: 30000 // 30 second timeout for browser launch
    });

    const page = await browser.newPage();
    
    // Set page timeout and user agent
    await page.setDefaultTimeout(30000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport for consistency
    await page.setViewport({ width: 1280, height: 720 });
    
    // Navigate to ytmp3.as with retry logic
    let navigationSuccess = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto('https://ytmp3.as/AOPR/', { 
          waitUntil: 'networkidle2',
          timeout: 20000
        });
        navigationSuccess = true;
        break;
      } catch (navError) {
        console.log(`Navigation attempt ${attempt + 1} failed:`, navError.message);
        if (attempt === 2) throw navError;
        await page.waitForTimeout(2000); // Wait 2 seconds before retry
      }
    }
    
    if (!navigationSuccess) {
      throw new Error('Failed to navigate to ytmp3.as after 3 attempts');
    }
    
    // Wait for the input field and fill it with YouTube URL
    try {
      await page.waitForSelector('input[type="text"]', { timeout: 15000 });
      
      // Clear any existing content and type the URL
      await page.click('input[type="text"]', { clickCount: 3 }); // Select all
      await page.type('input[type="text"]', youtubeUrl, { delay: 100 });
      
      // Wait a moment for the input to register
      await page.waitForTimeout(1000);
      
    } catch (inputError) {
      throw new Error('Could not find or fill the YouTube URL input field');
    }
    
    // Click the convert button with error handling
    try {
      // Wait for the MP3 button (type="button" with text "MP3")
      await page.waitForSelector('button[type="button"]', { timeout: 10000 });
      
      // Find and click the MP3 button specifically
      const mp3Button = await page.$('button[type="button"]');
      if (mp3Button) {
        const buttonText = await page.evaluate(btn => btn.textContent.trim(), mp3Button);
        if (buttonText === 'MP3') {
          await mp3Button.click();
          console.log('MP3 conversion button clicked successfully');
        } else {
          throw new Error(`Expected MP3 button but found: ${buttonText}`);
        }
      } else {
        throw new Error('MP3 conversion button not found');
      }
    } catch (buttonError) {
      throw new Error(`Could not find or click the MP3 convert button: ${buttonError.message}`);
    }
    
    // Wait for conversion to complete and download link to appear
    let downloadLink = null;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout for conversion
    
    console.log('Waiting for conversion to complete...');
    
    while (!downloadLink && attempts < maxAttempts) {
      await page.waitForTimeout(2000); // Wait 2 seconds between checks
      
      try {
        // Check for error messages first
        const errorElements = await page.$$eval('[class*="error"], .error, #error', 
          elements => elements.map(el => el.textContent.trim())
        );
        
        if (errorElements.length > 0 && errorElements.some(text => text.length > 0)) {
          throw new Error(`Conversion failed: ${errorElements[0]}`);
        }
        
        // Look for download links with multiple selectors and better debugging
        const links = await page.$$eval('a', links => 
          links.map(link => ({ 
            href: link.href, 
            text: link.textContent.trim().toLowerCase(),
            className: link.className,
            id: link.id
          }))
            .filter(link => 
              link.href.includes('.mp3') || 
              link.text.includes('download') ||
              link.href.includes('download') ||
              link.className.includes('download') ||
              link.text.includes('mp3') ||
              link.href.includes('blob:') ||
              link.href.includes('data:audio')
            )
        );
        
        // Debug: log all links found for troubleshooting
        if (attempts % 10 === 0) { // Log every 10th attempt to avoid spam
          const allLinks = await page.$$eval('a', links => 
            links.map(link => ({
              href: link.href,
              text: link.textContent.trim(),
              className: link.className
            }))
          );
          console.log(`Debug - All links found (attempt ${attempts}):`, allLinks.slice(0, 5)); // Show first 5 links
        }
        
        if (links.length > 0) {
          downloadLink = links[0].href;
          console.log('Download link found:', downloadLink);
          break;
        }
        
        // Check if we're still on the same page (conversion might have failed)
        const currentUrl = page.url();
        if (currentUrl === 'https://ytmp3.as/AOPR/' && attempts > 10) {
          // Try to find any indication that conversion failed or is in progress
          const pageText = await page.evaluate(() => document.body.textContent.toLowerCase());
          
          if (pageText.includes('error') || pageText.includes('failed')) {
            throw new Error('Conversion appears to have failed based on page content');
          }
          
          // Check for conversion progress indicators
          if (pageText.includes('converting') || pageText.includes('processing') || pageText.includes('please wait')) {
            console.log('Conversion still in progress...');
          } else if (attempts > 30) {
            // After 30 attempts (1 minute), log page content for debugging
            console.log('Debug - Current page content sample:', pageText.substring(0, 500));
          }
        }
        
        // Check for any buttons or elements that might indicate conversion completion
        const conversionElements = await page.$$eval('button, div, span', elements => 
          elements.map(el => ({
            tag: el.tagName.toLowerCase(),
            text: el.textContent.trim().toLowerCase(),
            className: el.className
          }))
            .filter(el => 
              el.text.includes('download') || 
              el.text.includes('ready') ||
              el.text.includes('complete') ||
              el.className.includes('download')
            )
        );
        
        if (conversionElements.length > 0 && attempts % 10 === 0) {
          console.log('Debug - Conversion-related elements found:', conversionElements.slice(0, 3));
        }
        
      } catch (evalError) {
        console.log('Error during link search:', evalError.message);
        // Continue trying unless it's a conversion error
        if (evalError.message.includes('Conversion failed')) {
          throw evalError;
        }
      }
      
      attempts++;
      console.log(`Conversion attempt ${attempts}/${maxAttempts}...`);
    }
    
    if (!downloadLink) {
      throw new Error('Download link not found after conversion timeout. The video might be unavailable or the service might be down.');
    }
    
    // Get video title from the page
    let videoTitle = 'Unknown';
    try {
      videoTitle = await page.$eval('h1, .title, [class*="title"]', el => el.textContent.trim());
    } catch (e) {
      // Fallback: extract from YouTube URL
      const videoId = extractVideoId(youtubeUrl);
      videoTitle = videoId || 'youtube_audio';
    }
    
    return {
      success: true,
      downloadUrl: downloadLink,
      title: sanitizeFilename(videoTitle)
    };
    
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

// Download file from URL with retry logic
async function downloadFile(url, filename) {
  const maxRetries = 3;
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`Downloading file, attempt ${attempt + 1}/${maxRetries}...`);
      
      const response = await fetch(url, {
        timeout: 30000, // 30 second timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) < 1000) {
        throw new Error('Downloaded file appears to be too small (likely an error page)');
      }
      
      const buffer = await response.buffer();
      
      if (buffer.length < 1000) {
        throw new Error('Downloaded file is too small (likely corrupted or an error)');
      }
      
      console.log(`File downloaded successfully, size: ${buffer.length} bytes`);
      return buffer;
      
    } catch (error) {
      lastError = error;
      console.log(`Download attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      }
    }
  }
  
  throw new Error(`Failed to download file after ${maxRetries} attempts: ${lastError.message}`);
}

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
      
      console.log('Step 2: Conversion successful, downloading file...');
      
      // Download the MP3 file
      const audioBuffer = await downloadFile(result.downloadUrl, result.title);
      
      return { audioBuffer, title: result.title };
    })();
    
    const { audioBuffer, title } = await Promise.race([conversionPromise, timeoutPromise]);
    
    // Validate the downloaded file
    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('Downloaded file is empty or corrupted');
    }
    
    // Set response headers
    res.header('Access-Control-Expose-Headers', 'X-Video-Title');
    res.header('X-Video-Title', title);
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');
    res.header('Content-Length', audioBuffer.length.toString());
    
    // Send the file
    res.send(audioBuffer);
    
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
    } else if (error.message.includes('Download link not found')) {
      statusCode = 422;
      errorCode = 'CONVERSION_FAILED';
      userMessage = 'Unable to convert this video. It may be private, restricted, or unavailable.';
    } else if (error.message.includes('download') || error.message.includes('fetch')) {
      statusCode = 502;
      errorCode = 'DOWNLOAD_FAILED';
      userMessage = 'Failed to download the converted file. Please try again.';
    }
    
    res.status(statusCode).json({ 
      error: userMessage,
      code: errorCode,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;