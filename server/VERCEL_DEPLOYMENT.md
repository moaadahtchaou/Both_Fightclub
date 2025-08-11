# Vercel Deployment Guide

## Overview
This guide explains how to deploy your Node.js Express server to Vercel.

## Files Created for Vercel

### 1. `vercel.json`
Configuration file that tells Vercel how to build and route your application.

### 2. `api/index.js`
Serverless function entry point that wraps your Express app.

## Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
vercel
```

## Environment Variables

You MUST set these environment variables in your Vercel dashboard:

### Required Variables:
- `MONGODB_ATLAS_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A secure random string for JWT tokens
- `NODE_ENV` - Set to `production`

### Optional Variables:
- `ADMIN_USERNAME` - Custom admin username (default: Bunny#9332)
- `ADMIN_PASSWORD` - Custom admin password

### Setting Environment Variables in Vercel:
1. Go to your project dashboard on Vercel
2. Click on "Settings" tab
3. Click on "Environment Variables"
4. Add each variable with its value

## Common Deployment Issues

### 1. Database Connection Timeout
**Error**: `Database connection timeout`
**Solution**: 
- Ensure `MONGODB_ATLAS_URI` is set correctly in Vercel environment variables
- Check that your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
- Verify your Atlas credentials are correct

### 2. Function Timeout
**Error**: `Function execution timed out`
**Solution**: 
- The `vercel.json` is configured with 30-second timeout
- Database initialization might be slow on cold starts
- Consider using MongoDB Atlas for faster connections

### 3. Missing Environment Variables
**Error**: Various authentication or connection errors
**Solution**: 
- Double-check all environment variables are set in Vercel dashboard
- Ensure variable names match exactly (case-sensitive)

### 4. Build Errors
**Error**: Build fails during deployment
**Solution**: 
- Ensure all dependencies are listed in `package.json`
- Check that Node.js version is compatible (Vercel uses Node 18 by default)

## Testing Your Deployment

After deployment, test these endpoints:
- `GET /` - Should return API welcome message
- `POST /api/users/login` - Test admin login
- `GET /api/users/profile` - Test authenticated routes

## Fallback Behavior

If MongoDB connection fails, the app will:
1. Log the connection error
2. Switch to in-memory storage
3. Create admin user in memory
4. Continue running (data won't persist)

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords and JWT secrets
- Regularly rotate your MongoDB Atlas credentials
- Enable IP whitelisting in MongoDB Atlas for production

## Support

If you encounter issues:
1. Check Vercel function logs in the dashboard
2. Verify environment variables are set correctly
3. Test MongoDB connection separately
4. Check this guide for common solutions