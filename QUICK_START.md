# Quick Start Guide

## ✅ Everything is Ready!

### Backend Status
- ✅ Running on port **3001**
- ✅ All 8 modules registered
- ✅ CORS configured for frontend (port 3000)
- ✅ Authentication ready

### Frontend Status
- ✅ Running on port **3000**
- ✅ Login/Register pages created
- ✅ API client configured for port 3001
- ✅ Authentication flow ready

## 🚀 First Time Setup

### Step 1: Register Your Company

1. Go to: `http://localhost:3000/register`
2. Fill in the form:
   - Company Name
   - Your Email
   - Password (min 6 characters)
   - First Name & Last Name
3. Click "Register"

You'll be automatically logged in and redirected to the dashboard!

### Step 2: Access Projects Module

After registration/login, you can:
- View Projects at `/projects`
- Create new projects
- All data is saved to MySQL database

## 🔐 Login Later

If you need to login again:
1. Go to: `http://localhost:3000/login`
2. Enter your email and password
3. You'll be redirected to dashboard

## 📝 Test the System

1. **Register/Login** → Get JWT token
2. **Create a Project** → Test POST API
3. **View Projects** → Test GET API
4. **Edit Project** → Test PATCH API
5. **Delete Project** → Test DELETE API (soft delete)

## 🎯 Next Steps

All backend APIs are ready. The frontend Projects module is connected. Other modules (Leads, Payments, etc.) still use mock data - I can connect them to the backend if you want!

## 🐛 Troubleshooting

### "Authentication required" error
- Make sure you're logged in
- Check browser console for token errors
- Try logging out and logging back in

### CORS errors
- Backend CORS is configured for `http://localhost:3000`
- If you see CORS errors, restart the backend server

### 404 errors
- Make sure backend is running on port 3001
- Check backend terminal for route registration logs


