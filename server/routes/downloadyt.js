const express = require('express');
const ytdl = require('@distube/ytdl-core');
const router = express.Router();

// YouTube download endpoint
router.get('/', async (req, res) => {
  const { url, type } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title.replace(/[^a-zA-Z0-9\s]/g, '');

    // Set headers before starting the stream
    res.header('Access-Control-Expose-Headers', 'X-Video-Title');
    res.header('X-Video-Title', title);
    
    if (type === 'audio') {
      res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.header('Content-Type', 'audio/mpeg');
      ytdl(url, { filter: 'audioonly' }).pipe(res);
    } else {
      res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
      res.header('Content-Type', 'video/mp4');
      ytdl(url, { filter: 'audioandvideo' }).pipe(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading the video' });
  }
});

module.exports = router;