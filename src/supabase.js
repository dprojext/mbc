import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://khrsyauspfdszripxetm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocnN5YXVzcGZkc3pyaXB4ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODM2MDQsImV4cCI6MjA4NDY1OTYwNH0.nyRZeQF0_ZCqEKgmpa1kglzsnPVSuEJjOZlCf-NXahE';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});

console.log('[SUPABASE] Client initialized');
