-- MBC DATASAVE & FINANCIAL RECOVERY SCRIPT
-- Execute this in Supabase SQL Editor to resolve all data persistence failures.

-- 1. TRANSACTION LEDGER RECONSTRUCTION
-- Ensure the transactions table supports all executive audit fields.
ALTER TABLE public.transactions RENAME COLUMN IF EXISTS type TO category;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS item_id TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'Cash Injection';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS reference_no TEXT DEFAULT 'N/A';
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS service_title TEXT; -- To store the display name of service/plan

-- 2. PROFILE REGISTRY RELAXATION
-- To allow manual user entry for bookkeeping, we need to handle the FK constraint.
-- NOTE: We keep UUID for system integrity but ensure manual users have a valid UUID.
DO $$ 
BEGIN
    -- Drop the restrictive foreign key if it exists to allow manual ledger entries.
    ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- 3. NOTIFICATION INFRASTRUCTURE SYNC
-- Ensure the unified notifications table is consistent.
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
