import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSend, FiUsers, FiUser, FiBell, FiTrash2,
    FiCheck, FiX, FiInfo, FiAlertTriangle, FiCheckCircle,
    FiFilter, FiSearch, FiLayers
} from 'react-icons/fi';

const AdminBroadcast = () => {
    const {
        users = [],
        adminNotifications = [],
        userNotifications = [],
        clearUserNotifications,
        clearAllNotifications,
        sendUserNotification,
        addAdminNotification
    } = useData();
    const { showToast } = useToast();

    const [activeView, setActiveView] = useState('History'); // 'History' or 'Broadcast'
    const [historySearch, setHistorySearch] = useState('');
    const [historyFilter, setHistoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [recipientFilter, setRecipientFilter] = useState('all');
    const [selectedDetail, setSelectedDetail] = useState(null);

    // Broadcast Form State
    const [targetType, setTargetType] = useState('all'); // 'all', 'customers', 'staff', 'selected'
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
            if (targetType === 'all') {
                targets = users.map(u => u.id);
            } else if (targetType === 'customers') {
                targets = users.filter(u => !u.role || u.role === 'user').map(u => u.id);
            } else if (targetType === 'staff') {
                targets = users.filter(u => u.role && u.role !== 'user').map(u => u.id);
            } else {
                targets = selectedUserIds;
            }

            for (const userId of targets) {
                await sendUserNotification(userId, {
                    title: notifTitle,
                    message: notifMessage,
                    type: notifType
                });
            }

            await addAdminNotification({
                type: 'message',
                title: 'Global Broadcast Sent',
                message: `"${notifTitle}" sent to ${targets.length} users.`,
                timestamp: new Date().toISOString()
            });

            setSentStatus('success');
            showToast('Broadcast delivered successfully!', 'success');
            setNotifTitle('');
            setNotifMessage('');
            setSelectedUserIds([]);
            setTimeout(() => setSentStatus(null), 3000);
        } catch (error) {
            setSentStatus('error');
            showToast('Failed to send broadcast', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const filteredUsers = (users || []).filter(u => {
        const name = (u.name || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const search = (searchQuery || '').toLowerCase();
        const matchesSearch = name.includes(search) || email.includes(search);

        if (recipientFilter === 'customer') return matchesSearch && (!u.role || u.role === 'user');
        if (recipientFilter === 'staff') return matchesSearch && (u.role && u.role !== 'user');
        return matchesSearch;
    });

    const filteredAdminHistory = (adminNotifications || [])
        .filter(n => {
            const matchesSearch = (n.title || '').toLowerCase().includes(historySearch.toLowerCase()) || 
                                 (n.message || '').toLowerCase().includes(historySearch.toLowerCase());
            if (historyFilter === 'all') return matchesSearch;
            return matchesSearch && n.type === historyFilter;
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    return (
        <div className="admin-broadcast-container">
            <header className="admin-flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>Communications Hub</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>Broadcast messages and manage notifications</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: '#111', padding: '0.4rem', borderRadius: '10px' }}>
                    {['History', 'Broadcast'].map(view => (
                        <button
                            key={view}
                            onClick={() => setActiveView(view)}
                            style={{
                                padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none',
                                background: activeView === view ? 'var(--color-gold)' : 'transparent',
                                color: activeView === view ? '#000' : '#888',
                                fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', transition: '0.3s'
                            }}
                        >
                            {view}
                        </button>
                    ))}
                </div>
            </header>

            {activeView === 'History' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="admin-flex-between">
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px', width: '100%' }}>
                            <input
                                placeholder="Search systemic alerts..."
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                            />
                            <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
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

                    <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <h2 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>System Alerts & History</h2>
                            <button
                                onClick={() => {
                                    openConfirm(
                                        'Clear System Alerts',
                                        'Are you sure you want to permanently delete all administrator notifications?',
                                        async () => {
                                            await clearAllNotifications();
                                            showToast('System alerts cleared', 'success');
                                        }
                                    );
                                }}
                                style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                            >
                                <FiTrash2 /> Clear All
                            </button>
                        </div>
                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
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
                                            padding: '1.2rem 1.5rem', borderBottom: '1px solid #1a1a1a',
                                            display: 'flex', gap: '1rem', transition: '0.2s',
                                            background: notif.read ? 'transparent' : 'rgba(var(--color-gold-rgb), 0.05)',
                                            cursor: 'pointer',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '10px', background: `${getColor(notif.type)}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(notif.type), flexShrink: 0,
                                            fontSize: '1.2rem'
                                        }}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                                                <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>{notif.title}</h3>
                                                <span style={{ color: '#444', fontSize: '0.7rem' }}>
                                                    {new Date(notif.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p style={{ color: '#888', margin: 0, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="admin-grid-2">
                    {/* Compose Form */}
                    <div className="admin-card">
                        <h2 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem' }}>Compose Broadcast</h2>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ color: '#888', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Notification Title</label>
                            <input
                                placeholder="Broadcast title..."
                                value={notifTitle}
                                onChange={(e) => setNotifTitle(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.2rem' }}>
                            <label style={{ color: '#888', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Message Content</label>
                            <textarea
                                placeholder="Type your notification here..."
                                value={notifMessage}
                                onChange={(e) => setNotifMessage(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', minHeight: '120px', resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ color: '#888', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Type</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                    {['info', 'success', 'warning', 'alert'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNotifType(type)}
                                            style={{
                                                padding: '0.5rem', borderRadius: '6px', border: '1px solid #333',
                                                background: notifType === type ? getColor(type) : '#0a0a0a',
                                                color: notifType === type ? '#000' : '#888',
                                                cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'capitalize'
                                            }}
                                        >{type}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ color: '#888', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Audience</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                    <button onClick={() => setTargetType('all')} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #333', background: targetType === 'all' ? 'var(--color-gold)' : '#0a0a0a', color: targetType === 'all' ? '#000' : '#888', cursor: 'pointer', fontSize: '0.7rem' }}>All</button>
                                    <button onClick={() => setTargetType('customers')} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #333', background: targetType === 'customers' ? 'var(--color-gold)' : '#0a0a0a', color: targetType === 'customers' ? '#000' : '#888', cursor: 'pointer', fontSize: '0.7rem' }}>Users</button>
                                    <button onClick={() => setTargetType('staff')} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #333', background: targetType === 'staff' ? 'var(--color-gold)' : '#0a0a0a', color: targetType === 'staff' ? '#000' : '#888', cursor: 'pointer', fontSize: '0.7rem' }}>Staff</button>
                                    <button onClick={() => setTargetType('selected')} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #333', background: targetType === 'selected' ? 'var(--color-gold)' : '#0a0a0a', color: targetType === 'selected' ? '#000' : '#888', cursor: 'pointer', fontSize: '0.7rem' }}>Pick</button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleBroadcast}
                            disabled={isSending || !notifTitle || !notifMessage || (targetType === 'selected' && selectedUserIds.length === 0)}
                            style={{
                                width: '100%', padding: '1rem', background: 'var(--color-gold)', borderRadius: '10px', border: 'none',
                                color: '#000', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                                opacity: (isSending || !notifTitle || !notifMessage) ? 0.5 : 1
                            }}
                        >
                            {isSending ? 'Sending...' : sentStatus === 'success' ? <><FiCheck /> Sent!</> : <><FiSend /> Send Notification</>}
                        </button>
                    </div>

                    {/* Recipient Manager */}
                    <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.8rem' }}>Recipient Manager</h3>
                            <div style={{ position: 'relative' }}>
                                <input
                                    placeholder="Search users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '0.7rem 0.7rem 0.7rem 2rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                                />
                                <FiSearch style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                            {filteredUsers.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#444', padding: '2rem' }}>No users found</p>
                            ) : (
                                filteredUsers.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => handleToggleUser(u.id)}
                                        style={{
                                            padding: '0.8rem', background: selectedUserIds.includes(u.id) ? 'rgba(var(--color-gold-rgb), 0.1)' : '#0a0a0a',
                                            border: '1px solid', borderColor: selectedUserIds.includes(u.id) ? 'var(--color-gold)' : '#333',
                                            borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: '0.2s'
                                        }}
                                    >
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', fontSize: '0.8rem' }}>
                                            <FiUser />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '500' }}>{u.name}</div>
                                            <div style={{ color: '#666', fontSize: '0.7rem' }}>{u.email}</div>
                                        </div>
                                        {selectedUserIds.includes(u.id) && <FiCheckCircle color="var(--color-gold)" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Selection Detail Overlay */}
            <AnimatePresence>
                {selectedDetail && (
                    <div className="modal active" onClick={() => setSelectedDetail(null)}>
                        <motion.div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ maxWidth: '500px' }}
                        >
                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: `${getColor(selectedDetail.type)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(selectedDetail.type), fontSize: '1.8rem', flexShrink: 0 }}>
                                    {getIcon(selectedDetail.type)}
                                </div>
                                <div>
                                    <h2 style={{ color: '#fff', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading)' }}>{selectedDetail.title}</h2>
                                    <span style={{ color: getColor(selectedDetail.type), textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em' }}>{selectedDetail.type} Alert</span>
                                </div>
                            </div>
                            <div style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '12px', color: '#ccc', lineHeight: '1.6', marginBottom: '2rem' }}>
                                {selectedDetail.message}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#555', fontSize: '0.85rem' }}>
                                <span>{new Date(selectedDetail.timestamp).toLocaleString()}</span>
                                <button className="btn btn-secondary" onClick={() => setSelectedDetail(null)}>Close Detail</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {confirmModal.isOpen && (
                    <div className="modal active" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
                        <motion.div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ maxWidth: '400px', textAlign: 'center' }}
                        >
                            <FiAlertTriangle color="#ff4444" size={48} style={{ marginBottom: '1.5rem' }} />
                            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>{confirmModal.title}</h2>
                            <p style={{ color: '#888', marginBottom: '2rem' }}>{confirmModal.message}</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 1, background: '#ff4444' }} onClick={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, isOpen: false }); }}>Confirm Clear</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminBroadcast;
