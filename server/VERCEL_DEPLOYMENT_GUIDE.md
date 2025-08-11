# Vercel Deployment Guide for Fight Club Server

This guide will help you deploy your Fight Club server to Vercel successfully.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **MongoDB Atlas**: Set up a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
3. **Vercel CLI** (optional): `npm i -g vercel`

## Step 1: Set Up MongoDB Atlas

1. Create a free MongoDB Atlas cluster
2. Create a database user with read/write permissions
3. Whitelist all IP addresses (0.0.0.0/0) for serverless deployment
4. Get your connection string (it should look like this):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/fightclub?retryWrites=true&w=majority
   ```

## Step 2: Configure Environment Variables

In your Vercel dashboard or via CLI, set these environment variables:

### Required Variables:
```bash
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/fightclub?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NODE_ENV=production
```

### Optional Variables:
```bash
ADMIN_USERNAME=Bunny#9332
ADMIN_PASSWORD=moaad073022+
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository or upload your project
4. Set the root directory to your server folder
5. Add environment variables in the "Environment Variables" section
6. Deploy!

### Option B: Using Vercel CLI
```bash
# Navigate to your server directory
cd /path/to/your/server

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_ATLAS_URI
vercel env add JWT_SECRET
vercel env add NODE_ENV

# Redeploy with environment variables
vercel --prod
```

## Step 4: Test Your Deployment

Once deployed, test these endpoints:

1. **Health Check**: `https://your-app.vercel.app/api/health`
2. **Upload**: `POST https://your-app.vercel.app/upload` (with file)
3. **Download**: `GET https://your-app.vercel.app/download?url=YOUTUBE_URL&type=audio`

## Common Issues and Solutions

### Issue 1: "ENOENT: no such file or directory"
**Solution**: This is fixed in the updated code. The app now uses in-memory storage for file uploads.

### Issue 2: Database Connection Timeout
**Solution**: 
- Make sure your MongoDB Atlas URI is correct
- Whitelist all IP addresses (0.0.0.0/0) in Atlas
- The app will fallback to in-memory storage if database connection fails

### Issue 3: Function Timeout
**Solution**: The `vercel.json` is configured with a 30-second timeout, which should be sufficient.

### Issue 4: Large File Uploads
**Solution**: The configuration supports up to 50MB files, but Vercel has limits on serverless functions.

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|----------|
| `MONGODB_ATLAS_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.net/db` |
| `JWT_SECRET` | Yes | Secret for JWT tokens | `your-super-secret-key` |
| `NODE_ENV` | No | Environment mode | `production` |
| `ADMIN_USERNAME` | No | Default admin username | `Bunny#9332` |
| `ADMIN_PASSWORD` | No | Default admin password | `your-password` |

## Features

✅ **YouTube Download**: Download audio/video from YouTube URLs  
✅ **File Upload**: Upload files to Catbox.moe  
✅ **User Management**: Admin user system  
✅ **Serverless Ready**: Optimized for Vercel deployment  
✅ **Fallback Storage**: In-memory storage when database is unavailable  

## Support

If you encounter issues:
1. Check the Vercel function logs
2. Verify all environment variables are set correctly
3. Test your MongoDB Atlas connection string locally first
4. Make sure your Atlas cluster allows connections from anywhere (0.0.0.0/0)

## Security Notes

- Never commit your `.env` file to version control
- Use strong, unique passwords for your admin account
- Generate a long, random JWT secret
- Regularly rotate your database credentials