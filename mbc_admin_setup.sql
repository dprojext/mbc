-- MBC ADMINISTRATIVE ACCESS OVERRIDE (CORRECTED)
-- RUN THIS IN SUPABASE SQL EDITOR

DO $$ 
DECLARE 
    target_user_id UUID;
BEGIN 
    -- 1. Identify the user by email
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'mbc@db.com';

    IF target_user_id IS NOT NULL THEN
        -- 2. Ensure profile exists and has admin role
        -- Using display_name to align with the platform's naming convention
        INSERT INTO public.profiles (id, email, display_name, role)
        VALUES (target_user_id, 'mbc@db.com', 'MBC Admin', 'admin')
        ON CONFLICT (id) DO UPDATE 
        SET role = 'admin', 
            display_name = EXCLUDED.display_name;

        RAISE NOTICE 'Admin access granted for user ID: %', target_user_id;
    ELSE
        RAISE NOTICE 'User mbc@db.com not found. Please ensure the account is created via Sign Up first.';
    END IF;
END $$;
