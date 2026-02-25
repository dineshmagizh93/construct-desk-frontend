# Clear Next.js Cache

If requests are still going to port 3000, Next.js might be caching the old value.

## Solution: Clear Next.js Cache

1. **Stop the frontend server** (Ctrl+C)

2. **Delete the .next folder:**
   ```bash
   cd frontend
   Remove-Item -Recurse -Force .next
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

## Alternative: Hardcoded Fix

I've hardcoded the API URL to `http://localhost:3001/api` in `frontend/lib/config.ts` so it will definitely use the correct port.

After restarting, check the browser console - you should see:
```
[Config] API_BASE_URL (hardcoded): http://localhost:3001/api
```

And requests should go to port 3001.


