import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import {
    FiBell, FiX, FiCheck, FiUser, FiCalendar, FiCreditCard,
    FiMessageSquare, FiAlertCircle, FiCheckCircle, FiMaximize2, FiExternalLink
} from 'react-icons/fi';

const AdminNotifications = () => {
    const { adminNotifications, markNotificationRead, clearAllNotifications } = useData();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);

    const unreadCount = (adminNotifications || []).filter(n => !n.read).length;

    const getIcon = (type) => {
        switch (type) {
            case 'booking': return <FiCalendar />;
            case 'user': return <FiUser />;
            case 'payment': return <FiCreditCard />;
            case 'message': return <FiMessageSquare />;
            default: return <FiAlertCircle />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'booking': return '#4caf50';
            case 'user': return 'var(--color-gold)';
            case 'payment': return '#29b6f6';
            case 'message': return '#9c27b0';
            default: return '#ff9800';
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: isOpen ? 'rgba(var(--color-gold-rgb), 0.1)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '0.7rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isOpen ? 'var(--color-gold)' : '#888',
                    position: 'relative',
                    transition: '0.2s'
                }}
            >
                <FiBell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#ff4444',
                        color: '#fff',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '50px',
                        minWidth: '18px',
                        textAlign: 'center'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                        onClick={() => setIsOpen(false)}
                    />
                    <div style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        width: '380px',
                        maxHeight: '500px',
                        background: '#151515',
                        border: '1px solid #333',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        zIndex: 999,
                        overflow: 'hidden',
                        animation: 'slideDown 0.2s ease'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '1.2rem 1.5rem',
                            borderBottom: '1px solid #222',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Notifications</h3>
                            {(adminNotifications || []).length > 0 && (
                                <button
                                    onClick={clearAllNotifications}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#666',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {(!adminNotifications || adminNotifications.length === 0) ? (
                                <div style={{ padding: '3rem', textAlign: 'center', color: '#444' }}>
                                    <FiCheckCircle size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                    <p>You're all caught up!</p>
                                </div>
                            ) : (
                                adminNotifications
                                    .slice()
                                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                    .map((notif, idx) => (
                                        <div
                                            key={notif.id || idx}
                                            onClick={() => {
                                                markNotificationRead(notif.id);
                                                setSelectedNotif(notif);
                                            }}
                                            style={{
                                                padding: '1rem 1.5rem',
                                                borderBottom: '1px solid #1a1a1a',
                                                display: 'flex',
                                                gap: '1rem',
                                                cursor: 'pointer',
                                                background: notif.read ? 'transparent' : 'rgba(var(--color-gold-rgb), 0.03)',
                                                transition: '0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: `${getColor(notif.type)}15`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: getColor(notif.type),
                                                flexShrink: 0
                                            }}>
                                                {getIcon(notif.type)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    color: notif.read ? '#888' : '#fff',
                                                    fontSize: '0.9rem',
                                                    fontWeight: notif.read ? '400' : '600',
                                                    marginBottom: '0.1rem'
                                                }}>
                                                    {notif.title}
                                                </div>
                                                <div style={{
                                                    color: getColor(notif.type),
                                                    fontSize: '0.6rem',
                                                    fontWeight: '900',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    marginBottom: '0.4rem',
                                                    opacity: notif.read ? 0.5 : 1
                                                }}>
                                                    {notif.type || 'INFO'} LEVEL
                                                </div>
                                                <div style={{
                                                    color: notif.read ? '#555' : '#888',
                                                    fontSize: '0.75rem',
                                                    lineHeight: '1.4',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: '2',
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}>
                                                    {notif.message}
                                                </div>
                                                <div style={{ color: '#444', fontSize: '0.7rem', marginTop: '0.4rem' }}>
                                                    {formatTime(notif.timestamp)}
                                                </div>
                                            </div>
                                            {!notif.read && (
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: 'var(--color-gold)',
                                                    flexShrink: 0,
                                                    marginTop: '6px'
                                                }} />
                                            )}
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* Footer Link */}
                        <div style={{ borderTop: '1px solid #222' }}>
                            <Link
                                to="/admin/broadcast"
                                state={{ tab: 'Notifications' }}
                                onClick={() => setIsOpen(false)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '0.6rem 1rem',
                                    color: 'var(--color-gold)',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    textDecoration: 'none',
                                    background: 'rgba(0,0,0,0.2)'
                                }}
                            >
                                <FiExternalLink size={14} />
                                View Full Broadcast Hub
                            </Link>
                        </div>
                    </div>
                </>
            )}

            {/* Notification Detail Modal */}
            {selectedNotif && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 10000 }}
                        onClick={() => setSelectedNotif(null)}
                    />
                    <div style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '500px',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '24px',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.8)',
                        zIndex: 10001,
                        padding: '2rem',
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}>
                        <button
                            onClick={() => setSelectedNotif(null)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                        >
                            <FiX size={24} />
                        </button>

                        <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '16px',
                            background: `${getColor(selectedNotif.type)}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: getColor(selectedNotif.type),
                            marginBottom: '1.5rem',
                            fontSize: '1.8rem'
                        }}>
                            {getIcon(selectedNotif.type)}
                        </div>

                        <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                            {selectedNotif.title}
                        </h2>

                        <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '2rem' }}>
                            {selectedNotif.message}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '1.5rem' }}>
                            <span style={{ color: '#555', fontSize: '0.85rem' }}>
                                {new Date(selectedNotif.timestamp).toLocaleString()}
                            </span>
                            <Link
                                to="/admin/broadcast"
                                state={{ tab: 'Notifications', openNotifId: selectedNotif.id }}
                                onClick={() => {
                                    setSelectedNotif(null);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '0.6rem 1.2rem',
                                    background: 'var(--color-gold)',
                                    color: '#000',
                                    borderRadius: '10px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: '700'
                                }}
                            >
                                Open Hub
                            </Link>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>

        </div>
    );
};

export default AdminNotifications;
