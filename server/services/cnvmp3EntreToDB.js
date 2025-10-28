const axios = require('axios');
const { extractVideoId } = require('../utils/youtubeUtils');

/**
 * Perform the 3-step flow to convert and insert a YouTube audio entry into CnvMP3's database.
 * Steps:
 * 1) POST get_video_data.php { url, token }
 * 2) POST download_video_ucep.php { url, quality, title, formatValue }
 * 3) POST insert_to_database.php { youtube_id, server_path, quality, title, formatValue }
 *
 * @param {string} youtubeUrlOrId - Full YouTube URL (https://...) or a video ID
 * @returns {Promise<{success:boolean,youtubeId:string,title:string,downloadLink:string,insertResult:Object}>}
 */
async function cnvmp3EnterToDB(youtubeUrlOrId) {
  if (!youtubeUrlOrId || typeof youtubeUrlOrId !== 'string') {
    throw new Error('youtubeUrlOrId must be a non-empty string');
  }

  // Normalize inputs
  const youtubeId = youtubeUrlOrId.startsWith('http')
    ? extractVideoId(youtubeUrlOrId)
    : youtubeUrlOrId;

  if (!youtubeId) {
    throw new Error('Failed to extract YouTube video ID from input');
  }

  const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  const baseHeaders = {
    'Content-Type': 'application/json',
    'Origin': 'https://cnvmp3.com',
    'Referer': 'https://cnvmp3.com/v43',
    'Connection': 'keep-alive',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br'
  };

  // 1) get_video_data.php
  const payload1 = { url: youtubeUrl, token: '1234' };
  console.log('▶️ Step 1: get_video_data.php', payload1);

  const res1 = await axios.post('https://cnvmp3.com/get_video_data.php', payload1, {
    headers: baseHeaders,
    timeout: 30000,
    responseType: 'json',
    maxRedirects: 5,
    validateStatus: s => s >= 200 && s < 300
  });

  if (!res1.data || !res1.data.success) {
    throw new Error(`get_video_data failed: ${JSON.stringify(res1.data || {})}`);
  }
  const title = res1.data.title || 'Unknown Title';
  console.log('✅ Step 1 success:', title);

  // 2) download_video_ucep.php
  const payload2 = { url: youtubeUrl, quality: 0, title, formatValue: 1 };
  console.log('▶️ Step 2: download_video_ucep.php', payload2);

  const res2 = await axios.post('https://cnvmp3.com/download_video_ucep.php', payload2, {
    headers: baseHeaders,
    timeout: 45000,
    responseType: 'json',
    maxRedirects: 5,
    validateStatus: s => s >= 200 && s < 300
  });

  if (!res2.data || !res2.data.success) {
    throw new Error(`download_video_ucep failed: ${JSON.stringify(res2.data || {})}`);
  }
  const downloadLink = res2.data.download_link || res2.data.url;
  if (!downloadLink) {
    throw new Error('download_video_ucep did not return a download link');
  }
  console.log('✅ Step 2 success, download_link:', downloadLink);

  // 3) insert_to_database.php
  const payload3 = {
    youtube_id: youtubeId,
    server_path: downloadLink,
    quality: 0,
    title,
    formatValue: 1
  };
  console.log('▶️ Step 3: insert_to_database.php', payload3);

  const res3 = await axios.post('https://cnvmp3.com/insert_to_database.php', payload3, {
    headers: baseHeaders,
    timeout: 30000,
    responseType: 'json',
    maxRedirects: 5,
    validateStatus: s => s >= 200 && s < 300
  });

  if (!res3.data || !res3.data.success) {
    throw new Error(`insert_to_database failed: ${JSON.stringify(res3.data || {})}`);
  }
  console.log('✅ Step 3 success:', res3.data.message || 'Inserted');

  return {
    success: true,
    youtubeId,
    title,
    downloadLink,
    insertResult: res3.data
  };
}

module.exports = {
  cnvmp3EnterToDB
};

// Optional CLI usage: node server/services/cnvmp3EntreToDB.js <youtubeUrlOrId>
if (require.main === module) {
  (async () => {
    try {
      const input = process.argv[2];
      if (!input) {
        console.error('Usage: node server/services/cnvmp3EntreToDB.js <youtubeUrlOrId>');
        process.exit(1);
      }
      const result = await cnvmp3EnterToDB(input);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  })();
}