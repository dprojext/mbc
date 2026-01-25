import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { FiDollarSign, FiUsers, FiCalendar, FiStar, FiPlus, FiDownload, FiArrowUpRight, FiArrowDownRight, FiClock, FiActivity, FiPackage, FiSettings, FiMessageCircle } from 'react-icons/fi';

const AdminOverview = () => {
    const navigate = useNavigate();
    const { transactions = [], plans = [], bookings = [], settings, conversations = [] } = useData();
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [selectedStat, setSelectedStat] = useState(null);
    const [timeFilter, setTimeFilter] = useState('All');

    const filterByDate = (list, range, dateKey = 'date') => {
        if (range === 'All') return list;
        const now = new Date();
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
        if (label === 'Website Traffic') return { value: range === 'All' ? (settings?.viewCount || 0).toLocaleString() : 'N/A', change: 'History N/A' };
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
        if (label === 'Support Tix') return { value: `${openTickets} Open`, change: 'Active' };
        if (label === 'Failed Payments') {
            const val = filteredTransactions.filter(t => t.status === 'Failed').length;
            return { value: val, change: val > 0 ? 'Alert' : 'Stable' };
        }
        return { value: '0', change: 'N/A' };
    };

    const modalMetric = selectedStat ? getStatData(selectedStat.label, timeFilter) : { value: '0', change: '' };

    // Dynamic Stats
    const totalRevenue = transactions
        .filter(t => t.status === 'Completed')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const activeMembers = plans
        .reduce((acc, curr) => acc + (curr.activeUsers || 0), 0);

    // Calculate Popularity
    const serviceCounts = (bookings || []).reduce((acc, b) => { if (b?.service) acc[b.service] = (acc[b.service] || 0) + 1; return acc; }, {});
    const popularService = Object.entries(serviceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    // Calculate Bookings Today (matching today's date)
    const today = new Date().toISOString().split('T')[0];
    const bookingsToday = bookings.filter(b => b.date === today).length;
    const bookingsYesterday = (bookings || []).filter(b => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return b?.date === d.toISOString().split('T')[0];
    }).length;

    // Calculate Change percentage for bookings
    const rawBookingChange = (bookingsYesterday === 0) ? (bookingsToday > 0 ? 100 : 0) : ((bookingsToday - bookingsYesterday) / bookingsYesterday) * 100;
    const bookingChange = `${rawBookingChange >= 0 ? '+' : ''}${rawBookingChange.toFixed(1)}%`;

    // Additional Metrics
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const failedPayments = transactions.filter(t => t.status === 'Failed').length;

    // Calculate Average Rating from completed bookings that have a rating
    const ratings = bookings.filter(b => b.rating).map(b => b.rating);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';

    // Calculate Open Support Tickets (assuming all active conversations are open for now)
    const openTickets = conversations.length;

    const stats = [
        {
            label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, change: totalRevenue > 0 ? 'N/A' : '0%', positive: true, icon: <FiDollarSign />, path: '/admin/payments', description: 'Gross revenue from all completed transactions.'
        },
        {
            label: 'Website Traffic', value: (settings?.viewCount || 0).toLocaleString(), change: 'N/A', positive: true, icon: <FiActivity />, path: '/admin/analytics', description: 'Total unique visits to the landing page.'
        },
        {
            label: 'Popular Package', value: popularService, change: 'Trending', positive: true, icon: <FiPackage />, path: '/admin/services', description: 'Most booked service type.'
        },
        {
            label: 'Membership', value: `${activeMembers} Active`, change: bookingChange, positive: true, icon: <FiUsers />, path: '/admin/subscriptions', description: 'Active recurring subscribers.'
        },
        {
            label: 'Pending Bookings', value: pendingBookings, change: pendingBookings > 0 ? 'Needs Action' : 'All Clear', positive: pendingBookings === 0, icon: <FiClock />, path: '/admin/calendar', description: 'Appointments awaiting approval.'
        },
        {
            label: 'Avg. Rating', value: avgRating, change: 'N/A', positive: true, icon: <FiStar />, path: '/admin/analytics', description: 'Average customer feedback score.'
        },
        {
            label: 'Support Tix', value: `${openTickets} Open`, change: 'N/A', positive: true, icon: <FiMessageCircle />, path: '/admin/chat', description: 'Unresolved support conversations.'
        },
        {
            label: 'Failed Payments', value: failedPayments, change: failedPayments > 0 ? 'Alert' : 'Stable', positive: false, icon: <FiActivity />, path: '/admin/payments', description: 'Transactions that could not be processed.'
        }
    ];

    // Dynamic Recent Activity from Transactions
    const recentActivity = (Array.isArray(transactions) ? transactions : []).slice(0, 5).map((trx) => ({
        id: trx?.id || Math.random(),
        text: trx?.status === 'Completed' ? `Payment Received` : `Payment ${trx?.status || 'Unknown'}`,
        user: trx?.user || 'Guest',
        email: `${(trx?.user || 'Guest').toString().toLowerCase().replace(/\s/g, '.')}@example.com`,
        time: trx?.date || 'Today',
        type: trx?.status === 'Completed' ? 'success' : trx?.status === 'Pending' ? 'info' : 'warning',
        details: `${trx?.type || 'Misc'} - $${Number(trx?.amount || 0).toFixed(2)}`,
        path: '/admin/payments'
    }));

    const quickActions = [
        {
            label: 'Add User', icon: <FiUsers />, path: '/admin/users', color: '#4caf50', description: 'Create new member account'
        },
        {
            label: 'New Plan', icon: <FiPackage />, path: '/admin/subscriptions', color: 'var(--color-gold)', description: 'Create subscription plan'
        },
        {
            label: 'Export', icon: <FiDownload />, path: '/admin/data', color: '#29b6f6', description: 'Export data & reports'
        },
        {
            label: 'Settings', icon: <FiSettings />, path: '/admin/content', color: '#9c27b0', description: 'Platform configuration'
        }
    ];

    // Dynamic Top Members from Transactions
    const memberSpending = transactions.reduce((acc, curr) => {
        if (curr.status === 'Completed') {
            acc[curr.user] = (acc[curr.user] || 0) + curr.amount;
        }
        return acc;
    }, {});

    const topMembers = Object.entries(memberSpending)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, spent], idx) => ({
            id: idx + 1,
            name,
            plan: 'Member',
            spent: `$${spent.toLocaleString()}`,
            avatar: name.charAt(0),
            email: `${name.toLowerCase().replace(' ', '.')}@member.com`,
            joinDate: 'New'
        }));

    const [selectedMember, setSelectedMember] = useState(null);

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Activity Detail Modal */}
            {selectedActivity && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <div
                        style={{
                            background: '#1a1a1a',
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid #333',
                            maxWidth: '450px',
                            width: '90%'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ color: '#fff', margin: 0, marginBottom: '0.3rem' }}>{selectedActivity.text}</h3>
                                <div style={{ color: '#888', fontSize: '0.85rem' }}>{selectedActivity.time}</div>
                            </div>
                            <button
                                onClick={() => setSelectedActivity(null)}
                                style={{ background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}
                            >×</button>
                        </div>

                        <div style={{ background: '#111', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                            <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>User</div>
                            <div style={{ color: '#fff', fontWeight: '500' }}>{selectedActivity.user}</div>
                            <div style={{ color: '#666', fontSize: '0.85rem' }}>{selectedActivity.email}</div>
                        </div>

                        <div style={{ background: '#111', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                            <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Details</div>
                            <div style={{ color: '#ccc' }}>{selectedActivity.details}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setSelectedActivity(null)}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: 'transparent',
                                    border: '1px solid #333',
                                    color: '#888',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    navigate(selectedActivity.path);
                                    setSelectedActivity(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: 'var(--color-gold)',
                                    border: 'none',
                                    color: '#000',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                View Details →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Member Detail Modal */}
            {selectedMember && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <div
                        style={{
                            background: '#1a1a1a',
                            padding: '2rem',
                            borderRadius: '16px',
                            border: '1px solid #333',
                            maxWidth: '450px',
                            width: '90%'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                fontWeight: '600',
                                color: '#000'
                            }}>
                                {selectedMember.avatar}
                            </div>
                            <div>
                                <h3 style={{ color: '#fff', margin: 0 }}>{selectedMember.name}</h3>
                                <div style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}>{selectedMember.plan} Member</div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: '#111', padding: '1rem', borderRadius: '10px' }}>
                                <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Total Spent</div>
                                <div style={{ color: '#4caf50', fontWeight: '600', fontSize: '1.2rem' }}>{selectedMember.spent}</div>
                            </div>
                            <div style={{ background: '#111', padding: '1rem', borderRadius: '10px' }}>
                                <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Member Since</div>
                                <div style={{ color: '#fff', fontWeight: '500' }}>{selectedMember.joinDate}</div>
                            </div>
                        </div>

                        <div style={{ background: '#111', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                            <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Contact</div>
                            <div style={{ color: '#ccc' }}>{selectedMember.email}</div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setSelectedMember(null)}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: 'transparent',
                                    border: '1px solid #333',
                                    color: '#888',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    navigate('/admin/users');
                                    setSelectedMember(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    background: 'var(--color-gold)',
                                    border: 'none',
                                    color: '#000',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                Manage User →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stat Detail Modal */}
            {selectedStat && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    <div
                        style={{
                            background: '#1a1a1a',
                            padding: '2.5rem',
                            borderRadius: '20px',
                            border: '1px solid #333',
                            maxWidth: '500px',
                            width: '90%',
                            position: 'relative'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedStat(null)}
                            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#666', fontSize: '1.5rem', cursor: 'pointer' }}
                        >×</button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '15px',
                                background: 'rgba(var(--color-gold-rgb), 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-gold)'
                            }}>
                                {selectedStat.icon}
                            </div>
                            <div>
                                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.5rem' }}>{selectedStat.label} Analysis</h3>
                                <p style={{ color: '#666', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>Comprehensive performance metrics</p>
                            </div>
                        </div>

                        <div style={{ background: '#111', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid #222' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #222' }}>
                                {['24h', '7d', '30d', 'All'].map(range => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeFilter(range)}
                                        style={{
                                            background: timeFilter === range ? '#fff' : '#222',
                                            border: 'none',
                                            color: timeFilter === range ? '#000' : '#888',
                                            padding: '0.4rem 0.8rem',
                                            borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s',
                                            fontWeight: timeFilter === range ? 'bold' : 'normal'
                                        }}
                                        onMouseOver={e => { if (timeFilter !== range) e.currentTarget.style.color = '#fff'; }}
                                        onMouseOut={e => { if (timeFilter !== range) e.currentTarget.style.color = '#888'; }}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Current Metric</div>
                                    <div style={{ color: '#fff', fontSize: '2.4rem', fontWeight: '800' }}>{modalMetric.value}</div>
                                </div>
                                <div style={{
                                    color: selectedStat.positive ? '#4caf50' : '#ff4444',
                                    fontSize: '0.9rem',
                                    fontWeight: '600',
                                    padding: '0.3rem 0.8rem',
                                    background: selectedStat.positive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                                    borderRadius: '50px',
                                    marginBottom: '0.5rem'
                                }}>
                                    {modalMetric.change}
                                </div>
                            </div>
                            <div style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                {selectedStat.description}
                                <br /><br />
                                {selectedStat.label === 'Total Revenue' && "Accumulated revenue from all completed transactions. Use the time filters above to analyze specific periods."}
                                {selectedStat.label === 'Pending Bookings' && "Number of customer appointments waiting for admin confirmation. Prompt action helps improve customer satisfaction."}
                                {selectedStat.label === 'Failed Payments' && "Transactions that failed due to gateway errors or insufficient funds. Check the Payments tab for details."}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setSelectedStat(null)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: 'transparent',
                                    border: '1px solid #333',
                                    color: '#888',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={() => {
                                    navigate(`${selectedStat.path}?range=${timeFilter}`);
                                    setSelectedStat(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    background: 'var(--color-gold)',
                                    border: 'none',
                                    color: '#000',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '700'
                                }}
                            >
                                Deep Analysis →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '2rem'
            }}>
                <div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#555',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        marginBottom: '0.4rem'
                    }}>
                        Overview
                    </div>
                    <h1 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2.2rem',
                        margin: 0,
                        color: '#fff'
                    }}>
                        Dashboard
                    </h1>
                    <p style={{ color: '#666', marginTop: '0.4rem', fontSize: '0.9rem' }}>
                        Welcome back! Click any card to explore details.
                    </p>
                </div>
                <Link
                    to="/admin/analytics"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'rgba(76, 175, 80, 0.1)',
                        padding: '0.5rem 1rem',
                        borderRadius: '50px',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#4caf50',
                        boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)',
                        animation: 'pulse 2s ease-in-out infinite'
                    }} />
                    <span style={{ fontSize: '0.8rem', color: '#4caf50', fontWeight: '500' }}>System Online</span>
                </Link>
            </div>

            {/* Clickable Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.2rem',
                marginBottom: '1.5rem'
            }}>
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedStat(stat)}
                        style={{
                            background: 'rgba(20,20,20,0.8)',
                            padding: '1.3rem',
                            borderRadius: '14px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.borderColor = 'rgba(var(--color-gold-rgb), 0.3)';
                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            fontSize: '3.5rem',
                            opacity: 0.04
                        }}>
                            {stat.icon}
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.8rem'
                        }}>
                            <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>{stat.icon}</div>
                            <div style={{
                                color: stat.positive ? '#4caf50' : '#ff4444',
                                fontSize: '0.75rem',
                                background: stat.positive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '20px',
                                fontWeight: '500'
                            }}>
                                {stat.change}
                            </div>
                        </div>
                        <div style={{
                            fontSize: '1.8rem',
                            fontWeight: '700',
                            color: '#fff',
                            lineHeight: 1,
                            marginBottom: '0.4rem'
                        }}>
                            {stat.value}
                        </div>
                        <div style={{
                            color: '#666',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                        }}>
                            {stat.label}
                        </div>
                        <div style={{
                            color: 'var(--color-gold)',
                            fontSize: '0.7rem',
                            marginTop: '0.6rem',
                            opacity: 0.8
                        }}>
                            {stat.description} →
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.2rem' }}>

                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    {/* Clickable Quick Actions */}
                    <div style={{
                        background: 'rgba(20,20,20,0.8)',
                        padding: '1.3rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <h3 style={{
                            marginBottom: '1rem',
                            fontSize: '0.95rem',
                            color: '#aaa',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>⚡</span> Quick Actions
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
                            {quickActions.map((action, idx) => (
                                <Link
                                    key={idx}
                                    to={action.path}
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        textAlign: 'center',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = action.color;
                                        e.currentTarget.style.transform = 'scale(1.03)';
                                        e.currentTarget.style.background = action.color === 'var(--color-gold)' ? 'rgba(var(--color-gold-rgb), 0.1)' : `rgba(${action.color === '#4caf50' ? '76,175,80' : action.color === '#29b6f6' ? '41,182,246' : '156,39,176'}, 0.1)`;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
                                    }}
                                >
                                    <div style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>{action.icon}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#ccc', marginBottom: '0.3rem' }}>{action.label}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#555' }}>{action.description}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Clickable Top Members */}
                    <div style={{
                        background: 'rgba(20,20,20,0.8)',
                        padding: '1.3rem',
                        borderRadius: '14px',
                        border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{
                                fontSize: '0.95rem',
                                color: '#aaa',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                margin: 0
                            }}>
                                <span>🏆</span> Top Members
                            </h3>
                            <Link to="/admin/users" style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textDecoration: 'none' }}>View All →</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {topMembers.map((member, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedMember(member)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.9rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        borderRadius: '10px',
                                        border: '1px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(var(--color-gold-rgb), 0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(var(--color-gold-rgb), 0.2)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '600',
                                            color: '#000',
                                            fontSize: '0.9rem'
                                        }}>
                                            {member.avatar}
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '500', fontSize: '0.9rem' }}>{member.name}</div>
                                            <div style={{ color: '#666', fontSize: '0.75rem' }}>{member.plan} • Click to view</div>
                                        </div>
                                    </div>
                                    <div style={{
                                        color: 'var(--color-gold)',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}>
                                        {member.spent}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Clickable Live Activity */}
                <div style={{
                    background: 'rgba(20,20,20,0.8)',
                    padding: '1.3rem',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    height: 'fit-content'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                    }}>
                        <h3 style={{
                            fontSize: '0.95rem',
                            color: '#aaa',
                            margin: 0,
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span>🔔</span> Live Activity
                        </h3>
                        <span style={{
                            fontSize: '0.6rem',
                            background: 'rgba(76, 175, 80, 0.15)',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            color: '#4caf50',
                            fontWeight: '500'
                        }}>
                            LIVE
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {recentActivity.map(activity => (
                            <div
                                key={activity.id}
                                onClick={() => setSelectedActivity(activity)}
                                style={{
                                    display: 'flex',
                                    gap: '0.8rem',
                                    alignItems: 'flex-start',
                                    padding: '0.8rem',
                                    background: 'rgba(0,0,0,0.2)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    border: '1px solid transparent',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    marginTop: '5px',
                                    flexShrink: 0,
                                    background: activity.type === 'success' ? '#4caf50' : activity.type === 'warning' ? '#ff9800' : '#29b6f6',
                                    boxShadow: `0 0 8px ${activity.type === 'success' ? 'rgba(76, 175, 80, 0.5)' : activity.type === 'warning' ? 'rgba(255, 152, 0, 0.5)' : 'rgba(41, 182, 246, 0.5)'}`
                                }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.85rem', color: '#ddd', marginBottom: '0.15rem' }}>{activity.text}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#777' }}>{activity.user}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#555', marginTop: '0.3rem' }}>{activity.time} • Click for details</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Link
                        to="/admin/payments"
                        style={{
                            display: 'block',
                            width: '100%',
                            padding: '0.9rem',
                            marginTop: '0.8rem',
                            background: 'transparent',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            color: '#666',
                            textAlign: 'center',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(var(--color-gold-rgb), 0.3)';
                            e.currentTarget.style.color = 'var(--color-gold)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            e.currentTarget.style.color = '#666';
                        }}
                    >
                        View Full History →
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default AdminOverview;
