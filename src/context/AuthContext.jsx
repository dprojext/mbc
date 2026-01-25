import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored session in localStorage (since Supabase client hangs)
        const checkStoredSession = async () => {
            console.log("[AUTH] Checking stored session...");
            try {
                const storedUser = localStorage.getItem('supabase_user');
                const storedToken = localStorage.getItem('supabase_access_token');

                if (storedUser && storedToken) {
                    const userData = JSON.parse(storedUser);
                    console.log("[AUTH] Found stored user:", userData.id);

                    // Sync Supabase client session so updates work
                    const refreshToken = localStorage.getItem('supabase_refresh_token');
                    try {
                        await supabase.auth.setSession({
                            access_token: storedToken,
                            refresh_token: refreshToken
                        });
                    } catch (sErr) { console.warn("[AUTH] Supabase client sync error:", sErr); }

                    // Fetch profile to get role
                    try {
                        const profileRes = await fetch(`https://khrsyauspfdszripxetm.supabase.co/rest/v1/profiles?id=eq.${userData.id}&select=role`, {
                            headers: {
                                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocnN5YXVzcGZkc3pyaXB4ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODM2MDQsImV4cCI6MjA4NDY1OTYwNH0.nyRZeQF0_ZCqEKgmpa1kglzsnPVSuEJjOZlCf-NXahE',
                                'Authorization': `Bearer ${storedToken}`
                            }
                        });
                        const profiles = await profileRes.json();
                        const role = profiles?.[0]?.role || 'user';
                        console.log("[AUTH] Restored user with role:", role);
                        setUser({ ...userData, role });
                    } catch (pErr) {
                        console.warn("[AUTH] Profile fetch error:", pErr);
                        setUser({ ...userData, role: 'user' });
                    }
                } else {
                    console.log("[AUTH] No stored session found");
                }
            } catch (err) {
                console.warn("[AUTH] Session restore error:", err);
            } finally {
                setLoading(false);
            }
        };

        checkStoredSession();
    }, []);

    const login = async (email, password) => {
        console.log("[LOGIN] Starting login for:", email);
        try {
            // Use direct fetch instead of Supabase client (client was hanging)
            console.log("[LOGIN] Using direct fetch...");
            const response = await fetch('https://khrsyauspfdszripxetm.supabase.co/auth/v1/token?grant_type=password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocnN5YXVzcGZkc3pyaXB4ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODM2MDQsImV4cCI6MjA4NDY1OTYwNH0.nyRZeQF0_ZCqEKgmpa1kglzsnPVSuEJjOZlCf-NXahE'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log("[LOGIN] Response received:", response.status);

            if (!response.ok || data.error) {
                console.error("[LOGIN] Auth error:", data.error_description || data.error || 'Login failed');
                return { success: false, message: data.error_description || data.error || 'Login failed' };
            }

            if (data.user) {
                console.log("[LOGIN] User authenticated:", data.user.id);

                // Store tokens in localStorage for persistence
                localStorage.setItem('supabase_access_token', data.access_token);
                localStorage.setItem('supabase_refresh_token', data.refresh_token);
                localStorage.setItem('supabase_user', JSON.stringify(data.user));

                // Sync Supabase client session so updates work
                try {
                    await supabase.auth.setSession({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token
                    });
                    console.log("[LOGIN] Supabase client session synced");
                } catch (sErr) { console.warn("[LOGIN] Supabase sync error:", sErr); }

                // Fetch profile using direct fetch (Supabase client hangs)
                let role = 'user';
                let requiresPasswordChange = false;

                try {
                    console.log("[LOGIN] Fetching profile...");
                    const profileRes = await fetch(`https://khrsyauspfdszripxetm.supabase.co/rest/v1/profiles?id=eq.${data.user.id}&select=role`, {
                        headers: {
                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocnN5YXVzcGZkc3pyaXB4ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODM2MDQsImV4cCI6MjA4NDY1OTYwNH0.nyRZeQF0_ZCqEKgmpa1kglzsnPVSuEJjOZlCf-NXahE',
                            'Authorization': `Bearer ${data.access_token}`
                        }
                    });
                    const profiles = await profileRes.json();
                    console.log("[LOGIN] Profile response:", profiles);
                    if (profiles && profiles[0]) {
                        role = profiles[0].role || 'user';
                    }
                } catch (pErr) {
                    console.warn("[LOGIN] Profile load error:", pErr);
                }

                console.log("[LOGIN] Setting user with role:", role);
                setUser({ ...data.user, role, requiresPasswordChange });
                return { success: true, role, requiresPasswordChange };
            }

            console.error("[LOGIN] No user in response");
            return { success: false, message: 'Authentication failed.' };
        } catch (err) {
            console.error("[LOGIN] Exception:", err);
            return { success: false, message: err.message };
        }
    };

    const signup = async (name, email, password, phone) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: name,
                    phone: phone,
                },
            },
        });

        if (error) return { success: false, message: error.message };
        return { success: true };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const refreshProfile = async () => {
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('role, requires_password_change').eq('id', user.id).single();
        if (profile) {
            setUser(prev => ({ ...prev, role: profile.role, requiresPasswordChange: profile.requires_password_change }));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, refreshProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
