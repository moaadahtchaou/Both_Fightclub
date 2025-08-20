const express = require('express');
const ytdl = require('@distube/ytdl-core');
const router = express.Router();

// YouTube download endpoint
router.get('/', async (req, res) => {
  const { url, type, mode } = req.query;

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    const info = await ytdl.getInfo(url);
    const rawTitle = info.videoDetails.title || 'youtube-audio';
    const title = rawTitle.replace(/[^a-zA-Z0-9\s-_]/g, '').trim();

    // Set headers before starting the stream
    res.header('Access-Control-Expose-Headers', 'X-Video-Title');
    res.header('X-Video-Title', title);

    // Production-friendly path: redirect to the direct audio/video URL to avoid long serverless streaming
    if (mode === 'redirect') {
      const filter = type === 'audio' ? 'audioonly' : 'audioandvideo';
      const quality = type === 'audio' ? 'highestaudio' : 'highest';
      const format = ytdl.chooseFormat(info.formats, { filter, quality });
      if (!format || !format.url) {
        return res.status(500).json({ error: 'No downloadable format found' });
      }
      return res.redirect(302, format.url);
    }

    if (type === 'audio') {
      res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.header('Content-Type', 'audio/mpeg');
      // Increase highWaterMark to improve streaming stability on some platforms
      ytdl(url, { filter: 'audioonly', quality: 'highestaudio', highWaterMark: 1 << 25 }).pipe(res);
    } else {
      res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
      res.header('Content-Type', 'video/mp4');
      ytdl(url, { filter: 'audioandvideo', quality: 'highest', highWaterMark: 1 << 25 }).pipe(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading the video' });
  }
});

module.exports = router;