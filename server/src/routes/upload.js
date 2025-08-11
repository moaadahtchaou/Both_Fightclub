const express = require('express');
const router = express.Router();
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('fileToUpload'), async (req, res) => {
  if (!req.file) {
    console.log('No file uploaded.');
    return res.status(400).send('No file uploaded.');
  }

  console.log('File uploaded:', req.file);

  const filePath = req.file.path;

  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(filePath), req.file.originalname);
    console.log('Form data: ', form);
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
    });
    console.log('Upload response:', response.data);
    fs.unlinkSync(filePath); // Clean up the uploaded file

    if (response.status === 200) {
      console.log('Upload successful:', response.data);
      res.send(response.data);

    } else {
      console.log(response.status, response.statusText);
      res.status(response.status).send(response.statusText);
    }
  } catch (error) {
    fs.unlinkSync(filePath); // Clean up the uploaded file
    console.error('Error uploading to Catbox:', error);
    res.status(500).send('Error uploading to Catbox.');
  }
});

module.exports = router;