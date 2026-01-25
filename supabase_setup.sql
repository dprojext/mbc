-- ============================================
-- METRO BLACKLINE CARE - SUPABASE DATABASE SETUP
-- ============================================
-- Paste this entire file into your Supabase SQL Editor
-- and click "Run" to create all required tables.
-- ============================================

-- 1. PROFILES & USERS
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    display_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'user', -- 'admin' or 'user'
    avatar_url TEXT,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    total_spent NUMERIC DEFAULT 0,
    plan TEXT DEFAULT 'None',
    status TEXT DEFAULT 'Pending',
    last_active TIMESTAMPTZ DEFAULT NOW(),
    requires_password_change BOOLEAN DEFAULT false
);

-- 2. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_name TEXT DEFAULT 'Metro Blackline Care',
    tagline TEXT DEFAULT 'Luxury Car Care, Wherever You Are.',
    description TEXT,
    legal_text TEXT,
    logo TEXT,
    primary_color TEXT DEFAULT '#c9a96a',
    secondary_color TEXT DEFAULT '#1a1a1a',
    accent_color TEXT DEFAULT '#ffffff',
    typography TEXT DEFAULT 'Nunito',
    show_legal BOOLEAN DEFAULT true,
    phone TEXT,
    email TEXT,
    hours TEXT,
    address TEXT,
    instagram TEXT,
    facebook TEXT,
    twitter TEXT,
    linkedin TEXT,
    google_map_link TEXT,
    view_count INTEGER DEFAULT 0,
    CONSTRAINT single_row CHECK (id = 1)
);

-- 3. SERVICES
CREATE TABLE IF NOT EXISTS public.services (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    price TEXT,
    image TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT false,
    icon_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUBSCRIPTION PLANS (PACKAGES)
CREATE TABLE IF NOT EXISTS public.plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    type TEXT DEFAULT 'subscription',
    period TEXT DEFAULT 'month',
    features JSONB DEFAULT '[]'::jsonb,
    active_users INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY, -- e.g. BK-123
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    full_name TEXT,
    date DATE,
    time TEXT,
    vehicle_type TEXT,
    service TEXT,
    location TEXT,
    status TEXT DEFAULT 'Pending', -- 'Pending', 'Approved', 'Completed', 'Rejected'
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id TEXT PRIMARY KEY, -- conv-123
    customer_id UUID REFERENCES auth.users ON DELETE CASCADE,
    customer_name TEXT,
    last_message TEXT,
    last_message_time TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY, -- msg-123
    conversation_id TEXT REFERENCES public.conversations ON DELETE CASCADE,
    sender TEXT, -- 'admin' or 'customer'
    text TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT false
);

-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE, -- NULL for admin notifications
    type TEXT, -- 'booking', 'user', 'payment', 'system'
    title TEXT,
    message TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    read BOOLEAN DEFAULT false
);

-- 9. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY, -- TRX-123
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    amount NUMERIC,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'Completed',
    type TEXT, -- 'Subscription', 'Service', 'One-time'
    user_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS & POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RE-RUNNABLE POLICIES (Drop first to avoid errors)

-- 1. Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Settings
DROP POLICY IF EXISTS "Settings are readable by everyone" ON public.site_settings;
CREATE POLICY "Settings are readable by everyone" ON public.site_settings FOR SELECT USING (true);

-- 3. Services & Plans
DROP POLICY IF EXISTS "Services are readable by everyone" ON public.services;
CREATE POLICY "Services are readable by everyone" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Plans are readable by everyone" ON public.plans;
CREATE POLICY "Plans are readable by everyone" ON public.plans FOR SELECT USING (true);

-- 4. Bookings
DROP POLICY IF EXISTS "Users view own bookings or Admin" ON public.bookings;
CREATE POLICY "Users view own bookings or Admin" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

DROP POLICY IF EXISTS "Users create own bookings" ON public.bookings;
CREATE POLICY "Users create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Notifications
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- 6. Transactions
DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- 7. Conversations & Messages
DROP POLICY IF EXISTS "Users view own conversations" ON public.conversations;
CREATE POLICY "Users view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = customer_id OR (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

DROP POLICY IF EXISTS "Users view own messages" ON public.messages;
CREATE POLICY "Users view own messages" ON public.messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.conversations WHERE conversations.id = messages.conversation_id AND (conversations.customer_id = auth.uid()))
    OR 
    (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, display_name, phone, role)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'phone', 
            CASE WHEN NEW.email = 'mbc@db.com' THEN 'admin' ELSE 'user' END);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SEED INITIAL DATA
-- ============================================

-- Site Settings
INSERT INTO public.site_settings (id, site_name, tagline, description, legal_text, logo, phone, email, hours, address)
VALUES (1, 'Metro Blackline Care', 'Luxury Car Care, Wherever You Are.', 
        'Experience unparalleled automotive excellence with our premium mobile detailing services.', 
        '© 2026 Metro Blackline Care. All rights reserved.', 'M', '+251 900 000 000', 
        'care@metroblackline.com', 'Mon - Sun: 7AM - 8PM', 'Addis Ababa, Ethiopia')
ON CONFLICT (id) DO NOTHING;

-- Services
INSERT INTO public.services (title, price, image, description, features, featured, icon_type)
VALUES 
('Signature Hand Wash', 'From $150', '/images/service-wash.jpg', 'Meticulous hand wash with premium products.', '["pH-Neutral Foam", "Microfiber Drying"]'::jsonb, false, 'wash'),
('Ceramic Pro Coating', 'From $800', '/images/service-ceramic.jpg', 'Professional grade 9H ceramic coating.', '["9H Hardness", "5-Year Protection"]'::jsonb, true, 'ceramic')
ON CONFLICT DO NOTHING;

-- Packages (Plans)
INSERT INTO public.plans (name, price, features, active_users)
VALUES 
('Silver Plan', 99, '["2 Signature Washes", "Basic Interior Cleaning"]'::jsonb, 0),
('Gold Plan', 199, '["4 Signature Washes", "Full Interior Detail", "Priority Scheduling"]'::jsonb, 0),
('Platinum Plan', 399, '["Unlimited Washes", "Monthly Ceramic Maintenance", "VIP Concierge"]'::jsonb, 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUPER ADMIN SETUP INFORMATION
-- ============================================
-- To create the Super Admin, run the following in the SQL Editor:
/*
-- 1. Create the user in Auth
-- This should ideally be done through the Supabase Authentication dashboard:
-- Email: mbc@db.com
-- Password: mbc@4321

-- 2. If you want to force set a user as admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'mbc@db.com';
*/

-- 10. BROADCASTS
CREATE TABLE IF NOT EXISTS public.broadcasts (
    id SERIAL PRIMARY KEY,
    subject TEXT,
    message TEXT,
    audience TEXT, -- 'All Users', 'Subscribers', etc.
    status TEXT DEFAULT 'Sent',
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    sent_by UUID REFERENCES auth.users
);

-- 11. ANALYTICS EVENTS
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id SERIAL PRIMARY KEY,
    event_type TEXT, -- 'page_view', 'click', 'signup'
    page_path TEXT,
    user_id UUID REFERENCES auth.users,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. DATA EXPORTS
CREATE TABLE IF NOT EXISTS public.data_exports (
    id SERIAL PRIMARY KEY,
    export_type TEXT, -- 'Users', 'Transactions'
    format TEXT, -- 'CSV', 'PDF'
    generated_by UUID REFERENCES auth.users,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    url TEXT
);

-- Enable RLS for new tables
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admins can manage broadcasts" ON public.broadcasts;
CREATE POLICY "Admins can manage broadcasts" ON public.broadcasts USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Admins can view analytics" ON public.analytics_events;
CREATE POLICY "Admins can view analytics" ON public.analytics_events USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "Users view own exports or Admin" ON public.data_exports;
CREATE POLICY "Users view own exports or Admin" ON public.data_exports USING (auth.uid() = generated_by OR (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')));

-- Analytics Insert Policy (Public)
DROP POLICY IF EXISTS "Public insert analytics" ON public.analytics_events;
CREATE POLICY "Public insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- ============================================
-- MANUAL OVERRIDE: CONFIRM & PROMOTE ADMIN
-- ============================================
-- Run these lines to force-confirm the mbc@db.com user if email verification is stuck
-- and ensure they have the 'admin' role.
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'mbc@db.com';

INSERT INTO public.profiles (id, email, role, display_name)
SELECT id, email, 'admin', 'Super Admin'
FROM auth.users
WHERE email = 'mbc@db.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
