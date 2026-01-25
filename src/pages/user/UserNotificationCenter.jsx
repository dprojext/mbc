import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FiBell, FiCheckCircle, FiInfo, FiAlertTriangle, FiTrash2, FiClock } from 'react-icons/fi';

const UserNotificationCenter = () => {
    const { user } = useAuth();
    const { userNotifications = [], clearUserNotifications } = useData();

    const myNotifications = userNotifications
        .filter(n => n.user_id === user?.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FiCheckCircle color="#4caf50" />;
            case 'warning': return <FiAlertTriangle color="#ff9800" />;
            case 'alert': return <FiInfo color="#f44336" />;
            default: return <FiBell color="var(--color-gold)" />;
        }
    };

    const formatTime = (ts) => {
        const date = new Date(ts);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="user-notifications">
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Notification <span className="gold">Center</span></h1>
                    <p style={{ color: '#888', marginTop: '0.4rem' }}>Stay updated with your service status and exclusive offers.</p>
                </div>
                {myNotifications.length > 0 && (
                    <button
                        onClick={clearUserNotifications}
                        className="btn btn-secondary"
                        style={{ color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.05)' }}
                    >
                        <FiTrash2 style={{ marginRight: '8px' }} /> Clear All
                    </button>
                )}
            </header>

            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                {myNotifications.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {myNotifications.map((notif, idx) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{
                                    padding: '1.5rem',
                                    borderBottom: '1px solid #1a1a1a',
                                    background: notif.read ? 'transparent' : 'rgba(var(--color-gold-rgb), 0.03)',
                                    display: 'flex',
                                    gap: '1.2rem'
                                }}
                            >
                                <div style={{
                                    width: '45px', height: '45px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                                    flexShrink: 0
                                }}>
                                    {getIcon(notif.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                        <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, fontWeight: '600' }}>{notif.title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#444', fontSize: '0.75rem' }}>
                                            <FiClock size={12} /> {formatTime(notif.timestamp)}
                                        </div>
                                    </div>
                                    <p style={{ color: '#888', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>{notif.message}</p>
                                    {!notif.read && (
                                        <div style={{ marginTop: '0.8rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Alert</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#222'
                        }}>
                            <FiBell size={40} />
                        </div>
                        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Quiet in here</h3>
                        <p style={{ color: '#666' }}>We'll notify you when your car is ready or when we have special updates for you.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserNotificationCenter;
