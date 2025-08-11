# Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with read/write permissions
- [ ] IP whitelist set to 0.0.0.0/0 (allow all IPs)
- [ ] Connection string obtained and tested

### ✅ Environment Variables
- [ ] `MONGODB_ATLAS_URI` - Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` - A long, random secret key (minimum 32 characters)
- [ ] `NODE_ENV` - Set to "production"
- [ ] `CLIENT_URL` - Your frontend domain (optional)
- [ ] `ADMIN_USERNAME` - Admin username (optional, defaults to Bunny#9332)
- [ ] `ADMIN_PASSWORD` - Admin password (optional, defaults to moaad073022+)

### ✅ Code Verification
- [ ] All file system operations use in-memory storage
- [ ] Database connections have proper timeout handling
- [ ] CORS is configured for production
- [ ] Error handling includes fallback to in-memory storage

## Deployment Steps

### Option 1: Vercel Dashboard
1. [ ] Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. [ ] Click "New Project"
3. [ ] Import from Git or upload project
4. [ ] Set root directory to server folder
5. [ ] Add all environment variables
6. [ ] Click "Deploy"

### Option 2: Vercel CLI
1. [ ] Install Vercel CLI: `npm i -g vercel`
2. [ ] Navigate to server directory
3. [ ] Run `vercel login`
4. [ ] Run `vercel` to deploy
5. [ ] Add environment variables: `vercel env add VARIABLE_NAME`
6. [ ] Redeploy: `vercel --prod`

## Post-Deployment Testing

### ✅ API Endpoints
- [ ] Health check: `GET /api/health`
- [ ] File upload: `POST /upload` (with multipart form data)
- [ ] YouTube download: `GET /download?url=YOUTUBE_URL&type=audio`
- [ ] User endpoints: `GET /api/users` (if applicable)

### ✅ Functionality Tests
- [ ] Admin user creation works
- [ ] Database connection or fallback to memory storage
- [ ] File uploads to Catbox.moe work
- [ ] YouTube downloads work
- [ ] CORS allows your frontend domain

## Troubleshooting

### Common Issues:

**❌ Database Connection Failed**
- Check MongoDB Atlas connection string
- Verify IP whitelist includes 0.0.0.0/0
- App should fallback to in-memory storage

**❌ Function Timeout**
- Check Vercel function logs
- Ensure operations complete within 30 seconds
- Large file operations may need optimization

**❌ CORS Errors**
- Add your frontend domain to environment variables
- Check CORS configuration in middleware
- Verify allowed origins in production

**❌ Environment Variables Not Found**
- Double-check variable names (case-sensitive)
- Redeploy after adding variables
- Check Vercel dashboard settings

## Success Indicators

✅ **Deployment Successful When:**
- Health endpoint returns 200 status
- Admin user is created (check logs)
- File uploads work without filesystem errors
- YouTube downloads complete successfully
- No CORS errors in browser console

## Security Reminders

🔒 **Security Checklist:**
- [ ] Strong JWT secret (32+ characters)
- [ ] Secure admin password
- [ ] MongoDB credentials not exposed
- [ ] CORS properly configured
- [ ] No sensitive data in logs

---

**Need Help?** Check the Vercel function logs for detailed error messages.