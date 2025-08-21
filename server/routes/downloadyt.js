const express = require('express');
const router = express.Router();
const fs = require('fs');
const os = require('os');
const path = require('path');
const youtubedl = require('youtube-dl-exec');

// Optional proxy support: set PROXY_URL env, e.g. http://user:pass@host:port or socks5://host:port
const proxy = process.env.PROXY_URL;

// Basic URL sanity check (yt-dlp will still validate)
const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;

router.get('/', async (req, res) => {
  const { url, type } = req.query;

  if (!url || !YT_REGEX.test(url)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  try {
    // Get metadata for title header
    let title = 'video';
    try {
      const info = await youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: [
          'referer: https://www.youtube.com/',
          'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        ],
        ...(proxy ? { proxy } : {}),
      });
      if (info && info.title) title = info.title;
    } catch (e) {
      // Non-fatal; continue with generic title
      console.warn('yt-dlp info fetch failed:', e?.message || e);
    }

    const safeTitle = String(title).replace(/[^a-zA-Z0-9\s-_\.]/g, '').slice(0, 100) || 'video';

    res.header('Access-Control-Expose-Headers', 'X-Video-Title');
    res.header('X-Video-Title', safeTitle);

    if (type === 'audio') {
      // Use a temporary file for MP3, since piping post-processed stdout is unreliable across environments
      const tmpFile = path.join(os.tmpdir(), `${Date.now()}-${safeTitle}.mp3`);

      const proc = youtubedl.exec(url, {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: '0',
        output: tmpFile,
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: [
          'referer: https://www.youtube.com/',
          'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        ],
        ...(proxy ? { proxy } : {}),
      });

      proc.on('error', (err) => {
        console.error('yt-dlp audio error:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Audio download failed' });
      });

      proc.on('close', (code) => {
        if (code !== 0 || !fs.existsSync(tmpFile)) {
          console.error('yt-dlp audio exited with code', code);
          if (!res.headersSent) return res.status(500).json({ error: 'Audio download failed' });
          return;
        }
        res.header('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        const stream = fs.createReadStream(tmpFile);
        stream.on('close', () => {
          fs.unlink(tmpFile, () => {});
        });
        stream.pipe(res);
      });
    } else {
      // Stream MP4 directly from yt-dlp stdout
      res.header('Content-Disposition', `attachment; filename="${safeTitle}.mp4"`);
      res.header('Content-Type', 'video/mp4');

      const proc = youtubedl.exec(url, {
        // Prefer mp4 container when possible
        format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        output: '-',
        noPart: true,
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: [
          'referer: https://www.youtube.com/',
          'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        ],
        ...(proxy ? { proxy } : {}),
      }, { stdio: ['ignore', 'pipe', 'pipe'] });

      proc.stdout.pipe(res);
      proc.stderr.on('data', (d) => process.stdout.write(d.toString()));
      proc.on('error', (err) => {
        console.error('yt-dlp video error:', err);
        if (!res.headersSent) res.status(500).json({ error: 'Video download failed' });
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Error downloading the video' });
  }
});

module.exports = router;