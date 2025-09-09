-- Proper User Deletion Script for Supabase
-- This deletes users from both auth.users and public.users tables

-- IMPORTANT: Run this in Supabase SQL Editor with proper permissions

-- Step 1: Create a function to properly delete a user
CREATE OR REPLACE FUNCTION delete_user_completely(user_email text)
RETURNS void AS $$
DECLARE
    user_id_to_delete uuid;
BEGIN
    -- Get the user ID from email
    SELECT id INTO user_id_to_delete 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id_to_delete IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Delete from public.users table first (due to foreign key constraints)
    DELETE FROM public.user_journeys WHERE user_id = user_id_to_delete;
    DELETE FROM public.user_subscriptions WHERE user_id = user_id_to_delete;
    DELETE FROM public.users WHERE id = user_id_to_delete;
    
    -- Delete from auth.users (this is the main auth table)
    DELETE FROM auth.users WHERE id = user_id_to_delete;
    
    RAISE NOTICE 'User % has been completely deleted', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Usage example (uncomment and replace with actual email)
-- SELECT delete_user_completely('user@example.com');

-- Step 3: To view all users before deletion
SELECT 
    au.id,
    au.email,
    pu.name,
    au.created_at,
    au.last_sign_in_at,
    pu.journey_count,
    pu.plan_type
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY au.created_at DESC;

-- Step 4: Alternative - Disable user instead of deleting
-- This is often preferred for audit trails
CREATE OR REPLACE FUNCTION disable_user(user_email text)
RETURNS void AS $$
DECLARE
    user_id_to_disable uuid;
BEGIN
    -- Get the user ID from email
    SELECT id INTO user_id_to_disable 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id_to_disable IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Disable in auth.users
    UPDATE auth.users 
    SET 
        banned_until = '2999-12-31'::timestamptz,
        updated_at = now()
    WHERE id = user_id_to_disable;
    
    -- Mark as inactive in public.users
    UPDATE public.users 
    SET 
        is_active = false,
        updated_at = now()
    WHERE id = user_id_to_disable;
    
    RAISE NOTICE 'User % has been disabled', user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
