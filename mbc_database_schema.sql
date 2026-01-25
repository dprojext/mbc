-- METRO BLACKLINE CARE (MBC) - Executive Database Schema
-- Optimized for Supabase / PostgreSQL

-- 1. Profiles (Extends Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user',
    subscription_plan TEXT DEFAULT 'None',
    requires_password_change BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    logo TEXT,
    site_name TEXT DEFAULT 'METRO BLACKLINE CARE',
    tagline TEXT,
    contact JSONB, -- { email, phone, location, socials: { instagram, facebook, twitter, linkedin } }
    landing_images JSONB, -- { hero, services, membership, contact }
    footer_sections JSONB, -- Array of { title, links: [{ label, url }] }
    documents JSONB, -- Array of { id, name, type, date, showInFooter }
    appearance JSONB, -- { primaryColor, accentColor, fontHeading, fontBody }
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Services
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY, -- e.g. 'wash-01'
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    icon_type TEXT,
    image TEXT,
    features TEXT[],
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Plans & Packages
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY, -- e.g. 'plan-gold'
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    period TEXT DEFAULT 'month', -- 'month', 'year', 'one-time'
    type TEXT DEFAULT 'subscription', -- 'subscription' or 'package'
    features TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    vehicle_type TEXT,
    service TEXT,
    date DATE,
    time TEXT,
    location TEXT,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    booking_id BIGINT REFERENCES public.bookings(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES auth.users(id),
    customer_name TEXT,
    service TEXT,
    amount NUMERIC,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'Completed', -- 'Completed', 'Pending', 'Refunded'
    date TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY, -- 'conv-' + timestamp
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT,
    last_message TEXT,
    last_message_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Messages
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY, -- 'msg-' + timestamp
    conversation_id TEXT REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender TEXT, -- 'user' or 'admin'
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Admin Notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT,
    message TEXT,
    type TEXT, -- 'booking', 'user', 'payment', 'system'
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 10. User Notifications
CREATE TABLE IF NOT EXISTS public.user_notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    type TEXT,
    read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Broadcasts
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT,
    message TEXT,
    sender TEXT,
    audience TEXT DEFAULT 'all', -- 'all', 'subscribers', 'users'
    active BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Analytics Events
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    event_type TEXT, -- 'page_view', 'booking_click', 'signup', etc.
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    path TEXT,
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Data Exports
CREATE TABLE IF NOT EXISTS public.data_exports (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    admin_id UUID REFERENCES auth.users(id),
    type TEXT, -- 'Users', 'Bookings', 'Financials'
    format TEXT, -- 'CSV', 'JSON'
    status TEXT DEFAULT 'Success',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) - Basic Examples
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings." ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can insert own bookings." ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- FUNCTION: Automatically update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_settings_modtime BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
