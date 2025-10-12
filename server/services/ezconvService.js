const axios = require('axios');
const { cleanYouTubeUrl } = require('../utils/youtubeUtils');

/**
 * Function to download using EzConv API
 * @param {string} youtubeUrl - YouTube URL to download
 * @returns {Object} Download result with success status and data
 */
async function downloadWithEzConvAPI(youtubeUrl) {
  try {
    // Clean the YouTube URL to remove extra parameters
    const cleanedUrl = cleanYouTubeUrl(youtubeUrl);
    console.log('🔄 Starting EzConv API download for:', cleanedUrl);
    if (cleanedUrl !== youtubeUrl) {
      console.log('🧹 URL cleaned from:', youtubeUrl, 'to:', cleanedUrl);
    }
    
    // Step 1: Get authentication token
    console.log('🔑 Getting EzConv authentication token...');
    const tokenResponse = await axios.post('https://ezconv.com/api/token', {}, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 30000 // 30 second timeout
    });
    
    if (!tokenResponse.data || !tokenResponse.data.token) {
      throw new Error('Failed to obtain authentication token from EzConv');
    }
    
    const token = tokenResponse.data.token;
    console.log('✅ EzConv token obtained successfully');
    
    // Step 2: Convert the YouTube URL
    console.log('🔄 Converting YouTube URL with EzConv...');
    const convertResponse = await axios.post('https://ds1.ezsrv.net/api/convert', {
      url: cleanedUrl,
      quality: "320",
      trim: false,
      startT: 0,
      endT: 0,
      token: token
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 60000 // 60 second timeout
    });
    
    if (convertResponse.data && convertResponse.data.status === 'done' && convertResponse.data.url) {
      console.log('✅ EzConv API download successful');

      return {
        success: true,
        downloadUrl: convertResponse.data.url,
        title: convertResponse.data.title || 'Unknown Title',
        format: '320kbps MP3',
        method: 'ezconv'
      };
    } else {
      throw new Error('Invalid response from EzConv API or conversion not completed');
    }
  } catch (error) {
    console.error('❌ EzConv API download failed:', error.message);
    return {
      success: false,
      error: error.message,
      method: 'ezconv'
    };
  }
}

module.exports = {
  downloadWithEzConvAPI
};