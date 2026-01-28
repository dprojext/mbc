-- MBC FINANCIAL SCHEMA ALIGNMENT (Transactions & Bookings)
-- This ensures the backend matches the DataContext.jsx requirements

BEGIN;

-- 1. ENHANCE BOOKINGS TABLE
-- Add price column if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'price') THEN
        ALTER TABLE public.bookings ADD COLUMN price TEXT;
    END IF;
END $$;

-- 2. ENHANCE TRANSACTIONS TABLE
-- Ensure all columns used in DataContext.jsx exist with correct names
DO $$ BEGIN
    -- amount (already exists in schema usually)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'amount') THEN
        ALTER TABLE public.transactions ADD COLUMN amount NUMERIC DEFAULT 0;
    END IF;

    -- user_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_name') THEN
        ALTER TABLE public.transactions ADD COLUMN user_name TEXT;
    END IF;

    -- user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'user_id') THEN
        ALTER TABLE public.transactions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    -- category
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'category') THEN
        ALTER TABLE public.transactions ADD COLUMN category TEXT DEFAULT 'Service';
    END IF;

    -- item_id (Using text to support both numeric booking IDs and string subscription IDs)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'item_id') THEN
        ALTER TABLE public.transactions ADD COLUMN item_id TEXT;
    END IF;

    -- item_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'item_name') THEN
        ALTER TABLE public.transactions ADD COLUMN item_name TEXT;
    END IF;

    -- payment_method
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'payment_method') THEN
        ALTER TABLE public.transactions ADD COLUMN payment_method TEXT;
    END IF;

    -- reference_no
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'reference_no') THEN
        ALTER TABLE public.transactions ADD COLUMN reference_no TEXT;
    END IF;

    -- status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'status') THEN
        ALTER TABLE public.transactions ADD COLUMN status TEXT DEFAULT 'Pending';
    END IF;

    -- invoice_id (For archival)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'invoice_id') THEN
        ALTER TABLE public.transactions ADD COLUMN invoice_id TEXT;
    END IF;

    -- timestamp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'timestamp') THEN
        ALTER TABLE public.transactions ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- date (Used in some filters)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'date') THEN
        ALTER TABLE public.transactions ADD COLUMN date TEXT;
    END IF;
END $$;

-- 3. PERMISSIONS
GRANT ALL ON TABLE public.bookings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.transactions TO anon, authenticated, service_role;

COMMIT;
