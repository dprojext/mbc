-- ADD profile_complete COLUMN TO PROFILES TABLE
-- This enables the "Complete Your Profile" popup for new users

DO $$ 
BEGIN
    -- Add profile_complete column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'profile_complete') THEN
        ALTER TABLE public.profiles ADD COLUMN profile_complete BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Set existing users as having complete profiles (so they don't see the popup)
UPDATE public.profiles SET profile_complete = TRUE WHERE profile_complete IS NULL;

-- Grant permissions
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
