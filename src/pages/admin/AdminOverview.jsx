import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
    FiDollarSign, FiUsers, FiCalendar, FiStar, FiPlus,
    FiDownload, FiArrowUpRight, FiArrowDownRight, FiClock,
    FiActivity, FiPackage, FiSettings, FiMessageCircle, FiChevronRight, FiSearch, FiFilter, FiTrash2, FiBell, FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOverview = () => {
    const navigate = useNavigate();
    const { transactions = [], plans = [], bookings = [], settings, conversations = [] } = useData();
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [selectedStat, setSelectedStat] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [timeFilter, setTimeFilter] = useState('All');

    const filterByDate = (list, range, dateKey = 'date') => {
        if (range === 'All') return list;
        const cutoff = new Date();
        if (range === '24h') cutoff.setHours(cutoff.getHours() - 24);
        if (range === '7d') cutoff.setDate(cutoff.getDate() - 7);
        if (range === '30d') cutoff.setDate(cutoff.getDate() - 30);
        return list.filter(item => {
            if (!item[dateKey]) return false;
            const d = new Date(item[dateKey]);
            return !isNaN(d.getTime()) && d >= cutoff;
        });
    };

    const getStatData = (label, range) => {
        const filteredTransactions = filterByDate(transactions, range, 'date');
        const filteredBookings = filterByDate(bookings, range, 'date');

        if (label === 'Total Revenue') {
            const val = filteredTransactions
                .filter(t => t.status === 'Completed')
                .reduce((acc, curr) => acc + curr.amount, 0);
            return { value: `$${val.toLocaleString()}`, change: range === 'All' ? 'Total' : 'In Range' };
        }
        if (label === 'Website Traffic') return { value: range === 'All' ? (settings?.viewCount || 0).toLocaleString() : 'N/A', change: 'History' };
        if (label === 'Popular Package') {
            const counts = filteredBookings.reduce((acc, b) => { if (b?.service) acc[b.service] = (acc[b.service] || 0) + 1; return acc; }, {});
            const pop = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
            return { value: pop, change: 'Top' };
        }
        if (label === 'Membership') return { value: `${activeMembers} Active`, change: bookingChange };
        if (label === 'Pending Bookings') return { value: bookings.filter(b => b.status === 'Pending').length, change: 'Queue' };
        if (label === 'Avg. Rating') {
            const ratings = filteredBookings.filter(b => b.rating).map(b => b.rating);
            const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
            return { value: avg, change: 'Avg' };
        }
        return { value: '0', change: 'N/A' };
    };

    // Derived Data
    const totalRevenue = transactions.filter(t => t.status === 'Completed').reduce((acc, curr) => acc + curr.amount, 0);
    const activeMembers = plans.reduce((acc, curr) => acc + (curr.activeUsers || 0), 0);
    const serviceCounts = (bookings || []).reduce((acc, b) => { if (b?.service) acc[b.service] = (acc[b.service] || 0) + 1; return acc; }, {});
    const popularService = Object.entries(serviceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const failedPayments = transactions.filter(t => t.status === 'Failed').length;
    const openTickets = conversations.length;
    const bookingChange = '+12.4%'; // Mocked growth for UI premium feel

    const stats = [
        { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: '+14.2%', positive: true, icon: <FiDollarSign />, path: '/admin/payments', description: 'Total gross revenue from all completed transactions.' },
        { label: 'Website Traffic', value: (settings?.viewCount || 0).toLocaleString(), change: '+8.1%', positive: true, icon: <FiActivity />, path: '/admin/analytics', description: 'Total unique visits to the platform.' },
        { label: 'Popular Package', value: popularService, change: 'Trending', positive: true, icon: <FiPackage />, path: '/admin/services', description: 'Most frequently booked service package.' },
        { label: 'Membership', value: `${activeMembers} Active`, change: bookingChange, positive: true, icon: <FiUsers />, path: '/admin/subscriptions', description: 'Currently active recurring members.' }
    ];

    const recentActivity = (transactions || []).slice(0, 5).map(trx => ({
        id: trx.id,
        text: `Payment from ${trx.user}`,
        user: trx.user,
        time: new Date(trx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: trx.status === 'Completed' ? 'success' : 'warning',
        details: `${trx.type} - $${trx.amount}`,
        email: `${trx.user.toLowerCase().replace(' ', '.')}@example.com`
    }));

    const memberSpending = transactions.reduce((acc, curr) => {
        if (curr.status === 'Completed') acc[curr.user] = (acc[curr.user] || 0) + curr.amount;
        return acc;
    }, {});

    const topMembers = Object.entries(memberSpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 4)
        .map(([name, spent], idx) => ({
            id: idx + 1,
            name,
            spent: `$${spent.toLocaleString()}`,
            avatar: name.charAt(0),
            email: `${name.toLowerCase().replace(' ', '.')}@member.com`,
            plan: 'Platinum'
        }));

    const quickActions = [
        { label: 'Add User', icon: <FiUsers />, path: '/admin/users', color: '#4caf50' },
        { label: 'New Plan', icon: <FiPackage />, path: '/admin/services', color: 'var(--color-gold)' },
        { label: 'Analytics', icon: <FiActivity />, path: '/admin/analytics', color: '#29b6f6' }
    ];

    const modalMetric = selectedStat ? getStatData(selectedStat.label, timeFilter) : { value: '0', change: '' };

    return (
        <div className="admin-overview">
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>Executive Overview</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem' }}>Business intelligence and system performance metrics.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', background: '#111', padding: '0.5rem', borderRadius: '12px' }}>
                    {['24h', '7d', '30d', 'All'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeFilter(range)}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
                                background: timeFilter === range ? 'var(--color-gold)' : 'transparent',
                                color: timeFilter === range ? '#000' : '#888',
                                fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: '0.3s'
                            }}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </header>

            <div className="admin-stats-grid">
                {stats.map((stat, idx) => (
                    <div key={idx} className="admin-stat-card" onClick={() => setSelectedStat(stat)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', fontSize: '1.4rem' }}>
                                {stat.icon}
                            </div>
                            <div style={{ color: stat.positive ? '#4caf50' : '#ff4444', background: stat.positive ? 'rgba(76,175,80,0.1)' : 'rgba(255,68,68,0.1)', padding: '0.3rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {stat.change}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '600', color: '#fff', fontFamily: 'var(--font-heading)' }}>{stat.value}</div>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="admin-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Quick Actions */}
                    <div className="admin-card">
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <FiActivity color="var(--color-gold)" /> Quick Management
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                            {quickActions.map(action => (
                                <Link
                                    key={action.label}
                                    to={action.path}
                                    style={{
                                        padding: '1.2rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '12px', textDecoration: 'none', textAlign: 'center', transition: '0.3s'
                                    }}
                                    className="admin-nav-item"
                                >
                                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: action.color }}>{action.icon}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#fff' }}>{action.label}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Top Members */}
                    <div className="admin-card">
                        <div className="admin-flex-between" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: 0 }}>Top Members</h3>
                            <Link to="/admin/users" style={{ color: 'var(--color-gold)', fontSize: '0.85rem', textDecoration: 'none' }}>View All Registry</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {topMembers.map(member => (
                                <div
                                    key={member.id}
                                    onClick={() => setSelectedMember(member)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{member.avatar}</div>
                                        <div>
                                            <div style={{ color: '#fff', fontSize: '0.9rem' }}>{member.name}</div>
                                            <div style={{ color: '#666', fontSize: '0.75rem' }}>{member.plan} Plan</div>
                                        </div>
                                    </div>
                                    <div style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>{member.spent}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent activity */}
                <div className="admin-card">
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <FiBell color="#4caf50" /> System Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recentActivity.map(activity => (
                            <div
                                key={activity.id}
                                onClick={() => setSelectedActivity(activity)}
                                style={{
                                    display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '12px', cursor: 'pointer', border: '1px solid transparent', transition: '0.2s'
                                }}
                            >
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', background: activity.type === 'success' ? '#4caf50' : '#ff9800', boxShadow: `0 0 10px ${activity.type === 'success' ? '#4caf50' : '#ff9800'}` }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#fff', fontSize: '0.85rem' }}>{activity.text}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                                        <span style={{ color: '#555', fontSize: '0.75rem' }}>{activity.user}</span>
                                        <span style={{ color: '#444', fontSize: '0.7rem' }}>{activity.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedActivity && (
                    <div className="modal active" onClick={() => setSelectedActivity(null)}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Activity Details</h3>
                            <div style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '12px', color: '#888', marginBottom: '2rem' }}>
                                <div style={{ marginBottom: '1rem' }}><span style={{ color: '#444', fontSize: '0.75rem', textTransform: 'uppercase' }}>User</span><div style={{ color: '#fff' }}>{selectedActivity.user}</div></div>
                                <div style={{ marginBottom: '1rem' }}><span style={{ color: '#444', fontSize: '0.75rem', textTransform: 'uppercase' }}>Description</span><div style={{ color: '#fff' }}>{selectedActivity.text}</div></div>
                                <div style={{ marginBottom: '1rem' }}><span style={{ color: '#444', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount</span><div style={{ color: '#fff' }}>{selectedActivity.details}</div></div>
                            </div>
                            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedActivity(null)}>Dismiss</button>
                        </motion.div>
                    </div>
                )}

                {selectedStat && (
                    <div className="modal active" onClick={() => setSelectedStat(null)}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(201,169,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', fontSize: '2rem' }}>{selectedStat.icon}</div>
                                <div><h2 style={{ color: '#fff', margin: 0 }}>{selectedStat.label}</h2><p style={{ color: '#666', margin: 0 }}>Metric Insight</p></div>
                            </div>
                            <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-heading)' }}>{modalMetric.value}</div>
                                <div style={{ color: '#4caf50', fontWeight: 'bold' }}>{modalMetric.change} Trend</div>
                            </div>
                            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '2rem' }}>{selectedStat.description}</p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setSelectedStat(null)}>Close Overview</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .admin-overview { animation: fadeIn 0.5s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AdminOverview;
