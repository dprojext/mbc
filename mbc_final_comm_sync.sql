-- MBC COMMUNICATIONS FINAL SYNC & RECOVERY
-- RUN THE ENTIRE CONTENTS OF THIS SCRIPT IN SUPABASE SQL EDITOR

-- 1. CLEAN SLATE (Remove potential conflicts)
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.broadcasts CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- 2. RECREATE CONVERSATIONS
CREATE TABLE public.conversations (
    id TEXT PRIMARY KEY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT,
    last_message TEXT,
    last_message_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RECREATE MESSAGES
CREATE TABLE public.messages (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL,
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ
);

-- 4. RECREATE BROADCASTS (Audited Registry)
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

-- 5. RECREATE NOTIFICATIONS
CREATE TABLE public.notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AUTHORIZE SYSTEM ACCESS (Bypass RLS for Hub Operations)
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- 7. GRANT PERMISSIONS TO API
GRANT ALL ON TABLE public.conversations TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.messages TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.broadcasts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;

-- 8. INITIALIZE PLATFORM DATA
INSERT INTO public.broadcasts (title, message, sender, audience, type)
VALUES ('Communications Hub Initialized', 'Platform dispatch engine is now authoritativey online. Registry persistence is confirmed.', 'SYSTEM', 'all', 'success');

INSERT INTO public.notifications (title, message, type)
VALUES ('Registry Sync Confirmed', 'The infrastructure performance registry is now active.', 'success');
