import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FiBell, FiCheckCircle, FiInfo, FiAlertTriangle, FiTrash2, FiClock, FiX } from 'react-icons/fi';

const UserNotificationCenter = () => {
    const { user } = useAuth();
    const { userNotifications = [], clearUserNotifications, markNotificationRead, deleteNotification } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedNotif, setSelectedNotif] = useState(null);

    const myNotifications = userNotifications
        .filter(n => n.user_id === user?.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    useEffect(() => {
        if (location.state?.openNotifId) {
            const notif = myNotifications.find(n => n.id === location.state.openNotifId);
            if (notif) setSelectedNotif(notif);
        }
    }, [location, myNotifications]);

    // Ensure state from navigation is cleared so refreshing doesn't re-open old modals if needed, 
    // but React Router usually handles this.
    // Major Fix: Ensure modal z-index is high enough to be clickable.

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
            <header className="admin-flex-between" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '1.8rem', margin: 0 }}>Notification <span className="gold">Center</span></h1>
                    <p style={{ color: '#888', marginTop: '0.4rem', fontSize: '0.85rem' }}>Manage priority service status and alerts.</p>
                </div>
                {myNotifications.length > 0 && (
                    <button
                        onClick={clearUserNotifications}
                        className="btn btn-secondary"
                        style={{ color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.05)', padding: '0.5rem 1rem', fontSize: '0.75rem' }}
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
                                    background: notif.read ? 'transparent' : 'rgba(201,169,106, 0.08)',
                                    display: 'flex',
                                    gap: '1.2rem',
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    position: 'relative',
                                    borderLeft: notif.read ? '3px solid transparent' : '4px solid var(--color-gold)',
                                    boxShadow: notif.read ? 'none' : '0 2px 8px rgba(201,169,106,0.15)'
                                }}
                                onClick={() => {
                                    setSelectedNotif(notif);
                                    if (!notif.read) markNotificationRead(notif.id);
                                }}
                                whileHover={{ background: notif.read ? 'rgba(255,255,255,0.02)' : 'rgba(201,169,106,0.08)' }}
                            >
                                {!notif.read && (
                                    <div style={{
                                        position: 'absolute', top: '1rem', right: '1.5rem',
                                        background: 'linear-gradient(135deg, var(--color-gold) 0%, #d4af37 100%)',
                                        color: '#000',
                                        fontSize: '0.6rem', fontWeight: '900', padding: '4px 12px',
                                        borderRadius: '6px', letterSpacing: '0.05em',
                                        boxShadow: '0 4px 12px rgba(201,169,106,0.4)',
                                        animation: 'pulse 2s infinite'
                                    }}>NEW</div>
                                )}
                                <div style={{
                                    width: '45px', height: '45px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.02)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                                    flexShrink: 0
                                }}>
                                    {getIcon(notif.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', flexDirection: window.innerWidth < 640 ? 'column' : 'row', justifyContent: 'space-between', marginBottom: '0.8rem', gap: '0.5rem' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ color: notif.read ? '#555' : 'var(--color-gold)', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.2rem', opacity: notif.read ? 0.4 : 0.8 }}>Priority Alert</div>
                                            <h3 style={{ color: notif.read ? '#aaa' : '#fff', fontSize: '1.1rem', margin: 0, fontWeight: notif.read ? '600' : '800' }}>{notif.title}</h3>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#555', fontSize: '0.7rem' }}>
                                            <FiClock size={12} /> {formatTime(notif.timestamp)}
                                        </div>
                                    </div>

                                    <div style={{
                                        padding: '1.2rem',
                                        background: notif.read ? 'rgba(255,255,255,0.005)' : 'rgba(255,255,255,0.02)',
                                        borderRadius: '14px',
                                        border: notif.read ? '1px solid rgba(255,255,255,0.02)' : '1px solid rgba(201,169,106,0.1)',
                                        marginTop: '0.5rem'
                                    }}>
                                        <p style={{ color: notif.read ? '#777' : '#aaa', margin: 0, fontSize: '0.95rem', lineHeight: '1.6', fontWeight: notif.read ? '300' : '400' }}>{notif.message}</p>
                                    </div>

                                    {!notif.read && (
                                        <div style={{ marginTop: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <div style={{ height: '3px', width: '30px', background: 'var(--color-gold)', borderRadius: '2px' }}></div>
                                            <div style={{ color: 'var(--color-gold)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.1em' }}>UNREAD</div>
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

            <AnimatePresence>
                {selectedNotif && (
                    <div className="modal active" onClick={() => setSelectedNotif(null)} style={{ zIndex: 9999 }}>
                        <motion.div
                            className="modal-content glass-modal"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            style={{
                                maxWidth: '550px',
                                padding: '2.5rem',
                                borderRadius: '30px',
                                background: 'rgba(10,10,10,0.95)',
                                backdropFilter: 'blur(40px)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                position: 'relative'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedNotif(null)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}
                            >
                                <FiX size={20} />
                            </button>

                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '60px', height: '60px', borderRadius: '18px',
                                    background: 'rgba(251,191,36,0.1)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                                    flexShrink: 0, color: 'var(--color-gold)', border: '1px solid rgba(251,191,36,0.1)'
                                }}>
                                    {getIcon(selectedNotif.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '0.6rem', opacity: 0.5 }}>Communication Subject</div>
                                    <h2 style={{ color: '#fff', fontSize: '2.2rem', margin: 0, fontWeight: '800', fontFamily: 'var(--font-heading)', lineHeight: '1.2' }}>{selectedNotif.title}</h2>
                                </div>
                            </div>

                            <div style={{
                                background: 'rgba(255,255,255,0.015)',
                                padding: '2.5rem',
                                borderRadius: '25px',
                                color: '#efefff',
                                fontSize: '1.15rem',
                                lineHeight: '1.8',
                                border: '1px solid rgba(255,255,255,0.03)',
                                marginBottom: '2.5rem',
                                whiteSpace: 'pre-wrap',
                                fontWeight: '300',
                                fontFamily: 'var(--font-heading)'
                            }}>
                                {selectedNotif.message}

                                {selectedNotif.data?.invoiceId && (
                                    <div style={{
                                        marginTop: '2rem',
                                        padding: '1.5rem',
                                        background: 'rgba(251,191,36,0.02)',
                                        border: '1px solid rgba(251,191,36,0.1)',
                                        borderRadius: '15px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--color-gold)', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1rem' }}>
                                            <FiFileText /> INVOICE DISCLOSURE
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                                            <div>
                                                <div style={{ color: '#444', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '900' }}>Invoice Number</div>
                                                <div style={{ color: '#fff' }}>#{selectedNotif.data.invoiceId}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: '#444', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '900' }}>Billing Category</div>
                                                <div style={{ color: '#fff' }}>{selectedNotif.data.planName}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: '#444', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '900' }}>Settlement Amount</div>
                                                <div style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>${selectedNotif.data.amount}</div>
                                            </div>
                                            <div>
                                                <div style={{ color: '#444', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '900' }}>Orchestration Hub</div>
                                                <div style={{ color: '#fff' }}>{selectedNotif.data.gateway || 'Standard'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a1a1a', paddingTop: '1.5rem' }}>
                                <div style={{ color: '#444', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                    RECEIVED: {formatTime(selectedNotif.timestamp)}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '0.05em', flex: '1 1 auto', minWidth: '140px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedNotif(null);
                                            navigate('/dashboard');
                                        }}
                                    >
                                        GO TO HUB
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '0.05em', flex: '1 1 auto', minWidth: '120px' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(selectedNotif.id);
                                            setSelectedNotif(null);
                                        }}
                                    >
                                        DISMISS
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserNotificationCenter;
