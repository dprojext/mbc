-- MBC BOOKING INFRASTRUCTURE EMERGENCY FIX
-- This script ensures the bookings table has all required columns and correct permissions.

DO $$ 
BEGIN
    -- 1. Ensure 'rejection_reason' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'rejection_reason') THEN
        ALTER TABLE public.bookings ADD COLUMN rejection_reason TEXT;
    END IF;

    -- 2. Ensure 'price' column exists (Sync with catalog)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'price') THEN
        ALTER TABLE public.bookings ADD COLUMN price TEXT;
    END IF;

    -- 3. Ensure 'vehicle_type' column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'vehicle_type') THEN
        ALTER TABLE public.bookings ADD COLUMN vehicle_type TEXT;
    END IF;

    -- 4. ENSURE RLS DOES NOT BLOCK ADMINS
    -- Reachable if RLS enabled
    ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
END $$;

-- 5. RELAX PERMISSIONS FOR ABSOLUTE PERSISTENCE
GRANT ALL ON TABLE public.bookings TO anon, authenticated, service_role;
