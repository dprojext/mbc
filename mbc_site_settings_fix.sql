-- SITE SETTINGS "NUCLEAR FIX"
-- RUN THIS IN SUPABASE SQL EDITOR TO ENSURE THE ADMIN PANEL CAN SAVE

-- 1. REBUILD TABLE (Keep existing data if possible, but ensure columns match)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'site_settings') THEN
        CREATE TABLE public.site_settings (
            id INTEGER PRIMARY KEY DEFAULT 1,
            site_name TEXT,
            tagline TEXT,
            description TEXT,
            legal_text TEXT,
            logo TEXT,
            favicon TEXT,
            primary_color TEXT,
            secondary_color TEXT,
            accent_color TEXT,
            typography TEXT,
            show_legal BOOLEAN,
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
            created_at TIMESTAMPTZ DEFAULT NOW(),
            CONSTRAINT single_row CHECK (id = 1)
        );
    END IF;
END $$;

-- 2. DISABLE RLS
ALTER TABLE public.site_settings DISABLE ROW LEVEL SECURITY;

-- 3. GRANT PERMISSIONS
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;

-- 4. ENSURE ROW 1 EXISTS
INSERT INTO public.site_settings (id, site_name, tagline, logo, primary_color)
VALUES (1, 'Metro Blackline Care', 'Luxury Car Care', 'M', '#c9a96a')
ON CONFLICT (id) DO NOTHING;
