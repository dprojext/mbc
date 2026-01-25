import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
    FiSend, FiUsers, FiUser, FiBell, FiTrash2,
    FiCheck, FiX, FiInfo, FiAlertTriangle, FiCheckCircle,
    FiFilter, FiSearch, FiLayers
} from 'react-icons/fi';

const AdminBroadcast = () => {
    const {
        users = [],
        userNotifications = [],
        adminNotifications = [],
        clearUserNotifications,
        clearAllNotifications,
        sendUserNotification,
        addAdminNotification
    } = useData();
    const { showToast } = useToast();

    const [activeView, setActiveView] = useState('History'); // 'History' or 'Broadcast'
    const [searchQuery, setSearchQuery] = useState('');
    const [archiveSearch, setArchiveSearch] = useState('');
    const [archiveFilter, setArchiveFilter] = useState('all');
    const [recipientFilter, setRecipientFilter] = useState('all'); // 'all', 'user', 'staff'
    const [selectedDetail, setSelectedDetail] = useState(null);

    // Broadcast Form State
    const [targetType, setTargetType] = useState('all'); // 'all' or 'selected'
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');
    const [notifType, setNotifType] = useState('info'); // info, success, warning, alert
    const [isSending, setIsSending] = useState(false);
    const [sentStatus, setSentStatus] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openConfirm = (title, message, onConfirm) => {
        setConfirmModal({ isOpen: true, title, message, onConfirm });
    };

    const handleToggleUser = (id) => {
        setSelectedUserIds(prev =>
            prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
        );
    };

    const handleBroadcast = async () => {
        if (!notifTitle || !notifMessage) return;

        setIsSending(true);
        try {
            let targets = [];
            if (targetType === 'all') {
                targets = users.map(u => u.id);
            } else if (targetType === 'customers') {
                targets = users.filter(u => !u.role || u.role === 'user').map(u => u.id);
            } else if (targetType === 'staff') {
                targets = users.filter(u => u.role && u.role !== 'user').map(u => u.id);
            } else {
                targets = selectedUserIds;
            }

            // Send to each user
            for (const userId of targets) {
                await sendUserNotification(userId, {
                    title: notifTitle,
                    message: notifMessage,
                    type: notifType
                });
            }

            // Also log this in admin history
            await addAdminNotification({
                type: 'message',
                title: 'Global Broadcast Sent',
                message: `"${notifTitle}" sent to ${targets.length} users.`
            });

            setSentStatus('success');
            showToast('Broadcast delivered successfully!', 'success');
            setNotifTitle('');
            setNotifMessage('');
            setSelectedUserIds([]);
            setTimeout(() => setSentStatus(null), 3000);
        } catch (error) {
            setSentStatus('error');
        } finally {
            setIsSending(false);
        }
    };

    const filteredUsers = (users || []).filter(u => {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const search = (searchQuery || '').toLowerCase();

        const matchesSearch = name.includes(search) || email.includes(search);

        const isStaff = u.role && u.role !== 'user';
        const matchesRole = recipientFilter === 'all' ||
            (recipientFilter === 'staff' ? isStaff : !isStaff);

        return matchesSearch && matchesRole;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FiCheckCircle />;
            case 'warning': return <FiAlertTriangle />;
            case 'alert': return <FiBell />;
            default: return <FiInfo />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'success': return '#4caf50';
            case 'warning': return '#ff9800';
            case 'alert': return '#ff4444';
            default: return 'var(--color-gold)';
        }
    };

    const [historySearch, setHistorySearch] = useState('');
    const [historyFilter, setHistoryFilter] = useState('all');

    // Filter for RECEIEVED Admin History
    const filteredAdminHistory = (adminNotifications || []).filter(n => {
        const title = (n.title || '').toLowerCase();
        const message = (n.message || '').toLowerCase();
        const search = (historySearch || '').toLowerCase();

        const matchesSearch = title.includes(search) || message.includes(search);
        const matchesType = historyFilter === 'all' || n.type === historyFilter;
        return matchesSearch && matchesType;
    });

    // Filter for SENT User Broadcasts
    const filteredSentHistory = (userNotifications || []).filter(n => {
        const title = (n.title || '').toLowerCase();
        const message = (n.message || '').toLowerCase();
        const search = (archiveSearch || '').toLowerCase();

        const matchesSearch = title.includes(search) || message.includes(search);
        const matchesType = archiveFilter === 'all' || n.type === archiveFilter;
        return matchesSearch && matchesType;
    });

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', paddingBottom: '3rem' }}>
            {/* Header ... (same as before) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '600' }}>Communication Hub</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', margin: 0, color: '#fff' }}>Notifications & Broadcast</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>Manage system alerts and communicate directly with your customers.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                        onClick={() => setActiveView('History')}
                        style={{
                            padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
                            background: activeView === 'History' ? 'var(--color-gold)' : 'transparent',
                            color: activeView === 'History' ? '#000' : '#888',
                            fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: '0.2s'
                        }}
                    >Admin History</button>
                    <button
                        onClick={() => setActiveView('Broadcast')}
                        style={{
                            padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
                            background: activeView === 'Broadcast' ? 'var(--color-gold)' : 'transparent',
                            color: activeView === 'Broadcast' ? '#000' : '#888',
                            fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: '0.2s'
                        }}
                    >Send Global Alert</button>
                </div>
            </div>

            {activeView === 'History' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Filters Toolbar */}
                    <div style={{
                        display: 'flex', gap: '1.5rem', background: 'rgba(20,20,20,0.8)',
                        padding: '1.2rem 2rem', borderRadius: '18px', border: '1px solid #222',
                        alignItems: 'center'
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <input
                                placeholder="Search system alerts..."
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                            />
                            <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <FiFilter style={{ color: '#555', marginRight: '0.5rem' }} />
                            {['all', 'booking', 'user', 'message', 'payment'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setHistoryFilter(f)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #333',
                                        background: historyFilter === f ? 'var(--color-gold)' : '#0a0a0a',
                                        color: historyFilter === f ? '#000' : '#888',
                                        fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer'
                                    }}
                                >{f}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: 'rgba(20,20,20,0.8)', borderRadius: '24px', border: '1px solid #222', overflow: 'hidden' }}>
                        <div style={{ padding: '2rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>System Alerts & History</h2>
                            <button
                                onClick={() => {
                                    openConfirm(
                                        'Clear System Alerts',
                                        'Are you sure you want to permanently delete all administrator notifications? This action cannot be undone.',
                                        async () => {
                                            await clearAllNotifications();
                                            showToast('System alerts cleared', 'success');
                                        }
                                    );
                                }}
                                style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                            >
                                <FiTrash2 /> Clear All Alerts
                            </button>
                        </div>
                        <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
                            {filteredAdminHistory.length === 0 ? (
                                <div style={{ padding: '5rem', textAlign: 'center', color: '#444' }}>
                                    <FiBell size={48} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
                                    <h3>No records found</h3>
                                </div>
                            ) : (
                                filteredAdminHistory.map((notif, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedDetail(notif)}
                                        style={{
                                            padding: '1.5rem 2.5rem', borderBottom: '1px solid #1a1a1a',
                                            display: 'flex', gap: '1.5rem', transition: '0.2s',
                                            background: notif.read ? 'transparent' : 'rgba(var(--color-gold-rgb), 0.05)',
                                            cursor: 'pointer',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '50px', height: '50px', borderRadius: '12px', background: `${getColor(notif.type)}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(notif.type), flexShrink: 0,
                                            fontSize: '1.4rem'
                                        }}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                <div>
                                                    <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0, fontFamily: 'var(--font-heading)' }}>{notif.title}</h3>
                                                    <span style={{ color: getColor(notif.type), fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '800' }}>
                                                        {notif.type} Event
                                                    </span>
                                                </div>
                                                <span style={{ color: '#444', fontSize: '0.75rem', background: '#0a0a0a', padding: '0.3rem 0.8rem', borderRadius: '6px' }}>
                                                    {new Date(notif.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p style={{ color: '#888', margin: 0, fontSize: '0.95rem', lineHeight: '1.5', maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
                        {/* Compose Form */}
                        <div style={{ background: 'rgba(20,20,20,0.8)', padding: '2.5rem', borderRadius: '24px', border: '1px solid #222' }}>
                            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '2rem', fontFamily: 'var(--font-heading)' }}>Compose Broadcast</h2>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '0.8rem' }}>Notification Title</label>
                                <input
                                    placeholder="e.g. System Update or Special Offer"
                                    value={notifTitle}
                                    onChange={(e) => setNotifTitle(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '0.8rem' }}>Message Content</label>
                                <textarea
                                    placeholder="What would you like to tell your users?"
                                    value={notifMessage}
                                    onChange={(e) => setNotifMessage(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', minHeight: '150px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '0.8rem' }}>Alert Type</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {['info', 'success', 'warning', 'alert'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNotifType(type)}
                                                style={{
                                                    flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #333',
                                                    background: notifType === type ? getColor(type) : '#0a0a0a',
                                                    color: notifType === type ? '#000' : '#888',
                                                    cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'capitalize'
                                                }}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '0.8rem' }}>Audience</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setTargetType('all')}
                                            style={{
                                                padding: '0.6rem', borderRadius: '8px', border: '1px solid #333',
                                                background: targetType === 'all' ? 'var(--color-gold)' : '#0a0a0a',
                                                color: targetType === 'all' ? '#000' : '#888',
                                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'
                                            }}
                                        >All Users</button>
                                        <button
                                            onClick={() => setTargetType('customers')}
                                            style={{
                                                padding: '0.6rem', borderRadius: '8px', border: '1px solid #333',
                                                background: targetType === 'customers' ? 'var(--color-gold)' : '#0a0a0a',
                                                color: targetType === 'customers' ? '#000' : '#888',
                                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'
                                            }}
                                        >All Customers</button>
                                        <button
                                            onClick={() => setTargetType('staff')}
                                            style={{
                                                padding: '0.6rem', borderRadius: '8px', border: '1px solid #333',
                                                background: targetType === 'staff' ? 'var(--color-gold)' : '#0a0a0a',
                                                color: targetType === 'staff' ? '#000' : '#888',
                                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'
                                            }}
                                        >All Staff</button>
                                        <button
                                            onClick={() => setTargetType('selected')}
                                            style={{
                                                padding: '0.6rem', borderRadius: '8px', border: '1px solid #333',
                                                background: targetType === 'selected' ? 'var(--color-gold)' : '#0a0a0a',
                                                color: targetType === 'selected' ? '#000' : '#888',
                                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'
                                            }}
                                        >Select Users</button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleBroadcast}
                                disabled={isSending || !notifTitle || !notifMessage || (targetType === 'selected' && selectedUserIds.length === 0)}
                                style={{
                                    width: '100%', padding: '1.2rem', background: 'var(--color-gold)', borderRadius: '12px', border: 'none',
                                    color: '#000', fontWeight: '700', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                    opacity: (isSending || !notifTitle || !notifMessage) ? 0.5 : 1
                                }}
                            >
                                {isSending ? 'SENDING...' : sentStatus === 'success' ? <><FiCheck /> SENT SUCCESSFULLY</> : <><FiSend /> DELIVER NOTIFICATION</>}
                            </button>
                        </div>

                        {/* User Selection Sidebar */}
                        {/* User Selection Sidebar */}
                        <div style={{ background: 'rgba(20,20,20,0.8)', borderRadius: '24px', border: '1px solid #222', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Recipient Manager</h3>
                                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                                    <input
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.2rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                                    />
                                    <FiSearch style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    {['all', 'customer', 'staff'].map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setRecipientFilter(f)}
                                            style={{
                                                flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid #333',
                                                background: recipientFilter === f ? 'var(--color-gold)' : '#0a0a0a',
                                                color: recipientFilter === f ? '#000' : '#888',
                                                fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer'
                                            }}
                                        >{f}</button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
                                {filteredUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleToggleUser(user.id)}
                                        style={{
                                            padding: '1rem 1.5rem', borderBottom: '1px solid #1a1a1a', cursor: 'pointer',
                                            background: selectedUserIds.includes(user.id) ? 'rgba(var(--color-gold-rgb), 0.1)' : 'transparent',
                                            display: 'flex', alignItems: 'center', gap: '1rem'
                                        }}
                                    >
                                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedUserIds.includes(user.id) ? 'var(--color-gold)' : 'transparent' }}>
                                            {selectedUserIds.includes(user.id) && <FiCheck size={14} color="#000" />}
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{user.name}</div>
                                            <div style={{ color: '#666', fontSize: '0.75rem' }}>{user.email}</div>
                                        </div>
                                        <span style={{ marginLeft: 'auto', background: '#111', padding: '2px 6px', borderRadius: '100px', fontSize: '0.65rem', color: 'var(--color-gold)', textTransform: 'capitalize' }}>
                                            {user.role && user.role !== 'user' ? (user.role === 'importer' ? 'Data Importer' : user.role) : (user.plan || 'No Plan')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {targetType === 'selected' && (
                                <div style={{ padding: '1rem', background: '#0a0a0a', borderTop: '1px solid #222', borderRadius: '0 0 24px 24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.8rem' }}>
                                        <span>Selected Recipients:</span>
                                        <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>{selectedUserIds.length} users</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Broadcast Archive (Full Width at Bottom) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{
                            display: 'flex', gap: '1.5rem', background: 'rgba(20,20,20,0.8)',
                            padding: '1.2rem 2rem', borderRadius: '18px', border: '1px solid #222',
                            alignItems: 'center'
                        }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    placeholder="Search sent archives..."
                                    value={archiveSearch}
                                    onChange={(e) => setArchiveSearch(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                                />
                                <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <FiFilter style={{ color: '#444', marginRight: '0.5rem' }} />
                                {['all', 'info', 'success', 'warning', 'alert'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setArchiveFilter(f)}
                                        style={{
                                            padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #333',
                                            background: archiveFilter === f ? 'var(--color-gold)' : '#0a0a0a',
                                            color: archiveFilter === f ? '#000' : '#888',
                                            fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'capitalize', cursor: 'pointer'
                                        }}
                                    >{f}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ background: 'rgba(20,20,20,0.8)', borderRadius: '24px', border: '1px solid #222', overflow: 'hidden' }}>
                            <div style={{ padding: '2rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Broadcast Archive</h3>
                                <button
                                    onClick={() => {
                                        openConfirm(
                                            'Purge Broadcast History',
                                            'This will remove all sent notification records from the system archive. This action is irreversible.',
                                            async () => {
                                                await clearUserNotifications();
                                                showToast('Broadcast history purged', 'success');
                                            }
                                        );
                                    }}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                                >
                                    <FiTrash2 /> Clear Sent History
                                </button>
                            </div>
                            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                {filteredSentHistory.length === 0 ? (
                                    <div style={{ padding: '5rem', textAlign: 'center', color: '#444' }}>
                                        <FiSend size={48} style={{ marginBottom: '1.5rem', opacity: 0.1 }} />
                                        <h3>No broadcast records found</h3>
                                    </div>
                                ) : (
                                    filteredSentHistory.map((notif, idx) => (
                                        <div key={idx} style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1a1a1a', display: 'flex', gap: '1.5rem', transition: '0.2s' }}>
                                            <div style={{
                                                width: '45px', height: '45px', borderRadius: '12px', background: `${getColor(notif.type)}15`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(notif.type), flexShrink: 0
                                            }}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                                    <div>
                                                        <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{notif.title}</h3>
                                                        <div style={{ color: 'var(--color-gold)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                                            Recipient: <span style={{ color: '#fff' }}>{getUserName(notif.userId)}</span>
                                                        </div>
                                                    </div>
                                                    <span style={{ color: '#444', fontSize: '0.75rem' }}>{new Date(notif.timestamp).toLocaleString()}</span>
                                                </div>
                                                <p style={{ color: '#888', margin: '0.5rem 0', fontSize: '0.9rem', lineHeight: '1.5' }}>{notif.message}</p>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                                                    <span style={{ background: '#111', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', color: getColor(notif.type), textTransform: 'uppercase', letterSpacing: '0.05em', border: `1px solid ${getColor(notif.type)}30` }}>
                                                        {notif.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {/* Detail Modal */}
            {
                selectedDetail && (
                    <>
                        <div
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 10000, animation: 'fadeIn 0.2s ease' }}
                        />
                        <div style={{
                            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: '90%', maxWidth: '600px', background: '#111', border: '1px solid #333',
                            borderRadius: '32px', boxShadow: '0 40px 80px rgba(0,0,0,0.9)', zIndex: 10001,
                            padding: '3rem', animation: 'popIn 0.3s cubic-bezier(0.19, 1, 0.22, 1)'
                        }}>
                            <button
                                onClick={() => setSelectedDetail(null)}
                                style={{ position: 'absolute', top: '2rem', right: '2rem', background: '#1a1a1a', border: 'none', color: '#888', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <FiX size={20} />
                            </button>

                            <div style={{
                                width: '80px', height: '80px', borderRadius: '24px', background: `${getColor(selectedDetail.type)}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(selectedDetail.type),
                                marginBottom: '2rem', fontSize: '2.5rem'
                            }}>
                                {getIcon(selectedDetail.type)}
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <span style={{ color: getColor(selectedDetail.type), fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                                    {selectedDetail.type} System Event
                                </span>
                                <h2 style={{ color: '#fff', fontSize: '2.5rem', margin: '0.5rem 0 1rem 0', fontFamily: 'var(--font-heading)', lineHeight: '1.2' }}>
                                    {selectedDetail.title}
                                </h2>
                                <div style={{ color: '#555', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiLayers /> Recorded {new Date(selectedDetail.timestamp).toLocaleString()}
                                </div>
                            </div>

                            <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '20px', border: '1px solid #222', marginBottom: '2.5rem' }}>
                                <p style={{ color: '#ccc', fontSize: '1.25rem', lineHeight: '1.8', margin: 0 }}>
                                    {selectedDetail.message}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedDetail(null)}
                                style={{ width: '100%', padding: '1.2rem', background: '#fff', color: '#000', borderRadius: '16px', border: 'none', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', transition: '0.2s' }}
                            >
                                Close Overlay
                            </button>
                        </div>
                    </>
                )
            }

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(15px)', zIndex: 20000 }}
                    />
                    <div style={{
                        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '90%', maxWidth: '450px', background: '#0d0d0d', border: '1px solid #222',
                        borderRadius: '32px', boxShadow: '0 40px 100px rgba(0,0,0,1)', zIndex: 20001,
                        padding: '3rem', textAlign: 'center', animation: 'popIn 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
                    }}>
                        <div style={{
                            width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255, 68, 68, 0.1)',
                            color: '#ff4444', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem'
                        }}>
                            <FiTrash2 />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                            {confirmModal.title}
                        </h2>
                        <p style={{ color: '#666', lineHeight: '1.6', fontSize: '1rem', marginBottom: '2.5rem' }}>
                            {confirmModal.message}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                style={{ flex: 1, padding: '1rem', background: '#1a1a1a', color: '#888', border: 'none', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    confirmModal.onConfirm();
                                    setConfirmModal({ ...confirmModal, isOpen: false });
                                }}
                                style={{ flex: 1, padding: '1rem', background: 'var(--color-gold)', color: '#000', border: 'none', borderRadius: '50px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: translate(-50%, -45%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default AdminBroadcast;
