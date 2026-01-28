-- MBC SERVICE REGISTRY FINAL RECONCILIATION
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. RECONCILE IDENTITY TYPE
-- Supports authoritative string-based slugs
ALTER TABLE public.services ALTER COLUMN id TYPE TEXT;

-- 2. ENSURE RLS IS ENABLED
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 3. DROP EXISTING POLICIES
DROP POLICY IF EXISTS "Services viewable by all" ON public.services;
DROP POLICY IF EXISTS "Services manageable by admin" ON public.services;

-- 4. CREATE POLICIES (Public Read, Admin All)
CREATE POLICY "Services viewable by all" ON public.services FOR SELECT USING (TRUE);
CREATE POLICY "Services manageable by admin" ON public.services FOR ALL USING (public.check_user_is_admin());

-- 5. GRANT PERMISSIONS
GRANT ALL ON TABLE public.services TO anon, authenticated, service_role;

-- 6. INITIALIZE DUMMY DATA (Handling JSONB for features)
-- Uses explicit JSONB casting to resolve the type mismatch error
INSERT INTO public.services (id, title, description, price, features, image, featured)
SELECT 'demo-wash', 'Signature Hand Wash', 'Premium meticulous cleaning.', 'From $45', '["Exterior Wash", "Hand Dry"]'::jsonb, '/images/service-wash.jpg', true
WHERE NOT EXISTS (SELECT 1 FROM public.services);

-- 7. RECONCILE PLANS TABLE
ALTER TABLE public.plans ALTER COLUMN id TYPE TEXT;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Plans viewable by all" ON public.plans;
DROP POLICY IF EXISTS "Plans manageable by admin" ON public.plans;
CREATE POLICY "Plans viewable by all" ON public.plans FOR SELECT USING (TRUE);
CREATE POLICY "Plans manageable by admin" ON public.plans FOR ALL USING (public.check_user_is_admin());
GRANT ALL ON TABLE public.plans TO anon, authenticated, service_role;
