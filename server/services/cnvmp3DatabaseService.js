const axios = require('axios');
const uploadToCatboxFromUrl = require('./upload/UploadCatbox');
const { extractVideoId } = require('../utils/youtubeUtils');
const { cnvmp3EnterToDB } = require('./cnvmp3EntreToDB');

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
    'Referer': 'https://cnvmp3.com/v40',
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

  let title;
  let downloadUrl;

  if (dbResult && dbResult.success && dbResult.data) {
    title = dbResult.data.title || 'Unknown Title';
    downloadUrl = dbResult.data.server_path;
  } else if (
    dbResult &&
    dbResult.success === false &&
    typeof dbResult.error === 'string' &&
    dbResult.error === 'No entry found for the provided youtube_id and quality'
  ) {
    console.log('⚠️ Database entry not found, falling back to 3-step flow');
    // Fallback: perform 3-step flow to create entry and get download link
    const enterRes = await cnvmp3EnterToDB(youtubeUrlOrId);
    title = enterRes.title || 'Unknown Title';
    downloadUrl = enterRes.downloadLink;
  } else {
    const msg = (dbResult && (dbResult.message || dbResult.error)) || 'Cnvmp3 database lookup failed or not found';
    throw new Error(msg);
  }

  if (!downloadUrl || typeof downloadUrl !== 'string') {
    throw new Error('No download URL available from database or conversion flow');
  }

  const filename = `${(title || 'audio').trim()}_${Math.floor(Math.random() * 11)}.mp3`;
  console.log('📥 Download URL:', downloadUrl);
  const info = await uploadToCatboxFromUrl(
    downloadUrl,
    {},
    filename,
    undefined,
    2
  );
  const catboxUrl = info.url;

  return {
    success: true,
    title,
    downloadUrl,
    catboxUrl,
    dbData: dbResult && dbResult.data ? dbResult.data : null
  };
}

module.exports = {
  checkCnvMp3Database,
  downloadAndUploadWithCnvMp3Database
};
