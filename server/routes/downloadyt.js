const express = require('express');
const router = express.Router();
const fs = require('fs');
const os = require('os');
const path = require('path');
const youtubedl = require('youtube-dl-exec');

// Optional proxy support: set PROXY_URL env, e.g. http://user:pass@host:port or socks5://host:port
const proxy = process.env.PROXY_URL;

// Optional cookies support to bypass bot checks:
// - YTDLP_COOKIES_FILE: absolute path to a Netscape cookies file
// - YTDLP_COOKIES: full Netscape cookies file content (multiline)
// We'll prefer the file path if provided and exists.

// Basic URL sanity check (yt-dlp will still validate)
const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i;

router.get('/', async (req, res) => {
  const { type } = req.query;
  const rawUrl = (req.query.url || '').toString();
  const cleanedUrl = rawUrl
    .trim()
    // strip wrapping quotes/backticks if the client sent them
    .replace(/^[`'\"]+|[`'\"]+$/g, '')
    // remove accidental newlines
    .replace(/\r?\n/g, '');

  if (!cleanedUrl || !YT_REGEX.test(cleanedUrl)) {
    return res.status(400).json({ error: 'Invalid YouTube URL' });
  }

  // Prepare optional cookies
  let cookiesPath = null;
  let tempCookiesFile = null;
  try {
    const envCookiesFile = process.env.YTDLP_COOKIES_FILE;
    const envCookiesText = process.env.YTDLP_COOKIES;
    if (envCookiesFile && fs.existsSync(envCookiesFile)) {
      cookiesPath = envCookiesFile;
    } else if (envCookiesText && envCookiesText.trim()) {
      // Write env-provided cookies text to a temp file for this request
      tempCookiesFile = path.join(os.tmpdir(), `cookies-${Date.now()}-${Math.random().toString(36).slice(2)}.txt`);
      fs.writeFileSync(tempCookiesFile, envCookiesText, { encoding: 'utf8' });
      cookiesPath = tempCookiesFile;
    }
    // Fallback for testing: use repo cookies file if present (NOT recommended for long-term use)
    if (!cookiesPath) {
      const repoCookies = path.resolve(process.cwd(), 'a54701ca-12a4-4b8a-b4c9-9a82602fe172.txt');
      if (fs.existsSync(repoCookies)) {
        cookiesPath = repoCookies;
      }
    }
  } catch (e) {
    console.warn('Unable to prepare cookies for yt-dlp:', e?.message || e);
  }

  const commonOpts = {
    noCheckCertificates: true,
    noWarnings: true,
    addHeader: [
      'referer: https://www.youtube.com/',
      'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    ],
    // Try iOS client which is often less impacted by bot checks
    extractorArgs: 'youtube:player_client=ios',
    ...(proxy ? { proxy } : {}),
    ...(cookiesPath ? { cookies: cookiesPath } : {}),
  };

  const cleanupCookies = () => {
    if (tempCookiesFile) {
      fs.unlink(tempCookiesFile, () => {});
      tempCookiesFile = null;
    }
  };

  try {
    // Get metadata for title header
    let title = 'video';
    try {
      const info = await youtubedl(cleanedUrl, {
        dumpSingleJson: true,
        ...commonOpts,
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

      const proc = youtubedl.exec(cleanedUrl, {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: '0',
        output: tmpFile,
        // Request best available audio to avoid format selection errors
        format: 'bestaudio/best',
        // Use web client for audio to improve format availability
        extractorArgs: 'youtube:player_client=web',
        ...commonOpts,
      });

      // Log stderr to help diagnose format issues in hosting logs
      proc.stderr?.on('data', (d) => process.stdout.write(d.toString()));
      proc.on('error', (err) => {
        console.error('yt-dlp audio error:', err);
        cleanupCookies();
        if (!res.headersSent) res.status(500).json({ error: 'Audio download failed' });
      });

      proc.on('close', (code) => {
        if (code !== 0 || !fs.existsSync(tmpFile)) {
          console.error('yt-dlp audio exited with code', code);
          cleanupCookies();
          if (!res.headersSent) return res.status(500).json({ error: 'Audio download failed' });
          return;
        }
        res.header('Content-Disposition', `attachment; filename="${safeTitle}.mp3"`);
        res.header('Content-Type', 'audio/mpeg');
        const stream = fs.createReadStream(tmpFile);
        stream.on('close', () => {
          fs.unlink(tmpFile, () => {});
          cleanupCookies();
        });
        stream.pipe(res);
      });
    } else {
      // Stream MP4 directly from yt-dlp stdout
      res.header('Content-Disposition', `attachment; filename="${safeTitle}.mp4"`);
      res.header('Content-Type', 'video/mp4');

      const proc = youtubedl.exec(
        cleanedUrl,
        {
          // Prefer mp4 container when possible
          format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
          output: '-',
          noPart: true,
          ...commonOpts,
        },
        { stdio: ['ignore', 'pipe', 'pipe'] }
      );

      proc.stdout.pipe(res);
      proc.stderr.on('data', (d) => process.stdout.write(d.toString()));
      proc.on('error', (err) => {
        console.error('yt-dlp video error:', err);
        cleanupCookies();
        if (!res.headersSent) res.status(500).json({ error: 'Video download failed' });
      });
      proc.on('close', () => {
        cleanupCookies();
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    cleanupCookies();
    res.status(500).json({ error: 'Error downloading the video' });
  }
});

module.exports = router;