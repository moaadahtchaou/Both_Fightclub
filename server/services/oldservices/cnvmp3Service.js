const https = require('https');
const zlib = require('zlib');
const axios = require('axios');
const FormData = require('form-data');

/**
 * Make two sequential POST requests to cnvmp3.com to get video data and download info
 * 
 * @param {string} youtubeUrl - The YouTube video URL
 * @returns {Promise<Object>} - The response containing video data and download URL
 */
function downloadWithCnvMp3API(youtubeUrl) {
  return new Promise((resolve, reject) => {
    if (!youtubeUrl || typeof youtubeUrl !== 'string') {
      reject(new Error('A valid YouTube URL string is required'));
      return;
    }

    console.log('🔄 Starting cnvmp3 download for:', youtubeUrl);
    
    // First request to get_video_data.php
    const firstRequestData = JSON.stringify({
        token: "1234",
        url: youtubeUrl
    });
    
    const firstOptions = {
      hostname: 'cnvmp3.com',
      path: '/get_video_data.php',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(firstRequestData),
        'Origin': 'https://cnvmp3.com',
        'Referer': 'https://cnvmp3.com/v38',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    };

    const firstReq = https.request(firstOptions, (res) => {
      let data = '';
      let stream = res;

      // Handle gzip/deflate compression
      if (res.headers['content-encoding'] === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (res.headers['content-encoding'] === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      } else if (res.headers['content-encoding'] === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress());
      }

      // Set encoding to handle text properly
      stream.setEncoding('utf8');

      stream.on('data', (chunk) => {
        data += chunk;
      });

      stream.on('end', () => {
        try {
          const firstResponse = JSON.parse(data);
          console.log('✅ First request successful:', firstResponse.title || 'Video data retrieved');
          
          if (!firstResponse.success) {
            reject(new Error(`First request failed: ${JSON.stringify(firstResponse)}`));
            return;
          }

          // Second request to download_video_ucep.php
          const secondRequestData = JSON.stringify({
            url: youtubeUrl,
            quality: 0,
            title: firstResponse.title,
            formatValue: 1
          });

          const secondOptions = {
            hostname: 'cnvmp3.com',
            path: '/download_video_ucep.php',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(secondRequestData),
              'Origin': 'https://cnvmp3.com',
              'Referer': 'https://cnvmp3.com/v38',
              'Connection': 'keep-alive',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br'
            }
          };

          const secondReq = https.request(secondOptions, (res2) => {
            let data2 = '';
            let stream2 = res2;

            // Handle gzip/deflate compression for second request
            if (res2.headers['content-encoding'] === 'gzip') {
              stream2 = res2.pipe(zlib.createGunzip());
            } else if (res2.headers['content-encoding'] === 'deflate') {
              stream2 = res2.pipe(zlib.createInflate());
            } else if (res2.headers['content-encoding'] === 'br') {
              stream2 = res2.pipe(zlib.createBrotliDecompress());
            }

            // Set encoding to handle text properly
            stream2.setEncoding('utf8');

            stream2.on('data', (chunk) => {
              data2 += chunk;
            });

            stream2.on('end', () => {
              try {
                const secondResponse = JSON.parse(data2);
                console.log('✅ Second request successful, download URL obtained');
                
                resolve({
                  firstResponse,
                  secondResponse,
                  downloadUrl: secondResponse.url || secondResponse.download_link,
                  title: firstResponse.title
                });
              } catch (err) {
                reject(new Error(`Failed to parse second JSON response: ${err.message}\nRaw Response: ${data2}`));
              }
            });
          });

          secondReq.on('error', (err) => {
            reject(new Error(`Second request error: ${err.message}`));
          });

          secondReq.write(secondRequestData);
          secondReq.end();

        } catch (err) {
          reject(new Error(`Failed to parse first JSON response: ${err.message}\nRaw Response: ${data}`));
        }
      });
    });

    firstReq.on('error', (err) => {
      reject(new Error(`First request error: ${err.message}`));
    });

    firstReq.write(firstRequestData);
    firstReq.end();
  });
}

/**
 * Upload file to Catbox from a download URL
 * @param {string} fileUrl - The URL of the file to upload
 * @param {string} filename - Optional filename for the upload
 * @returns {Promise<string>} - The Catbox URL
 */
async function uploadToCatboxFromUrl(fileUrl, filename = 'upload.mp3') {
  try {
    console.log('🔄 Starting Catbox upload for:', fileUrl);
    
    // URL encode the download link to handle special characters and spaces
    const encodedUrl = encodeURI(fileUrl);
    console.log('🔄 Encoded URL:', encodedUrl);
    
    // Get the file stream from the download URL
    const response = await axios.get(encodedUrl, { 
      responseType: 'stream',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Referer': 'https://cnvmp3.com/',
        'Sec-Ch-Ua': '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-User': '?1',
        'Sec-Gpc': '1',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36'
      },
      timeout: 30000 // 30 second timeout for download
    });
    
    // Prepare form data
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', response.data, {
      filename: filename
    });
    
    // Upload to Catbox
    const uploadResponse = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
      timeout: 60000 // 60 second timeout for upload
    });
    
    console.log('✅ Catbox upload successful:', uploadResponse.data);
    return uploadResponse.data;
  } catch (error) {
    console.error('❌ Catbox upload failed:', error.message);
    throw new Error(`Catbox upload failed: ${error.message}`);
  }
}

/**
 * Complete workflow: Download from cnvmp3 and upload to Catbox
 * @param {string} youtubeUrl - The YouTube video URL
 * @returns {Promise<Object>} - Complete result with video data and Catbox URL
 */
async function downloadAndUploadWithCnvMp3(youtubeUrl) {
  try {
    console.log('🚀 Starting cnvmp3 download and upload workflow for:', youtubeUrl);
    
    // Step 1: Get download URL from cnvmp3
    const cnvResult = await downloadWithCnvMp3API(youtubeUrl);
    
    if (!cnvResult.downloadUrl) {
      throw new Error('No download URL received from cnvmp3 API');
    }
    
    // Step 2: Upload to Catbox
    const catboxUrl = await uploadToCatboxFromUrl(
      cnvResult.downloadUrl, 
      `${cnvResult.title || 'audio'}.mp3`
    );
    
    return {
      success: true,
      title: cnvResult.title,
      downloadUrl: cnvResult.downloadUrl,
      catboxUrl: catboxUrl,
      videoData: cnvResult.firstResponse,
      downloadData: cnvResult.secondResponse
    };
    
  } catch (error) {
    console.error('❌ cnvmp3 workflow failed:', error.message);
    throw error;
  }
}

module.exports = {
  downloadWithCnvMp3API,
  uploadToCatboxFromUrl,
  downloadAndUploadWithCnvMp3
};