# Quick Fix for Projects Module Error

## Issue
Projects module showing "Projects API not found" error.

## Root Causes

### 1. Port Mismatch ✅ FIXED
- Backend running on port **3001**
- Frontend was configured for port **3000**
- **Fixed:** Updated `frontend/lib/config.ts` to use port 3001

### 2. Authentication Required ⚠️ NEEDS FIX
The Projects API requires JWT authentication. You need to:

1. **Register/Login first:**
   ```bash
   POST http://localhost:3001/api/auth/register
   {
     "companyName": "Your Company",
     "email": "admin@example.com",
     "password": "password123",
     "firstName": "Admin",
     "lastName": "User"
   }
   ```

2. **Or Login:**
   ```bash
   POST http://localhost:3001/api/auth/login
   {
     "email": "admin@example.com",
     "password": "password123"
   }
   ```

3. **Save the token:**
   - Copy the `accessToken` from the response
   - Open browser console
   - Run: `localStorage.setItem('auth_token', 'YOUR_TOKEN_HERE')`
   - Refresh the page

## Quick Test

After fixing authentication, the Projects page should work. If you still see errors:

1. Check browser console for the actual error
2. Verify backend is running: `http://localhost:3001/api/auth/me` (should return 401 without token)
3. Check network tab to see the actual API response

## Next Steps

I can create login/register pages to handle authentication automatically. Would you like me to do that?


