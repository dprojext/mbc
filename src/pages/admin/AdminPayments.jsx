import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useData } from '../../context/DataContext';
import { FiDollarSign, FiClock, FiDownload, FiPlus, FiX, FiUser, FiInfo, FiTrash2, FiEdit3, FiArrowRight } from 'react-icons/fi';

const AdminPayments = () => {
    const { transactions = [], addTransaction, updateTransaction, deleteTransaction, users = [] } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [editingTrx, setEditingTrx] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [viewingTrx, setViewingTrx] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
    
    const [searchParams] = useSearchParams();
    const [timeFilter, setTimeFilter] = useState(searchParams.get('range') || 'All');

    const paymentMethods = [
        'Cash', 'Check', 'Telebirr', 'CBE Bank', 'Awash Bank', 'Dashen Bank',
        'Abyssinia Bank', 'Hibret Bank', 'Zemen Bank', 'Wegagen Bank', 'Other'
    ];

    const [formData, setFormData] = useState({
        user: '',
        amount: '',
        type: 'Subscription',
        status: 'Completed',
        paymentMethod: 'Telebirr',
        referenceNo: '',
        date: new Date().toISOString().split('T')[0]
    });

    const filteredTransactions = useMemo(() => {
        if (timeFilter === 'All') return transactions;
        const now = new Date();
        const cutoff = new Date();
        if (timeFilter === '24h') cutoff.setHours(cutoff.getHours() - 24);
        if (timeFilter === '7d') cutoff.setDate(cutoff.getDate() - 7);
        if (timeFilter === '30d') cutoff.setDate(cutoff.getDate() - 30);
        return transactions.filter(t => {
            const d = new Date(t.date);
            return !isNaN(d.getTime()) && d >= cutoff;
        });
    }, [transactions, timeFilter]);

    const handleAdd = (e) => {
        e.preventDefault();
        const newTrx = {
            ...formData,
            amount: parseFloat(formData.amount),
            id: `TRX-${Date.now().toString().slice(-6)}`
        };
        addTransaction(newTrx);
        setIsAdding(false);
        setInvoiceData(newTrx);
        setFormData({
            user: '',
            amount: '',
            type: 'Subscription',
            status: 'Completed',
            paymentMethod: 'Telebirr',
            referenceNo: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleDownloadInvoice = async () => {
        const element = document.getElementById('invoice-capture-area');
        if (!element) return;
        try {
            const canvas = await html2canvas(element, { backgroundColor: '#000000', scale: 2 });
            const link = document.createElement('a');
            link.download = `Invoice-${invoiceData.id || 'Draft'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Invoice generation failed:", err);
        }
    };

    const downloadCSV = () => {
        const headers = ['ID', 'Date', 'User', 'Amount', 'Status', 'Type', 'Method', 'Reference'];
        const csvData = filteredTransactions.map(t => [
            t.id, t.date, t.user, t.amount, t.status, t.type, t.paymentMethod, t.referenceNo
        ]);
        const content = [headers, ...csvData].map(row => row.join(',')).join('\n');
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_export.csv`);
        link.click();
    };

    const totalRevenue = filteredTransactions
        .filter(t => t.status === 'Completed')
        .reduce((acc, current) => acc + current.amount, 0);

    return (
        <div style={{ padding: '2rem', minHeight: '100vh', background: '#0a0a0a', color: '#fff', animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.6rem', fontWeight: '600' }}>Financial Center</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.8rem', margin: 0, color: '#fff' }}>Transaction History</h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {['24h', '7d', '30d', 'All'].map(range => (
                        <button key={range} onClick={() => setTimeFilter(range)} style={{ background: timeFilter === range ? '#c9a96a' : 'transparent', border: `1px solid ${timeFilter === range ? '#c9a96a' : '#333'}`, color: timeFilter === range ? '#000' : '#888', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>{range}</button>
                    ))}
                    <button onClick={() => setIsAdding(true)} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '8px' }}>+ New Entry</button>
                    <button onClick={downloadCSV} className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem', borderRadius: '8px' }}>Export CSV</button>
                </div>
            </div>

            {/* KPI Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                {[
                    { label: 'Revenue in Period', value: `$${totalRevenue.toLocaleString()}` },
                    { label: 'Transactions', value: filteredTransactions.length },
                    { label: 'Avg Value', value: `$${filteredTransactions.length > 0 ? (totalRevenue / filteredTransactions.length).toFixed(2) : 0}` },
                    { label: 'Success Rate', value: `${filteredTransactions.length > 0 ? (filteredTransactions.filter(t => t.status === 'Completed').length / filteredTransactions.length * 100).toFixed(0) : 0}%` },
                ].map((stat, idx) => (
                    <div key={idx} style={{ background: 'rgba(30,30,30,0.5)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #222' }}>
                        <div style={{ color: '#555', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800' }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div style={{ background: 'rgba(20,20,20,0.8)', borderRadius: '24px', border: '1px solid #222', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #222' }}>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.8rem' }}>Date & ID</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.8rem' }}>User</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.8rem' }}>Amount</th>
                            <th style={{ padding: '1.2rem', color: '#555', fontSize: '0.8rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(trx => (
                            <tr key={trx.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                                <td style={{ padding: '1.2rem' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{trx.date}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#444' }}>{trx.id}</div>
                                </td>
                                <td style={{ padding: '1.2rem' }}>{trx.user}</td>
                                <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>${trx.amount}</td>
                                <td style={{ padding: '1.2rem' }}>
                                    <span style={{ padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', background: trx.status === 'Completed' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 68, 68, 0.1)', color: trx.status === 'Completed' ? '#4caf50' : '#ff4444' }}>
                                        {trx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredTransactions.length === 0 && (
                    <div style={{ padding: '5rem', textAlign: 'center', color: '#444' }}>No transactions found for this period</div>
                )}
            </div>

            {/* Modals and styles would go here... */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default AdminPayments;
