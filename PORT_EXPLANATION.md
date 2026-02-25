# Port Configuration Explanation

## Two Different Ports

### Frontend Dev Server (Next.js)
- **Port: 3000** ✅ This is CORRECT
- This is where your Next.js app runs
- URLs like `http://localhost:3000/projects` are the frontend
- Hot-reload files (`webpack.*.hot-update.js`) go to port 3000 - this is normal!

### Backend API Server (NestJS)
- **Port: 3001** ✅ This is CORRECT  
- This is where your backend API runs
- API requests should go to `http://localhost:3001/api/*`
- All API calls (Projects, Leads, Payments, etc.) go here

## What You're Seeing

The request to `http://localhost:3000/_next/static/webpack/...` is:
- ✅ **Normal and correct**
- Next.js hot-reload mechanism
- NOT an API request
- This is how Next.js updates your app during development

## Check API Requests

To verify API requests are going to the right port:

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by "Fetch/XHR" or "api"
4. Look for requests to `/api/projects`, `/api/leads`, etc.
5. These should go to `http://localhost:3001/api/...`

## Summary

- Frontend: `localhost:3000` ✅
- Backend API: `localhost:3001` ✅
- Hot-reload files: `localhost:3000` ✅ (this is fine!)

Everything is configured correctly!


