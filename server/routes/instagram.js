const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const axios = require('axios');
const FormData = require('form-data');
const { Audio } = require('../models');
const User = require('../models/User');
const { verifyToken } = require('./auth');

const router = express.Router();

function checkYtDlp() {
  return new Promise((resolve) => {
    // Prefer Python module invocation to avoid PATH issues
    const py = spawn('py', ['-m', 'yt_dlp', '--version'], { stdio: 'ignore' });
    let resolved = false;
    py.on('close', (code) => {
      if (!resolved && code === 0) {
        resolved = true;
        return resolve({ cmd: 'py', prefix: ['-m', 'yt_dlp'] });
      }
      if (!resolved) {
        // Fallback to direct yt-dlp
        const ytdlp = spawn('yt-dlp', ['--version'], { stdio: 'ignore' });
        ytdlp.on('close', (code2) => {
          if (code2 === 0) return resolve({ cmd: 'yt-dlp', prefix: [] });
          return resolve(null);
        });
      }
    });
    py.on('error', () => {
      const ytdlp = spawn('yt-dlp', ['--version'], { stdio: 'ignore' });
      ytdlp.on('close', (code2) => {
        if (code2 === 0) return resolve({ cmd: 'yt-dlp', prefix: [] });
        return resolve(null);
      });
    });
  });
}

async function checkFFmpeg() {
  return new Promise((resolve) => {
    try {
      const proc = spawn('ffmpeg', ['-version'], { stdio: 'ignore' });
      proc.on('close', (code) => resolve(code === 0));
      proc.on('error', () => resolve(false));
    } catch (_) {
      resolve(false);
    }
  });
}

async function getInfo(yt, url) {
  return new Promise((resolve) => {
    const args = [...yt.prefix, '-J', '--no-warnings', url];
    const proc = spawn(yt.cmd, args, { encoding: 'utf8' });
    let out = '';
    proc.stdout.on('data', (d) => (out += d.toString()));
    proc.on('close', () => {
      try {
        const info = JSON.parse(out || '{}');
        return resolve({
          title: info.title || 'Instagram Reel',
          duration: typeof info.duration === 'number' ? info.duration : 0,
        });
      } catch (_) {
        return resolve({ title: 'Instagram Reel', duration: 0 });
      }
    });
    proc.on('error', () => resolve({ title: 'Instagram Reel', duration: 0 }));
  });
}

async function downloadToTemp(yt, url, format = 'mp3', quality = '192') {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'igcat-'));
  const outTemplate = path.join(tempDir, 'audio.%(ext)s');
  const expected = path.join(tempDir, `audio.${format}`);

  // normalize quality
  let q = String(quality).toLowerCase();
  if (!q.endsWith('k')) q = `${q}k`;

  const args = [
    ...yt.prefix,
    '-f', 'best[ext=mp4]',
    '-x',
    '--audio-format', format,
    '--audio-quality', q,
    '-o', outTemplate,
    url,
  ];

  const proc = spawn(yt.cmd, args, { stdio: 'inherit' });

  const result = await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch (_) {}
      resolve({ ok: false, error: 'Timeout while downloading' });
    }, 4 * 60 * 1000); // 4 minutes

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 && fs.existsSync(expected)) {
        return resolve({ ok: true, tempDir, filePath: expected });
      }
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
      return resolve({ ok: false, error: `yt-dlp exited with code ${code}` });
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
      resolve({ ok: false, error: err.message });
    });
  });

  return result;
}

async function uploadFileToCatbox(filePath, filename = 'audio.mp3') {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', fs.createReadStream(filePath), { filename });
  const resp = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    timeout: 60_000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  if (resp && resp.data && typeof resp.data === 'string' && resp.data.startsWith('http')) {
    return resp.data;
  }
  throw new Error('Unexpected response from Catbox');
}

// Stream yt-dlp -> ffmpeg directly to Catbox without writing to disk
async function uploadStreamToCatboxFromYt(yt, url, filename = 'audio.mp3', quality = '192') {
  return new Promise((resolve, reject) => {
    try {
      let q = String(quality).toLowerCase();
      if (!q.endsWith('k')) q = `${q}k`;

      const ytdlpArgs = [
        ...yt.prefix,
        '-f', 'bestaudio/best',
        '-o', '-',
        '--no-part',
        '--no-progress',
        url,
      ];
      const ytdlp = spawn(yt.cmd, ytdlpArgs, { stdio: ['ignore', 'pipe', 'inherit'] });

      const ffArgs = [
        '-hide_banner',
        '-loglevel', 'error',
        '-i', 'pipe:0',
        '-vn',
        '-acodec', 'libmp3lame',
        '-b:a', q,
        '-f', 'mp3',
        'pipe:1',
      ];
      const ffmpeg = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'pipe', 'inherit'] });

      ytdlp.stdout.pipe(ffmpeg.stdin);

      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', ffmpeg.stdout, { filename, contentType: 'audio/mpeg' });

      let settled = false;
      const cleanup = () => {
        try { ytdlp.kill('SIGKILL'); } catch (_) {}
        try { ffmpeg.kill('SIGKILL'); } catch (_) {}
      };

      const timeout = setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error('Timeout during streaming upload'));
      }, 4 * 60 * 1000);

      axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 5 * 60 * 1000,
      }).then((resp) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        cleanup();
        if (resp && resp.data && typeof resp.data === 'string' && resp.data.startsWith('http')) {
          return resolve(resp.data);
        }
        return reject(new Error('Unexpected response from Catbox'));
      }).catch((err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        cleanup();
        reject(err);
      });

      ytdlp.on('error', (e) => { if (!settled) { settled = true; clearTimeout(timeout); cleanup(); reject(e); } });
      ffmpeg.on('error', (e) => { if (!settled) { settled = true; clearTimeout(timeout); cleanup(); reject(e); } });
      ytdlp.on('close', (code) => {
        if (code !== 0 && !settled) {
          settled = true;
          clearTimeout(timeout);
          cleanup();
          reject(new Error(`yt-dlp exited with code ${code}`));
        }
      });
      ffmpeg.on('close', (code) => {
        if (code !== 0 && !settled) {
          settled = true;
          clearTimeout(timeout);
          cleanup();
          reject(new Error(`ffmpeg exited with code ${code}`));
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

function isInstagramUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    const isIg = (host === 'instagram.com' || host.endsWith('.instagram.com') || host === 'ig.me' || host.endsWith('.ig.me')) && /(\/reel\/|\/reels\/|\/p\/|\/tv\/)/.test(path);
    const isFb = (host === 'facebook.com' || host.endsWith('.facebook.com') || host === 'fb.watch' || host.endsWith('.fb.watch')) && (
      /(\/reel\/|\/reels\/|\/videos\/|\/watch\/)/.test(path) || (path === '/watch' && u.searchParams.has('v')) || host.includes('fb.watch')
    );
    return isIg || isFb;
  } catch (_) {
    return false;
  }
}

function getPlatformFromUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host === 'facebook.com' || host.endsWith('.facebook.com') || host === 'fb.watch' || host.endsWith('.fb.watch')) return 'facebook';
    if (host === 'instagram.com' || host.endsWith('.instagram.com') || host === 'ig.me' || host.endsWith('.ig.me')) return 'instagram';
    return null;
  } catch (_) {
    return null;
  }
}

function extractIgFbId(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const path = u.pathname;

    // Instagram shortcodes: /p/{code}/, /reel/{code}/, /reels/{code}/, /tv/{code}/
    if (host.includes('instagram.com') || host.endsWith('ig.me')) {
      const igPatterns = [
        /\/p\/([^/?#]+)/i,
        /\/reel\/([^/?#]+)/i,
        /\/reels\/([^/?#]+)/i,
        /\/tv\/([^/?#]+)/i,
      ];
      for (const re of igPatterns) {
        const m = path.match(re);
        if (m && m[1]) return m[1];
      }
      return null;
    }

    // Facebook: /videos/{id}/, /reel/{id}, /watch/?v={id}, fb.watch short link
    if (host.includes('facebook.com')) {
      const m1 = path.match(/\/videos\/([0-9]+)/i);
      if (m1 && m1[1]) return m1[1];
      const m2 = path.match(/\/reel\/([0-9]+)/i);
      if (m2 && m2[1]) return m2[1];
      const vid = u.searchParams.get('v');
      if (vid) return vid;
      return null;
    }
    if (host.includes('fb.watch')) {
      // fb.watch/{short}
      const seg = path.replace(/^\//, '').split('/')[0];
      return seg || null;
    }

    return null;
  } catch (_) {
    return null;
  }
}

// GET /api/instagram/download-and-upload?url=...
router.get('/download-and-upload', verifyToken, async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Instagram/Facebook URL is required', code: 'MISSING_URL' });
  }
  if (!isInstagramUrl(url)) {
    return res.status(400).json({ error: 'Invalid Instagram/Facebook URL', code: 'INVALID_URL' });
  }

  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found', code: 'USER_NOT_FOUND' });

    // Duplicate check first: allow returning existing without requiring credits
    const platform = getPlatformFromUrl(url) || 'instagram';
    const igfbId = extractIgFbId(url);
    if (igfbId) {
      // Look for any existing record for this media across all users
      const existing = await Audio.findOne({ source: platform, igfbvideoId: igfbId });
      if (existing) {
        // Share access with current user if not already shared
        const isAlreadyShared = existing.sharedUsers && existing.sharedUsers.includes(user._id);
        if (!isAlreadyShared) {
          existing.sharedUsers.push(user._id);
          await existing.save();
        }
        return res.json({
          success: true,
          alreadyExists: true,
          isShared: true,
          catboxUrl: existing.uploadUrl,
          title: existing.originalName,
          format: 'mp3 192kbps',
          user: { username: user.username, remainingCredits: user.credits },
          platform,
          igfbvideoId: igfbId,
          message: isAlreadyShared ? 'You already have access to this audio file.' : 'This audio already exists and has been shared with you.'
        });
      }
    }

    // No duplicate: ensure user has credits
    if (user.credits < 1) {
      return res.status(402).json({ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS', currentCredits: user.credits });
    }

    const yt = await checkYtDlp();
    if (!yt) {
      return res.status(500).json({ error: 'yt-dlp not available on server', code: 'YTDLP_MISSING' });
    }

    const hasFFmpeg = await checkFFmpeg();
    if (!hasFFmpeg) {
      return res.status(500).json({ error: 'ffmpeg not available on server', code: 'FFMPEG_MISSING' });
    }

    const defaultTitle = platform === 'facebook' ? 'Facebook Video' : 'Instagram Reel';

    const info = await getInfo(yt, url);

    // Stream directly to Catbox (no temp file on OS)
    const safeName = `${(info.title || defaultTitle).slice(0, 60).replace(/[^\w\-\s\.]/g, '') || 'audio'}.mp3`;

    let catboxUrl;
    try {
      catboxUrl = await uploadStreamToCatboxFromYt(yt, url, safeName, '192');
    } catch (e) {
      return res.status(502).json({ error: 'Failed to upload to Catbox', code: 'UPLOAD_FAILED', details: e.message });
    }

    // Deduct credit and save record
    try {
      await user.useCredits(1, `${platform === 'facebook' ? 'Facebook video' : 'Instagram Reel'} audio download: ${info.title || defaultTitle}`);
      const audioRecord = new Audio({
        user: user._id,
        originalName: info.title || defaultTitle,
        source: platform,
        sourceUrl: url,
        youtubeVideoId: null,
        igfbvideoId: igfbId || null,
        uploadUrl: catboxUrl,
        sharedUsers: [user._id],
        ipAddress: req.ip || req.connection?.remoteAddress || 'unknown',
        tags: [platform, 'download'],
        isPublic: false,
      });
      await audioRecord.save();
    } catch (dbErr) {
      if (dbErr?.message?.includes('Insufficient credits')) {
        return res.status(402).json({ error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS', currentCredits: user.credits });
      }
      console.error('DB save error:', dbErr.message);
    }

    return res.json({
      success: true,
      catboxUrl,
      title: info.title || defaultTitle,
      format: 'mp3 192kbps',
      user: { username: user.username, remainingCredits: Math.max(0, (user.credits || 0) - 1) },
      platform,
      igfbvideoId: igfbId || null,
    });
  } catch (err) {
    console.error('Instagram route error:', err.message);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR', details: process.env.NODE_ENV === 'development' ? err.message : undefined });
  }
});

module.exports = router;