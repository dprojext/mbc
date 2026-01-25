import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { FiDollarSign, FiClock, FiDownload, FiPlus, FiX, FiUser, FiInfo, FiTrash2, FiSearch, FiFilter } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPayments = () => {
    const { transactions = [], addTransaction, deleteTransaction } = useData();
    const [searchParams] = useSearchParams();
    const [timeFilter, setTimeFilter] = useState(searchParams.get('range') || 'All');
    const [isAdding, setIsAdding] = useState(false);
    const [viewingTrx, setViewingTrx] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = useMemo(() => {
        let result = transactions;
        if (timeFilter !== 'All') {
            const cutoff = new Date();
            if (timeFilter === '24h') cutoff.setHours(cutoff.getHours() - 24);
            if (timeFilter === '7d') cutoff.setDate(cutoff.getDate() - 7);
            if (timeFilter === '30d') cutoff.setDate(cutoff.getDate() - 30);
            result = result.filter(t => new Date(t.date) >= cutoff);
        }
        if (searchTerm) {
            result = result.filter(t =>
                t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return result.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, timeFilter, searchTerm]);

    const totalRevenue = filteredTransactions
        .filter(t => t.status === 'Completed')
        .reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="admin-payments-container" style={{ animation: 'fadeIn 0.5s ease' }}>
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>Transaction Ledger</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem' }}>Manage and track all customer payments and subscriptions.</p>
                </div>
                <div className="admin-card" style={{ padding: '1rem 1.5rem', margin: 0, background: 'rgba(76,175,80,0.05)', borderColor: 'rgba(76,175,80,0.1)' }}>
                    <div style={{ color: '#4caf50', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.2rem', fontWeight: 'bold' }}>Period Revenue</div>
                    <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>${totalRevenue.toLocaleString()}</div>
                </div>
            </header>

            <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
                <div className="admin-card" style={{ padding: '1.2rem', margin: 0 }}>
                    <div className="admin-flex-between">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['24h', '7d', '30d', 'All'].map(range => (
                                <button
                                    key={range}
                                    onClick={() => setTimeFilter(range)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                                        background: timeFilter === range ? 'var(--color-gold)' : 'transparent',
                                        color: timeFilter === range ? '#000' : '#888',
                                        fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                                    }}
                                >{range}</button>
                            ))}
                        </div>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '300px', width: '100%' }}>
                            <FiSearch style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                            <input
                                placeholder="Find transaction..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem 2.2rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', color: '#fff', fontSize: '0.85rem' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="admin-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--admin-border)' }}>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Transaction ID</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Customer</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Method</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(trx => (
                            <tr
                                key={trx.id}
                                onClick={() => setViewingTrx(trx)}
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: '0.2s' }}
                                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '1.2rem', color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: 'bold' }}>{trx.id}</td>
                                <td style={{ padding: '1.2rem', color: '#fff', fontSize: '0.9rem' }}>{trx.user}</td>
                                <td style={{ padding: '1.2rem', color: '#fff', fontWeight: 'bold' }}>${trx.amount.toLocaleString()}</td>
                                <td style={{ padding: '1.2rem', color: '#666', fontSize: '0.85rem' }}>{trx.paymentMethod || 'Credit Card'}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span style={{
                                        padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold',
                                        background: trx.status === 'Completed' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                                        color: trx.status === 'Completed' ? '#4caf50' : '#ff9800'
                                    }}>{trx.status}</span>
                                </td>
                                <td style={{ padding: '1.2rem', color: '#555', fontSize: '0.8rem' }}>{new Date(trx.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {viewingTrx && (
                    <div className="modal active" onClick={() => setViewingTrx(null)}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ color: '#fff', margin: 0 }}>Payment Memo</h3>
                                <div style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>{viewingTrx.id}</div>
                            </div>
                            <div style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #222' }}>
                                <div className="admin-flex-between"><span style={{ color: '#444' }}>Customer</span><span style={{ color: '#fff' }}>{viewingTrx.user}</span></div>
                                <div className="admin-flex-between"><span style={{ color: '#444' }}>Service Type</span><span style={{ color: '#fff' }}>{viewingTrx.type}</span></div>
                                <div className="admin-flex-between"><span style={{ color: '#444' }}>Amount Paid</span><span style={{ color: '#fff', fontWeight: 'bold' }}>${viewingTrx.amount}</span></div>
                                <div className="admin-flex-between"><span style={{ color: '#444' }}>Method</span><span style={{ color: '#fff' }}>{viewingTrx.paymentMethod}</span></div>
                                <div className="admin-flex-between"><span style={{ color: '#444' }}>Reference</span><span style={{ color: '#fff' }}>{viewingTrx.referenceNo || 'N/A'}</span></div>
                                <div className="admin-flex-between"><span style={{ color: '#444' }}>Date</span><span style={{ color: '#fff' }}>{new Date(viewingTrx.date).toLocaleString()}</span></div>
                            </div>
                            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setViewingTrx(null)}>Close Memo</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminPayments;
