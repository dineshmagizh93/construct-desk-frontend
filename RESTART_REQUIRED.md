# ⚠️ Frontend Restart Required

## Issue Fixed
The `.env.local` file has been updated from port 3000 to port 3001 to match the backend.

## Action Required

**You MUST restart the frontend server** for the change to take effect:

1. **Stop the frontend server:**
   - Press `Ctrl+C` in the terminal where `npm run dev` is running

2. **Restart the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Verify the change:**
   - Open browser console (F12)
   - You should see: `[Config] API_BASE_URL: http://localhost:3001/api`
   - Check network tab - requests should go to `localhost:3001`

## Why Restart is Needed

Next.js reads environment variables only at startup. Changes to `.env.local` require a server restart.

## After Restart

Once restarted, you'll still need to authenticate (get a JWT token) to access the Projects API. See `AUTHENTICATION_SETUP.md` for instructions.


