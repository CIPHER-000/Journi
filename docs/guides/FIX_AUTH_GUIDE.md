# Fix Authentication Issue - Supabase Environment Variables

## The Problem
The backend cannot validate authentication tokens because the Supabase environment variables are not set on Render.

## Solution: Add Supabase Environment Variables to Render

### Step 1: Get Your Supabase Keys

1. Go to your Supabase Dashboard: https://app.supabase.com/
2. Select your project
3. Go to **Settings** → **API**
4. You'll need these three values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (safe for public use)
   - **service_role secret** key (keep this secret!)

### Step 2: Add to Render

1. Go to your Render Dashboard: https://dashboard.render.com/
2. Click on your **journi-backend** service
3. Go to **Environment** tab (left sidebar)
4. Click **Add Environment Variable**
5. Add these three variables:

```
SUPABASE_URL = [Your Project URL from Step 1]
SUPABASE_ANON_KEY = [Your anon public key from Step 1]
SUPABASE_SERVICE_ROLE_KEY = [Your service_role secret key from Step 1]
```

### Step 3: Save and Deploy

1. Click **Save Changes**
2. Render will automatically redeploy your service
3. Wait 3-5 minutes for the deployment to complete

### Step 4: Test

After deployment:
1. Try logging in again on your frontend
2. Create a journey - it should work now!

## Why This Fixes the Issue

- The frontend uses Supabase tokens for authentication
- The backend needs the `SUPABASE_SERVICE_ROLE_KEY` to validate these tokens
- Without this key, the backend cannot verify if tokens are valid
- Once set, the backend can properly authenticate users

## Security Note

- **NEVER** expose the `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- This key gives admin access to your database
- Only use it in backend/server environments

## If You Don't Have Access to Supabase

If you don't have the Supabase project credentials, you have two options:

### Option 1: Create a New Supabase Project
1. Go to https://app.supabase.com/
2. Create a new project (free)
3. Get the keys and follow the steps above

### Option 2: Disable Authentication (NOT RECOMMENDED)
This would require significant code changes and is not secure for production.

## After Setting the Variables

Once the environment variables are set and Render has redeployed:
- Authentication will work properly
- Users can sign up, log in, and create journeys
- Token validation will succeed
- No more 401 errors!
