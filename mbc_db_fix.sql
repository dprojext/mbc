-- MBC DATABASE FIX & ENHANCEMENT SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. FIX PROFILES TABLE
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS saved_vehicles JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS saved_addresses JSONB DEFAULT '[]';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;

-- 2. FIX CONVERSATIONS TABLE (Ensure customer_id exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='customer_id') THEN
        ALTER TABLE public.conversations ADD COLUMN customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. ENSURE ALL TABLES HAVE THE RIGHT STRUCTURE
-- Bookings
DO $$ BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='customer_id') THEN
        ALTER TABLE public.bookings ADD COLUMN customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Conversations should also have customer_name etc. if they don't
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message_time TIMESTAMPTZ DEFAULT NOW();

-- Transactions
DO $$ BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='transactions' AND column_name='customer_id') THEN
        ALTER TABLE public.transactions ADD COLUMN customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender TEXT; -- 'user' or 'admin'
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT NOW();

-- Site Settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_name TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS tagline TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS legal_text TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS primary_color TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS secondary_color TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS accent_color TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS typography TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS show_legal BOOLEAN DEFAULT TRUE;

-- REFRESH POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles are viewable by owner and admin" ON public.profiles;
CREATE POLICY "Profiles are viewable by owner and admin" ON public.profiles 
    FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    type TEXT,
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);
