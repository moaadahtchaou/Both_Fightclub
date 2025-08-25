# Dependency Update Instructions

To resolve the deprecation warnings on Render, follow these steps:

## 1. Update Dependencies

The `package.json` has been updated with:
- `multer`: `^1.4.5-lts.1` → `^2.0.0` (security fixes)
- `puppeteer`: `^21.0.0` → `^24.9.0` (latest supported version)

## 2. Install Updated Dependencies

Run these commands in the server directory:

```bash
# Remove old package-lock.json and node_modules
rm -rf package-lock.json node_modules

# Install fresh dependencies
npm install
```

## 3. Test the Application

After updating:
1. Test the upload functionality (uses multer)
2. Test the ytmp3 scraper (uses puppeteer)
3. Verify all routes work correctly

## 4. Deploy to Render

The warnings should be resolved in the next deployment.

## Notes

- Multer 2.x is backward compatible with the current usage
- Puppeteer 24.9.0 includes security updates and performance improvements
- No code changes are required for these updates