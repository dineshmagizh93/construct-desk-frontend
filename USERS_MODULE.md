# Users Management Module

## Overview

A complete Users management module has been created to allow you to add and manage company users in your CRM.

## Features

### ✅ Backend APIs

1. **Create User** - `POST /user`
   - Add new users to your company
   - Fields: firstName, lastName, email, password, role, phone
   - Automatically assigns to your company

2. **List Users** - `GET /user/all`
   - Get all users in your company
   - Optional: `?includeInactive=true` to include inactive users

3. **Get User** - `GET /user/:id`
   - Get user details by ID

4. **Update User** - `PATCH /user/:id`
   - Update user information
   - Change password (optional)
   - Update role, email, name, etc.

5. **Delete User** - `DELETE /user/:id`
   - Soft delete user
   - Prevents deleting the last admin user

### ✅ Frontend

1. **Users List Page** (`/users`)
   - View all company users
   - Search by name or email
   - Filter by role (Admin/User)
   - See user status (Active/Inactive)

2. **Add User Form**
   - Create new users
   - Set role (Admin/User)
   - Set password
   - All fields validated

3. **Edit User Form**
   - Update user details
   - Change password (optional - leave blank to keep current)
   - Update role
   - Activate/Deactivate users

4. **User Management**
   - Delete users (with confirmation)
   - View user details
   - Search and filter

## Security Features

- ✅ Company-scoped (users can only see/manage users in their company)
- ✅ Prevents deleting last admin user
- ✅ Password hashing (bcrypt)
- ✅ Email uniqueness within company
- ✅ JWT authentication required

## How to Use

1. **Navigate to Users Page**
   - Click "Users" in the sidebar (or go to `/users`)

2. **Add a New User**
   - Click "Add User" button
   - Fill in the form:
     - First Name (required)
     - Last Name (required)
     - Email (required, must be unique)
     - Password (required, min 6 characters)
     - Role (Admin or User)
     - Phone (optional)
   - Click "Create User"

3. **Edit a User**
   - Click the three dots (⋮) next to a user
   - Select "Edit"
   - Update any fields
   - Password is optional (leave blank to keep current)
   - Click "Update User"

4. **Delete a User**
   - Click the three dots (⋮) next to a user
   - Select "Delete"
   - Confirm deletion

## Integration with Leads

Now that you can add users, the "Assigned To" dropdown in the Leads form will show:
- All active users from your company
- Real user names (not mock data)
- Properly sorted alphabetically

## User Roles

- **Admin**: Full access to all features
- **User**: Standard user access (can be customized later)

## Next Steps

1. Add users to your company via `/users` page
2. Assign leads to these users when creating/editing leads
3. Manage user permissions (future enhancement)


