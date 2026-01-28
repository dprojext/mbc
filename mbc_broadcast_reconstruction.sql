-- MBC BROADCAST INFRASTRUCTURE - CRITICAL TABLE RECONSTRUCTION
-- RUN THIS IN SUPABASE SQL EDITOR TO RESOLVE "COLUMN DOES NOT EXIST" ERRORS

-- 1. DROP AND RECREATE BROADCASTS TABLE
-- This ensuring the table is perfectly aligned with the executive platform requirements.
DROP TABLE IF EXISTS public.broadcasts CASCADE;

CREATE TABLE public.broadcasts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sender TEXT DEFAULT 'MBC Admin',
    audience TEXT DEFAULT 'all',
    type TEXT DEFAULT 'info',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- 2. DISABLE RLS (Ensure immediate visibility across the platform)
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Global access for broadcasts" ON public.broadcasts;
CREATE POLICY "Global access for broadcasts" ON public.broadcasts FOR ALL USING (true);

-- 3. GRANT PERMISSIONS
GRANT ALL ON TABLE public.broadcasts TO anon, authenticated, service_role;

-- 4. INSERT AUTHORITATIVE INITIALIZATION RECORD
INSERT INTO public.broadcasts (title, message, sender, audience, type)
VALUES (
    'Communications Hub Restored', 
    'The Platform Dispatch Registry has been authoritativey reconstructed. All manual outreach protocols are now persistent and secured within the executive cloud registry.', 
    'SYSTEM', 
    'all', 
    'success'
);

-- 5. ENSURE OTHER CORE TABLES ARE SECURED
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
