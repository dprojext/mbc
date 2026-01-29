import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FiCalendar, FiCreditCard, FiMessageSquare, FiBell, FiChevronRight, FiCheckCircle, FiClock, FiStar, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserOverview = () => {
    const { user } = useAuth();
    const data = useData() || {};
    const { bookings = [], userNotifications = [], plans = [] } = data;

    // Data filtering
    const myBookings = bookings.filter(b => b.customer_id === user?.id || b.email === user?.email);
    const myNotifications = userNotifications.filter(n => n.user_id === user?.id).slice(0, 3);
    const activeSubscription = user?.subscriptionPlan || 'No Active Plan';

    const nextWash = myBookings
        .filter(b => b.status === 'Confirmed' || b.status === 'Approved' || b.status === 'Pending')
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

    const calculateTotalSpent = () => {
        return myBookings.reduce((acc, booking) => {
            const p = booking.price;
            const isValidPrice = p !== null && p !== undefined && String(p) !== 'null' && String(p) !== 'undefined' && String(p) !== '';

            if (isValidPrice) {
                const matches = String(p).match(/\d+/);
                return acc + (matches ? Number(matches[0]) : 0);
            }

            const svc = (data.services || []).find(s => s.title === booking.service);
            if (svc) {
                const matches = String(svc.price).match(/\d+/);
                return acc + (matches ? Number(matches[0]) : 0);
            }

            return acc;
        }, 0);
    };

    const stats = [
        { label: 'Upcoming Wash', value: nextWash ? `${nextWash.date} @ ${nextWash.time}` : 'None', icon: <FiCalendar />, color: 'var(--color-gold)' },
        { label: 'Current Plan', value: activeSubscription.toUpperCase(), icon: <FiStar />, color: 'var(--color-gold)' },
        { label: 'Assets Spent', value: `$${calculateTotalSpent().toLocaleString()}`, icon: <FiCreditCard />, color: 'var(--color-gold)' },
        { label: 'Alerts', value: userNotifications.filter(n => n.user_id === user?.id && !n.read).length, icon: <FiBell />, color: 'var(--color-gold)' }
    ];

    return (
        <div className="user-overview">
            {/* Header removed: handled by UserDashboard executive header */}

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {stats.map((stat, idx) => {
                    const paths = {
                        'Upcoming Wash': '/dashboard/bookings',
                        'Current Plan': '/dashboard/subscription',
                        'Assets Spent': '/dashboard/bookings',
                        'Alerts': '/dashboard/notifications'
                    };
                    return (
                        <Link key={idx} to={paths[stat.label]} style={{ textDecoration: 'none' }}>
                            <motion.div
                                className="admin-stat-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{ padding: '1.2rem', cursor: 'pointer', height: '100%' }}
                                whileHover={{ translateY: -5, borderColor: 'var(--color-gold)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, fontSize: '1rem' }}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</div>
                                <div style={{ color: '#666', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>

            <div className="admin-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Quick Access - MOVED UP and EXPANDED */}
                    <div className="admin-card">
                        <div style={{ color: 'var(--color-gold)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem', opacity: 0.6 }}>Executive Portal</div>
                        <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: '800' }}>Quick Actions</h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
                            gap: '1rem'
                        }}>
                            <Link to="/booking" className="admin-nav-item" style={{ flexDirection: 'column', gap: '0.6rem', textAlign: 'center', padding: '1.2rem', background: 'rgba(201,169,106,0.05)', border: '1px solid rgba(201,169,106,0.1)' }}>
                                <FiCalendar color="var(--color-gold)" size={22} />
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>Book Wash</span>
                            </Link>
                            <Link to="/dashboard/subscription" className="admin-nav-item" style={{ flexDirection: 'column', gap: '0.6rem', textAlign: 'center', padding: '1.2rem' }}>
                                <FiStar color="var(--color-gold)" size={22} />
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>My Plan</span>
                            </Link>
                            <Link to="/dashboard/payments" className="admin-nav-item" style={{ flexDirection: 'column', gap: '0.6rem', textAlign: 'center', padding: '1.2rem' }}>
                                <FiCreditCard color="var(--color-gold)" size={22} />
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>Settlements</span>
                            </Link>
                            <Link to="/dashboard/chat" className="admin-nav-item" style={{ flexDirection: 'column', gap: '0.6rem', textAlign: 'center', padding: '1.2rem' }}>
                                <FiMessageSquare color="var(--color-gold)" size={22} />
                                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}>Support</span>
                            </Link>
                        </div>
                    </div>

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
                                        background: booking.status === 'Confirmed' || booking.status === 'Approved' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                                        color: booking.status === 'Confirmed' || booking.status === 'Approved' ? '#4caf50' : '#ff9800'
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
                            {userNotifications
                                .filter(n => n.user_id === user?.id)
                                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                                .slice(0, 3)
                                .map(notif => (
                                    <Link
                                        key={notif.id}
                                        to="/dashboard/notifications"
                                        state={{ openNotifId: notif.id }}
                                        style={{ textDecoration: 'none', display: 'block' }}
                                    >
                                        <div style={{ padding: '0.8rem', borderLeft: '3px solid var(--color-gold)', background: 'rgba(255,255,255,0.02)', borderRadius: '0 8px 8px 0', cursor: 'pointer', transition: '0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        >
                                            <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>{notif.title}</div>
                                            <div style={{ color: '#666', fontSize: '0.75rem' }}>{notif.message.substring(0, 60)}...</div>
                                        </div>
                                    </Link>
                                ))}
                            {userNotifications.filter(n => n.user_id === user?.id).length === 0 && (
                                <p style={{ color: '#444', textAlign: 'center', padding: '1rem' }}>No new notifications.</p>
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                            <Link to="/dashboard/notifications" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center', fontSize: '0.8rem' }}>
                                View Full Broadcast Hub
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserOverview;
