const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');

// SERVERLESS-SAFE: Configure multer with explicit memory storage only
// This prevents any filesystem operations that would fail on Vercel
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  // Explicitly disable any file system operations
  fileFilter: (req, file, cb) => {
    // Accept all files but ensure they go to memory only
    cb(null, true);
  }
});

router.post('/', upload.single('fileToUpload'), async (req, res) => {
  if (!req.file) {
    console.log('No file uploaded.');
    return res.status(400).send('No file uploaded.');
  }

  console.log('File received (in-memory):', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    // Append the in-memory buffer directly
    form.append('fileToUpload', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: {
        ...form.getHeaders(),
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.6',
        'Cache-Control': 'no-cache',
        'Origin': 'https://catbox.moe',
        'Referer': 'https://catbox.moe/',
        'Sec-Ch-Ua': '"!Not_A;Brand";v="99", "Brave";v="139", "Chromium";v="139"',
        'Sec-Ch-Ua-Mobile': '?1',
        'Sec-Ch-Ua-Platform': '"Android"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log('Upload response:', response.data);

    if (response.status === 200) {
      console.log('Upload successful:', response.data);
      res.send(response.data);
    } else {
      console.log(response.status, response.statusText);
      res.status(response.status).send(response.statusText);
    }
  } catch (error) {
    console.error('Error uploading to Catbox:', error?.response?.data || error.message || error);
    res.status(500).send('Error uploading to Catbox.');
  }
});

module.exports = router;