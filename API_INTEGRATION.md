# Projects API Integration

This document describes how the Projects frontend module integrates with the backend API.

## Configuration

### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

The default API URL is `http://localhost:3001/api` if not specified.

### Authentication

The API client automatically includes JWT tokens from `localStorage` in the `Authorization` header.

**To set a token after login:**
```typescript
import { setAuthToken } from '@/lib/config';

// After successful login
setAuthToken(token);
```

**To remove token on logout:**
```typescript
import { removeAuthToken } from '@/lib/config';

// On logout
removeAuthToken();
```

## API Client

The centralized API client (`lib/api/client.ts`) handles:
- JWT token injection
- Error handling
- Request/response transformation
- Network error handling

## Projects API

All project operations are handled through `lib/api/projects.ts`:

- `getAll()` - Fetch all projects (company-scoped)
- `getById(id)` - Fetch a single project
- `create(data)` - Create a new project
- `update(id, data)` - Update a project
- `delete(id)` - Soft delete a project
- `getStats()` - Get project statistics

## Hooks

### `useProjects()`

Manages project list state and operations:

```typescript
const { 
  projects,      // Project[]
  loading,        // boolean
  error,          // string | null
  loadProjects,   // () => Promise<void>
  createProject,  // (data: CreateProjectDto) => Promise<Project>
  updateProject,  // (id: string, data: UpdateProjectDto) => Promise<Project>
  deleteProject   // (id: string) => Promise<void>
} = useProjects();
```

### `useProjectStats()`

Fetches project statistics from the API:

```typescript
const { 
  stats,      // ProjectStats | null
  loading,     // boolean
  error,      // string | null
  loadStats   // () => Promise<void>
} = useProjectStats();
```

## Error Handling

All API calls handle errors gracefully:

1. **Network errors**: Displayed as "Network error. Please check your connection."
2. **API errors**: Error messages from the backend are displayed
3. **401 Unauthorized**: Token may be invalid or expired
4. **404 Not Found**: Resource doesn't exist
5. **Validation errors**: Displayed in form fields

## Loading States

All components show loading indicators:
- Spinner with message during data fetch
- Disabled buttons during form submission
- Skeleton loaders (optional, can be added)

## Empty States

Components display helpful messages when:
- No projects exist: "No projects found. Create your first project to get started."
- No projects match filters: "No projects match your filters."

## Data Transformation

The API client automatically transforms:
- Date strings to ISO format
- Decimal numbers to floats
- Backend field names to frontend types

## Testing

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login first** to get a JWT token (if auth is implemented)

4. **Test the Projects module:**
   - Navigate to `/projects`
   - Create a new project
   - View project details
   - Edit a project
   - Delete a project
   - Check dashboard stats

## Troubleshooting

### "Network error" messages
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend

### "Unauthorized" errors
- Verify JWT token is set in localStorage
- Check token expiration
- Ensure backend auth is working

### Data not loading
- Check browser console for errors
- Verify API endpoints are correct
- Check network tab in DevTools

