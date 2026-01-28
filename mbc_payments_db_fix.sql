-- ADD MISSING FINANCIAL COLUMNS TO SITE SETTINGS
-- This ensures the ENABLED/DISABLED buttons can persist their state

DO $$ 
BEGIN
    -- Add payment_gateways column (JSONB for complex instruction sets)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'payment_gateways') THEN
        ALTER TABLE public.site_settings ADD COLUMN payment_gateways JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add payments_enabled column (Boolean toggle)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'payments_enabled') THEN
        ALTER TABLE public.site_settings ADD COLUMN payments_enabled BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Refresh permissions just in case
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;
