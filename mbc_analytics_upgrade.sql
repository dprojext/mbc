-- MBC ANALYTICS ENGINE UPGRADE
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. DROP AND REBUILD ANALYTICS ENGINE
DROP TABLE IF EXISTS public.analytics_events CASCADE;

CREATE TABLE public.analytics_events (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    event_type TEXT NOT NULL, -- 'page_view', 'interaction', 'conversion'
    page_path TEXT,
    user_id TEXT, -- Allowing string 'anonymous' or UUID
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DISABLE RLS FOR ANALYTICS (Live Ticker Support)
ALTER TABLE public.analytics_events DISABLE ROW LEVEL SECURITY;

-- 3. GRANT PERMISSIONS
GRANT ALL ON TABLE public.analytics_events TO anon, authenticated, service_role;

-- 4. INITIALIZE WITH SYSTEM BOOT EVENT
INSERT INTO public.analytics_events (event_type, page_path, user_id, metadata)
VALUES ('system_start', '/admin/analytics', 'SYSTEM', '{"status": "Authoritative Registry Online"}'::jsonb);
