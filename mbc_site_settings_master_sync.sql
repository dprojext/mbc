-- MBC SITE SETTINGS SCHEMA UPGRADE
-- Synchronizes the database table with the DataContext.jsx payload

DO $$ 
BEGIN
    -- Core Identity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'description') THEN
        ALTER TABLE public.site_settings ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'favicon') THEN
        ALTER TABLE public.site_settings ADD COLUMN favicon TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'legal_text') THEN
        ALTER TABLE public.site_settings ADD COLUMN legal_text TEXT;
    END IF;

    -- Visual Engine (Flat columns for easier access)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'primary_color') THEN
        ALTER TABLE public.site_settings ADD COLUMN primary_color TEXT DEFAULT '#c9a96a';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'secondary_color') THEN
        ALTER TABLE public.site_settings ADD COLUMN secondary_color TEXT DEFAULT '#1a1a1a';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'accent_color') THEN
        ALTER TABLE public.site_settings ADD COLUMN accent_color TEXT DEFAULT '#ffffff';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'background_color') THEN
        ALTER TABLE public.site_settings ADD COLUMN background_color TEXT DEFAULT '#0a0a0a';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'typography') THEN
        ALTER TABLE public.site_settings ADD COLUMN typography TEXT DEFAULT 'Nunito';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'show_legal') THEN
        ALTER TABLE public.site_settings ADD COLUMN show_legal BOOLEAN DEFAULT TRUE;
    END IF;

    -- Contact & Discovery
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'phone') THEN
        ALTER TABLE public.site_settings ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'email') THEN
        ALTER TABLE public.site_settings ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'hours') THEN
        ALTER TABLE public.site_settings ADD COLUMN hours TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'address') THEN
        ALTER TABLE public.site_settings ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'google_map_link') THEN
        ALTER TABLE public.site_settings ADD COLUMN google_map_link TEXT;
    END IF;

    -- Social Architecture
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'instagram') THEN
        ALTER TABLE public.site_settings ADD COLUMN instagram TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'facebook') THEN
        ALTER TABLE public.site_settings ADD COLUMN facebook TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'twitter') THEN
        ALTER TABLE public.site_settings ADD COLUMN twitter TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'linkedin') THEN
        ALTER TABLE public.site_settings ADD COLUMN linkedin TEXT;
    END IF;

    -- System Stats & SEO
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'view_count') THEN
        ALTER TABLE public.site_settings ADD COLUMN view_count BIGINT DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'seo') THEN
        ALTER TABLE public.site_settings ADD COLUMN seo JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Asset Management
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'dashboard_images') THEN
        ALTER TABLE public.site_settings ADD COLUMN dashboard_images JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Payments System
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'payments_enabled') THEN
        ALTER TABLE public.site_settings ADD COLUMN payments_enabled BOOLEAN DEFAULT TRUE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'payment_gateways') THEN
        ALTER TABLE public.site_settings ADD COLUMN payment_gateways JSONB DEFAULT '[]'::jsonb;
    END IF;

END $$;

-- Reset permissions to ensure the app can write to the new columns
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;

-- Final Verification
SELECT * FROM public.site_settings LIMIT 1;
