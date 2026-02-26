# Vercel + Render Deployment Guide

## Overview

This guide explains how to deploy the frontend to Vercel and connect it to your backend on Render.

## The Problem

After deploying to Vercel, you're seeing:
- `ERR_CONNECTION_REFUSED` errors
- `404` errors
- Requests going to `localhost:3001` instead of your Render backend

**This happens because the frontend is still using the localhost URL in production.**

## Solution: Set Environment Variables in Vercel

### Step 1: Get Your Render Backend URL

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your backend service
3. Copy the service URL (it will look like: `https://your-app-name.onrender.com`)
4. Add `/api` to the end: `https://your-app-name.onrender.com/api`

**Example:**
- Render service URL: `https://construction-crm-backend.onrender.com`
- API Base URL: `https://construction-crm-backend.onrender.com/api`

### Step 2: Set Environment Variable in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add the following:

   **Variable Name:**
   ```
   NEXT_PUBLIC_API_URL
   ```

   **Value:**
   ```
   https://your-app-name.onrender.com/api
   ```
   (Replace `your-app-name` with your actual Render service name)

   **Environment:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development (optional, for local testing)

6. Click **Save**

### Step 3: Redeploy Your Vercel App

After adding the environment variable:

1. Go to **Deployments** tab in Vercel
2. Click the **⋯** (three dots) on your latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

**Important:** Environment variables are only available after redeployment.

### Step 4: Verify It's Working

1. After redeployment, open your Vercel app URL
2. Open browser DevTools (F12) → Console tab
3. You should see the API URL logged (in development mode)
4. Try logging in or registering
5. Check Network tab - requests should go to your Render backend, not localhost

## Environment Variables Summary

### Required in Vercel

```bash
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com/api
```

**Important Notes:**
- Must start with `NEXT_PUBLIC_` to be available in the browser
- Must include the full URL with `https://`
- Must include `/api` at the end (your backend's global prefix)
- No trailing slash after `/api`

### Optional (for local development)

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

This will be used when running `npm run dev` locally.

## Backend Configuration (Render)

Make sure your Render backend has these environment variables:

```bash
# Required
DATABASE_URL=mysql://root:password@host:port/database?ssl={"rejectUnauthorized":false}
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app

# Optional
PORT=10000  # Render provides this automatically
```

**Important:** The `FRONTEND_URL` in Render must match your Vercel app URL for CORS to work.

## Troubleshooting

### Issue 1: Still Getting localhost Errors

**Symptoms:** Requests still go to `localhost:3001`

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. Make sure you redeployed after adding the variable
3. Clear browser cache (hard refresh: Ctrl+Shift+R)
4. Check Vercel build logs to ensure the variable is being used

### Issue 2: CORS Errors

**Symptoms:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution:**
1. In Render, set `FRONTEND_URL` to your exact Vercel app URL
2. Make sure it includes `https://` and no trailing slash
3. Example: `FRONTEND_URL=https://your-app.vercel.app`

### Issue 3: 404 Errors

**Symptoms:** Getting 404 from Render backend

**Solution:**
1. Verify your Render backend is running (check Render logs)
2. Test the backend directly: `https://your-backend.onrender.com/api`
3. Make sure `NEXT_PUBLIC_API_URL` includes `/api` at the end
4. Check that routes are registered in your backend

### Issue 4: Environment Variable Not Working

**Symptoms:** Variable is set but not being used

**Solution:**
1. **Variable name must be exact:** `NEXT_PUBLIC_API_URL` (case-sensitive)
2. **Must redeploy:** Environment variables are only available after redeployment
3. **Check build logs:** Vercel build logs show which env vars are available
4. **No spaces:** Make sure there are no spaces around the `=` in Vercel

## Quick Checklist

### Vercel Setup
- [ ] `NEXT_PUBLIC_API_URL` environment variable set
- [ ] Value is `https://your-backend.onrender.com/api`
- [ ] Variable is enabled for Production environment
- [ ] App has been redeployed after adding variable
- [ ] Build logs show the variable is being used

### Render Setup
- [ ] Backend is deployed and running
- [ ] `FRONTEND_URL` is set to your Vercel app URL
- [ ] `DATABASE_URL` is correctly configured
- [ ] `JWT_SECRET` is set
- [ ] `NODE_ENV=production` is set
- [ ] Backend logs show successful startup

### Testing
- [ ] Vercel app loads without errors
- [ ] Browser console shows no connection errors
- [ ] Network tab shows requests to Render backend (not localhost)
- [ ] Login/register functionality works
- [ ] API calls return data (not 404 or CORS errors)

## Example Configuration

### Vercel Environment Variables

```
NEXT_PUBLIC_API_URL = https://construction-crm-backend.onrender.com/api
```

### Render Environment Variables

```
DATABASE_URL = mysql://root:password@host:port/database?ssl={"rejectUnauthorized":false}
JWT_SECRET = your-generated-secret-key
JWT_EXPIRES_IN = 7d
NODE_ENV = production
FRONTEND_URL = https://construction-crm-frontend.vercel.app
```

## Still Having Issues?

1. **Check Vercel Build Logs:**
   - Go to Deployments → Click on a deployment → View Function Logs
   - Look for any errors related to environment variables

2. **Check Render Logs:**
   - Go to Render dashboard → Your service → Logs
   - Look for startup errors or connection issues

3. **Test Backend Directly:**
   - Open `https://your-backend.onrender.com/api` in browser
   - Should see API info or 404 (but not connection refused)

4. **Test Frontend API Calls:**
   - Open browser DevTools → Network tab
   - Try to login/register
   - Check what URL the requests are going to
   - Check response status codes
