-- MBC DATABASE COMPATIBILITY PATCH (PostgreSQL v15+ Friendly)
-- Standard PostgreSQL RENAME COLUMN does not support IF EXISTS.
-- This script uses a safe DO block to perform the renaming and enhancements.

DO $$ 
BEGIN
    -- 1. SYNCHRONIZE TRANSACTION LEDGER
    -- Rename 'type' to 'category' if 'type' exists and 'category' doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'type') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'category') THEN
        ALTER TABLE public.transactions RENAME COLUMN type TO category;
    END IF;

    -- Add missing executive fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'item_id') THEN
        ALTER TABLE public.transactions ADD COLUMN item_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'payment_method') THEN
        ALTER TABLE public.transactions ADD COLUMN payment_method TEXT DEFAULT 'Cash Injection';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'transactions' AND column_name = 'reference_no') THEN
        ALTER TABLE public.transactions ADD COLUMN reference_no TEXT DEFAULT 'N/A';
    END IF;

    -- 2. RELAX PROFILE CONSTRAINTS
    -- Drop the restrictive foreign key to allow manual record-keeping
    BEGIN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
    EXCEPTION
        WHEN undefined_object THEN 
            -- Constraint already gone, no action needed
            NULL;
    END;

    -- 3. SYNC NOTIFICATION DISH
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'type') THEN
        ALTER TABLE public.notifications ADD COLUMN type TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'title') THEN
        ALTER TABLE public.notifications ADD COLUMN title TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'message') THEN
        ALTER TABLE public.notifications ADD COLUMN message TEXT;
    END IF;

END $$;
