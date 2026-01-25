import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FiCalendar, FiCreditCard, FiMessageSquare, FiBell, FiChevronRight, FiCheckCircle, FiClock, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserOverview = () => {
    const { user } = useAuth();
    const { bookings = [], userNotifications = [], plans = [] } = useData();

    // Data filtering
    const myBookings = bookings.filter(b => b.customer_id === user?.id || b.email === user?.email);
    const myNotifications = userNotifications.filter(n => n.user_id === user?.id).slice(0, 3);
    const activeSubscription = user?.subscriptionPlan || 'No Active Plan';

    const stats = [
        { label: 'Upcoming Wash', value: myBookings.find(b => b.status === 'Confirmed')?.date || 'None', icon: <FiCalendar />, color: 'var(--color-gold)' },
        { label: 'Current Plan', value: activeSubscription, icon: <FiStar />, color: '#4caf50' },
        { label: 'Notifications', value: userNotifications.filter(n => n.user_id === user?.id && !n.read).length, icon: <FiBell />, color: '#2196f3' }
    ];

    return (
        <div className="user-overview">
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Welcome back, <span className="gold">{user?.name?.split(' ')[0]}</span></h1>
                <p style={{ color: '#888', marginTop: '0.5rem' }}>Here's what's happening with your vehicles today.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        className="admin-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                                {stat.icon}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.2rem' }}>{stat.value}</div>
                        <div style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="admin-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Recent Bookings */}
                    <div className="admin-card">
                        <div className="admin-flex-between" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>Recent Activity</h3>
                            <Link to="/dashboard/bookings" style={{ color: 'var(--color-gold)', fontSize: '0.85rem', textDecoration: 'none' }}>View All</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {myBookings.length > 0 ? myBookings.slice(0, 3).map(booking => (
                                <div key={booking.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(201,169,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}>
                                            <FiClock />
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{booking.service}</div>
                                            <div style={{ color: '#666', fontSize: '0.75rem' }}>{booking.date} at {booking.time}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold',
                                        background: booking.status === 'Confirmed' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                                        color: booking.status === 'Confirmed' ? '#4caf50' : '#ff9800'
                                    }}>
                                        {booking.status}
                                    </span>
                                </div>
                            )) : (
                                <p style={{ color: '#444', textAlign: 'center', padding: '1rem' }}>No recent bookings.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Notifications Catchup */}
                    <div className="admin-card">
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Latest Alerts</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {myNotifications.length > 0 ? myNotifications.map(notif => (
                                <div key={notif.id} style={{ padding: '0.8rem', borderLeft: '3px solid var(--color-gold)', background: 'rgba(255,255,255,0.02)', borderRadius: '0 8px 8px 0' }}>
                                    <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>{notif.title}</div>
                                    <div style={{ color: '#666', fontSize: '0.75rem' }}>{notif.message.substring(0, 60)}...</div>
                                </div>
                            )) : (
                                <p style={{ color: '#444', textAlign: 'center', padding: '1rem' }}>No new notifications.</p>
                            )}
                        </div>
                        <Link to="/dashboard/notifications" className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem', fontSize: '0.8rem' }}>
                            Open Notification Center
                        </Link>
                    </div>

                    {/* Quick Access */}
                    <div className="admin-card">
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                            <Link to="/booking" className="admin-nav-item" style={{ flexDirection: 'column', gap: '0.5rem', textAlign: 'center', padding: '1rem' }}>
                                <FiCalendar color="var(--color-gold)" size={20} />
                                <span style={{ fontSize: '0.75rem' }}>Book Now</span>
                            </Link>
                            <Link to="/dashboard/chat" className="admin-nav-item" style={{ flexDirection: 'column', gap: '0.5rem', textAlign: 'center', padding: '1rem' }}>
                                <FiMessageSquare color="#2196f3" size={20} />
                                <span style={{ fontSize: '0.75rem' }}>Support</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOverview;
