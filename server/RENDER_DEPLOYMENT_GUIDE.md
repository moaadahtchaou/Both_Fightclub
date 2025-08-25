# Render Deployment Guide for Puppeteer

## Issue: Chrome Dependencies Missing

The error you encountered:
```
libnspr4.so: cannot open shared object file: No such file or directory
```

This happens because Render's Linux environment doesn't include all the system libraries that Chrome needs to run <mcreference link="https://pptr.dev/troubleshooting" index="0">0</mcreference>.

## Solution: Updated Dockerfile

I've updated the **Dockerfile** to install all necessary Chrome dependencies:

### Key Dependencies Added:
- `libnspr4` - The missing library causing your error
- `libnss3` - Network Security Services
- `libgtk-3-0` - GTK+ graphical toolkit
- `libgbm1` - Generic Buffer Management
- `fonts-liberation` - Required fonts
- And 25+ other essential Chrome libraries

### Puppeteer Launch Arguments Enhanced:

I've also updated `ytmp3-scraper.js` with additional Chrome flags for containerized environments:

```javascript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox', 
  '--disable-dev-shm-usage',
  '--single-process',           // New: Prevents multi-process issues
  '--disable-gpu',              // Essential for headless
  '--disable-web-security',
  // ... and 15+ more stability flags
]
```

## Deployment Steps:

### 1. Push Updated Code
```bash
git add .
git commit -m "Fix Chrome dependencies for Render deployment"
git push origin main
```

### 2. Render Will Rebuild
Render will automatically detect the updated Dockerfile and:
- Install all Chrome dependencies during build
- Use the enhanced Puppeteer configuration
- Resolve the `libnspr4.so` error

### 3. Verify Deployment
After deployment, test the ytmp3 scraper endpoint:
```bash
curl -X POST https://your-app.onrender.com/api/ytmp3-scraper \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## Environment Variables (Optional)

For additional stability, you can set these in Render:

```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_CACHE_DIR=/tmp/.cache/puppeteer
NODE_ENV=production
```

## Troubleshooting

### If Chrome Still Fails:
1. Check Render build logs for dependency installation
2. Verify all libraries are installed: `ldd chrome | grep not`
3. Test with minimal Puppeteer script

### Memory Issues:
- Render's free tier has 512MB RAM limit
- Consider upgrading to paid plan for better performance
- The `--single-process` flag helps reduce memory usage

### Timeout Issues:
- Increase timeout values if needed
- Monitor Render's function execution time limits

## Files Modified:

1. **Dockerfile** - Added Chrome dependencies
2. **ytmp3-scraper.js** - Enhanced Puppeteer launch args
3. **package.json** - Updated to secure versions (multer 2.x, puppeteer 24.x)

## Expected Result:

✅ Chrome launches successfully  
✅ No more `libnspr4.so` errors  
✅ ytmp3 scraping works on Render  
✅ Stable containerized deployment  

The next deployment should resolve all Chrome dependency issues!