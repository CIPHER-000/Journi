# Database Migration Instructions

## Adding Job Tracking Columns to user_journeys Table

This migration adds three important columns to the `user_journeys` table to properly track job status and errors:
- `job_id` - Unique identifier for tracking jobs
- `error_message` - Stores error messages when jobs fail
- `progress_data` - Stores detailed progress information as JSON

## How to Apply the Migration

### Option 1: Using Supabase Dashboard (Recommended)

1. **Login to your Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your Journi project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Run the Migration**
   - Copy the contents of `add_job_tracking_columns.sql`
   - Paste into the SQL editor
   - Click "Run" or press Ctrl+Enter

4. **Verify the Migration**
   - The query results should show the three new columns
   - You should see:
     - `job_id` with type `text`
     - `error_message` with type `text`
     - `progress_data` with type `jsonb`

### Option 2: Using Supabase CLI (For Local Development)

If you have Supabase CLI installed:

```bash
# Apply the migration
supabase db push

# Or run directly
supabase db execute -f add_job_tracking_columns.sql
```

### Option 3: Manual Migration File

The migration is also saved in `supabase/migrations/20250909132553_add_job_tracking_columns.sql` for version control and automatic deployment.

## Benefits After Migration

Once applied, the application will:
- ✅ Accurately track job status (failed, completed, cancelled)
- ✅ Store error messages in the database
- ✅ Use job_id for precise updates (no more fallback logic)
- ✅ Maintain complete progress history
- ✅ Enable better debugging and user support

## Verification

After running the migration, you can verify it worked by running:

```sql
SELECT * FROM public.user_journeys LIMIT 1;
```

You should see the new columns in the result.

## Rollback (If Needed)

To rollback the migration (this will DELETE the data in these columns):

```sql
ALTER TABLE public.user_journeys
  DROP COLUMN IF EXISTS job_id,
  DROP COLUMN IF EXISTS error_message,
  DROP COLUMN IF EXISTS progress_data;

DROP INDEX IF EXISTS idx_user_journeys_job_id;
```

⚠️ **Warning**: Rollback will permanently delete any data stored in these columns.
