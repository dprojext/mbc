-- SITE SETTINGS NUCLEAR FIX v2
-- This script ensures the site_settings table matches the application's DataContext.jsx payload perfectly.
-- Run this in your Supabase SQL Editor to fix synchronization and persistence issues.

-- 1. Ensure the table exists with all required columns
DO $$ 
BEGIN
    -- Base columns (if table doesn't exist, CREATE it)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_settings' AND table_schema = 'public') THEN
        CREATE TABLE public.site_settings (
            id BIGINT PRIMARY KEY,
            site_name TEXT DEFAULT 'Metro Blackline Care',
            tagline TEXT,
            description TEXT,
            logo TEXT,
            favicon TEXT,
            legal_text TEXT,
            show_legal BOOLEAN DEFAULT TRUE,
            primary_color TEXT DEFAULT '#c9a96a',
            secondary_color TEXT DEFAULT '#1a1a1a',
            accent_color TEXT DEFAULT '#ffffff',
            background_color TEXT DEFAULT '#0a0a0a',
            typography TEXT DEFAULT 'Nunito',
            phone TEXT,
            email TEXT,
            hours TEXT,
            address TEXT,
            instagram TEXT,
            facebook TEXT,
            twitter TEXT,
            linkedin TEXT,
            google_map_link TEXT,
            view_count BIGINT DEFAULT 0,
            seo JSONB DEFAULT '{}'::jsonb,
            documents JSONB DEFAULT '[]'::jsonb,
            landing_images JSONB DEFAULT '{}'::jsonb,
            dashboard_images JSONB DEFAULT '{}'::jsonb,
            payment_gateways JSONB DEFAULT '[]'::jsonb,
            payments_enabled BOOLEAN DEFAULT TRUE,
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    ELSE
        -- Table exists, add columns if missing
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'description') THEN ALTER TABLE public.site_settings ADD COLUMN description TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'logo') THEN ALTER TABLE public.site_settings ADD COLUMN logo TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'favicon') THEN ALTER TABLE public.site_settings ADD COLUMN favicon TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'legal_text') THEN ALTER TABLE public.site_settings ADD COLUMN legal_text TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'show_legal') THEN ALTER TABLE public.site_settings ADD COLUMN show_legal BOOLEAN DEFAULT TRUE; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'primary_color') THEN ALTER TABLE public.site_settings ADD COLUMN primary_color TEXT DEFAULT '#c9a96a'; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'secondary_color') THEN ALTER TABLE public.site_settings ADD COLUMN secondary_color TEXT DEFAULT '#1a1a1a'; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'accent_color') THEN ALTER TABLE public.site_settings ADD COLUMN accent_color TEXT DEFAULT '#ffffff'; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'background_color') THEN ALTER TABLE public.site_settings ADD COLUMN background_color TEXT DEFAULT '#0a0a0a'; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'typography') THEN ALTER TABLE public.site_settings ADD COLUMN typography TEXT DEFAULT 'Nunito'; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'phone') THEN ALTER TABLE public.site_settings ADD COLUMN phone TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'email') THEN ALTER TABLE public.site_settings ADD COLUMN email TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'hours') THEN ALTER TABLE public.site_settings ADD COLUMN hours TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'address') THEN ALTER TABLE public.site_settings ADD COLUMN address TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'instagram') THEN ALTER TABLE public.site_settings ADD COLUMN instagram TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'facebook') THEN ALTER TABLE public.site_settings ADD COLUMN facebook TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'twitter') THEN ALTER TABLE public.site_settings ADD COLUMN twitter TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'linkedin') THEN ALTER TABLE public.site_settings ADD COLUMN linkedin TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'google_map_link') THEN ALTER TABLE public.site_settings ADD COLUMN google_map_link TEXT; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'view_count') THEN ALTER TABLE public.site_settings ADD COLUMN view_count BIGINT DEFAULT 0; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'seo') THEN ALTER TABLE public.site_settings ADD COLUMN seo JSONB DEFAULT '{}'::jsonb; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'documents') THEN ALTER TABLE public.site_settings ADD COLUMN documents JSONB DEFAULT '[]'::jsonb; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'landing_images') THEN ALTER TABLE public.site_settings ADD COLUMN landing_images JSONB DEFAULT '{}'::jsonb; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'dashboard_images') THEN ALTER TABLE public.site_settings ADD COLUMN dashboard_images JSONB DEFAULT '{}'::jsonb; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'payment_gateways') THEN ALTER TABLE public.site_settings ADD COLUMN payment_gateways JSONB DEFAULT '[]'::jsonb; END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'payments_enabled') THEN ALTER TABLE public.site_settings ADD COLUMN payments_enabled BOOLEAN DEFAULT TRUE; END IF;
    END IF;
END $$;

-- 2. Enforce id=1 as the single source of truth
DELETE FROM public.site_settings WHERE id != 1;

-- 3. Ensure row #1 exists with initial data if it doesn't
INSERT INTO public.site_settings (id, site_name, tagline, payments_enabled, payment_gateways)
VALUES (1, 'Metro Blackline Care', 'Luxury Car Care, Wherever You Are.', TRUE, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 4. Reset Permissions and RLS
-- We disable RLS and grant ALL to ensure the app, which might be running as 'anon' or 'authenticated', can write settings.
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;

-- 5. Verification
SELECT * FROM public.site_settings WHERE id = 1;

