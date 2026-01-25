import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { FiX, FiActivity, FiArrowUpRight, FiDollarSign, FiUsers, FiPackage, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAnalytics = () => {
    const { bookings = [], transactions = [], users = [], services = [] } = useData();
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [searchParams] = useSearchParams();
    const [viewFilter, setViewFilter] = useState('Current Year');

    // KPI Logic
    const totalRevenue = transactions.filter(t => t.status === 'Completed').reduce((acc, curr) => acc + curr.amount, 0);
    const activeMembers = users.filter(u => u.plan && u.plan !== 'None').length;
    const totalBookings = bookings.length;
    const avgRating = 4.8; // Mocked

    const kpis = [
        { label: 'Gross Revenue', value: `$${totalRevenue.toLocaleString()}`, trend: '+12.5%', positive: true, icon: <FiDollarSign />, details: 'Total revenue from all completed transactions.' },
        { label: 'Active Members', value: activeMembers, trend: '+4.2%', positive: true, icon: <FiUsers />, details: 'Users with active recurring subscription plans.' },
        { label: 'Total Bookings', value: totalBookings, trend: '+18.1%', positive: true, icon: <FiActivity />, details: 'Cumulative number of appointments in the system.' },
        { label: 'Customer Satisfaction', value: avgRating, trend: '+0.2', positive: true, icon: <FiStar />, details: 'Average rating from post-service feedback.' }
    ];

    const monthlyData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.map((month, idx) => ({
            name: month,
            revenue: transactions.filter(t => t.status === 'Completed' && new Date(t.date).getMonth() === idx).reduce((acc, t) => acc + t.amount, 0),
            bookings: bookings.filter(b => new Date(b.date).getMonth() === idx).length
        })).slice(0, new Date().getMonth() + 1);
    }, [transactions, bookings]);

    const serviceData = useMemo(() => {
        const counts = bookings.reduce((acc, b) => {
            acc[b.service] = (acc[b.service] || 0) + 1;
            return acc;
        }, {});
        const total = bookings.length || 1;
        return services.slice(0, 4).map(s => ({
            name: s.title,
            value: Number(((counts[s.title] || 0) / total * 100).toFixed(1)),
            color: 'var(--color-gold)'
        })).sort((a, b) => b.value - a.value);
    }, [bookings, services]);

    return (
        <div className="admin-analytics-container" style={{ animation: 'fadeIn 0.5s ease' }}>
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>Business Analytics</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem' }}>Deep dive into platform performance and user growth.</p>
                </div>
                <div style={{ display: 'flex', background: '#111', padding: '0.5rem', borderRadius: '12px' }}>
                    <select
                        value={viewFilter}
                        onChange={e => setViewFilter(e.target.value)}
                        style={{ background: 'transparent', color: '#fff', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', outline: 'none', fontWeight: 'bold' }}
                    >
                        <option value="Current Year">Current Year</option>
                        <option value="Last 6 Months">Last 6 Months</option>
                    </select>
                </div>
            </header>

            <div className="admin-stats-grid" style={{ marginBottom: '2.5rem' }}>
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="admin-stat-card" onClick={() => setSelectedDetail(kpi)}>
                        <div className="admin-flex-between" style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '1.4rem', color: 'var(--color-gold)' }}>{kpi.icon}</div>
                            <span style={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: 'bold', background: 'rgba(76,175,80,0.1)', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{kpi.trend}</span>
                        </div>
                        <div style={{ fontSize: '1.8rem', color: '#fff', fontWeight: '600' }}>{kpi.value}</div>
                        <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>{kpi.label}</div>
                    </div>
                ))}
            </div>

            <div className="admin-grid-2">
                <div className="admin-card" style={{ height: '450px' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Revenue vs Bookings Growth</h3>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 10 }} />
                                <YAxis hide />
                                <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="revenue" stroke="var(--color-gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="bookings" stroke="#4caf50" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Service Popularity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {serviceData.map((s, idx) => (
                            <div key={idx}>
                                <div className="admin-flex-between" style={{ marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#ccc', fontSize: '0.9rem' }}>{s.name}</span>
                                    <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>{s.value}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#0a0a0a', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${s.value}%`, height: '100%', background: 'var(--color-gold)', borderRadius: '10px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedDetail && (
                    <div className="modal active" onClick={() => setSelectedDetail(null)}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="admin-flex-between" style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(201,169,106,0.1)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{selectedDetail.icon}</div>
                                    <h2 style={{ color: '#fff', margin: 0 }}>{selectedDetail.label}</h2>
                                </div>
                                <button onClick={() => setSelectedDetail(null)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}><FiX size={24} /></button>
                            </div>
                            <div style={{ background: '#0a0a0a', padding: '2rem', borderRadius: '16px', textAlign: 'center', marginBottom: '2rem', border: '1px solid #222' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff' }}>{selectedDetail.value}</div>
                                <div style={{ color: '#4caf50', fontWeight: 'bold' }}>{selectedDetail.trend} Period Trend</div>
                            </div>
                            <p style={{ color: '#888', lineHeight: '1.6' }}>{selectedDetail.details}</p>
                            <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setSelectedDetail(null)}>Close Analysis</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminAnalytics;
