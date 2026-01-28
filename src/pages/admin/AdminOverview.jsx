import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
    FiDollarSign, FiUsers, FiCalendar, FiStar, FiPlus,
    FiDownload, FiArrowUpRight, FiArrowDownRight, FiClock,
    FiActivity, FiPackage, FiSettings, FiMessageCircle, FiChevronRight, FiSearch, FiFilter, FiTrash2, FiBell, FiX, FiUser
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar, Cell, YAxis } from 'recharts';

const AdminOverview = () => {
    const navigate = useNavigate();
    const { transactions = [], plans = [], bookings = [], settings, conversations = [], analytics = [], users = [] } = useData();
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [selectedStat, setSelectedStat] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [timeFilter, setTimeFilter] = useState('All');

    const filterByDate = (list, range, dateKey = 'date') => {
        if (range === 'All') return list;
        const cutoff = new Date();
        if (range === 'Day') cutoff.setHours(cutoff.getHours() - 24);
        if (range === 'Week') cutoff.setDate(cutoff.getDate() - 7);
        if (range === 'Month') cutoff.setDate(cutoff.getDate() - 30);
        return list.filter(item => {
            if (!item[dateKey]) return false;
            const d = new Date(item[dateKey]);
            return !isNaN(d.getTime()) && d >= cutoff;
        });
    };

    const getStatData = (label, range) => {
        const filteredTransactions = filterByDate(transactions, range, 'date');
        const filteredBookings = filterByDate(bookings, range, 'date');
        const filteredUsers = filterByDate(users, range, 'joined');
        const activeInPeriod = filteredUsers.filter(u => u.subscriptionPlan && (u.subscriptionPlan !== 'None' && u.subscriptionPlan !== 'No Plan')).length;

        if (label === 'Total Revenue') {
            const val = filteredTransactions
                .filter(t => t.status === 'Completed')
                .reduce((acc, curr) => acc + curr.amount, 0);
            const growth = getGrowth(transactions.filter(t => t.status === 'Completed'), range, 'date');
            return { value: `$${val.toLocaleString()}`, change: growth };
        }
        if (label === 'Website Traffic') {
            const growth = getGrowth(analytics, range, 'created_at');
            const totalViews = settings?.viewCount || analytics.length || 0;
            const filteredTraffic = filterByDate(analytics, range, 'created_at').length;
            return { value: range === 'All' ? totalViews.toLocaleString() : filteredTraffic.toLocaleString(), change: growth };
        }
        if (label === 'Popular Package') {
            const counts = filteredBookings.reduce((acc, b) => { if (b?.service) acc[b.service] = (acc[b.service] || 0) + 1; return acc; }, {});
            const pop = Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
            return { value: pop, change: 'Trending' };
        }
        if (label === 'Membership') {
            const growth = getGrowth(users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'None' && u.subscriptionPlan !== 'No Plan'), range, 'joined');
            const count = range === 'All' ? activeMembers : filteredUsers.filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'None' && u.subscriptionPlan !== 'No Plan').length;
            return { value: `${count} Active`, change: growth };
        }
        if (label === 'Pending Bookings') return { value: bookings.filter(b => b.status === 'Pending').length, change: 'Queue' };
        if (label === 'Avg. Rating') {
            const ratings = filteredBookings.filter(b => b.rating).map(b => b.rating);
            const avg = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
            return { value: avg, change: 'Avg' };
        }
        return { value: '0', change: '+0%' };
    };

    // Derived Data
    const activeMembers = users.filter(u => u.subscriptionPlan && (u.subscriptionPlan !== 'None' && u.subscriptionPlan !== 'No Plan')).length;
    const totalRevenue = transactions.filter(t => t.status === 'Completed').reduce((acc, curr) => acc + curr.amount, 0);
    const serviceCounts = (bookings || []).reduce((acc, b) => { if (b?.service) acc[b.service] = (acc[b.service] || 0) + 1; return acc; }, {});
    const popularService = Object.entries(serviceCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;
    const failedPayments = transactions.filter(t => t.status === 'Failed').length;
    const openTickets = conversations.length;

    const matrixData = useMemo(() => {
        const last6Months = [...Array(6)].map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return {
                name: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
                month: d.getMonth(),
                year: d.getFullYear()
            };
        });

        return last6Months.map(m => {
            const rev = transactions
                .filter(t => {
                    const d = new Date(t.date);
                    return d.getMonth() === m.month && d.getFullYear() === m.year && t.status === 'Completed';
                })
                .reduce((acc, curr) => acc + curr.amount, 0);

            const traffic = analytics.filter(e => {
                const d = new Date(e.created_at);
                return d.getMonth() === m.month && d.getFullYear() === m.year;
            }).length;

            return { name: m.name, revenue: rev, traffic: traffic };
        });
    }, [transactions, analytics]);

    const planDistribution = useMemo(() => {
        const counts = users.reduce((acc, u) => {
            const p = u.subscriptionPlan || 'None';
            acc[p] = (acc[p] || 0) + 1;
            return acc;
        }, {});
        const total = users.length || 1;
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            percentage: Math.round((value / total) * 100)
        })).sort((a, b) => b.value - a.value).slice(0, 4);
    }, [users]);

    // Dynamic Growth Calculations
    const getGrowth = (list, range, dateKey = 'date') => {
        if (!list || list.length === 0) return '+0%';

        const now = new Date();
        let days = 30;
        if (range === 'Day') days = 1;
        if (range === 'Week') days = 7;
        if (range === 'Month') days = 30;
        if (range === 'All') days = 90; // Default comparison for 'All' is last 90 days

        const periodMs = days * 24 * 60 * 60 * 1000;

        const currentPeriod = list.filter(item => {
            if (!item[dateKey]) return false;
            const d = new Date(item[dateKey]);
            return !isNaN(d.getTime()) && d >= new Date(now.getTime() - periodMs);
        });
        const previousPeriod = list.filter(item => {
            if (!item[dateKey]) return false;
            const d = new Date(item[dateKey]);
            const start = new Date(now.getTime() - (periodMs * 2));
            const end = new Date(now.getTime() - periodMs);
            return !isNaN(d.getTime()) && d >= start && d < end;
        });

        if (previousPeriod.length === 0) return currentPeriod.length > 0 ? '+100%' : '+0%';
        const diff = ((currentPeriod.length - previousPeriod.length) / previousPeriod.length) * 100;
        return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    const stats = [
        {
            label: 'Total Revenue',
            ...getStatData('Total Revenue', timeFilter),
            positive: true,
            color: '#2196f3',
            bgColor: 'rgba(33, 150, 243, 0.12)',
            icon: <FiDollarSign />,
            path: '/admin/payments',
            description: 'Total cumulative gross revenue from all successfully settled platform transactions.'
        },
        {
            label: 'Website Traffic',
            ...getStatData('Website Traffic', timeFilter),
            positive: true,
            icon: <FiActivity />,
            path: '/admin/analytics',
            description: 'Total verified unique visits to the MBC executive platform derived from secure analytics streams.'
        },
        {
            label: 'Popular Package',
            ...getStatData('Popular Package', timeFilter),
            positive: true,
            color: '#4caf50',
            bgColor: 'rgba(76, 175, 80, 0.12)',
            icon: <FiPackage />,
            path: '/admin/services',
            description: 'The highest performance service tier based on total booking volume.'
        },
        {
            label: 'Membership',
            ...getStatData('Membership', timeFilter),
            positive: true,
            icon: <FiUsers />,
            path: '/admin/subscriptions',
            description: 'Verified active members with recurring subscription status.'
        }
    ];

    const recentActivity = (transactions || []).slice(0, 10).map(trx => ({
        id: trx.id,
        text: `Secure payment authorized by ${trx.user}`,
        user: trx.user,
        time: new Date(trx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: trx.status === 'Completed' ? 'success' : trx.status === 'Failed' ? 'error' : 'warning',
        details: `${trx.type} - $${trx.amount}`,
        email: `${trx.user.toLowerCase().replace(' ', '.')}@member.com`,
        reference: trx.id
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
            plan: users.find(u => (u.name || (u.email && u.email.split('@')[0])) === name)?.subscriptionPlan || 'Member'
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
                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Day', 'Week', 'Month', 'All'].map(range => (
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

            <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="admin-stat-card" onClick={() => setSelectedStat(stat)} style={{ cursor: 'pointer', padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', fontSize: '1.2rem' }}>
                                {stat.icon}
                            </div>
                            <div style={{
                                color: stat.color || (stat.positive ? '#4caf50' : '#ff4444'),
                                background: stat.bgColor || (stat.positive ? 'rgba(76,175,80,0.1)' : 'rgba(255,68,68,0.1)'),
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                fontWeight: '800',
                                height: 'fit-content'
                            }}>
                                {stat.change}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>{stat.value}</div>
                        <div style={{ color: '#555', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '700' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* NEW: Intelligence Matrix Section */}
            <div className="admin-grid-2" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
                <div className="admin-card" style={{ padding: '1rem', height: '220px', display: 'flex', flexDirection: 'column' }}>
                    <div className="admin-flex-between" style={{ marginBottom: '1rem' }}>
                        <h3 style={{ color: '#fff', fontSize: '0.85rem', margin: 0, fontWeight: '800' }}>Revenue & Traffic Matrix</h3>
                        <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.55rem', color: '#666' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--color-gold)' }}></span> REV</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4caf50' }}></span> TRAFFIC</div>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={matrixData} margin={{ top: 0, right: 0, left: -40, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <Tooltip
                                    contentStyle={{ background: 'var(--admin-sidebar-bg)', border: '1px solid var(--admin-border)', borderRadius: '10px', fontSize: '0.7rem' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--color-gold)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                                <Area type="monotone" dataKey="traffic" stroke="#4caf50" fillOpacity={0} strokeWidth={1.5} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.02)', marginTop: '0.5rem' }}>
                        {matrixData.map(d => (
                            <span key={d.name} style={{ fontSize: '0.55rem', color: '#444', fontWeight: '800' }}>{d.name}</span>
                        ))}
                    </div>
                </div>

                <div className="admin-card" style={{ padding: '1rem', height: '220px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ color: '#fff', fontSize: '0.85rem', margin: '0 0 1rem 0', fontWeight: '800' }}>Plan Distribution Matrix</h3>
                    <div style={{ flex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={planDistribution} layout="vertical" margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" hide />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ background: 'var(--admin-sidebar-bg)', border: '1px solid var(--admin-border)', borderRadius: '10px', fontSize: '0.7rem' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                                    {planDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#c9a96a', '#4caf50', '#2196f3', '#9c27b0'][index % 4]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {planDistribution.map((plan, i) => (
                            <div key={plan.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                                <span style={{ fontSize: '0.6rem', color: '#666', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{plan.name.toUpperCase()}</span>
                                <span style={{ fontSize: '0.6rem', color: ['#c9a96a', '#4caf50', '#2196f3', '#9c27b0'][i % 4], fontWeight: '900' }}>{plan.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="admin-grid-2" style={{ gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Subscription Dashboard */}
                    <div className="admin-card" style={{ background: 'linear-gradient(135deg, rgba(201,169,106,0.05) 0%, rgba(0,0,0,0) 100%)' }}>
                        <div className="admin-flex-between" style={{ marginBottom: '1.2rem' }}>
                            <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <FiPackage color="var(--color-gold)" size={18} /> Membership Ecosystem
                            </h3>
                            <div style={{ padding: '0.3rem 0.6rem', background: 'rgba(76,175,80,0.1)', color: '#4caf50', borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800' }}>LIVE REGISTRY</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                <div style={{ color: 'var(--color-gold)', fontSize: '1.4rem', fontWeight: '800' }}>{users.filter(u => u.subscriptionPlan?.includes('Platinum')).length}</div>
                                <div style={{ color: '#555', fontSize: '0.6rem', fontWeight: '800', marginTop: '0.3rem' }}>PREMIUM</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '800' }}>{users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'None').length}</div>
                                <div style={{ color: '#555', fontSize: '0.6rem', fontWeight: '800', marginTop: '0.3rem' }}>TOTAL ACTIVE</div>
                            </div>
                            <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.02)' }}>
                                <div style={{ color: '#4caf50', fontSize: '1.4rem', fontWeight: '800' }}>{getGrowth(users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'None'), 'joined')}</div>
                                <div style={{ color: '#555', fontSize: '0.6rem', fontWeight: '800', marginTop: '0.3rem' }}>MOM GROWTH</div>
                            </div>
                        </div>
                        <Link to="/admin/subscriptions" className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', padding: '0.8rem', fontSize: '0.75rem', textAlign: 'center', display: 'block', textDecoration: 'none' }}>MANAGE ALL SUBSCRIPTIONS</Link>
                    </div>

                    {/* Quick Actions */}
                    <div className="admin-card">
                        <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <FiActivity color="var(--color-gold)" size={18} /> Quick Management
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                            {quickActions.map(action => (
                                <Link
                                    key={action.label}
                                    to={action.path}
                                    style={{
                                        padding: '1.2rem 0.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)',
                                        borderRadius: '12px', textDecoration: 'none', textAlign: 'center', transition: '0.3s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}
                                    className="admin-nav-item"
                                >
                                    <div style={{ fontSize: '1.2rem', marginBottom: '0.4rem', color: action.color, display: 'flex' }}>{action.icon}</div>
                                    <div style={{ fontSize: '0.6rem', color: '#777', fontWeight: '800', letterSpacing: '0.05em' }}>{action.label.toUpperCase()}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Top Members */}
                    <div className="admin-card">
                        <div className="admin-flex-between" style={{ marginBottom: '1.2rem' }}>
                            <h3 style={{ color: '#fff', fontSize: '1rem', margin: 0 }}>Top Members</h3>
                            <Link to="/admin/users" style={{ color: 'var(--color-gold)', fontSize: '0.75rem', textDecoration: 'none' }}>View All Registry</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {topMembers.length > 0 ? topMembers.map(member => (
                                <div
                                    key={member.id}
                                    onClick={() => setSelectedMember(member)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', cursor: 'pointer'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-gold)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>{member.avatar}</div>
                                        <div>
                                            <div style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '600' }}>{member.name}</div>
                                            <div style={{ color: '#555', fontSize: '0.65rem' }}>{member.plan} Plan</div>
                                        </div>
                                    </div>
                                    <div style={{ color: 'var(--color-gold)', fontWeight: 'bold', fontSize: '0.85rem' }}>{member.spent}</div>
                                </div>
                            )) : (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#444' }}>
                                    <FiUsers size={24} style={{ marginBottom: '0.6rem', opacity: 0.3 }} />
                                    <div style={{ fontSize: '0.75rem' }}>No member data available yet.</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent activity */}
                <div className="admin-card">
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FiBell color="#4caf50" size={18} /> System Activity
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {recentActivity.length > 0 ? recentActivity.map(activity => (
                            <div
                                key={activity.id}
                                onClick={() => setSelectedActivity(activity)}
                                style={{
                                    display: 'flex', gap: '0.8rem', padding: '1rem', background: 'rgba(0,0,0,0.25)',
                                    borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.02)', transition: '0.2s',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: activity.type === 'success' ? '#4caf50' : activity.type === 'error' ? '#ff4444' : '#ff9800', boxShadow: `0 0 10px ${activity.type === 'success' ? '#4caf50' : activity.type === 'error' ? '#ff4444' : '#ff9800'}` }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#ccc', fontSize: '0.75rem', fontWeight: '500' }}>{activity.text}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', color: '#444', fontSize: '0.65rem' }}>
                                        <span style={{ fontFamily: 'monospace' }}>REF: {activity.reference.toString().substring(0, 8)}</span>
                                        <span>{activity.time}</span>
                                    </div>
                                </div>
                                <FiChevronRight size={14} color="#333" />
                            </div>
                        )) : (
                            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#444' }}>
                                <FiActivity size={28} style={{ marginBottom: '0.8rem', opacity: 0.2 }} />
                                <div style={{ fontSize: '0.75rem' }}>No recent activity recorded.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedActivity && (
                    <div className="modal active" onClick={() => setSelectedActivity(null)}>
                        <motion.div
                            className="modal-content admin-modal-wide"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="admin-modal-grid">
                                <div>
                                    <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.6rem', fontFamily: 'var(--font-heading)' }}>Security Audit Protocol</h3>
                                    <div style={{ background: 'rgba(var(--color-black-rgb), 0.5)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--admin-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                        <div style={{ marginBottom: '1.5rem' }}><span style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '800' }}>Authorized Agent</span><div style={{ color: '#fff', fontSize: '1.1rem', marginTop: '0.3rem', fontWeight: '600' }}>{selectedActivity.user}</div></div>
                                        <div style={{ marginBottom: '0' }}><span style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '800' }}>Validated Balance</span><div style={{ color: 'var(--color-gold)', fontSize: '1.6rem', fontWeight: 'bold', marginTop: '0.3rem' }}>{selectedActivity.details}</div></div>
                                    </div>
                                </div>
                                <div style={{ paddingTop: '1rem' }}>
                                    <span style={{ color: '#444', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '800' }}>Operation Description</span>
                                    <div style={{ color: '#888', lineHeight: '1.8', marginTop: '1rem', fontSize: '1.05rem' }}>{selectedActivity.text}</div>
                                    <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(201,169,106,0.05)', borderRadius: '12px', border: '1px solid rgba(201,169,106,0.1)', color: 'var(--color-gold)', fontSize: '0.8rem' }}>
                                        Verified Security Event: {selectedActivity.reference.toString().substring(0, 12)}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-modal-actions">
                                <button className="btn btn-primary" style={{ padding: '1.2rem', fontSize: '0.85rem' }} onClick={() => { navigate('/admin/payments'); setSelectedActivity(null); }}>RUN FULL AUDIT</button>
                                <button className="btn btn-secondary" style={{ padding: '1.2rem', fontSize: '0.85rem' }} onClick={() => setSelectedActivity(null)}>DISMISS</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {selectedStat && (
                    <div className="modal active" onClick={() => setSelectedStat(null)}>
                        <motion.div
                            className="modal-content admin-modal-wide"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <div className="admin-modal-grid tighter">
                                {/* Data Visualization Column */}
                                <div>
                                    <div className="admin-modal-vial" style={{ marginBottom: 0 }}>
                                        <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: '0.4rem', lineHeight: 1 }}>{modalMetric.value}</div>
                                        <div style={{
                                            color: (modalMetric.change || '').includes('-') ? '#ff4444' : '#4caf50',
                                            fontWeight: '900', fontSize: '0.75rem', letterSpacing: '0.2em'
                                        }}>{(modalMetric.change || '').toUpperCase()} PERFORMANCE TREND</div>
                                    </div>
                                </div>

                                {/* Information Column */}
                                <div>
                                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(201,169,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', fontSize: '2.2rem' }}>{selectedStat.icon}</div>
                                        <div>
                                            <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>{selectedStat.label}</h2>
                                            <p style={{ color: '#c9a96a', margin: '0.4rem 0 0', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '700' }}>Executive Analytics Protocol</p>
                                        </div>
                                    </div>
                                    <p style={{ color: '#999', lineHeight: '2', fontSize: '1.1rem', marginBottom: 0 }}>{selectedStat.description}</p>
                                    <div style={{ marginTop: '2.5rem', borderTop: '1px solid #1a1a1a', paddingTop: '1.5rem', color: '#444', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                        * Data synchronized with MBC Secure Registry. Last synchronized: {new Date().toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>

                            <div className="admin-modal-actions">
                                <button className="btn btn-primary" style={{ padding: '0.9rem 1.5rem', fontWeight: '800', fontSize: '0.85rem' }} onClick={() => { navigate(selectedStat.path); setSelectedStat(null); }}>VIEW REPOSITORY</button>
                                <button className="btn btn-secondary" style={{ padding: '0.9rem 1.5rem', fontWeight: '800', fontSize: '0.85rem' }} onClick={() => setSelectedStat(null)}>CLOSE INFO</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                .admin-overview { animation: fadeIn 0.5s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .admin-modal-wide {
                    width: min(95%, 750px);
                    max-width: none;
                    padding: 2rem;
                    border-radius: 24px;
                    text-align: left;
                }

                .admin-modal-grid {
                    display: grid;
                    grid-template-columns: 260px 1fr;
                    gap: 2.5rem;
                    align-items: center;
                }

                .admin-modal-grid.tighter {
                    gap: 3rem;
                }

                .admin-modal-vial {
                    background: var(--admin-sidebar-bg);
                    padding: 0 1.5rem;
                    height: 180px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 20px;
                    text-align: center;
                    border: 1px solid var(--admin-border);
                    box-shadow: inset 0 0 40px rgba(0,0,0,0.3);
                    margin-bottom: 0;
                }

                .admin-modal-actions {
                    display: grid;
                    grid-template-columns: 1.2fr 0.8fr;
                    gap: 1rem;
                    margin-top: 2rem;
                    border-top: 1px solid #1a1a1a;
                    padding-top: 1.5rem;
                }

                @media (max-width: 900px) {
                    .admin-modal-wide {
                        width: 92% !important;
                        max-height: 85vh !important;
                        overflow-y: auto !important;
                        padding: 1.5rem !important;
                    }
                    .admin-modal-grid {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 1.5rem !important;
                        text-align: center !important;
                    }
                    .admin-modal-vial {
                        padding: 2rem 1.5rem !important;
                        height: auto !important;
                        min-height: 140px !important;
                        margin-bottom: 0 !important;
                    }
                    .admin-modal-vial div:first-child {
                        font-size: 2.8rem !important;
                    }
                    .admin-modal-vial div:nth-child(2) {
                        font-size: 0.65rem !important;
                        letter-spacing: 0.12em !important;
                    }
                    .admin-modal-actions {
                        grid-template-columns: 1fr !important;
                        order: 10 !important;
                        margin-top: 1rem !important;
                        padding-top: 1rem !important;
                    }
                    .admin-modal-grid > div:last-child {
                        padding: 0 !important;
                    }
                    .admin-modal-grid.tighter div:last-child div:first-child {
                        justify-content: center !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminOverview;
