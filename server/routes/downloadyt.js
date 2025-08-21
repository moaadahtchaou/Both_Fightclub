const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');
const router = express.Router();

const unlinkAsync = promisify(fs.unlink);

router.get('/', async (req, res) => {
  const { url, type } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'YouTube URL is required' });
  }

  try {
    const youtubeDl = require('youtube-dl-exec');

    // First fetch video info to get a clean title
    const videoInfo = await youtubeDl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    });

    const rawTitle = videoInfo && videoInfo.title ? String(videoInfo.title) : `youtube-${Date.now()}`;
    const title = rawTitle.replace(/[^a-zA-Z0-9\s_-]/g, '').trim() || `youtube-${Date.now()}`;

    // Expose title so client can name the file
    res.header('Access-Control-Expose-Headers', 'X-Video-Title');
    res.header('X-Video-Title', title);

    if (type === 'audio') {
      // We want an actual MP3 file. yt-dlp cannot post-process to mp3 on stdout reliably,
      // so we generate a temporary mp3 file, stream it, then delete it.
      res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
      res.header('Content-Type', 'audio/mpeg');

      const tmpPath = path.join(os.tmpdir(), `${title}-${Date.now()}.mp3`);

      await youtubeDl(url, {
        extractAudio: true,
        audioFormat: 'mp3',
        // 0 = best VBR quality; adjust as needed
        audioQuality: '0',
        output: tmpPath,
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]
      });

      const readStream = fs.createReadStream(tmpPath);
      readStream.on('error', async (err) => {
        console.error('Stream error:', err);
        try { await unlinkAsync(tmpPath); } catch (_) {}
        if (!res.headersSent) res.status(500).json({ error: 'Error streaming the audio file' });
        else res.destroy(err);
      });

      readStream.on('close', async () => {
        try { await unlinkAsync(tmpPath); } catch (_) {}
      });

      return readStream.pipe(res);
    }

    // Default: stream best video to client using stdout
    res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
    res.header('Content-Type', 'video/mp4');

    const subprocess = youtubeDl.exec(url, {
      format: 'best',
      output: '-',
      noCheckCertificates: true,
      noWarnings: true,
      preferFreeFormats: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    });

    subprocess.stderr.on('data', (data) => {
      // Useful for debugging yt-dlp/ffmpeg messages on the server
      const msg = data.toString();
      if (msg && msg.trim()) console.error('[yt-dlp]', msg.trim());
    });

    subprocess.on('error', (err) => {
      console.error('Download subprocess error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading the video' });
      } else {
        res.destroy(err);
      }
    });

    return subprocess.stdout.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    const message = (error && error.message) || String(error);
    const details = process.env.NODE_ENV === 'development' ? message : undefined;

    // If ffmpeg is not present for audio conversion, surface a helpful message
    if (/ffmpeg/i.test(message)) {
      return res.status(500).json({ error: 'Audio conversion requires ffmpeg/ffprobe to be available on the server', details });
    }

    return res.status(500).json({ 
      error: 'Error downloading the media',
      details
    });
  }
});

module.exports = router;