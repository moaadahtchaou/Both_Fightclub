const axios = require('axios');
const FormData = require('form-data');

/**
 * Function to upload file to Catbox
 * @param {string} fileUrl - URL of the file to upload
 * @returns {string} Catbox upload URL
 */
async function uploadToCatbox(fileUrl) {
  try {
    console.log('🔄 Starting Catbox upload for:', fileUrl);
    
    // Get the file stream from the download URL
    const response = await axios.get(fileUrl, { responseType: 'stream' });
    
    // Prepare form data
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', response.data, {
      filename: 'upload.mp3'
    });
    
    // Upload to Catbox
    const uploadResponse = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
      timeout: 60000 // 60 second timeout
    });
    
    console.log('✅ Catbox upload successful:', uploadResponse.data);
    return uploadResponse.data;
  } catch (error) {
    console.error('❌ Catbox upload failed:', error.message);
    throw new Error(`Catbox upload failed: ${error.message}`);
  }
}

module.exports = {
  uploadToCatbox
};