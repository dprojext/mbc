import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { FiX, FiActivity, FiArrowUpRight, FiDollarSign, FiUsers, FiPackage, FiStar, FiGlobe, FiMousePointer, FiArrowDownRight, FiClock } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAnalytics = () => {
    const { bookings = [], transactions = [], users = [], analytics = [], plans = [], purgeSystemData } = useData();
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [viewFilter, setViewFilter] = useState('Month');

    // --- Dynamic Growth Intelligence ---
    const calculateGrowth = (list, dateKey = 'created_at', isRate = false) => {
        if (!list || list.length === 0) return { trend: '+0%', positive: true };
        const now = new Date();
        const currentCutoff = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const previousCutoff = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        const currentItems = list.filter(item => {
            const d = new Date(item[dateKey] || item.date || item.timestamp);
            return d >= currentCutoff;
        });
        const previousItems = list.filter(item => {
            const d = new Date(item[dateKey] || item.date || item.timestamp);
            return d >= previousCutoff && d < currentCutoff;
        });

        if (isRate) {
            const currentVal = currentItems.length / (users.length || 1);
            const prevVal = previousItems.length / (users.length || 1);
            const diff = (currentVal - prevVal).toFixed(1);
            return { trend: `${Number(diff) >= 0 ? '+' : ''}${diff}`, positive: Number(diff) >= 0 };
        }

        const currentVal = currentItems.reduce((acc, item) => acc + (Number(item.amount) || 1), 0);
        const prevVal = previousItems.reduce((acc, item) => acc + (Number(item.amount) || 1), 0);

        if (prevVal === 0) return { trend: currentVal > 0 ? '+100%' : '+0%', positive: true };
        const growth = ((currentVal - prevVal) / prevVal) * 100;
        return { trend: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`, positive: growth >= 0 };
    };

    // Real Data Calculations
    const completedTransactions = transactions.filter(t => t.status === 'Completed' || t.status === 'Paid');
    const totalRevenue = completedTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const activeMembers = users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'No Active Plan').length;

    // Detailed Website Traffic Tracking
    const pageViews = analytics.filter(e => e.event_type === 'page_view');
    const totalVisits = pageViews.length;
    const uniqueVisitors = new Set(pageViews.map(v => v.user_id)).size;

    // Top Pages Performance Matrix
    const pageCounts = pageViews.reduce((acc, v) => {
        acc[v.page_path] = (acc[v.page_path] || 0) + 1;
        return acc;
    }, {});
    const topPages = Object.entries(pageCounts)
        .map(([path, count]) => ({ path, count, percentage: ((count / totalVisits) * 100).toFixed(1) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    const subscriptionData = useMemo(() => {
        const counts = users.reduce((acc, u) => {
            const plan = u.subscriptionPlan || 'No Plan';
            acc[plan] = (acc[plan] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [users]);

    const COLORS = ['#c9a96a', '#4caf50', '#2196f3', '#9c27b0', '#ff9800'];

    const revenueGrowth = calculateGrowth(completedTransactions, 'date');
    const memberGrowth = calculateGrowth(users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'No Active Plan'), 'joined_at');
    const trafficGrowth = calculateGrowth(pageViews, 'created_at');
    const engagementGrowth = calculateGrowth(pageViews, 'created_at', true);

    const kpis = [
        {
            label: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString()}`,
            trend: revenueGrowth.trend,
            positive: revenueGrowth.positive,
            icon: <FiDollarSign />,
            color: 'var(--color-gold)',
            details: 'Authoritative financial aggregation of all completed and verified cloud ledger entries.',
            subMetrics: [
                { label: 'Platform Transactions', value: completedTransactions.length, icon: <FiPackage /> },
                { label: 'Booking Revenue', value: `$${completedTransactions.filter(t => !t.plan_id).reduce((s, t) => s + (t.amount || 0), 0).toLocaleString()}`, icon: <FiActivity /> },
                { label: 'Avg Ticket Value', value: `$${(totalRevenue / (completedTransactions.length || 1)).toFixed(2)}`, icon: <FiDollarSign /> }
            ]
        },
        {
            label: 'Active Members',
            value: activeMembers,
            trend: memberGrowth.trend,
            positive: memberGrowth.positive,
            icon: <FiUsers />,
            color: '#4caf50',
            details: 'Verified account index for users with currently active and hydrated subscription tiers.',
            subMetrics: [
                { label: 'Premium Tiers', value: users.filter(u => u.subscriptionPlan?.toLowerCase().includes('platinum') || u.subscriptionPlan?.toLowerCase().includes('diamond')).length, icon: <FiStar /> },
                { label: 'Core Tiers', value: users.filter(u => u.subscriptionPlan?.toLowerCase().includes('gold') || u.subscriptionPlan?.toLowerCase().includes('silver')).length, icon: <FiPackage /> },
                { label: 'New Signups', value: users.filter(u => new Date(u.joined_at || u.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: <FiActivity /> }
            ]
        },
        {
            label: 'Systemic Traffic',
            value: totalVisits.toLocaleString(),
            trend: trafficGrowth.trend,
            positive: trafficGrowth.positive,
            icon: <FiGlobe />,
            color: '#2196f3',
            details: 'Total unique route interactions recorded by the platform telemetry engine.',
            subMetrics: topPages.slice(0, 3).map(p => ({ label: p.path.replace('/admin/', '').toUpperCase(), value: p.count, icon: <FiActivity /> }))
        },
        {
            label: 'Engagement Rate',
            value: `${((totalVisits / (users.length || 1))).toFixed(1)}x`,
            trend: engagementGrowth.trend,
            positive: engagementGrowth.positive,
            icon: <FiMousePointer />,
            color: '#9c27b0',
            details: 'The average interaction frequency per unique user identity within the systemic record.',
            subMetrics: [
                { label: 'Current Users', value: users.length, icon: <FiUsers /> },
                { label: 'Auth Ratio', value: `${((users.length / (totalVisits || 1)) * 100).toFixed(1)}%`, icon: <FiPackage /> },
                { label: 'Activity Index', value: (totalVisits / 100).toFixed(1), icon: <FiActivity /> }
            ]
        }
    ];

    const trafficData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();

        let rangeCount = 7;
        if (viewFilter === 'Week') rangeCount = 7;
        if (viewFilter === 'Month') rangeCount = 30;
        if (viewFilter === 'Day') rangeCount = 1;

        const periodDays = [...Array(rangeCount)].map((_, i) => {
            const d = new Date();
            d.setDate(now.getDate() - (rangeCount - 1 - i));
            return d;
        });

        return periodDays.map(date => {
            const dateStr = date.toDateString();
            const dayStr = viewFilter === 'Day' ? date.toLocaleTimeString([], { hour: '2-digit' }) : days[date.getDay()];
            const dayViews = pageViews.filter(v => new Date(v.created_at || v.timestamp).toDateString() === dateStr).length;
            const dayRevenue = completedTransactions.filter(t => (t.date || t.created_at) && new Date(t.date || t.created_at).toDateString() === dateStr).reduce((acc, t) => acc + (t.amount || 0), 0);
            return { name: dayStr, visits: dayViews, revenue: dayRevenue };
        });
    }, [pageViews, completedTransactions, viewFilter]);

    const servicePopularity = useMemo(() => {
        const servicesUsed = bookings.reduce((acc, b) => {
            acc[b.service] = (acc[b.service] || 0) + 1;
            return acc;
        }, {});
        const total = bookings.length || 1;
        return Object.entries(servicesUsed).map(([name, count]) => ({
            name,
            value: Number(((count / total) * 100).toFixed(1))
        })).sort((a, b) => b.value - a.value).slice(0, 5);
    }, [bookings]);

    const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);

    return (
        <div className="admin-analytics-container" style={{ animation: 'fadeIn 0.5s ease' }}>
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0, fontSize: '1.8rem' }}>Business Analytics</h1>
                    <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.2rem' }}>Deep dive into platform performance and user growth.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', background: '#111', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,201,106,0.1)' }}>
                        {['Day', 'Week', 'Month'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewFilter(mode)}
                                style={{
                                    padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
                                    background: viewFilter === mode ? 'var(--color-gold)' : 'transparent',
                                    color: viewFilter === mode ? '#000' : '#444',
                                    fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', transition: '0.2s'
                                }}
                            >{mode.toUpperCase()}</button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsPurgeModalOpen(true)}
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.8rem 1.2rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                    >
                        CLEAR DATA
                    </button>
                </div>
            </header>

            <div className="admin-stats-grid" style={{ marginBottom: '1.5rem' }}>
                {kpis.map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -5 }}
                        className="admin-stat-card"
                        onClick={() => setSelectedDetail(kpi)}
                        style={{ cursor: 'pointer', padding: '1rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color || 'var(--color-gold)', fontSize: '1.2rem' }}>
                                {kpi.icon}
                            </div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                color: kpi.positive ? '#4caf50' : '#ff4444',
                                background: kpi.positive ? 'rgba(76,175,80,0.1)' : 'rgba(255,68,68,0.1)',
                                padding: '0.2rem 0.5rem', borderRadius: '6px',
                                fontSize: '0.65rem', fontWeight: '800'
                            }}>
                                {kpi.trend}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#fff', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>{kpi.value}</div>
                        <div style={{ color: '#555', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: '700' }}>{kpi.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="admin-grid-2" style={{ marginBottom: '1.5rem' }}>
                <div className="admin-card" style={{ height: '400px', background: 'rgba(5,5,5,0.8)', padding: '1.5rem' }}>
                    <div className="admin-flex-between" style={{ marginBottom: '1.2rem' }}>
                        <div>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 0.4rem 0' }}>Revenue & Traffic Matrix</h3>
                            <p style={{ color: '#444', fontSize: '0.75rem', margin: 0 }}>Detailed correlation between engagement and transactions.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-gold)' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-gold)' }}></span> Revenue</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4caf50' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4caf50' }}></span> Traffic</div>
                        </div>
                    </div>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 11, fontWeight: 'bold' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px', color: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ fontSize: '0.8rem' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="var(--color-gold)" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="visits" stroke="#4caf50" strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'rgba(5,5,5,0.8)', height: '400px', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Plan Distribution Matrix</h3>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={subscriptionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {subscriptionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                            <div style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '800' }}>{activeMembers}</div>
                            <div style={{ color: '#555', fontSize: '0.7rem', textTransform: 'uppercase' }}>Active Plans</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        {subscriptionData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                                <span style={{ color: '#ccc', fontSize: '0.8rem' }}>{d.name.substring(0, 15)}</span>
                                <span style={{ color: '#555', fontSize: '0.75rem' }}>({d.value})</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="admin-grid-2">
                <div className="admin-card" style={{ background: 'rgba(5,5,5,0.8)' }}>
                    <div className="admin-flex-between" style={{ marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: '0 0 0.4rem 0' }}>Authoritative Traffic Registry</h3>
                            <p style={{ color: '#444', fontSize: '0.75rem', margin: 0 }}>Granular breakdown of platform route engagement.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        {topPages.map((page, idx) => (
                            <div key={idx} style={{ padding: '0.8rem 1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                <div className="admin-flex-between" style={{ marginBottom: '0.6rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                        <span style={{ color: '#444', fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'monospace' }}>#{idx + 1}</span>
                                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{page.path}</span>
                                    </div>
                                    <span style={{ color: 'var(--color-gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>{page.count} <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>HITS</span></span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${page.percentage}%` }}
                                        transition={{ duration: 1.5, ease: 'easeOut' }}
                                        style={{ height: '100%', background: 'var(--color-gold)', borderRadius: '10px' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-card" style={{ background: 'rgba(5,5,5,0.8)' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem' }}>Acquisition Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                        {servicePopularity.length > 0 ? servicePopularity.map((s, idx) => (
                            <div key={idx}>
                                <div className="admin-flex-between" style={{ marginBottom: '0.6rem' }}>
                                    <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500' }}>{s.name}</span>
                                    <span style={{ color: '#4caf50', fontWeight: 'bold', fontSize: '0.85rem' }}>{s.value}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.value}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        style={{ height: '100%', background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)', borderRadius: '10px' }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#333' }}>No service data available yet.</div>
                        )}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#555', fontSize: '0.75rem' }}>
                            <FiActivity /> Live telemetry stream active. Last check: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isPurgeModalOpen && (
                    <div className="modal active" onClick={() => setIsPurgeModalOpen(false)}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            style={{ maxWidth: '500px', padding: '3rem', borderRadius: '35px', background: 'rgba(10,0,0,0.98)', border: '1px solid rgba(255,0,0,0.1)', textAlign: 'center' }}
                        >
                            <div style={{ width: '80px', height: '80px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: '#ef4444' }}>
                                <FiActivity size={35} />
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Critical Authorization</h2>
                            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                                You are about to purge all systemic telemetry and transaction records. This action is <span style={{ color: '#ef4444', fontWeight: 'bold' }}>IRREVERSIBLE</span> and will reset all analytical counters.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsPurgeModalOpen(false)}>ABORT MISSION</button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1.5, background: '#ef4444', color: '#fff' }}
                                    onClick={() => {
                                        purgeSystemData();
                                        setIsPurgeModalOpen(false);
                                    }}
                                >CONFIRM PURGE</button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {selectedDetail && (
                    <div className="modal active" onClick={() => setSelectedDetail(null)}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ maxWidth: '600px', padding: '2.5rem', borderRadius: '30px', background: 'rgba(7,7,7,0.98)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(50px)' }}
                        >
                            <div className="admin-flex-between" style={{ marginBottom: '3rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '18px',
                                        background: `${selectedDetail.color}15`, color: selectedDetail.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.8rem', border: `1px solid ${selectedDetail.color}20`
                                    }}>
                                        {selectedDetail.icon}
                                    </div>
                                    <div>
                                        <div style={{ color: selectedDetail.color, fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Analytical Audit</div>
                                        <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>{selectedDetail.label}</h2>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedDetail(null)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '25px', textAlign: 'center', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.5rem', fontWeight: '900', letterSpacing: '0.15em' }}>AGGREGATED TOTAL</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', lineHeight: '1', fontFamily: 'var(--font-heading)' }}>{selectedDetail.value}</div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#4caf50', fontWeight: 'bold', background: 'rgba(76,175,80,0.1)', padding: '0.4rem 1rem', borderRadius: '50px', marginTop: '1rem', fontSize: '0.7rem' }}>
                                    <FiArrowUpRight /> {selectedDetail.trend} Growth
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                                {selectedDetail.subMetrics?.map((metric, midx) => (
                                    <div key={midx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
                                        <div style={{ color: '#444', fontSize: '1.2rem', marginBottom: '0.8rem' }}>{metric.icon}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '0.3rem' }}>{metric.value}</div>
                                        <div style={{ color: '#555', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{metric.label}</div>
                                    </div>
                                ))}
                            </div>

                            <p style={{ color: '#444', lineHeight: '1.8', fontSize: '0.95rem', background: 'rgba(255,255,255,0.01)', padding: '1.5rem', borderRadius: '15px', borderLeft: `3px solid ${selectedDetail.color}` }}>
                                {selectedDetail.details}
                            </p>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '3rem', padding: '1.2rem', borderRadius: '15px', fontWeight: '900', fontSize: '0.9rem', letterSpacing: '0.1em' }}
                                onClick={() => setSelectedDetail(null)}
                            >
                                CLOSE REGISTRY AUDIT
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAnalytics;
