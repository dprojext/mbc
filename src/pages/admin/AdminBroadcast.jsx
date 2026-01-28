import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSend, FiUsers, FiUser, FiBell, FiTrash2,
    FiCheck, FiX, FiInfo, FiAlertTriangle, FiCheckCircle,
    FiFilter, FiSearch, FiLayers, FiActivity, FiGlobe, FiRadio, FiClock, FiChevronRight, FiExternalLink, FiShield
} from 'react-icons/fi';

const AdminBroadcast = () => {
    const {
        users = [],
        adminNotifications = [],
        broadcasts = [],
        sendUserNotification,
        addAdminNotification,
        addBroadcast,
        clearAllNotifications,
        markNotificationRead
    } = useData();
    const { showToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();

    const [activeView, setActiveView] = useState('Broadcast');
    const [historySearch, setHistorySearch] = useState('');
    const [historyFilter, setHistoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Broadcast Form State
    const [targetType, setTargetType] = useState('all');
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');
    const [notifType, setNotifType] = useState('info');
    const [isSending, setIsSending] = useState(false);
    const [sentStatus, setSentStatus] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
    const [selectedBroadcast, setSelectedBroadcast] = useState(null);
    const [selectedDetail, setSelectedDetail] = useState(null);

    // Initial Tab Handling from Location State
    useEffect(() => {
        if (location.state?.tab) {
            setActiveView(location.state.tab);
        }
        // Deep link to specific notification or broadcast if passed
        if (location.state?.openNotifId) {
            const notif = adminNotifications.find(n => n.id === location.state.openNotifId);
            if (notif) setSelectedDetail(notif);
        }
        if (location.state?.openBroadcastId) {
            const bc = broadcasts.find(b => b.id === location.state.openBroadcastId);
            if (bc) setSelectedBroadcast(bc);
        }
    }, [location, adminNotifications, broadcasts]);

    const { deleteBroadcast } = useData();

    const openConfirm = (title, message, onConfirm) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm });
    };

    const handleToggleUser = (id) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const getColor = (type) => {
        switch (type) {
            case 'success': return '#4caf50';
            case 'warning': return '#ff9800';
            case 'alert': return '#f44336';
            default: return 'var(--color-gold)';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FiCheckCircle />;
            case 'warning': return <FiAlertTriangle />;
            case 'alert': return <FiInfo />;
            default: return <FiBell />;
        }
    };

    const handleBroadcast = async () => {
        if (!notifTitle || !notifMessage) return;
        setIsSending(true);
        try {
            let targets = [];
            if (targetType === 'all') targets = users.map(u => u.id);
            else if (targetType === 'customers') targets = users.filter(u => !u.role || u.role === 'user').map(u => u.id);
            else if (targetType === 'staff') targets = users.filter(u => u.role && u.role !== 'user').map(u => u.id);
            else targets = selectedUserIds;

            // 1. Send individually
            for (const userId of targets) {
                await sendUserNotification(userId, {
                    title: notifTitle,
                    message: notifMessage,
                    type: notifType
                });
            }

            // 2. Persist to Broadcast Registry
            await addBroadcast({
                title: notifTitle,
                message: notifMessage,
                audience: targetType,
                type: notifType, // Include priority level
                sender: 'MBC Admin'
            });

            // 3. Admin log - Refined Format with Priority Level
            await addAdminNotification({
                type: notifType, // Correctly pass the priority level (info, success, etc)
                title: 'Broadcast Dispatched',
                message: `Subject: "${notifTitle}"\nPayload: "${notifMessage}"`,
                timestamp: new Date().toISOString()
            });

            setSentStatus('success');
            showToast('Executive broadcast delivered.', 'success');
            setNotifTitle('');
            setNotifMessage('');
            setSelectedUserIds([]);
            setTimeout(() => setSentStatus(null), 3000);
        } catch (error) {
            setSentStatus('error');
            showToast('Dispatch failure detected.', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const filteredUsers = (users || []).filter(u => {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const search = (searchQuery || '').toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    const filteredAdminHistory = (adminNotifications || [])
        .filter(n => {
            const matchesSearch = (n.title || '').toLowerCase().includes(historySearch.toLowerCase()) ||
                (n.message || '').toLowerCase().includes(historySearch.toLowerCase());
            if (historyFilter === 'all') return matchesSearch;
            return matchesSearch && n.type === historyFilter;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const metrics = [
        { label: 'System Heartbeat', value: '0.4ms', icon: <FiActivity />, color: '#4caf50' },
        { label: 'Network Reach', value: users.length.toString(), icon: <FiGlobe />, color: 'var(--color-gold)' },
        { label: 'Dispatched', value: (broadcasts?.length || 0).toString(), icon: <FiSend />, color: '#2196f3' },
        { label: 'Pending Notifications', value: adminNotifications.filter(n => !n.read).length.toString(), icon: <FiBell />, color: '#ff9800' }
    ];

    const getNotificationAction = (notif) => {
        if (notif.type === 'booking') return { label: 'View Booking', action: () => navigate('/admin-bookings') };
        if (notif.type === 'user') return { label: 'Inspect Profile', action: () => navigate('/admin-users') };
        if (notif.type === 'payment') return { label: 'Audit Transaction', action: () => navigate('/admin-financials') };
        return null;
    };

    const handleTestDispatch = async () => {
        await addBroadcast({
            title: 'Diagnostic System Sync',
            message: 'This is a systemic diagnostic payload generated to verify registry integrity. If you can see this, your Communications Hub state synchronization is functional.',
            audience: 'all',
            type: 'success'
        });
        showToast('Diagnostic payload injected.', 'success');
    };

    return (
        <div className="admin-broadcast-premium">
            {/* Header Telemetry Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="admin-stat-vial"
                        style={{
                            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                            padding: '0.8rem 1rem', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '0.8rem'
                        }}
                    >
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                            {m.icon}
                        </div>
                        <div>
                            <div style={{ color: '#666', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800' }}>{m.label}</div>
                            <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)' }}>{m.value}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <header className="admin-flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Communications <span className="gold">Hub</span></h1>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.2rem' }}>Orchestrate platform-wide outreach and monitor systemic integrity.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', background: '#0a0a0a', padding: '0.4rem', borderRadius: '12px', border: '1px solid #1a1a1a' }}>
                    {['Broadcast', 'Notifications'].map(view => (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            style={{
                                padding: '0.6rem 1.4rem', borderRadius: '8px', border: 'none',
                                background: activeView === view ? 'var(--color-gold)' : 'transparent',
                                color: activeView === view ? '#000' : '#888',
                                fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer', transition: '0.3s'
                            }}
                        >
                            {view.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeView === 'Broadcast' ? (
                    <motion.div
                        key="broadcast"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
                    >
                        {/* A3 DOCUMENT LAYOUT */}
                        <div style={{
                            width: '100%',
                            minHeight: '700px',
                            background: '#050505',
                            borderRadius: '25px',
                            border: '1px solid #1a1a1a',
                            padding: '2.5rem',
                            display: 'flex',
                            gap: '2.5rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Decorative Desk Background Element */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, pointerEvents: 'none', background: 'radial-gradient(circle at 10% 10%, var(--color-gold), transparent)' }}></div>

                            {/* Left Side: The "Digital A3" Document */}
                            <div style={{
                                flex: 2.2,
                                background: 'rgba(255,255,255,0.02)',
                                borderRadius: '25px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                padding: '3.5rem',
                                color: '#eee',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5)'
                            }}>
                                {/* Document Header */}
                                <div style={{ borderBottom: '1px solid rgba(251,191,36,0.2)', paddingBottom: '2rem', marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: '900', letterSpacing: '0.2em', margin: 0, textTransform: 'uppercase', color: 'var(--color-gold)' }}>Executive Dispatch</h2>
                                        <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#444', marginTop: '0.6rem', letterSpacing: '0.1em' }}>METRO BLACKLINE CARE • PLATFORM GOVERNANCE</div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontSize: '0.7rem', fontWeight: 'bold', color: '#333', fontFamily: 'monospace' }}>
                                        REF: <span style={{ color: '#555' }}>MBC-DOC-{new Date().getFullYear()}-{Date.now().toString().slice(-4)}</span><br />
                                        DATE: <span style={{ color: '#555' }}>{new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    {/* Subject Field */}
                                    <div style={{ marginBottom: '2.5rem' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--color-gold)', display: 'block', marginBottom: '0.6rem', textTransform: 'uppercase', opacity: 0.7 }}>Subject Identification:</label>
                                        <input
                                            placeholder="ENTER BROADCAST SUBJECT..."
                                            value={notifTitle}
                                            onChange={(e) => setNotifTitle(e.target.value)}
                                            style={{ width: '100%', border: 'none', borderBottom: '1px solid #1a1a1a', padding: '0.8rem 0', fontSize: '1.25rem', fontWeight: 'bold', outline: 'none', background: 'transparent', color: '#fff' }}
                                        />
                                    </div>

                                    {/* Message Body */}
                                    <div style={{ marginBottom: '3rem' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--color-gold)', display: 'block', marginBottom: '1rem', textTransform: 'uppercase', opacity: 0.7 }}>Official Communication Payload:</label>
                                        <textarea
                                            placeholder="Type the official message here. This document will be dispatched to all authorized nodes in the selected audience vector..."
                                            value={notifMessage}
                                            onChange={(e) => setNotifMessage(e.target.value)}
                                            style={{ width: '100%', minHeight: '320px', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', fontSize: '1.1rem', lineHeight: '1.6', outline: 'none', borderRadius: '12px', resize: 'none', color: '#ccc' }}
                                        />
                                    </div>

                                    {/* Controls Integrated into Document */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginTop: '1.5rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--color-gold)', display: 'block', marginBottom: '1rem', textTransform: 'uppercase', opacity: 0.7 }}>Vector Classification</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                {['all', 'customers', 'staff', 'selected'].map(t => (
                                                    <button key={t} onClick={() => setTargetType(t)} style={{ padding: '0.7rem', border: '1px solid #1a1a1a', borderRadius: '8px', background: targetType === t ? 'var(--color-gold)' : 'rgba(255,255,255,0.02)', color: targetType === t ? '#000' : '#444', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', transition: '0.3s' }}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--color-gold)', display: 'block', marginBottom: '1rem', textTransform: 'uppercase', opacity: 0.7 }}>Priority Level</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                                {['info', 'success', 'warning', 'alert'].map(p => (
                                                    <button key={p} onClick={() => setNotifType(p)} style={{ padding: '0.7rem', border: '1px solid #1a1a1a', borderRadius: '8px', background: notifType === p ? getColor(p) : 'rgba(255,255,255,0.02)', color: notifType === p ? '#fff' : '#444', borderColor: notifType === p ? getColor(p) : '#1a1a1a', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', transition: '0.3s' }}>{p}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(251,191,36,0.2)', paddingTop: '2.5rem', marginTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.4 }}>Authorized Signatory: MBC ADMIN CMD</div>
                                    <button
                                        onClick={handleBroadcast}
                                        disabled={isSending || !notifTitle || !notifMessage}
                                        style={{
                                            background: 'var(--color-gold)',
                                            color: '#000',
                                            padding: '1.2rem 3.5rem',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontWeight: '900',
                                            fontSize: '0.9rem',
                                            letterSpacing: '0.15em',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            boxShadow: '0 10px 30px rgba(201,169,106,0.15)',
                                            transition: '0.3s'
                                        }}
                                        className="dispatch-button"
                                    >
                                        {isSending ? 'DISPATCHING...' : <><FiRadio /> AUTHORIZE & SEND</>}
                                    </button>
                                </div>
                            </div>

                            {/* Right Side: Registry Node Selector */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="admin-card glass" style={{ height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)', borderRadius: '20px' }}>
                                    <div style={{ marginBottom: '1.2rem' }}>
                                        <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Registry Node Selector</h3>
                                        <div style={{ position: 'relative' }}>
                                            <input placeholder="Identify specific node..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '10px', color: '#fff', fontSize: '0.85rem' }} />
                                            <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {filteredUsers.map((u, i) => (
                                            <motion.div key={u.id} onClick={() => handleToggleUser(u.id)} style={{ padding: '0.8rem 1rem', background: selectedUserIds.includes(u.id) ? 'rgba(201,169,106,0.12)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: selectedUserIds.includes(u.id) ? 'var(--color-gold)' : 'transparent', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.8rem', transition: '0.3s' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', border: '1px solid rgba(251,191,36,0.1)', fontSize: '0.9rem' }}><FiUser /></div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600' }}>{u.name}</div>
                                                    <div style={{ color: '#555', fontSize: '0.7rem' }}>{u.email.slice(0, 20)}...</div>
                                                </div>
                                                {selectedUserIds.includes(u.id) && <FiCheckCircle color="var(--color-gold)" size={16} />}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* BROADCAST HUB HISTORY */}
                        <div className="admin-card glass" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(251,191,36,0.1)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiClock size={16} />
                                </div>
                                <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Broadcast History Registry</h2>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.2rem' }}>
                                {broadcasts.length === 0 ? (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem 0', background: 'rgba(255,255,255,0.01)', borderRadius: '25px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                                        <FiSend size={40} style={{ marginBottom: '1.5rem', opacity: 0.2, color: 'var(--color-gold)' }} />
                                        <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem', opacity: 0.5 }}>Cloud Registry Offline or Empty</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '2rem', maxWidth: '300px', margin: '0 auto 2rem' }}>Manual outreach payloads are missing. Please send a broadcast or run the SQL sync script in Supabase.</p>
                                        <button onClick={handleTestDispatch} style={{ background: 'rgba(251,191,36,0.1)', color: 'var(--color-gold)', border: '1px solid rgba(251,191,36,0.2)', padding: '0.6rem 2rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', transition: '0.3s' }}>GENERATE DIAGNOSTIC DISPATCH</button>
                                    </div>
                                ) : (
                                    [...broadcasts].sort((a, b) => new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at)).map((b, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.03)' }}
                                            onClick={() => setSelectedBroadcast(b)}
                                            style={{
                                                padding: '1.8rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: '20px', cursor: 'pointer', transition: '0.3s', position: 'relative', overflow: 'hidden'
                                            }}
                                        >
                                            {/* Top Accent */}
                                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)', opacity: 0.2 }}></div>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                                    <FiRadio color="var(--color-gold)" size={12} />
                                                    <span style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.2em' }}>REGISTRY_ENTITY</span>
                                                </div>
                                                <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>{new Date(b.timestamp || b.created_at).toLocaleString()}</span>
                                            </div>

                                            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 0.8rem 0', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{b.title}</h3>
                                            <p style={{ color: '#666', fontSize: '0.9rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.5' }}>{b.message}</p>

                                            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1.2rem' }}>
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#555', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                        <FiUsers size={12} /> <span style={{ textTransform: 'uppercase' }}>{b.audience}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: getColor(b.type || 'info'), fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                        <FiCheckCircle size={12} /> <span style={{ textTransform: 'uppercase' }}>{b.type || 'INFO'}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openConfirm('DELETE DISPATCH RECORD', 'Permanentely remove this transmission from the registry?', () => deleteBroadcast(b.id)); }}
                                                        style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}
                                                    >
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: '900' }}>
                                                        VIEW <FiChevronRight size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="notifications"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                        {/* SYSTEM ALERTS LOG */}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.01)', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input placeholder="Scan systemic performance registry stream..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#050505', border: '1px solid #151515', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }} />
                                    <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#333' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {['all', 'booking', 'user', 'message', 'payment'].map(f => (
                                        <button key={f} onClick={() => setHistoryFilter(f)} style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: '1px solid #151515', background: historyFilter === f ? 'var(--color-gold)' : '#050505', color: historyFilter === f ? '#000' : '#555', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', transition: '0.2s' }}>{f}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="admin-card glass" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                            <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #151515', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '12px', height: '12px', background: '#4caf50', borderRadius: '50%', boxShadow: '0 0 15px #4caf50', animation: 'pulse 2s infinite' }}></div>
                                    <h2 style={{ color: '#fff', fontSize: '1.3rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Systemic Performance Registry</h2>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(255,68,68,0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => openConfirm('PURGE SECURITY CLEARANCE', 'CRITICAL WARNING: You are authorizing the permanent destruction of the systemic performance registry. Authorize purge?', clearAllNotifications)}
                                    style={{
                                        background: '#ff4444',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0.8rem 1.8rem',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '900',
                                        letterSpacing: '0.1em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.8rem',
                                        boxShadow: '0 4px 15px rgba(255,68,68,0.15)'
                                    }}
                                >
                                    <FiShield size={16} /> PURGE REGISTRY
                                </motion.button>
                            </div>

                            <div style={{ maxHeight: '750px', overflowY: 'auto', padding: '1.2rem' }}>
                                {filteredAdminHistory.map((notif, idx) => {
                                    const action = getNotificationAction(notif);
                                    return (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -8 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => {
                                                setSelectedDetail(notif);
                                                if (!notif.read) markNotificationRead(notif.id);
                                            }}
                                            style={{
                                                padding: '1.2rem 1.8rem',
                                                background: notif.read ? 'rgba(255,255,255,0.01)' : 'rgba(var(--color-gold-rgb), 0.05)',
                                                border: '1px solid',
                                                borderColor: notif.read ? 'rgba(255,255,255,0.03)' : 'rgba(201,169,106,0.15)',
                                                borderRadius: '16px',
                                                display: 'flex',
                                                gap: '1.5rem',
                                                marginBottom: '0.8rem',
                                                cursor: 'pointer',
                                                alignItems: 'center',
                                                position: 'relative'
                                            }}
                                            className="audit-card-hover"
                                        >
                                            {!notif.read && (
                                                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--color-gold)', color: '#000', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>UNREAD</div>
                                            )}
                                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${getColor(notif.type)}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(notif.type), fontSize: '1.3rem', border: `1px solid ${getColor(notif.type)}15` }}>{getIcon(notif.type)}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                        <span style={{ color: getColor(notif.type), fontSize: '0.6rem', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{notif.type || 'INFO'} LEVEL</span>
                                                        <h4 style={{ color: notif.read ? '#fff' : 'var(--color-gold)', fontSize: '1rem', margin: 0, fontWeight: '700' }}>{notif.title}</h4>
                                                    </div>
                                                    <span style={{ color: '#333', fontSize: '0.7rem', fontFamily: 'monospace' }}>{new Date(notif.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p style={{ color: notif.read ? '#666' : '#999', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>{notif.message.slice(0, 120)}...</p>
                                            </div>

                                            {action && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); action.action(); }}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.02)',
                                                        color: '#fff',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        padding: '0.6rem 1.2rem',
                                                        borderRadius: '10px',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '800',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        transition: '0.2s'
                                                    }}
                                                    className="action-button-hover"
                                                >
                                                    {action.label.toUpperCase()} <FiExternalLink size={12} />
                                                </button>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlays for Details */}
            <AnimatePresence>
                {(selectedDetail || selectedBroadcast) && (
                    <div className="modal active" onClick={() => { setSelectedDetail(null); setSelectedBroadcast(null); }}>
                        <motion.div className="modal-content glass-modal" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} style={{ maxWidth: '650px', padding: '3rem', borderRadius: '35px', background: 'rgba(5,5,5,0.99)', backdropFilter: 'blur(50px)', border: '1px solid rgba(251,191,36,0.1)' }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'rgba(251,191,36,0.1)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '1px solid rgba(251,191,36,0.1)' }}>
                                    {selectedBroadcast ? <FiSend /> : getIcon(selectedDetail.type)}
                                </div>
                                <div>
                                    <div style={{ color: 'var(--color-gold)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.3em' }}>{selectedBroadcast ? 'OFFICIAL DISPATCH' : `${selectedDetail?.type?.toUpperCase() || 'SYSTEM'} LEVEL`}</div>
                                    <h2 style={{ color: '#fff', margin: '0.5rem 0 0 0', fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: '800' }}>{selectedBroadcast?.title || selectedDetail?.title}</h2>
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.02)',
                                padding: '2.5rem',
                                borderRadius: '25px',
                                color: '#efefff',
                                lineHeight: '1.8',
                                fontSize: '1.2rem',
                                marginBottom: '2.5rem',
                                border: '1px solid rgba(251,191,36,0.05)',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'var(--font-heading)',
                                fontWeight: '300',
                                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)'
                            }}>
                                {selectedBroadcast?.message || selectedDetail?.message}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2.5rem' }}>
                                <div style={{ color: '#555', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.15em', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)' }}></div>
                                    VERIFIED DISPATCH • {new Date(selectedBroadcast?.timestamp || selectedDetail?.timestamp).toLocaleString()}
                                </div>
                                <button className="btn btn-secondary" style={{ padding: '0.9rem 3rem', borderRadius: '14px', fontWeight: '900', fontSize: '0.8rem' }} onClick={() => { setSelectedDetail(null); setSelectedBroadcast(null); }}>DISMISS PAYLOAD</button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {confirmModal.isOpen && (
                    <div className="modal active" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
                        <motion.div
                            className="modal-content glass-modal"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                maxWidth: '450px',
                                textAlign: 'center',
                                padding: '3.5rem',
                                borderRadius: '35px',
                                background: 'rgba(10,10,10,0.99)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                backdropFilter: 'blur(40px)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ width: '80px', height: '80px', borderRadius: '25px', background: 'rgba(255,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4444', margin: '0 auto 2rem', fontSize: '2rem', border: '1px solid rgba(255,68,68,0.1)' }}>
                                <FiAlertTriangle size={32} />
                            </div>
                            <h2 style={{ color: '#fff', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>{confirmModal.title}</h2>
                            <p style={{ color: '#666', marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '0.95rem' }}>{confirmModal.message}</p>
                            <div style={{ display: 'flex', gap: '1.2rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }} onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>ABORT</button>
                                <button className="btn btn-primary" style={{ flex: 1, background: '#ff4444', border: 'none', padding: '1rem', fontWeight: '900' }} onClick={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, isOpen: false }); }}>AUTHORIZE PURGE</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .admin-broadcast-premium { animation: fadeIn 0.8s ease-out; background: #000; min-height: 100vh; padding: 2rem; }
                .glass { position: relative; overflow: hidden; }
                .audit-card-hover:hover { background: rgba(255,255,255,0.02) !important; border-color: rgba(201,169,106,0.2) !important; transform: translateY(-3px); }
                .gold { color: var(--color-gold); }
                .dispatch-button:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(0,0,0,0.5); background: #222; }
                .action-button-hover:hover { background: #fff !important; color: #000 !important; border-color: #fff !important; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
                @media (max-width: 1400px) { .admin-grid-2 { display: flex !important; flex-direction: column !important; } }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default AdminBroadcast;
