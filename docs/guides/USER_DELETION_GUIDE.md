# User Deletion Guide for Journi

## Understanding the Issue

When you delete a user from the `public.users` table, they reappear because:

1. **Supabase Auth Structure**: Supabase uses two separate user tables:
   - `auth.users` - The main authentication table (managed by Supabase)
   - `public.users` - Your custom user profile table

2. **Auto-Recreation Logic**: The auth service (auth_service.py, lines 207-245) automatically recreates the `public.users` profile when:
   - A valid auth token exists (user still in `auth.users`)
   - But no corresponding profile exists in `public.users`

## Solutions

### Option 1: Complete User Deletion (Recommended for Testing)
Use the SQL function provided in `delete_user_properly.sql`:

```sql
-- Delete a user completely from both tables
SELECT delete_user_completely('user@example.com');
```

This will:
- Delete all user journey data
- Delete from public.users
- Delete from auth.users (completely removes authentication)

### Option 2: Disable User (Recommended for Production)
Instead of deleting, disable the user:

```sql
-- Disable a user without deleting data
SELECT disable_user('user@example.com');
```

This will:
- Ban the user in auth.users (cannot login)
- Mark as inactive in public.users
- Preserve data for audit trails

### Option 3: Use Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to Authentication > Users
3. Find the user
4. Click the three dots menu
5. Select "Delete user"

This deletes from both auth.users and triggers cascading deletes.

### Option 4: Prevent Auto-Recreation (Code Change)
If you want to prevent auto-recreation of deleted users, modify `auth_service.py`:

1. Change the verify_token method to NOT create profiles automatically
2. Instead, return None if profile doesn't exist
3. This will effectively lock out users without public.users profiles

## Best Practices

1. **Never delete directly from public.users alone** - Always handle both tables
2. **Use soft deletes in production** - Mark as inactive instead of deleting
3. **Implement proper user management API** - Create endpoints for user deletion/deactivation
4. **Add cascade deletes** - Ensure foreign key constraints cascade properly

## Testing User Deletion

To test if deletion worked:
1. Run the delete function
2. Clear browser cookies/localStorage
3. Try to login - should fail
4. Check both tables:
   ```sql
   -- Check if user exists in either table
   SELECT 'auth' as table_name, id, email FROM auth.users WHERE email = 'user@example.com'
   UNION ALL
   SELECT 'public' as table_name, id, email FROM public.users WHERE email = 'user@example.com';
   ```

## Important Notes

- The session token remains valid until it expires (usually 1 hour)
- Clear browser storage after deletion to force re-authentication
- Users can't login after proper deletion from auth.users
- Consider GDPR compliance when implementing user deletion
