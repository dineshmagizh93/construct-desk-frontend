# Login Help

## The 401 Error Explained

The 401 (Unauthorized) error when trying to login means:

1. **No account exists** - You need to register first
2. **Wrong credentials** - Email or password is incorrect
3. **Account inactive** - User account has been deactivated

## Solutions

### Option 1: Register a New Account (Recommended)

1. Go to: `http://localhost:3000/register`
2. Fill in the registration form:
   - Company Name
   - Email (this will be your login email)
   - Password (minimum 6 characters)
   - First Name
   - Last Name
3. Click "Register"
4. You'll be automatically logged in and redirected to the dashboard

### Option 2: Use Seed Data (If Available)

If you ran the seed script (`npm run prisma:seed`), you can use:

- **Email:** `admin@construction.com`
- **Password:** `password123`

**Note:** The seed script must have been run successfully for these credentials to work.

## How to Check if Seed Data Exists

1. Make sure the backend is running
2. Check the backend terminal for seed script output
3. Or try logging in with the seed credentials above

## Still Having Issues?

1. **Check backend is running:**
   - Backend should be on `http://localhost:3001`
   - Look for: `✅ Application is running on: http://localhost:3001`

2. **Check database connection:**
   - Make sure MySQL is running
   - Verify `.env` has correct `DATABASE_URL`

3. **Check CORS:**
   - Backend should show: `🔧 CORS configured for: http://localhost:3000`

4. **Try registering a new account:**
   - This is the most reliable way to get started


