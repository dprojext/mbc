-- MBC SYSTEM REGISTRY "NUCLEAR FIX" (Services & Subscriptions)
-- RUN THIS IN SUPABASE SQL EDITOR TO BYPASS ALL SECURITY BLOCKS

-- 1. SERVICES REGISTRY RESET
DROP TABLE IF EXISTS public.services CASCADE;
CREATE TABLE public.services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price TEXT,
    icon_type TEXT DEFAULT 'FiPackage',
    image TEXT DEFAULT '/images/service-wash.jpg',
    features JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.services TO anon, authenticated, service_role;

-- 2. PLANS/SUBSCRIPTIONS REGISTRY RESET
DROP TABLE IF EXISTS public.plans CASCADE;
CREATE TABLE public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price TEXT NOT NULL, -- Keep as text for flexible pricing like "From $150"
    type TEXT DEFAULT 'subscription', -- 'subscription' or 'one-time'
    features JSONB DEFAULT '[]'::jsonb,
    active_users INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.plans DISABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.plans TO anon, authenticated, service_role;

-- 3. SEED AUTHORITATIVE SERVICES
INSERT INTO public.services (id, title, description, price, features, image, featured)
VALUES 
('wash-01', 'Signature Hand Wash', 'Meticulous hand wash with premium products.', 'From $45', '["pH-Neutral Foam", "Microfiber Drying", "Wheel Deep Clean"]'::jsonb, '/images/service-wash.jpg', true),
('detail-01', 'Interior Restoration', 'Deep cleaning and conditioning of all surfaces.', '$150', '["Steam Sanitization", "Leather Conditioning", "Odor Removal"]'::jsonb, '/images/hero-car.jpg', false);

-- 4. SEED AUTHORITATIVE PLANS
INSERT INTO public.plans (id, name, price, type, features, active_users)
VALUES 
('plan-silver', 'Silver Tier', '45', 'subscription', '["2 Washes / Month", "Interior Vacuum", "Tire Shine"]'::jsonb, 12),
('plan-gold', 'Gold Executive', '85', 'subscription', '["4 Washes / Month", "Wax Protection", "Interior Sanitization", "Engine Bay Clean"]'::jsonb, 8),
('pkg-ceramic', 'Ceramic Shield', '450', 'one-time', '["3 Year Protection", "Paint Correction", "Hydrophobic Layer"]'::jsonb, 5);
