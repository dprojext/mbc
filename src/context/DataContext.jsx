import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabase';

export const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    // --- Initial Constants (Fallbacks) ---
    const initialSettings = {
        siteName: 'Metro Blackline Care',
        tagline: 'Luxury Car Care, Wherever You Are.',
        description: 'Experience unparalleled automotive excellence with our premium mobile detailing services.',
        legalText: '© 2026 Metro Blackline Care. All rights reserved.',
        logo: 'M',
        favicon: '●',
        colors: { primary: '#c9a96a', secondary: '#1a1a1a', accent: '#ffffff', background: '#0a0a0a' },
        typography: 'Nunito',
        showLegal: true,
        seo: { title: 'Metro Blackline - Premium Mobile Car Wash', description: 'Top-rated mobile car wash and detailing service in Addis Ababa.', ogImage: '' },
        documents: [],
        landingImages: {
            hero: '/images/hero-car.jpg',
            about: '/images/service-wash.jpg',
            membership: '/images/hero-car.jpg',
            contact: '/images/hero-car.jpg'
        },
        contact: {
            phone: '+1 (555) 000-0000',
            email: 'care@metroblackline.com',
            hours: 'Mon - Sun: 7AM - 8PM',
            socials: { instagram: '#', facebook: '#', twitter: '#', linkedin: '#' },
            address: 'Addis Ababa, Ethiopia',
            googleMapLink: ''
        },
        viewCount: 0,
        footerSections: [
            { title: 'Services', links: [{ label: 'Signature Wash', url: '#services' }, { label: 'Interior Detail', url: '#services' }, { label: 'Ceramic Coating', url: '#services' }] },
            { title: 'Company', links: [{ label: 'About Us', url: '#about' }, { label: 'Contact', url: '#contact' }, { label: 'Careers', url: '#' }] }
        ],
        paymentGateways: [
            { id: 'bank', name: 'Bank Transfer', type: 'bank', enabled: true, details: '100012345678 - MBC PLC', bankName: 'MBC PLC', accountHolder: 'Metro Blackline Care', accountNumber: '100012345678', transferType: 'Internal/ACH' },
            { id: 'mobile', name: 'Mobile Money', type: 'mobile', enabled: true, details: '*889#' },
            { id: 'card', name: 'Credit/Debit Card', type: 'card', enabled: false, details: 'Stripe/Flutterwave' }
        ],
        paymentsEnabled: true
    };

    const initialServices = [];

    const initialPlans = [];

    const initialUsers = [];

    const initialConversations = [];

    const initialMessages = [];

    const initialAdminNotifications = [];

    // --- State Management ---
    const [settings, setSettings] = useState(initialSettings);
    const [services, setServices] = useState(initialServices);
    const [plans, setPlans] = useState(initialPlans);
    const [transactions, setTransactions] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState(initialUsers);
    const [conversations, setConversations] = useState(initialConversations);
    const [messages, setMessages] = useState(initialMessages);
    const [adminNotifications, setAdminNotifications] = useState(initialAdminNotifications);
    const [userNotifications, setUserNotifications] = useState([]);
    const [broadcasts, setBroadcasts] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [dataExports, setDataExports] = useState([]);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Auth Session Management ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- Real-time Preview Synchronization ---
    useEffect(() => {
        const handleSync = () => {
            const previewData = localStorage.getItem('preview_settings');
            if (previewData) {
                try {
                    const parsed = JSON.parse(previewData);
                    setSettings(prev => {
                        // Only merge if the parsed data has content to avoid blanking
                        if (!parsed || Object.keys(parsed).length === 0) return prev;

                        const merged = { ...prev, ...parsed };
                        // Deep merge for critical nested structures
                        if (parsed.colors && prev.colors) merged.colors = { ...prev.colors, ...parsed.colors };
                        if (parsed.contact && prev.contact) merged.contact = { ...prev.contact, ...parsed.contact };
                        if (parsed.seo && prev.seo) merged.seo = { ...prev.seo, ...parsed.seo };
                        return merged;
                    });
                } catch (e) { }
            }
        };

        // Listen for storage events from other tabs/frames
        window.addEventListener('storage', (e) => {
            if (e.key === 'preview_settings') handleSync();
        });

        // Initial check
        handleSync();

        return () => window.removeEventListener('storage', handleSync);
    }, []);

    // Function for admin to update local preview state without db hit
    const liveUpdateSettings = (newSettings) => {
        setSettings(prev => {
            const next = { ...prev, ...newSettings };
            localStorage.setItem('preview_settings', JSON.stringify(next));
            return next;
        });
        window.dispatchEvent(new Event('storage'));
    };

    // --- Supabase Synchronization Logic ---

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // parallel fetch all tables using allSettled so one failure doesn't block others
                const results = await Promise.allSettled([
                    supabase.from('site_settings').select('*'),
                    supabase.from('services').select('*'),
                    supabase.from('plans').select('*'),
                    supabase.from('profiles').select('*'),
                    supabase.from('bookings').select('*'),
                    supabase.from('transactions').select('*'),
                    supabase.from('conversations').select('*'),
                    supabase.from('messages').select('*'),
                    supabase.from('notifications').select('*'),
                    supabase.from('broadcasts').select('*'),
                    supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(200),
                    supabase.from('data_exports').select('*')
                ]);

                // Helper to get data from result or log notice/error
                const getData = (result, tableName) => {
                    if (result.status === 'fulfilled' && result.value && !result.value.error) {
                        return result.value.data;
                    }
                    if (result.status === 'fulfilled' && result.value?.error) {
                        console.warn(`Fetch Notice [${tableName}]:`, result.value.error.message);
                    } else if (result.status === 'rejected') {
                        console.error(`Fetch Error [${tableName}]:`, result.reason);
                    }
                    return null;
                };

                const fetchedSettings = getData(results[0], 'site_settings');
                const fetchedServices = getData(results[1], 'services');
                const fetchedPlans = getData(results[2], 'plans');
                const fetchedUsers = getData(results[3], 'profiles');
                const fetchedBookings = getData(results[4], 'bookings');
                const fetchedTransactions = getData(results[5], 'transactions');
                const fetchedConvos = getData(results[6], 'conversations');
                const fetchedMessages = getData(results[7], 'messages');
                const fetchedNotifs = getData(results[8], 'notifications');
                const fetchedBroadcasts = getData(results[9], 'broadcasts');
                const fetchedAnalytics = getData(results[10], 'analytics_events');
                const fetchedExports = getData(results[11], 'data_exports');

                if (fetchedSettings && (Array.isArray(fetchedSettings) ? fetchedSettings.length > 0 : fetchedSettings)) {
                    const s = Array.isArray(fetchedSettings) ? fetchedSettings[0] : fetchedSettings;
                    // Map snake_case to camelCase for settings with deep fallbacks
                    setSettings({
                        ...initialSettings,
                        ...s,
                        id: s.id,
                        siteName: s.site_name || initialSettings.siteName,
                        tagline: s.tagline || initialSettings.tagline,
                        description: s.description || initialSettings.description,
                        legalText: s.legal_text || initialSettings.legalText,
                        logo: s.logo || initialSettings.logo,
                        favicon: s.favicon || initialSettings.favicon,
                        colors: {
                            primary: s.primary_color || initialSettings.colors.primary,
                            secondary: s.secondary_color || initialSettings.colors.secondary,
                            accent: s.accent_color || initialSettings.colors.accent,
                            background: s.background_color || initialSettings.colors.background
                        },
                        typography: s.typography || initialSettings.typography,
                        showLegal: s.show_legal !== undefined ? s.show_legal : initialSettings.showLegal,
                        contact: {
                            ...initialSettings.contact,
                            phone: s.phone || initialSettings.contact.phone,
                            email: s.email || initialSettings.contact.email,
                            hours: s.hours || initialSettings.contact.hours,
                            address: s.address || initialSettings.contact.address,
                            googleMapLink: s.google_map_link || initialSettings.contact.googleMapLink,
                            socials: {
                                instagram: s.instagram || initialSettings.contact.socials.instagram,
                                facebook: s.facebook || initialSettings.contact.socials.facebook,
                                twitter: s.twitter || initialSettings.contact.socials.twitter,
                                linkedin: s.linkedin || initialSettings.contact.socials.linkedin,
                            }
                        },
                        viewCount: Number(s.view_count || 0),
                        seo: {
                            ...initialSettings.seo,
                            ...(s.seo || {})
                        },
                        documents: Array.isArray(s.documents) ? s.documents : [],
                        landingImages: s.landing_images || initialSettings.landingImages,
                        dashboardImages: s.dashboard_images || initialSettings.dashboardImages,
                        // Intelligent Merge for Payment Gateways
                        paymentGateways: (() => {
                            const dbGws = Array.isArray(s.payment_gateways) ? s.payment_gateways : [];
                            const coreGws = initialSettings.paymentGateways;
                            const merged = coreGws.map(core => {
                                const match = dbGws.find(g => g.id === core.id);
                                return match ? { ...core, ...match } : core;
                            });
                            const custom = dbGws.filter(g => !coreGws.some(c => c.id === g.id));
                            return [...merged, ...custom];
                        })(),
                        paymentsEnabled: s.payments_enabled !== false
                    });
                }
                if (fetchedServices) setServices(fetchedServices);
                if (fetchedPlans) {
                    setPlans(fetchedPlans.map(p => ({ ...p, activeUsers: p.active_users || 0 })));
                }

                // Map Profiles to Users (Deep attribute hydration)
                if (fetchedUsers) {
                    setUsers(fetchedUsers.map(u => ({
                        ...u,
                        name: u.display_name || 'Anonymous',
                        savedVehicles: Array.isArray(u.saved_vehicles) ? u.saved_vehicles : [],
                        savedAddresses: Array.isArray(u.saved_addresses) ? u.saved_addresses : [],
                        subscriptionPlan: u.plan || u.subscription_plan || 'None',
                        plan: u.plan || u.subscription_plan || 'None',
                        joined: u.created_at ? new Date(u.created_at).toISOString().split('T')[0] : 'Unknown',
                        requests: Array.isArray(u.requests) ? u.requests : []
                    })));
                }

                // Map Bookings (database snake_case to UI camelCase)
                if (fetchedBookings) {
                    setBookings(fetchedBookings.map(b => ({
                        ...b,
                        fullName: b.full_name || 'Customer',
                        customerId: b.customer_id,
                        vehicleType: b.vehicle_type
                    })));
                }

                // Map Transactions (database snake_case to UI camelCase)
                if (fetchedTransactions) {
                    const mappedTrx = fetchedTransactions.map(t => ({
                        ...t,
                        user: t.user_name || t.user || 'Guest',
                        amount: Number(t.amount || 0),
                        paymentMethod: t.payment_method || 'N/A',
                        referenceNo: t.reference_no || 'N/A',
                        itemId: String(t.item_id || ''),
                        referenceId: t.reference_id || null,
                        category: t.category || 'Service',
                        invoiceId: t.invoice_id || null
                    }));
                    // Sort strictly by timestamp desc to ensure recent at top
                    setTransactions(mappedTrx.sort((a, b) => new Date(b.timestamp || b.created_at || b.date) - new Date(a.timestamp || a.created_at || a.date)));
                }

                if (fetchedConvos) {
                    setConversations(fetchedConvos.map(c => ({
                        ...c,
                        customerId: c.customer_id,
                        customerName: c.customer_name,
                        lastMessage: c.last_message,
                        lastMessageTime: c.last_message_time
                    })));
                }
                if (fetchedMessages) {
                    setMessages(fetchedMessages.map(m => ({ ...m, conversationId: m.conversation_id || '' })));
                }

                if (fetchedNotifs) {
                    const mappedNotifs = fetchedNotifs.map(n => ({ ...n, userId: n.user_id }));
                    setAdminNotifications(mappedNotifs.filter(n => !n.userId));
                    setUserNotifications(mappedNotifs.filter(n => n.userId));
                }

                // Explicitly set broadcasts, with fallback to empty array to ensure it's never undefined
                setBroadcasts(Array.isArray(fetchedBroadcasts) ? fetchedBroadcasts : []);
                if (fetchedAnalytics) setAnalytics(fetchedAnalytics);
                if (fetchedExports) setDataExports(fetchedExports);

                console.log("Supabase Data Synced Successfully.");
            } catch (err) {
                console.error("Critical Data Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    // --- Real-time Subscriptions for Chat ---
    useEffect(() => {
        // Subscribe to new messages in real-time
        const messagesChannel = supabase
            .channel('messages-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                console.log('[CHAT] Real-time message received:', payload);
                const newMsg = { ...payload.new, conversationId: payload.new.conversation_id };
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
                const updatedMsg = { ...payload.new, conversationId: payload.new.conversation_id };
                setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
                setMessages(prev => prev.filter(m => m.id !== payload.old.id));
            })
            .subscribe();

        // Subscribe to conversation updates
        const conversationsChannel = supabase
            .channel('conversations-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversations' }, (payload) => {
                console.log('[CHAT] Real-time conversation received:', payload);
                const newConvo = {
                    ...payload.new,
                    customerId: payload.new.customer_id,
                    customerName: payload.new.customer_name,
                    lastMessage: payload.new.last_message,
                    lastMessageTime: payload.new.last_message_time
                };
                setConversations(prev => {
                    if (prev.some(c => c.id === newConvo.id)) return prev;
                    return [newConvo, ...prev];
                });
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversations' }, (payload) => {
                const updatedConvo = {
                    ...payload.new,
                    customerId: payload.new.customer_id,
                    customerName: payload.new.customer_name,
                    lastMessage: payload.new.last_message,
                    lastMessageTime: payload.new.last_message_time
                };
                setConversations(prev => prev.map(c => c.id === updatedConvo.id ? updatedConvo : c));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(messagesChannel);
            supabase.removeChannel(conversationsChannel);
        };
    }, []);

    // --- High-Frequency Polling Fallback ('Load every second') ---
    useEffect(() => {
        const interval = setInterval(() => {
            const pollData = async () => {
                const { data: pollMsgs } = await supabase.from('messages').select('*');
                const { data: pollConvos } = await supabase.from('conversations').select('*');

                if (pollMsgs) {
                    const mappedMsgs = pollMsgs.map(m => ({ ...m, conversationId: m.conversation_id || '' }));
                    setMessages(prev => {
                        // Sort by ID to ensure consistent comparison
                        const sortedPrev = [...prev].sort((a, b) => a.id - b.id);
                        const sortedNew = [...mappedMsgs].sort((a, b) => a.id - b.id);
                        if (JSON.stringify(sortedPrev) === JSON.stringify(sortedNew)) return prev;
                        return mappedMsgs;
                    });
                }
                if (pollConvos) {
                    const mappedConvos = pollConvos.map(c => ({
                        ...c,
                        customerId: c.customer_id,
                        customerName: c.customer_name,
                        lastMessage: c.last_message,
                        lastMessageTime: c.last_message_time
                    }));
                    setConversations(prev => {
                        const sortedPrev = [...prev].sort((a, b) => String(a.id).localeCompare(String(b.id)));
                        const sortedNew = [...mappedConvos].sort((a, b) => String(a.id).localeCompare(String(b.id)));
                        if (JSON.stringify(sortedPrev) === JSON.stringify(sortedNew)) return prev;
                        return mappedConvos;
                    });
                }
            };
            pollData();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // --- Demo Data Auto-Purge Deactivated for Production ---
    /*
    useEffect(() => {
        if (!loading) {
            const demoNames = ['Alex Johnson', 'Sarah Miller'];
            const hasDemoData = users.some(u => demoNames.includes(u.name));

            if (hasDemoData) {
                console.log("Demo data detected. Auto-purging for a clean slate...");
                purgeSystemData();
            }
        }
    }, [users, loading]);
    */

    const saveToSupabase = async (key, value) => {
        try {
            await supabase.from('app_data').upsert({ key, value }, { onConflict: 'key' });
            localStorage.setItem(`site_${key}`, JSON.stringify(value));
        } catch (err) {
            console.error(`Supabase Save Error (${key}):`, err.message);
            localStorage.setItem(`site_${key}`, JSON.stringify(value));
        }
    };

    // --- Data Actions ---

    const updateSettings = (newSettingsOrFn) => {
        // Use a local variable to capture calculated next state for the async branch
        let next;

        setSettings(prev => {
            next = typeof newSettingsOrFn === 'function' ? newSettingsOrFn(prev) : { ...prev, ...newSettingsOrFn };

            // Optimistic Local Sync
            localStorage.setItem('preview_settings', JSON.stringify(next));

            // Trigger async persistence without blocking the UI thread
            persistSettingsToCloud(next);

            return next;
        });
    };

    const persistSettingsToCloud = async (next) => {
        try {
            const payload = {
                id: next.id || 1,
                site_name: next.siteName,
                tagline: next.tagline,
                description: next.description,
                legal_text: next.legalText,
                logo: next.logo,
                favicon: next.favicon,
                primary_color: next.colors?.primary,
                secondary_color: next.colors?.secondary,
                accent_color: next.colors?.accent,
                background_color: next.colors?.background,
                typography: next.typography,
                show_legal: next.showLegal,
                phone: next.contact?.phone,
                email: next.contact?.email,
                hours: next.contact?.hours,
                address: next.contact?.address,
                instagram: next.contact?.socials?.instagram,
                facebook: next.contact?.socials?.facebook,
                twitter: next.contact?.socials?.twitter,
                linkedin: next.contact?.socials?.linkedin,
                google_map_link: next.contact?.googleMapLink,
                view_count: next.viewCount || 0,
                seo: next.seo,
                documents: next.documents,
                landing_images: next.landingImages || next.landing_images,
                dashboard_images: next.dashboardImages || next.dashboard_images,
                payment_gateways: next.paymentGateways || next.payment_gateways,
                payments_enabled: next.paymentsEnabled
            };

            const { error } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' });

            if (error) {
                console.error("[SYNCHRONIZATION ERROR]:", error.message);
                throw error;
            }
            console.log("[LEDGER SYNC]: Configuration persisted to cloud.");
        } catch (err) {
            console.error("Database Persistence Failure:", err);
        }
    };

    const incrementViewCount = async () => {
        try {
            const newCount = (settings.viewCount || 0) + 1;
            setSettings(prev => ({ ...prev, viewCount: newCount }));
            await supabase.from('site_settings').update({ view_count: newCount }).eq('id', 1);
        } catch (err) { console.error("View Count Increment Error:", err); }
    };

    // Services
    const addService = async (service) => {
        try {
            // Clean payload
            const payload = { ...service };
            const { data, error } = await supabase.from('services').insert(payload).select().single();
            if (error) throw error;
            if (data) setServices(prev => [...prev, data]);
            return data;
        } catch (err) {
            console.error("Database Error [Add Service]:", err.message);
            throw err;
        }
    };
    const updateService = async (updated) => {
        try {
            const { id, ...payload } = updated;
            const { error } = await supabase.from('services').update(payload).eq('id', id);
            if (error) throw error;

            setServices(prev => prev.map(s => String(s.id) === String(id) ? updated : s));
        } catch (err) {
            console.error("Database Error [Update Service]:", err.message);
            throw err;
        }
    };
    const deleteService = async (id) => {
        try {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
            setServices(prev => prev.filter(s => String(s.id) !== String(id)));
        } catch (err) {
            console.error("Database Error [Delete Service]:", err.message);
            throw err;
        }
    };

    // Plans
    const addPlan = async (plan) => {
        try {
            const { activeUsers, active_users, ...payload } = plan;
            const insertData = {
                ...payload,
                active_users: activeUsers || active_users || 0
            };
            const { data, error } = await supabase.from('plans').insert(insertData).select().single();
            if (error) throw error;
            if (data) setPlans(prev => [...prev, data]);
            return data;
        } catch (err) {
            console.error("Database Error [Add Plan]:", err.message);
            throw err;
        }
    };
    const updatePlan = async (updated) => {
        try {
            const { id, activeUsers, active_users, ...payload } = updated;
            // Map back to snake_case or omit derived fields if database doesn't have them
            const updateData = {
                ...payload,
                active_users: activeUsers || active_users || 0
            };
            const { error } = await supabase.from('plans').update(updateData).eq('id', id);
            if (error) throw error;
            setPlans(prev => prev.map(p => String(p.id) === String(id) ? updated : p));
        } catch (err) {
            console.error("Database Error [Update Plan]:", err.message);
            throw err;
        }
    };
    const deletePlan = async (id) => {
        try {
            const { error } = await supabase.from('plans').delete().eq('id', id);
            if (error) throw error;
            setPlans(prev => prev.filter(p => String(p.id) !== String(id)));
        } catch (err) {
            console.error("Database Error [Delete Plan]:", err.message);
            throw err;
        }
    };

    // Bookings
    const addBooking = async (booking) => {
        const id = `BK-${Math.floor(100 + Math.random() * 900)}`;
        const newBooking = { ...booking, id, status: 'Pending' };
        try {
            const dbBooking = {
                id: newBooking.id,
                customer_id: newBooking.customerId || null,
                full_name: newBooking.fullName,
                email: newBooking.email,
                phone: newBooking.phone,
                service: newBooking.service,
                date: newBooking.date,
                time: newBooking.time,
                status: newBooking.status,
                location: newBooking.location,
                vehicle_type: newBooking.vehicleType || null,
                price: String(newBooking.price)
            };
            await supabase.from('bookings').insert(dbBooking);
            setBookings(prev => [newBooking, ...prev]);

            // Notification
            addAdminNotification({
                type: 'booking',
                title: 'New Booking Request',
                message: `${booking.fullName} booked ${booking.service} for ${booking.date}`
            });
        } catch (err) { console.error("Add Booking Error:", err); }
    };
    const updateBooking = async (updated) => {
        // Optimistic Update
        const previousBookings = [...bookings];
        setBookings(prev => prev.map(b => String(b.id) === String(updated.id) ? { ...b, ...updated } : b));

        try {
            // Map to database schema (snake_case)
            const dbPayload = {};
            if (updated.status) dbPayload.status = updated.status;

            // Handle rejection_reason (allow clearing it)
            if (updated.rejection_reason !== undefined) {
                dbPayload.rejection_reason = updated.rejection_reason;
            }

            // Map common business fields if they exist in the payload
            const fieldMap = {
                fullName: 'full_name',
                full_name: 'full_name',
                email: 'email',
                phone: 'phone',
                service: 'service',
                date: 'date',
                time: 'time',
                location: 'location',
                customerId: 'customer_id',
                customer_id: 'customer_id',
                vehicleType: 'vehicle_type',
                vehicle_type: 'vehicle_type'
            };

            Object.keys(fieldMap).forEach(key => {
                if (updated[key] !== undefined) {
                    dbPayload[fieldMap[key]] = updated[key];
                }
            });

            // Ensure price is a string if present
            if (updated.price !== undefined) {
                dbPayload.price = String(updated.price);
            }

            const { error } = await supabase.from('bookings').update(dbPayload).eq('id', updated.id);
            if (error) {
                console.error("Database Update Error:", error);
                throw error;
            }

            // Send notification to user if status changed
            if (updated.status === 'Approved' || updated.status === 'Rejected') {
                const userId = updated.customerId || updated.customer_id;
                if (userId) {
                    sendUserNotification(userId, {
                        type: updated.status === 'Approved' ? 'success' : 'warning',
                        title: `Booking ${updated.status}`,
                        message: updated.status === 'Approved'
                            ? `Your wash for ${updated.service} on ${updated.date} has been confirmed.`
                            : `Your wash request was declined. Reason: ${updated.rejection_reason || 'No specific reason provided.'}`
                    });
                }
            }
        } catch (err) {
            console.error("Update Booking Protocol Failure:", err);
            // Revert on failure
            setBookings(previousBookings);

            // If it's a fetch error, it might be transient or network related
            if (err.message === 'Failed to fetch') {
                throw new Error("Network connection lost. Please check your internet or database status.");
            }
            throw err;
        }
    };
    const deleteBooking = async (id) => {
        try {
            await supabase.from('bookings').delete().eq('id', id);
            setBookings(prev => prev.filter(b => String(b.id) !== String(id)));
        } catch (err) { console.error("Delete Booking Error:", err); }
    };

    // Transactions
    const addTransaction = async (trx) => {
        // Prepare payload for Supabase (snake_case)
        const dbTrx = {
            id: trx.id || `TRX-${Date.now()}`,
            user_name: trx.user || trx.userName || 'Guest',
            user_id: trx.userId || null,
            amount: Number(trx.amount),
            category: trx.category || 'Service',
            item_id: trx.itemId || null,
            item_name: trx.item || trx.itemName || null,
            payment_method: trx.paymentMethod || 'Auth Transfer',
            reference_no: trx.referenceNo || 'N/A',
            status: trx.status || 'Completed',
            date: trx.date || new Date().toISOString().split('T')[0],
            timestamp: trx.timestamp || new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('transactions').insert(dbTrx).select().single();
            if (error) throw error;

            if (data) {
                const mappedTrx = {
                    ...data,
                    user: data.user_name,
                    userId: data.user_id,
                    paymentMethod: data.payment_method,
                    referenceNo: data.reference_no,
                    itemId: data.item_id,
                    item: data.item_name
                };
                setTransactions(prev => [mappedTrx, ...prev]);

                // Automatically notify admin if this is a pending user submission
                if (mappedTrx.status === 'Pending') {
                    addAdminNotification({
                        type: 'payment',
                        title: 'New Settlement Received',
                        message: `${mappedTrx.user} submitted a payment for USD ${mappedTrx.amount}. Reference: ${mappedTrx.referenceNo}`,
                        data: { transactionId: mappedTrx.id }
                    });
                }
                console.log("[FINANCE] Ledger record successfully persisted.");
            }
        } catch (err) {
            console.error("Critical Transaction Injection Error:", err);
            // Fallback for UI responsiveness
            setTransactions(prev => [{ ...dbTrx, user: dbTrx.user_name, userId: dbTrx.user_id }, ...prev]);
        }
    };

    const updateTransaction = async (updated) => {
        const payload = {
            user_name: updated.user || updated.userName,
            amount: Number(updated.amount),
            category: updated.category,
            item_id: String(updated.itemId || ''),
            payment_method: updated.paymentMethod,
            reference_no: updated.referenceNo,
            status: updated.status,
            date: updated.date,
            invoice_id: updated.invoiceId
        };
        try {
            const { error } = await supabase.from('transactions').update(payload).eq('id', updated.id);
            if (error) throw error;
            setTransactions(prev => prev.map(t => String(t.id) === String(updated.id) ? { ...updated, amount: Number(updated.amount) } : t));
        } catch (err) { console.error("Update Transaction Error:", err); }
    };
    const deleteTransaction = async (id) => {
        try {
            await supabase.from('transactions').delete().eq('id', id);
            setTransactions(prev => prev.filter(t => String(t.id) !== String(id)));
        } catch (err) { console.error("Delete Transaction Error:", err); }
    };

    // Users (Profiles)
    const addUser = async (newUser) => {
        // Manual addition often lacks a valid UUID. We generate one if needed for the profiles PK.
        const id = newUser.id.includes('-') && newUser.id.length > 20 ? newUser.id : crypto.randomUUID();

        const payload = {
            id,
            email: newUser.email,
            display_name: newUser.name,
            role: newUser.role || 'user',
            plan: newUser.plan || 'None',
            phone: newUser.phone || '',
            status: newUser.status || 'Active',
            joined_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('profiles').insert(payload).select().single();
            if (error) throw error;

            const mappedUser = {
                ...newUser,
                id: id,
                name: newUser.name,
                subscriptionPlan: newUser.plan,
                joined: new Date().toISOString().split('T')[0]
            };
            setUsers(prev => [...prev, mappedUser]);
            console.log("Member Registry Entry Initialized.");
        } catch (err) {
            console.error("Add User Registry Error:", err);
            // Fallback
            setUsers(prev => [...prev, { ...newUser, id }]);
        }
    };
    const deleteUser = async (id) => {
        try {
            await supabase.from('profiles').delete().eq('id', id);
            setUsers(prev => prev.filter(u => String(u.id) !== String(id)));
        } catch (err) { console.error("Delete User Error:", err); }
    };
    const updateUserStatus = async (id, status) => {
        try {
            await supabase.from('profiles').update({ status }).eq('id', id);
            setUsers(prev => prev.map(u => String(u.id) === String(id) ? { ...u, status } : u));
        } catch (err) { console.error("Update User Status Error:", err); }
    };

    const updateUsers = async (newUsers) => {
        setUsers(newUsers);
        try {
            for (const u of newUsers) {
                await supabase.from("profiles").upsert({
                    id: u.id,
                    display_name: u.name,
                    phone: u.phone,
                    role: u.role,
                    plan: u.subscriptionPlan || u.plan,
                    saved_vehicles: u.savedVehicles || [],
                    saved_addresses: u.saved_addresses || []
                });
            }
        } catch (err) { console.error("Update Users Error:", err); }
    };

    // Messages & Conversations
    const sendMessage = async (msg) => {
        // Note: Database auto-generates BIGINT id, do not include it
        const dbMsg = {
            conversation_id: msg.conversationId,
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp,
            read: false
        };

        try {
            const { data, error: msgError } = await supabase.from('messages').insert(dbMsg).select().single();
            if (msgError) {
                console.error("[CHAT] Message insert failed:", msgError);
                return false;
            }

            if (data) {
                const mappedMsg = { ...data, conversationId: data.conversation_id };
                setMessages(prev => [...prev, mappedMsg]);

                // Update conversation last message
                await supabase.from('conversations').update({
                    last_message: msg.text,
                    last_message_time: msg.timestamp
                }).eq('id', msg.conversationId);

                setConversations(prev => prev.map(c =>
                    c.id === msg.conversationId
                        ? { ...c, last_message: msg.text, last_message_time: msg.timestamp, lastMessage: msg.text, lastMessageTime: msg.timestamp }
                        : c
                ));
                return true;
            }
            return false;
        } catch (err) {
            console.error("[CHAT] Send Message Error:", err);
            return false;
        }
    };

    const markAsRead = async (conversationId) => {
        try {
            await supabase.from('messages').update({ read: true }).eq('conversation_id', conversationId);
            setMessages(prev => prev.map(m =>
                m.conversationId === conversationId ? { ...m, read: true } : m
            ));
        } catch (err) { console.error("Mark Read Error:", err); }
    };

    const addConversation = async (convo) => {
        const id = `conv-${Date.now()}`;
        const dbConvo = {
            id,
            customer_id: convo.customerId,
            customer_name: convo.customerName,
            last_message: convo.lastMessage || '',
            last_message_time: convo.lastMessageTime || new Date().toISOString()
        };
        try {
            const { error } = await supabase.from('conversations').insert(dbConvo);
            if (error) {
                console.error("[CHAT] Conversation insert failed:", error);
                return null;
            }

            const mappedConvo = {
                ...dbConvo,
                customerId: convo.customerId,
                customerName: convo.customerName,
                lastMessage: convo.lastMessage,
                lastMessageTime: convo.lastMessageTime
            };
            setConversations(prev => [mappedConvo, ...prev]);
            return mappedConvo;
        } catch (err) {
            console.error("[CHAT] Add Conversation Error:", err);
            return null;
        }
    };

    const updateUserSubscription = async (userId, planName) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    plan: planName,
                    subscription_plan: planName
                })
                .eq('id', userId);

            if (error) throw error;

            setUsers(prev => prev.map(u => String(u.id) === String(userId) ? { ...u, subscriptionPlan: planName, plan: planName } : u));
            return { success: true };
        } catch (err) {
            console.error("Update Subscription Error:", err);
            return { success: false, message: err.message };
        }
    };

    // Admin Notifications
    const addAdminNotification = async (notif) => {
        const newNotif = {
            ...notif,
            timestamp: new Date().toISOString(),
            read: false
        };
        try {
            const { data } = await supabase.from('notifications').insert(newNotif).select().single();
            if (data) setAdminNotifications([data, ...adminNotifications]);
        } catch (err) { console.error("Add Admin Notif Error:", err); }
    };

    const markNotificationRead = async (id) => {
        try {
            await supabase.from('notifications').update({ read: true }).eq('id', id);
            setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUserNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) { console.error("Mark Notif Read Error:", err); }
    };

    const deleteNotification = async (id) => {
        try {
            await supabase.from('notifications').delete().eq('id', id);
            setAdminNotifications(prev => prev.filter(n => n.id !== id));
            setUserNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) { console.error("Delete Notif Error:", err); }
    };

    const clearAllNotifications = async () => {
        try {
            // Delete notifications where user_id is null (Admin notifications)
            await supabase.from('notifications').delete().is('user_id', null);
            setAdminNotifications([]);
        } catch (err) { console.error("Clear Notifs Error:", err); }
    };

    // User Notifications
    const sendUserNotification = async (userId, notif) => {
        const newNotif = {
            ...notif,
            user_id: userId,
            timestamp: new Date().toISOString(),
            read: false
        };
        try {
            const { data } = await supabase.from('notifications').insert(newNotif).select().single();
            if (data) setUserNotifications(prev => [data, ...prev]);
        } catch (err) { console.error("Send User Notif Error:", err); }
    };

    const clearUserNotifications = async () => {
        try {
            const userId = session?.user?.id;
            if (!userId) return;
            await supabase.from('notifications').delete().eq('user_id', userId);
            setUserNotifications(prev => prev.filter(n => n.user_id !== userId));
        } catch (err) { console.error("Clear User Notifs Error:", err); }
    };

    const purgeSystemData = async () => {
        try {
            await Promise.all([
                supabase.from('profiles').delete().neq('role', 'admin'),
                supabase.from('bookings').delete().neq('id', 'KEEP'),
                supabase.from('transactions').delete().neq('id', 'KEEP'),
                supabase.from('notifications').delete().neq('id', 0),
                supabase.from('messages').delete().neq('id', 'KEEP'),
                supabase.from('conversations').delete().neq('id', 'KEEP'),
            ]);
            setUsers(users.filter(u => u.role === 'admin'));
            setBookings([]);
            setTransactions([]);
            setAdminNotifications([]);
            setUserNotifications([]);
            setMessages([]);
            setConversations([]);
            setBroadcasts([]); // Keep registry clean on purge
        } catch (err) { console.error("Purge Error:", err); }
    };

    // --- New Features Actions ---
    const addBroadcast = async (broadcast) => {
        try {
            const payload = {
                ...broadcast,
                timestamp: new Date().toISOString()
            };

            const { data, error } = await supabase.from('broadcasts').insert(payload).select().single();
            if (error) throw error;

            if (data) {
                setBroadcasts(prev => [data, ...prev]);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Critical Registry Sync Error:", err);
            return false;
        }
    };

    const deleteBroadcast = async (id) => {
        try {
            setBroadcasts(prev => prev.filter(b => b.id !== id));
            const { error } = await supabase.from('broadcasts').delete().eq('id', id);
            return !error;
        } catch (err) { console.error("Delete Broadcast Error:", err); return false; }
    };

    const editMessage = async (messageId, newText) => {
        try {
            const timestamp = new Date().toISOString();
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, edited: true, edited_at: timestamp } : m));
            const { error } = await supabase.from('messages').update({ text: newText, edited: true, edited_at: timestamp }).eq('id', messageId);
            return !error;
        } catch (err) { console.error("Edit Message Error:", err); return false; }
    };

    const deleteMessage = async (messageId) => {
        try {
            const timestamp = new Date().toISOString();
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, deleted: true, deleted_at: timestamp } : m));
            const { error } = await supabase.from('messages').update({ deleted: true, deleted_at: timestamp }).eq('id', messageId);
            return !error;
        } catch (err) { console.error("Delete Message Error:", err); return false; }
    };

    const logAnalyticsEvent = async (event) => {
        try { // Fire and forget mostly, but we update state for live feel
            // only log if session exists or anonymous tracking enabled
            const { data } = await supabase.from('analytics_events').insert(event).select().single();
            if (data) setAnalytics(prev => [data, ...prev]);
        } catch (err) { console.error("Log Analytics Error:", err); }
    };

    const logDataExport = async (exportLog) => {
        try {
            const { data } = await supabase.from('data_exports').insert(exportLog).select().single();
            if (data) setDataExports(prev => [data, ...prev]);
        } catch (err) { console.error("Log Export Error:", err); }
    };

    return (
        <DataContext.Provider value={{
            settings, updateSettings, liveUpdateSettings, incrementViewCount,
            services, addService, updateService, deleteService,
            plans, addPlan, updatePlan, deletePlan,
            transactions, addTransaction, updateTransaction, deleteTransaction,
            bookings, addBooking, updateBooking, deleteBooking,
            users, addUser, deleteUser, updateUsers,
            conversations, messages, sendMessage, markAsRead, addConversation,
            updateUserSubscription,
            adminNotifications, addAdminNotification, markNotificationRead, deleteNotification, clearAllNotifications,
            userNotifications, sendUserNotification, clearUserNotifications,
            broadcasts, addBroadcast, deleteBroadcast,
            analytics, logAnalyticsEvent,
            dataExports, logDataExport,
            editMessage, deleteMessage,
            purgeSystemData,
            session,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};
