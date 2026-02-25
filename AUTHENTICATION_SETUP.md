# Authentication Setup Guide

## Current Issue
The Projects module (and all other modules) require JWT authentication. You need to login first to get a token.

## Quick Solution: Manual Token Setup

### Step 1: Register a Company/User

Use Postman, curl, or any API client:

```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "companyName": "My Construction Company",
  "email": "admin@example.com",
  "password": "password123",
  "firstName": "Admin",
  "lastName": "User"
}
```

### Step 2: Login to Get Token

```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

Response will include:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Step 3: Set Token in Browser

1. Open browser console (F12)
2. Run this command:
   ```javascript
   localStorage.setItem('auth_token', 'YOUR_ACCESS_TOKEN_HERE')
   ```
3. Refresh the page

### Step 4: Verify It Works

After setting the token, the Projects page should load successfully!

## Better Solution: Create Login Pages

I can create proper login/register pages so you don't need to manually set tokens. Would you like me to do that?

## Test Authentication

To test if authentication is working:

```bash
# Without token (should return 401)
GET http://localhost:3001/api/projects

# With token (should return projects list)
GET http://localhost:3001/api/projects
Authorization: Bearer YOUR_TOKEN_HERE
```


