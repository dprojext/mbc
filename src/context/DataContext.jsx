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
        colors: { primary: '#c9a96a', secondary: '#1a1a1a', accent: '#ffffff' },
        typography: 'Nunito',
        showLegal: true,
        seo: { title: 'Metro Blackline - Premium Mobile Car Wash', description: 'Top-rated mobile car wash and detailing service in Addis Ababa.' },
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
        ]
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

    // --- Supabase Synchronization Logic ---

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // parallel fetch all tables using allSettled so one failure doesn't block others
                const results = await Promise.allSettled([
                    supabase.from('site_settings').select('*').single(),
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

                if (fetchedSettings) {
                    // Map snake_case to camelCase for settings with deep fallbacks
                    setSettings({
                        ...initialSettings,
                        ...fetchedSettings,
                        siteName: fetchedSettings.site_name || initialSettings.siteName,
                        tagline: fetchedSettings.tagline || initialSettings.tagline,
                        description: fetchedSettings.description || initialSettings.description,
                        legalText: fetchedSettings.legal_text || initialSettings.legalText,
                        logo: fetchedSettings.logo || initialSettings.logo,
                        colors: {
                            primary: fetchedSettings.primary_color || initialSettings.colors.primary,
                            secondary: fetchedSettings.secondary_color || initialSettings.colors.secondary,
                            accent: fetchedSettings.accent_color || initialSettings.colors.accent
                        },
                        typography: fetchedSettings.typography || initialSettings.typography,
                        showLegal: fetchedSettings.show_legal !== undefined ? fetchedSettings.show_legal : initialSettings.showLegal,
                        contact: {
                            ...initialSettings.contact,
                            phone: fetchedSettings.phone || initialSettings.contact.phone,
                            email: fetchedSettings.email || initialSettings.contact.email,
                            hours: fetchedSettings.hours || initialSettings.contact.hours,
                            address: fetchedSettings.address || initialSettings.contact.address,
                        },
                        viewCount: Number(fetchedSettings.view_count || 0),
                        documents: Array.isArray(fetchedSettings.documents) ? fetchedSettings.documents : []
                    });
                }
                if (fetchedServices) setServices(fetchedServices);
                if (fetchedPlans) {
                    setPlans(fetchedPlans.map(p => ({ ...p, activeUsers: p.active_users || 0 })));
                }

                // Map Profiles to Users (display_name -> name)
                if (fetchedUsers) {
                    setUsers(fetchedUsers.map(u => ({
                        ...u,
                        name: u.display_name || 'Anonymous',
                        savedVehicles: u.saved_vehicles || [],
                        savedAddresses: u.saved_addresses || [],
                        subscriptionPlan: u.subscription_plan || 'None',
                        requests: Array.isArray(u.requests) ? u.requests : []
                    })));
                }

                // Map Bookings (full_name -> fullName)
                if (fetchedBookings) {
                    setBookings(fetchedBookings.map(b => ({ ...b, fullName: b.full_name || 'Customer' })));
                }

                // Map Transactions (user_name -> user)
                if (fetchedTransactions) {
                    setTransactions(fetchedTransactions.map(t => ({
                        ...t,
                        user: t.user_name || 'Guest',
                        amount: Number(t.amount || 0)
                    })));
                }

                if (fetchedConvos) setConversations(fetchedConvos);
                if (fetchedMessages) {
                    setMessages(fetchedMessages.map(m => ({ ...m, conversationId: m.conversation_id || '' })));
                }

                if (fetchedNotifs) {
                    const mappedNotifs = fetchedNotifs.map(n => ({ ...n, userId: n.user_id }));
                    setAdminNotifications(mappedNotifs.filter(n => !n.userId));
                    setUserNotifications(mappedNotifs.filter(n => n.userId));
                }

                if (fetchedBroadcasts) setBroadcasts(fetchedBroadcasts);
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

    // --- Demo Data Auto-Purge ---
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

    const updateSettings = async (newSettings) => {
        setSettings(newSettings);
        try {
            await supabase.from('site_settings').upsert({
                id: 1,
                site_name: newSettings.siteName,
                tagline: newSettings.tagline,
                description: newSettings.description,
                legal_text: newSettings.legalText,
                logo: newSettings.logo,
                primary_color: newSettings.colors.primary,
                secondary_color: newSettings.colors.secondary,
                accent_color: newSettings.colors.accent,
                typography: newSettings.typography,
                show_legal: newSettings.showLegal,
                phone: newSettings.contact.phone,
                email: newSettings.contact.email,
                hours: newSettings.contact.hours,
                address: newSettings.contact.address,
                instagram: newSettings.contact.socials.instagram,
                facebook: newSettings.contact.socials.facebook,
                twitter: newSettings.contact.socials.twitter,
                linkedin: newSettings.contact.socials.linkedin,
                google_map_link: newSettings.contact.googleMapLink,
                view_count: newSettings.viewCount
            });
        } catch (err) { console.error("Settings Update Error:", err); }
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
            const { data } = await supabase.from('services').insert(service).select().single();
            if (data) setServices([...services, data]);
        } catch (err) { console.error("Add Service Error:", err); }
    };
    const updateService = async (updated) => {
        try {
            await supabase.from('services').update(updated).eq('id', updated.id);
            setServices(services.map(s => s.id === updated.id ? updated : s));
        } catch (err) { console.error("Update Service Error:", err); }
    };
    const deleteService = async (id) => {
        try {
            await supabase.from('services').delete().eq('id', id);
            setServices(services.filter(s => s.id !== id));
        } catch (err) { console.error("Delete Service Error:", err); }
    };

    // Plans
    const updatePlans = async (newPlans) => {
        setPlans(newPlans);
        try {
            // Upsert each plan
            for (const plan of newPlans) {
                await supabase.from('plans').upsert(plan);
            }
        } catch (err) { console.error("Update Plans Error:", err); }
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
                vehicle_type: newBooking.vehicleType,
                price: newBooking.price
            };
            await supabase.from('bookings').insert(dbBooking);
            setBookings([newBooking, ...bookings]);

            // Notification
            addAdminNotification({
                type: 'booking',
                title: 'New Booking Request',
                message: `${booking.fullName} booked ${booking.service} for ${booking.date}`
            });
        } catch (err) { console.error("Add Booking Error:", err); }
    };
    const updateBooking = async (updated) => {
        try {
            const dbUpdated = {
                id: updated.id,
                customer_id: updated.customerId || null,
                full_name: updated.fullName,
                email: updated.email,
                phone: updated.phone,
                service: updated.service,
                date: updated.date,
                time: updated.time,
                status: updated.status,
                location: updated.location,
                vehicle_type: updated.vehicleType,
                price: updated.price
            };
            await supabase.from('bookings').update(dbUpdated).eq('id', updated.id);
            setBookings(bookings.map(b => b.id === updated.id ? updated : b));
        } catch (err) { console.error("Update Booking Error:", err); }
    };
    const deleteBooking = async (id) => {
        try {
            await supabase.from('bookings').delete().eq('id', id);
            setBookings(bookings.filter(b => b.id !== id));
        } catch (err) { console.error("Delete Booking Error:", err); }
    };

    // Transactions
    const addTransaction = async (trx) => {
        const id = `TRX-${Date.now()}`;
        const newTrx = { ...trx, id };
        try {
            await supabase.from('transactions').insert(newTrx);
            setTransactions([newTrx, ...transactions]);
        } catch (err) { console.error("Add Transaction Error:", err); }
    };
    const updateTransaction = async (updated) => {
        try {
            await supabase.from('transactions').update(updated).eq('id', updated.id);
            setTransactions(transactions.map(t => t.id === updated.id ? updated : t));
        } catch (err) { console.error("Update Transaction Error:", err); }
    };
    const deleteTransaction = async (id) => {
        try {
            await supabase.from('transactions').delete().eq('id', id);
            setTransactions(transactions.filter(t => t.id !== id));
        } catch (err) { console.error("Delete Transaction Error:", err); }
    };

    // Users (Profiles)
    const addUser = async (newUser) => {
        // usually handled by Supabase Auth, but for manual addition to profiles:
        try {
            await supabase.from('profiles').insert({ ...newUser, display_name: newUser.name });
            setUsers([...users, newUser]);
        } catch (err) { console.error("Add User Error:", err); }
    };
    const deleteUser = async (id) => {
        try {
            await supabase.from('profiles').delete().eq('id', id);
            setUsers(users.filter(u => u.id !== id));
        } catch (err) { console.error("Delete User Error:", err); }
    };
    const updateUsers = async (newUsers) => {
        setUsers(newUsers);
        try {
            for (const u of newUsers) {
                await supabase.from('profiles').upsert({
                    id: u.id,
                    display_name: u.name,
                    phone: u.phone,
                    role: u.role,
                    subscription_plan: u.subscriptionPlan,
                    saved_vehicles: u.savedVehicles || [],
                    saved_addresses: u.savedAddresses || []
                });
            }
        } catch (err) { console.error("Update Users Error:", err); }
    };

    // Messages & Conversations
    const sendMessage = async (msg) => {
        const id = `msg-${Date.now()}`;
        const dbMsg = {
            id,
            conversation_id: msg.conversationId,
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp,
            read: false
        };

        try {
            await supabase.from('messages').insert(dbMsg);
            setMessages([...messages, { ...dbMsg, conversationId: msg.conversationId }]);

            // Update conversation last message
            await supabase.from('conversations').update({
                last_message: msg.text,
                last_message_time: msg.timestamp
            }).eq('id', msg.conversationId);

            setConversations(conversations.map(c =>
                c.id === msg.conversationId
                    ? { ...c, last_message: msg.text, last_message_time: msg.timestamp }
                    : c
            ));
        } catch (err) { console.error("Send Message Error:", err); }
    };

    const markAsRead = async (conversationId) => {
        try {
            await supabase.from('messages').update({ read: true }).eq('conversation_id', conversationId);
            setMessages(messages.map(m =>
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
            last_message: convo.lastMessage,
            last_message_time: convo.lastMessageTime
        };
        try {
            await supabase.from('conversations').insert(dbConvo);
            setConversations([dbConvo, ...conversations]);
            return dbConvo;
        } catch (err) { console.error("Add Conversation Error:", err); return null; }
    };

    const updateUserSubscription = async (userId, planName) => {
        try {
            await supabase.from('profiles').update({ subscription_plan: planName }).eq('id', userId);
            setUsers(users.map(u => u.id === userId ? { ...u, subscriptionPlan: planName } : u));
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
            setAdminNotifications(adminNotifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (err) { console.error("Mark Notif Read Error:", err); }
    };

    const clearAllNotifications = async () => {
        try {
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
            if (data) setUserNotifications([data, ...userNotifications]);
        } catch (err) { console.error("Send User Notif Error:", err); }
    };

    const clearUserNotifications = async () => {
        try {
            await supabase.from('notifications').delete().not('user_id', 'is', null);
            setUserNotifications([]);
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
        } catch (err) { console.error("Purge Error:", err); }
    };

    // --- New Features Actions ---
    const addBroadcast = async (broadcast) => {
        try {
            const { data } = await supabase.from('broadcasts').insert(broadcast).select().single();
            if (data) setBroadcasts([data, ...broadcasts]);
        } catch (err) { console.error("Add Broadcast Error:", err); }
    };

    const logAnalyticsEvent = async (event) => {
        try { // Fire and forget mostly, but we update state for live feel
            // only log if session exists or anonymous tracking enabled
            const { data } = await supabase.from('analytics_events').insert(event).select().single();
            if (data) setAnalytics([data, ...analytics]);
        } catch (err) { console.error("Log Analytics Error:", err); }
    };

    const logDataExport = async (exportLog) => {
        try {
            const { data } = await supabase.from('data_exports').insert(exportLog).select().single();
            if (data) setDataExports([data, ...dataExports]);
        } catch (err) { console.error("Log Export Error:", err); }
    };

    return (
        <DataContext.Provider value={{
            settings, updateSettings, incrementViewCount,
            services, addService, updateService, deleteService,
            plans, updatePlans,
            transactions, addTransaction, updateTransaction, deleteTransaction,
            bookings, addBooking, updateBooking, deleteBooking,
            users, addUser, deleteUser, updateUsers,
            conversations, messages, sendMessage, markAsRead, addConversation,
            updateUserSubscription,
            adminNotifications, addAdminNotification, markNotificationRead, clearAllNotifications,
            userNotifications, sendUserNotification, clearUserNotifications,
            broadcasts, addBroadcast,
            analytics, logAnalyticsEvent,
            dataExports, logDataExport,
            purgeSystemData,
            session,
            loading
        }}>
            {children}
        </DataContext.Provider>
    );
};
