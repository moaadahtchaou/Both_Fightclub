const axios = require('axios');
const { uploadToCatboxFromUrl } = require('./cnvmp3Service');
const { extractVideoId } = require('../utils/youtubeUtils');

/**
 * POST to cnvmp3.com/check_database.php with youtube_id to check if file exists
 * @param {string} youtubeId - The YouTube video ID (e.g., vP2j5Z3izM0)
 * @returns {Promise<Object>} - Raw response JSON from cnvmp3
 */
async function checkCnvMp3Database(youtubeId) {
  if (!youtubeId || typeof youtubeId !== 'string') {
    throw new Error('A valid YouTube video ID is required');
  }

  const payload = {
    youtube_id: youtubeId,
    quality: 0,
    formatValue: 1
  };

  const headers = {
    'Content-Type': 'application/json',
    'Origin': 'https://cnvmp3.com',
    'Referer': 'https://cnvmp3.com/v37',
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br'
  };

  console.log(`📡 Checking cnvmp3 database for YouTube ID: ${youtubeId}`);

  const response = await axios.post('https://cnvmp3.com/check_database.php', payload, {
    headers,
    timeout: 30000,
    responseType: 'json',
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 300
  });

  if (!response || !response.data) {
    throw new Error('Empty response from cnvmp3 database API');
  }

  return response.data;
}

/**
 * Orchestrates: check database -> upload server_path to Catbox
 * Accepts either a full YouTube URL or a plain video ID.
 * @param {string} youtubeUrlOrId - YouTube URL (https://...) or video ID
 * @returns {Promise<{success:boolean,title:string,downloadUrl:string,catboxUrl:string,dbData:Object}>}
 */
async function downloadAndUploadWithCnvMp3Database(youtubeUrlOrId) {
  if (!youtubeUrlOrId || typeof youtubeUrlOrId !== 'string') {
    throw new Error('youtubeUrlOrId must be a non-empty string');
  }

  // Determine video ID
  const youtubeId = youtubeUrlOrId.startsWith('http')
    ? extractVideoId(youtubeUrlOrId)
    : youtubeUrlOrId;

  if (!youtubeId) {
    throw new Error('Failed to extract YouTube video ID from input');
  }

  // Step 1: Check cnvmp3 database
  const dbResult = await checkCnvMp3Database(youtubeId);

  if (!dbResult.success || !dbResult.data) {
    const msg = dbResult.message || 'Cnvmp3 database lookup failed or not found';
    throw new Error(msg);
  }

  const { server_path, title } = dbResult.data;

  if (!server_path || typeof server_path !== 'string') {
    throw new Error('No server_path provided by cnvmp3 database API');
  }

  // Step 2: Upload to Catbox using the provided server_path (download URL)
  // Ensure we pass a safe filename (spaces are fine)
  const filename = `${(title || 'audio').trim()}.mp3`;

  console.log('📥 Download URL from database:', server_path);
  const catboxUrl = await uploadToCatboxFromUrl(server_path, filename);

  return {
    success: true,
    title: title || 'Unknown Title',
    downloadUrl: server_path,
    catboxUrl,
    dbData: dbResult.data
  };
}

module.exports = {
  checkCnvMp3Database,
  downloadAndUploadWithCnvMp3Database
};