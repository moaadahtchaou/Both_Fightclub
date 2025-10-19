const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const zlib = require('zlib');
const https = require('https');
const http = require('http');
const { PassThrough } = require('stream');

const DEFAULT_HEADERS = {
  'Accept': '*/*',
  'Accept-Encoding': 'identity',
  'Accept-Language': 'en-US,en;q=0.9',
  'Connection': 'keep-alive',
  'Origin': 'https://cnvmp3.com',
  'Referer': 'https://cnvmp3.com/',
  'Sec-Ch-Ua': '"Brave";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
  'Sec-Ch-Ua-Mobile': '?1',
  'Sec-Ch-Ua-Platform': '"Android"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'cross-site',
  'Sec-Fetch-User': '?1',
  'Sec-Gpc': '1',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36'
};

const KEEPALIVE_HTTPS = new https.Agent({ keepAlive: true });
const KEEPALIVE_HTTP = new http.Agent({ keepAlive: true });

// Normalize the URL to avoid double-encoding of existing % sequences
function sanitizeUrl(url) {
  try {
    return encodeURI(decodeURI(url));
  } catch {
    return url;
  }
}

function parseFlags(argv) {
  const options = { headers: {}, retries: 1 };
  for (const arg of argv) {
    if (arg.startsWith('--filename=')) options.filename = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--referer=')) options.headers['Referer'] = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--ua=')) options.headers['User-Agent'] = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--origin=')) options.headers['Origin'] = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--header=')) {
      const kv = arg.substring('--header='.length);
      const idx = kv.indexOf('=');
      if (idx > 0) options.headers[kv.slice(0, idx)] = kv.slice(idx + 1);
    }
    else if (arg.startsWith('--userhash=')) options.userhash = arg.split('=').slice(1).join('=');
    else if (arg.startsWith('--retries=')) options.retries = parseInt(arg.split('=').slice(1).join('=') || '1', 10) || 1;
  }
  return options;
}

function mapContentTypeToExt(ct) {
  if (!ct) return null;
  const c = ct.toLowerCase();
  if (c.includes('audio/mpeg')) return '.mp3';
  if (c.includes('audio/mp4')) return '.m4a';
  if (c.includes('audio/ogg')) return '.ogg';
  if (c.includes('audio/wav')) return '.wav';
  if (c.includes('video/mp4')) return '.mp4';
  if (c.includes('application/pdf')) return '.pdf';
  if (c.includes('image/jpeg')) return '.jpg';
  if (c.includes('image/png')) return '.png';
  return null;
}

function extractFilenameFromContentDisposition(cd) {
  if (!cd) return null;
  const star = /filename\*=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
  if (star && star[1]) return star[1];
  const plain = /filename="?([^";]+)"?/i.exec(cd);
  if (plain && plain[1]) return plain[1];
  return null;
}

function getFilenameFromQuery(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const q = u.searchParams.get('file');
    if (q) {
      const base = path.basename(q);
      if (base) return base;
    }
  } catch {}
  return null;
}

function extFromFilename(name) {
  const ext = path.extname(name || '').toLowerCase();
  return ext || null;
}

function inferFilename(rawUrl, contentType, fallback = 'upload.bin', contentDisposition) {
  const fromCD = extractFilenameFromContentDisposition(contentDisposition);
  if (fromCD) return fromCD;
  const fromQuery = getFilenameFromQuery(rawUrl);
  let base = fromQuery;
  if (!base) {
    try {
      const parsed = new URL(rawUrl);
      base = path.basename(parsed.pathname);
    } catch {
      base = null;
    }
  }
  if (!base || base === '/' || base.length === 0) base = fallback;
  if (!path.extname(base)) {
    const ext = mapContentTypeToExt(contentType);
    if (ext) base += ext.startsWith('.') ? ext : `.${ext}`;
  }
  return base;
}

function looksLikeHTML(buf) {
  if (!buf || buf.length < 20) return false;
  const s = buf.slice(0, 512).toString('utf8').toLowerCase();
  return s.includes('<html') || s.includes('<!doctype html') || s.includes('<head>') || s.includes('<body');
}

function looksLikeAudio(buf) {
  if (!buf || buf.length < 10) return false;
  // MP3 with ID3 tag
  if (buf.slice(0, 3).toString('ascii') === 'ID3') return true;
  // OGG
  if (buf.slice(0, 4).toString('ascii') === 'OggS') return true;
  // WAV/RIFF
  if (buf.slice(0, 4).toString('ascii') === 'RIFF') return true;
  // MP3 frame sync: 0xFFEx (rough heuristic)
  const b0 = buf[0];
  const b1 = buf[1];
  if (b0 === 0xFF && (b1 & 0xE0) === 0xE0) return true;
  return false;
}

function makeSniffingStream(stream, onSniff) {
  let collected = Buffer.alloc(0);
  let sniffed = false;
  const out = new PassThrough();
  stream.on('data', (chunk) => {
    if (!sniffed) {
      collected = Buffer.concat([collected, chunk]);
      if (collected.length >= 2048) {
        sniffed = true;
        try { onSniff(collected.slice(0, 4096)); } catch {}
      }
    }
    out.write(chunk);
  });
  stream.on('end', () => {
    if (!sniffed) {
      try { onSniff(collected); } catch {}
    }
    out.end();
  });
  stream.on('error', (err) => out.emit('error', err));
  return out;
}

async function fetchStream(encodedUrl, headers) {
  return axios.get(encodedUrl, {
    responseType: 'stream',
    headers,
    timeout: 90000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
    httpAgent: KEEPALIVE_HTTP,
    httpsAgent: KEEPALIVE_HTTPS,
    maxContentLength: Infinity,
  });
}

async function postForm(form) {
  const formHeaders = form.getHeaders();
  let contentLength;
  try {
    contentLength = await new Promise((resolve, reject) => form.getLength((err, len) => err ? reject(err) : resolve(len)));
  } catch {
    contentLength = undefined;
  }
  const headers = contentLength ? { ...formHeaders, 'Content-Length': contentLength } : formHeaders;
  return axios.post('https://catbox.moe/user/api.php', form, {
    headers,
    timeout: 90000,
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
    httpAgent: KEEPALIVE_HTTP,
    httpsAgent: KEEPALIVE_HTTPS,
    maxBodyLength: Infinity,
  });
}

async function uploadToCatboxFromUrl(fileUrl, headers = {}, filename, userhash, retries = 1, skipDefaultHeaders = false) {
  if (!fileUrl || typeof fileUrl !== 'string') {
    throw new Error('A valid file URL is required');
  }

  const encodedUrl = sanitizeUrl(fileUrl);
  const mergedHeaders = skipDefaultHeaders ? { ...headers } : { ...DEFAULT_HEADERS, ...headers };

  let attempt = 0;
  let lastErr;
  while (attempt < Math.max(1, retries)) {
    try {
      const response = await fetchStream(encodedUrl, mergedHeaders);
      const contentType = response.headers['content-type'] || null;
      const contentDisposition = response.headers['content-disposition'] || null;
      const contentEncoding = response.headers['content-encoding'] || null;
      const contentLength = Number(response.headers['content-length']) || null;
      const finalUrl = response.request && response.request.res && response.request.res.responseUrl || encodedUrl;

      let stream = response.data;
      if (contentEncoding === 'gzip') stream = stream.pipe(zlib.createGunzip());
      else if (contentEncoding === 'deflate') stream = stream.pipe(zlib.createInflate());
      else if (contentEncoding === 'br') stream = stream.pipe(zlib.createBrotliDecompress());

      let isHTML = false;
      let isAudio = false;
      const sniffStream = makeSniffingStream(stream, (buf) => {
        isHTML = looksLikeHTML(buf);
        isAudio = looksLikeAudio(buf);
      });

      if (isHTML || (contentType && contentType.includes('text/html'))) {
        throw new Error('Source returned HTML instead of audio; headers/session likely required');
      }
      if (contentLength !== null && contentLength < 2048) {
        throw new Error('Source payload too small; likely an error page or token gate');
      }

      const finalFilename = filename || inferFilename(finalUrl, contentType, 'upload.bin', contentDisposition);

      let uploadContentType = contentType || undefined;
      if (!uploadContentType) {
        const ext = extFromFilename(finalFilename);
        if (ext === '.mp3') uploadContentType = 'audio/mpeg';
        else if (ext === '.m4a') uploadContentType = 'audio/mp4';
        else if (ext === '.ogg') uploadContentType = 'audio/ogg';
        else if (ext === '.wav') uploadContentType = 'audio/wav';
      }

      const form = new FormData();
      form.append('reqtype', 'fileupload');
      if (userhash) form.append('userhash', userhash);
      form.append('fileToUpload', sniffStream, {
        filename: finalFilename,
        contentType: uploadContentType,
        knownLength: contentLength || undefined,
      });

      const uploadResponse = await postForm(form);

      if (typeof uploadResponse.data === 'string' && uploadResponse.data.startsWith('http')) {
        return {
          url: uploadResponse.data.trim(),
          contentType,
          filename: finalFilename,
          sourceFinalUrl: finalUrl,
          contentEncoding,
          contentLength,
        };
      }
      throw new Error(`Catbox API error: ${uploadResponse.data}`);
    } catch (err) {
      lastErr = err;
      attempt += 1;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      break;
    }
  }
  throw lastErr || new Error('Upload failed');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node uploadToCatboxFromUrl.js <file_url> [--filename=name.ext] [--referer=...] [--ua=...] [--origin=...] [--header=Key=Value] [--userhash=YOUR_HASH] [--retries=1]');
    console.error('Example: node uploadToCatboxFromUrl.js "https://example.com/song.mp3" --referer=https://cnvmp3.com/v38 --filename="mySong.mp3" --retries=2');
    process.exit(1);
  }

  const fileUrl = args[0];
  const opts = parseFlags(args.slice(1));

  console.log('Uploading to Catbox from URL...');
  console.log('Source URL:', fileUrl);
  if (opts.filename) console.log('Filename:', opts.filename);
  if (Object.keys(opts.headers).length) console.log('Custom headers:', opts.headers);

  uploadToCatboxFromUrl(fileUrl, opts.headers, opts.filename, opts.userhash, opts.retries)
    .then((info) => {
      console.log('✅ Upload complete');
      console.log('Catbox URL:', info.url);
      console.log('Filename:', info.filename);
      console.log('Content-Type:', info.contentType || 'unknown');
      console.log('Content-Encoding:', info.contentEncoding || 'none');
      console.log('Content-Length:', info.contentLength || 'unknown');
      console.log('Final Source URL:', info.sourceFinalUrl);
    })
    .catch((err) => {
      console.error('❌ Upload failed:', err.message);
      console.error('Hint: if you see HTML or tiny payloads, the source likely needs exact Referer/Cookie/Origin headers.');
      process.exit(1);
    });
}

module.exports = uploadToCatboxFromUrl;