const express = require('express');
const ytdl = require('@distube/ytdl-core');
const router = express.Router();
const fs = require('fs');
const { SocksProxyAgent } = require('socks-proxy-agent');
// Read cookies from file
const cookies = fs.readFileSync('cookies.txt', 'utf8');

// It's recommended to use environment variables for your proxy credentials
const proxy = process.env.PROXY_URL; // e.g., 'socks5://user:pass@host:port'
const agent = proxy ? new SocksProxyAgent(proxy) : null;

router.get('/', async (req, res) => {
  const { url, type } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url, { requestOptions: { agent, headers: { 'Cookie': cookies } } });

    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9\s]/g, '');

    res.header('Access-Control-Expose-Headers', 'X-Video-Title');
    res.header('X-Video-Title', title);
    
    //Audio
    res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
    res.header('Content-Type', 'audio/mpeg');
    ytdl(url, { filter: 'audioonly', requestOptions: { agent, headers: { 'Cookie': cookies } } }).pipe(res);

    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading the video' });
  }
});

module.exports = router;