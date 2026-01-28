import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('supabase_user');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                // SECURE FALLBACK: Ensure primary admin email always has admin privileges in local cache
                if (u && u.email === 'mbc@db.com') {
                    u.role = 'admin';
                    u.name = u.name || 'MBC Admin';
                }
                return u;
            } catch (e) {
                return null;
            }
        }
        return null;
    });
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

                    // Fetch profile to get role and saved data
                    // Use a safer select to avoid 400 errors if columns are missing
                    try {
                        const profileRes = await fetch(`https://khrsyauspfdszripxetm.supabase.co/rest/v1/profiles?id=eq.${userData.id}`, {
                            headers: {
                                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocnN5YXVzcGZkc3pyaXB4ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODM2MDQsImV4cCI6MjA4NDY1OTYwNH0.nyRZeQF0_ZCqEKgmpa1kglzsnPVSuEJjOZlCf-NXahE',
                                'Authorization': `Bearer ${storedToken}`
                            }
                        });

                        if (profileRes.ok) {
                            const profiles = await profileRes.json();
                            if (profiles?.[0]) {
                                const p = profiles[0];
                                console.log("[AUTH] Restored executive profile for:", p.display_name);
                                const completeUser = {
                                    ...userData,
                                    role: p.role || userData.role || 'user',
                                    name: p.display_name || userData.name,
                                    phone: p.phone,
                                    profileImg: p.profile_img,
                                    subscriptionPlan: p.subscription_plan,
                                    savedVehicles: p.saved_vehicles || [],
                                    savedAddresses: p.saved_addresses || [],
                                    requiresPasswordChange: p.requires_password_change || false
                                };

                                // FORCE ADMIN: Ensure fallback email always maintains admin status
                                if (userData.email === 'mbc@db.com') completeUser.role = 'admin';

                                localStorage.setItem('supabase_user', JSON.stringify(completeUser));
                                setUser(completeUser);
                            }
                        } else {
                            const errText = await profileRes.text();
                            console.warn("[AUTH] Profile fetch failed with status:", profileRes.status, errText);
                            // CRITICAL FIX: If API fails (recursion etc), TRUST THE CACHED ROLE in userData
                            // This prevents redirecting admins to user dashboard on server errors.
                            if (userData.role) {
                                console.log("[AUTH] Server error encountered. Maintaining cached role:", userData.role);
                                setUser(userData);
                            }
                        }
                    } catch (pErr) {
                        console.warn("[AUTH] Profile fetch exception:", pErr);
                        // SECURE FALLBACK: Maintain cached session if it exists
                        if (userData.role) {
                            setUser(userData);
                        } else if (userData.email === 'mbc@db.com') {
                            setUser({ ...userData, role: 'admin', name: 'MBC Admin', requiresPasswordChange: false });
                        } else {
                            setUser({ ...userData, role: 'user', requiresPasswordChange: false });
                        }
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

                // Store key tokens in localStorage for persistence
                localStorage.setItem('supabase_access_token', data.access_token);
                localStorage.setItem('supabase_refresh_token', data.refresh_token);
                // DO NOT store user yet until profile role is attached to avoid role-less sessions on reload

                // Sync Supabase client session so updates work
                try {
                    await supabase.auth.setSession({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token
                    });
                    console.log("[LOGIN] Supabase client session synced");
                } catch (sErr) { console.warn("[LOGIN] Supabase sync error:", sErr); }

                // Fetch profile using direct fetch (Supabase client hangs)
                let profileData = { role: 'user', name: data.user.email, requiresPasswordChange: false };

                try {
                    console.log("[LOGIN] Fetching executive profile...");
                    const profileRes = await fetch(`https://khrsyauspfdszripxetm.supabase.co/rest/v1/profiles?id=eq.${data.user.id}`, {
                        headers: {
                            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocnN5YXVzcGZkc3pyaXB4ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODM2MDQsImV4cCI6MjA4NDY1OTYwNH0.nyRZeQF0_ZCqEKgmpa1kglzsnPVSuEJjOZlCf-NXahE',
                            'Authorization': `Bearer ${data.access_token}`
                        }
                    });
                    const profiles = await profileRes.json();
                    if (profiles && profiles[0]) {
                        const p = profiles[0];
                        profileData = {
                            role: p.role || 'user',
                            name: p.display_name,
                            phone: p.phone,
                            profileImg: p.profile_img,
                            subscriptionPlan: p.subscription_plan,
                            savedVehicles: p.saved_vehicles || [],
                            savedAddresses: p.saved_addresses || [],
                            requiresPasswordChange: p.requires_password_change || false,
                            profileComplete: p.profile_complete || false
                        };
                    }
                } catch (pErr) {
                    console.warn("[LOGIN] Profile load error:", pErr);
                }

                // SECURE FALLBACK: Ensure primary admin email always has admin role
                if (data.user.email === 'mbc@db.com') {
                    profileData.role = 'admin';
                    profileData.name = profileData.name || 'MBC Admin';
                    profileData.profileComplete = true; // Admins skip profile setup
                    console.log("[LOGIN] Securely applied fallback admin role.");
                }

                console.log("[LOGIN] Session established for:", profileData.name);
                const completeUser = { ...data.user, ...profileData };
                localStorage.setItem('supabase_user', JSON.stringify(completeUser));
                setUser(completeUser);
                return { success: true, role: profileData.role, requiresPasswordChange: profileData.requiresPasswordChange, profileComplete: profileData.profileComplete };
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
        localStorage.removeItem('supabase_user');
        setUser(null);
    };

    const refreshProfile = async () => {
        if (!user) return;
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                const updatedUser = {
                    ...user,
                    role: profile.role,
                    name: profile.display_name,
                    phone: profile.phone,
                    profileImg: profile.profile_img,
                    subscriptionPlan: profile.subscription_plan,
                    savedVehicles: profile.saved_vehicles || [],
                    savedAddresses: profile.saved_addresses || [],
                    requiresPasswordChange: profile.requires_password_change
                };
                localStorage.setItem('supabase_user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (err) { console.error("[AUTH] Refresh Profile Error:", err); }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, refreshProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
