import React, { useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { useSearchParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
    FiDollarSign, FiClock, FiDownload, FiPlus, FiX, FiUser,
    FiInfo, FiTrash2, FiSearch, FiFilter, FiActivity, FiArrowUpRight,
    FiCheckCircle, FiMinus, FiPieChart, FiBarChart, FiLayers, FiPackage, FiCalendar
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPayments = () => {
    const {
        transactions = [],
        addTransaction,
        deleteTransaction,
        users = [],
        services = [],
        plans = [],
        settings = {},
        updateSettings,
        updateTransaction,
        updateUserSubscription,
        updateBooking,
        sendUserNotification,
        currency,
        setCurrency
    } = useData();

    const getGwIcon = (type, existingIcon) => {
        if (existingIcon) return existingIcon;
        switch (type) {
            case 'bank': return <FiDollarSign />;
            case 'mobile': return <FiClock />;
            case 'card': return <FiActivity />;
            case 'crypto': return <FiLayers />;
            default: return <FiPackage />;
        }
    };
    const [searchParams] = useSearchParams();
    const [timeFilter, setTimeFilter] = useState(searchParams.get('range') || 'All');
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'transactions'
    const [isAdding, setIsAdding] = useState(false);
    const [isAddingGateway, setIsAddingGateway] = useState(false);
    const [newGateway, setNewGateway] = useState({
        id: '',
        name: '',
        description: '',
        details: '',
        enabled: true,
        type: 'bank_eth',
        bankProvider: '',
        accountHolder: '',
        accountNumber: ''
    });

    const ETHIOPIAN_BANKS = [
        "Commercial Bank of Ethiopia (CBE)",
        "Bank of Abyssinia",
        "Dashen Bank",
        "Awash Bank",
        "Zemen Bank",
        "Hibret Bank",
        "Berhan Bank",
        "Nib International Bank",
        "Cooperative Bank of Oromia",
        "Wegagen Bank",
        "Oromia International Bank",
        "Lion International Bank",
        "Abay Bank",
        "Enat Bank",
        "Addis International Bank",
        "Global Bank Ethiopia",
        "Amhara Bank",
        "Tsehay Bank",
        "Gadaa Bank",
        "Siinqee Bank"
    ];

    const INTERNATIONAL_PLATFORMS = [
        "PayPal",
        "Stripe",
        "Wise",
        "Revolut",
        "Payoneer",
        "Skrill",
        "Binance Pay",
        "Other International"
    ];

    // Process Gateways in Memo
    const CORE_GATEWAYS = [
        { id: 'bank', name: 'Bank Transfer (Orchestration)', type: 'bank', description: 'Users see bank details for manual transfers.', enabled: true, details: '100012345678 - MBC PLC' },
        { id: 'mobile', name: 'Mobile Money (Digital Wallet)', type: 'mobile', description: 'USSD codes or mobile number for wallet payments.', enabled: true, details: '*889#' },
        { id: 'card', name: 'Standard Card Processing', type: 'card', description: 'Integrated card terminal for direct payments.', enabled: false, details: 'Stripe/Flutterwave' }
    ];

    // Process Gateways in Memo
    const allGateways = useMemo(() => {
        const savedGateways = settings?.paymentGateways || [];

        // Merge saved settings into core gateways
        const mergedGateways = CORE_GATEWAYS.map(core => {
            const saved = savedGateways.find(s => s.id === core.id);
            return saved ? { ...core, ...saved } : core;
        });

        // Add custom gateways that aren't core
        const customGateways = savedGateways.filter(s => !CORE_GATEWAYS.find(c => c.id === s.id));

        return [...mergedGateways, ...customGateways];
    }, [settings?.paymentGateways]);

    const toggleGateway = (gwId) => {
        updateSettings(prev => {
            const saved = prev.paymentGateways || [];

            // Reconstruct the full list for clean serialization (DATA ONLY)
            const merged = CORE_GATEWAYS.map(core => {
                const s = saved.find(item => item.id === core.id);
                return s ? { ...core, ...s } : core;
            });
            const custom = saved.filter(s => !CORE_GATEWAYS.find(c => c.id === s.id));
            const all = [...merged, ...custom];

            const updated = all.map(g => g.id === gwId ? { ...g, enabled: !g.enabled } : g);
            return { ...prev, paymentGateways: updated };
        });
    };

    const updateDetails = (gwId, val) => {
        updateSettings(prev => {
            const saved = prev.paymentGateways || [];
            // Reconstruct for clean data transfer
            const merged = CORE_GATEWAYS.map(core => {
                const s = saved.find(item => item.id === core.id);
                return s ? { ...core, ...s } : core;
            });
            const custom = saved.filter(s => !CORE_GATEWAYS.find(c => c.id === s.id));
            const all = [...merged, ...custom];

            const updated = all.map(g => g.id === gwId ? { ...g, details: val } : g);
            return { ...prev, paymentGateways: updated };
        });
    };

    // Use local state for immediate feedback on text areas to prevent clearing
    const [localDetails, setLocalDetails] = useState({});

    const handleDetailChange = (gwId, val) => {
        setLocalDetails(prev => ({ ...prev, [gwId]: val }));
    };

    const handleDetailBlur = (gwId) => {
        if (localDetails[gwId] !== undefined) {
            updateDetails(gwId, localDetails[gwId]);
        }
    };
    const [viewingTrx, setViewingTrx] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Manual Form State
    const [newTrx, setNewTrx] = useState({
        userId: '',
        user: '',
        amount: '',
        currency: 'USD',
        category: 'Service', // 'Service' or 'Subscription'
        itemId: '',
        status: 'Completed',
        paymentMethod: 'Cash Injection',
        referenceNo: '',
        date: new Date().toISOString().split('T')[0]
    });

    const filteredTransactions = useMemo(() => {
        let result = transactions;
        if (timeFilter !== 'All') {
            const cutoff = new Date();
            if (timeFilter === 'Day') cutoff.setHours(cutoff.getHours() - 24);
            if (timeFilter === 'Week') cutoff.setDate(cutoff.getDate() - 7);
            if (timeFilter === 'Month') cutoff.setDate(cutoff.getDate() - 30);
            result = result.filter(t => new Date(t.date || t.timestamp) >= cutoff);
        }
        if (searchTerm) {
            result = result.filter(t =>
                t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.id && String(t.id).toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        return result.sort((a, b) => {
            const timeB = new Date(b.timestamp || b.created_at || b.date).getTime();
            const timeA = new Date(a.timestamp || a.created_at || a.date).getTime();
            return timeB - timeA;
        });
    }, [transactions, timeFilter, searchTerm]);

    const stats = useMemo(() => {
        const completed = filteredTransactions.filter(t => t.status === 'Completed' || t.status === 'Paid');
        const revenue = completed.reduce((acc, curr) => {
            // "Only deposited" logic: sum specific currency fields, or amount if it matches selected currency
            const amount = currency === 'ETB'
                ? (curr.amount_etb || (curr.currency === 'ETB' ? curr.amount : 0))
                : (curr.amount_usd || (curr.currency === 'USD' || !curr.currency ? curr.amount : 0));
            return acc + (Number(amount) || 0);
        }, 0);
        const count = filteredTransactions.length;
        const avg = count > 0 ? (revenue / (completed.length || 1)).toFixed(2) : 0;

        const serviceRev = completed.filter(t => t.category === 'Service').reduce((acc, curr) => {
            const amount = currency === 'ETB'
                ? (curr.amount_etb || (curr.currency === 'ETB' ? curr.amount : 0))
                : (curr.amount_usd || (curr.currency === 'USD' || !curr.currency ? curr.amount : 0));
            return acc + (Number(amount) || 0);
        }, 0);
        const subRev = completed.filter(t => t.category === 'Subscription').reduce((acc, curr) => {
            const amount = currency === 'ETB'
                ? (curr.amount_etb || (curr.currency === 'ETB' ? curr.amount : 0))
                : (curr.amount_usd || (curr.currency === 'USD' || !curr.currency ? curr.amount : 0));
            return acc + (Number(amount) || 0);
        }, 0);

        return {
            revenue,
            count,
            avg,
            pending: filteredTransactions.filter(t => t.status === 'Pending').length,
            serviceRev,
            subRev
        };
    }, [filteredTransactions, currency]);

    const chartData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(date => {
            const dayTrx = transactions.filter(t => (t.date || t.timestamp || '').split('T')[0] === date && (t.status === 'Completed' || t.status === 'Paid'));
            const amount = dayTrx.reduce((sum, t) => {
                const val = currency === 'ETB'
                    ? (t.amount_etb || (t.currency === 'ETB' ? t.amount : 0))
                    : (t.amount_usd || (t.currency === 'USD' || !t.currency ? t.amount : 0));
                return sum + (Number(val) || 0);
            }, 0);
            return {
                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                amount
            };
        });
    }, [transactions, currency]);

    const allocationData = [
        { name: 'Services', value: stats.serviceRev || 0 },
        { name: 'Subscriptions', value: stats.subRev || 0 }
    ];

    const COLORS = ['#c9a96a', '#4caf50'];

    const handleAddTrx = (e) => {
        e.preventDefault();
        const selectedUser = users.find(u => u.id === newTrx.userId);
        let itemLabel = '';
        if (newTrx.category === 'Service') {
            itemLabel = services.find(s => s.id === newTrx.itemId)?.title || 'Custom Service';
        } else {
            itemLabel = plans.find(p => p.id === newTrx.itemId)?.name || 'Custom Subscription';
        }

        const trxData = {
            ...newTrx,
            id: `TRX-${Date.now()}`,
            user: selectedUser ? selectedUser.name : newTrx.user,
            type: itemLabel,
            amount: Number(newTrx.amount),
            timestamp: new Date().toISOString(),
            // Ensure reference logic is preserved
            referenceNo: newTrx.referenceNo || 'N/A'
        };
        addTransaction(trxData);
        setIsAdding(false);
        // Trigger Invoice Preview
        setViewingTrx(trxData);
        setNewTrx({
            userId: '',
            user: '',
            amount: '',
            category: 'Service',
            itemId: '',
            status: 'Completed',
            paymentMethod: 'Cash Injection',
            referenceNo: '',
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleCategoryChange = (cat) => {
        setNewTrx({ ...newTrx, category: cat, itemId: '', amount: '' });
    };

    const handleItemChange = (itemId) => {
        let price = '';
        if (newTrx.category === 'Service') {
            const s = services.find(s => s.id === itemId);
            price = s ? s.price.replace('$', '') : '';
        } else {
            const p = plans.find(p => p.id === itemId);
            price = p ? p.price : '';
        }
        setNewTrx({ ...newTrx, itemId, amount: price });
    };

    const handleApprovePayment = async (trx) => {
        try {
            // 1. Processing item details...
            const itemName = trx.item || trx.item_name || trx.type || trx.itemName || 'Executive Service';

            // 2. If it's a subscription, update the user's plan
            if (trx.category === 'Subscription') {
                const userId = trx.userId || trx.user_id;
                if (userId) {
                    await updateUserSubscription(userId, itemName);
                }
            } else if (trx.category === 'Service' && (trx.itemId || trx.item_id)) {
                await updateBooking({ id: trx.itemId || trx.item_id, status: 'Paid' });
            }

            // 3. Generate and Persist Invoice ID
            const invoiceId = trx.invoiceId || `INV-${Date.now()}`;
            const updatedTrx = { ...trx, status: 'Completed', invoiceId };
            await updateTransaction(updatedTrx);

            // 4. Send high-fidelity notification to user
            if (trx.userId || trx.user_id) {
                await sendUserNotification(trx.userId || trx.user_id, {
                    title: 'Executive Settlement Confirmed',
                    message: `Your payment of $${trx.amount} for ${itemName} has been verified and processed. Your privileges have been updated. Your official invoice (#${invoiceId}) is now available for download in your Financial Ledger.`,
                    type: 'success',
                    data: {
                        invoiceId,
                        transactionId: trx.id,
                        amount: trx.amount,
                        item: itemName,
                        confirmedAt: new Date().toISOString()
                    }
                });
            }

            // Keep modal open but update status visually
            setViewingTrx(updatedTrx);
        } catch (err) {
            console.error("Approval error:", err);
        }
    };

    const handleDenyPayment = async (trx) => {
        try {
            const updatedTrx = { ...trx, status: 'Denied' };
            await updateTransaction(updatedTrx);

            if (trx.userId || trx.user_id) {
                await sendUserNotification(trx.userId || trx.user_id, {
                    title: 'Settlement Denied',
                    message: `Your payment reference for ${trx.item || trx.type || 'Service'} was not verified. Please contact concierge or submit a valid reference.`,
                    type: 'error'
                });
            }
            // Keep modal open to show denied status
            setViewingTrx(updatedTrx);
        } catch (err) {
            console.error("Denial error:", err);
        }
    };


    return (
        <div className="admin-payments-container" style={{ animation: 'fadeIn 0.5s ease' }}>
            <header className="admin-flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>Financial Command</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem' }}>Authoritative registry and revenue telemetry hub.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {['USD', 'ETB'].map(curr => (
                            <button
                                key={curr}
                                onClick={() => setCurrency(curr)}
                                style={{
                                    padding: '0.4rem 0.8rem', borderRadius: '8px', border: 'none',
                                    background: currency === curr ? 'var(--color-gold)' : 'transparent',
                                    color: currency === curr ? '#000' : '#888',
                                    fontWeight: '900', fontSize: '0.7rem', cursor: 'pointer', transition: '0.2s'
                                }}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn btn-primary"
                        style={{ background: 'transparent', color: 'var(--color-gold)', border: '1px dashed var(--color-gold)', gap: '0.8rem', padding: '0.8rem 1.5rem' }}
                    >
                        <FiPlus /> MANUAL ENTRY
                    </button>
                </div>
            </header>

            {/* Inner Sub-Navigation Tabs */}
            <div className="admin-card" style={{ padding: '0.5rem', marginBottom: '2.5rem', display: 'inline-flex', gap: '0.5rem', background: 'rgba(255,255,255,0.02)' }}>
                {[
                    { id: 'dashboard', label: 'Financial Intelligence', icon: <FiActivity /> },
                    { id: 'transactions', label: 'Transaction Ledger', icon: <FiDollarSign /> },
                    { id: 'gateways', label: 'Payment Gateways', icon: <FiLayers /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '0.8rem 1.5rem',
                            border: 'none',
                            borderRadius: '10px',
                            background: activeTab === tab.id ? 'var(--color-gold)' : 'transparent',
                            color: activeTab === tab.id ? '#000' : '#555',
                            fontSize: '0.8rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            transition: '0.3s'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' ? (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                    >
                        {/* Top Stat Bar */}
                        <div className="admin-stats-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                            <div className="admin-card" style={{ padding: '1.5rem' }}>
                                <div style={{ color: '#444', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Liquidity</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '800' }}>{currency === 'ETB' ? 'ETB ' : '$'}{stats.revenue.toLocaleString()}</div>
                                    <div style={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: 'bold' }}><FiArrowUpRight /> +12%</div>
                                </div>
                            </div>
                            <div className="admin-card" style={{ padding: '1.5rem' }}>
                                <div style={{ color: '#444', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Service Rev</div>
                                <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '800' }}>{currency === 'ETB' ? 'ETB ' : '$'}{stats.serviceRev.toLocaleString()}</div>
                            </div>
                            <div className="admin-card" style={{ padding: '1.5rem' }}>
                                <div style={{ color: '#444', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Subscription Rev</div>
                                <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '800' }}>{currency === 'ETB' ? 'ETB ' : '$'}{stats.subRev.toLocaleString()}</div>
                            </div>
                            <div className="admin-card" style={{ padding: '1.5rem' }}>
                                <div style={{ color: '#444', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Avg Ticket</div>
                                <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '800' }}>{currency === 'ETB' ? 'ETB ' : '$'}{stats.avg}</div>
                            </div>
                        </div>

                        <div className="admin-grid-2" style={{ marginBottom: '2rem', gridTemplateColumns: '2fr 1.2fr' }}>
                            {/* Revenue Graph */}
                            <div className="admin-card" style={{ background: 'rgba(10,10,10,0.8)', height: '450px' }}>
                                <div className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}><FiActivity color="var(--color-gold)" /> Real-time Revenue Matrix (7D)</h3>
                                    <div style={{ color: '#444', fontSize: '0.8rem' }}>Authoritative telemetry active.</div>
                                </div>
                                <div style={{ height: '320px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="payColor" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 11, fontWeight: '700' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#444', fontSize: 11 }} />
                                            <Tooltip
                                                contentStyle={{ background: '#000', border: '1px solid #222', borderRadius: '15px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}
                                                itemStyle={{ color: 'var(--color-gold)', fontWeight: '800' }}
                                            />
                                            <Area type="monotone" dataKey="amount" stroke="var(--color-gold)" strokeWidth={4} fillOpacity={1} fill="url(#payColor)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Allocation */}
                            <div className="admin-card" style={{ background: 'rgba(10,10,10,0.8)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '2rem', textAlign: 'center' }}><FiPieChart style={{ marginRight: '10px' }} /> Revenue Allocation</h3>
                                <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={allocationData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={8}
                                                dataKey="value"
                                            >
                                                {allocationData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '12px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800' }}>100%</div>
                                        <div style={{ color: '#444', fontSize: '0.6rem', textTransform: 'uppercase' }}>Hydrated</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
                                    {allocationData.map((d, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[i] }} />
                                                <span style={{ color: '#888', fontSize: '0.9rem' }}>{d.name}</span>
                                            </div>
                                            <span style={{ color: '#fff', fontWeight: 'bold' }}>{currency === 'ETB' ? 'ETB ' : '$'}{d.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : activeTab === 'transactions' ? (
                    <motion.div
                        key="transactions"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                    >
                        {/* Filters & Quick Search - Integrated into Transactions Tab */}
                        <div className="admin-card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.5rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Discovery Search</label>
                                <div style={{ position: 'relative' }}>
                                    <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                                    <input
                                        placeholder="Audit by name or TRX identifier..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{ width: '100%', padding: '1rem 1rem 1rem 2.8rem', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>
                            <div style={{ minWidth: '350px' }}>
                                <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Audit Horizon</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                    {['Day', 'Week', 'Month', 'All'].map(range => (
                                        <button
                                            key={range}
                                            onClick={() => setTimeFilter(range)}
                                            style={{
                                                padding: '0.9rem', borderRadius: '10px',
                                                border: timeFilter === range ? '1px solid var(--color-gold)' : '1px solid #1a1a1a',
                                                background: timeFilter === range ? 'rgba(201,169,106,0.1)' : 'rgba(255,255,255,0.02)',
                                                color: timeFilter === range ? 'var(--color-gold)' : '#444',
                                                fontSize: '0.7rem', fontWeight: '900', cursor: 'pointer', transition: '0.3s'
                                            }}
                                        >{range.toUpperCase()}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="admin-table-wrapper">
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--admin-border)' }}>
                                        <th style={{ padding: '1.5rem', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '900' }}>TRX Index</th>
                                        <th style={{ padding: '1.5rem', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '900' }}>Identity</th>
                                        <th style={{ padding: '1.5rem', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '900' }}>Liquidity</th>
                                        <th style={{ padding: '1.5rem', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '900' }}>Mechanism / Ref</th>
                                        <th style={{ padding: '1.5rem', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '900' }}>Status</th>
                                        <th style={{ padding: '1.5rem', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '900' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map(trx => (
                                        <tr
                                            key={trx.id}
                                            onClick={() => setViewingTrx(trx)}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: '0.2s' }}
                                            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                                            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1.5rem', color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{trx.id}</td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>{trx.user}</div>
                                                <div style={{ color: '#444', fontSize: '0.7rem' }}>{trx.category}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem', color: '#fff', fontWeight: '900', fontSize: '1.1rem' }}>
                                                {currency === 'ETB' ? 'ETB ' : '$'}{(currency === 'ETB' ? (trx.amount_etb || trx.amount * 120) : (trx.amount_usd || trx.amount)).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div style={{ color: '#fff', fontSize: '0.85rem' }}>{trx.paymentMethod}</div>
                                                <div style={{ color: '#444', fontSize: '0.7rem', fontFamily: 'monospace' }}>{trx.referenceNo || 'NO_REF'}</div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <span style={{
                                                    padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase',
                                                    background: trx.status === 'Completed' || trx.status === 'Paid' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                                                    color: trx.status === 'Completed' || trx.status === 'Paid' ? '#4caf50' : '#ff9800'
                                                }}>{trx.status}</span>
                                            </td>
                                            <td style={{ padding: '1.5rem', color: '#666', fontSize: '0.8rem', fontWeight: 'bold' }}>{trx.date || new Date(trx.timestamp).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="gateways"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <div className="admin-grid-2">
                            <div className="admin-card">
                                <div className="admin-flex-between" style={{ marginBottom: '2rem' }}>
                                    <div>
                                        <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Configure Settlement Gateways</h3>
                                        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem' }}>Manage the payment methods available to your executive members.</p>
                                    </div>
                                    <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Executive Payment Switch</div>
                                        <button
                                            onClick={() => {
                                                updateSettings(prev => ({ ...prev, paymentsEnabled: !prev.paymentsEnabled }));
                                            }}
                                            style={{
                                                padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid',
                                                borderColor: settings?.paymentsEnabled ? 'rgba(76,175,80,0.3)' : 'rgba(239,68,68,0.3)',
                                                background: settings?.paymentsEnabled ? 'rgba(76,175,80,0.1)' : 'rgba(239,68,68,0.1)',
                                                color: settings?.paymentsEnabled ? '#4caf50' : '#ef4444',
                                                fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', transition: '0.3s',
                                                display: 'flex', alignItems: 'center', gap: '0.8rem', width: '100%'
                                            }}
                                        >
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: settings?.paymentsEnabled ? '#4caf50' : '#ef4444', boxShadow: settings?.paymentsEnabled ? '0 0 10px #4caf50' : '0 0 10px #ef4444' }} />
                                            {settings?.paymentsEnabled ? 'PAYMENTS ONLINE' : 'PAYMENTS OFFLINE'}
                                        </button>
                                        <div style={{ color: '#444', fontSize: '0.6rem', marginTop: '0.6rem' }}>{settings?.paymentsEnabled ? 'Members can perform settlements' : 'Platform settlements are currently coordinated via concierge'}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <button
                                        onClick={() => setIsAddingGateway(true)}
                                        style={{ padding: '1rem', background: 'rgba(201,169,106,0.1)', border: '1px dashed var(--color-gold)', color: 'var(--color-gold)', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}
                                    >
                                        <FiPlus /> DEPLOY CUSTOM GATEWAY
                                    </button>
                                    {allGateways.map(gw => (
                                        <div key={gw.id} style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div className="admin-flex-between" style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                    <div style={{ width: '50px', height: '50px', background: 'rgba(201,169,106,0.1)', color: 'var(--color-gold)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {getGwIcon(gw.type || gw.id, gw.icon)}
                                                    </div>
                                                    <div>
                                                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{gw.name}</div>
                                                        <div style={{ color: '#444', fontSize: '0.75rem' }}>{gw.description}</div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <button
                                                        onClick={() => toggleGateway(gw.id)}
                                                        style={{
                                                            padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: gw.enabled ? 'rgba(76,175,80,0.1)' : 'rgba(239,68,68,0.1)',
                                                            color: gw.enabled ? '#4caf50' : '#ef4444',
                                                            fontSize: '0.75rem', fontWeight: '900', cursor: 'pointer', transition: '0.3s'
                                                        }}
                                                    >
                                                        {gw.enabled ? 'ACTIVE' : 'DISABLED'}
                                                    </button>
                                                    {/* Delete button for non-core gateways */}
                                                    {!['bank', 'mobile', 'card'].includes(gw.id) && (
                                                        <button
                                                            onClick={() => {
                                                                updateSettings(prev => ({
                                                                    ...prev,
                                                                    paymentGateways: (prev.paymentGateways || []).filter(g => g.id !== gw.id)
                                                                }));
                                                            }}
                                                            style={{ padding: '0.5rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {
                                                gw.id === 'bank' ? (
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                        <div className="admin-field">
                                                            <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Bank Name</label>
                                                            <input
                                                                value={gw.bankName || ''}
                                                                onChange={e => {
                                                                    const updated = allGateways.map(g => g.id === gw.id ? { ...g, bankName: e.target.value } : g);
                                                                    updateSettings(prev => ({ ...prev, paymentGateways: updated }));
                                                                }}
                                                                style={{ width: '100%', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '0.8rem', color: '#fff', fontSize: '0.8rem' }}
                                                            />
                                                        </div>
                                                        <div className="admin-field">
                                                            <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Account Number</label>
                                                            <input
                                                                value={gw.accountNumber || ''}
                                                                onChange={e => {
                                                                    const updated = allGateways.map(g => g.id === gw.id ? { ...g, accountNumber: e.target.value } : g);
                                                                    updateSettings(prev => ({ ...prev, paymentGateways: updated }));
                                                                }}
                                                                style={{ width: '100%', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '0.8rem', color: '#fff', fontSize: '0.8rem' }}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="admin-field">
                                                        <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Payment Instructions / Credentials</label>
                                                        <textarea
                                                            value={localDetails[gw.id] !== undefined ? localDetails[gw.id] : gw.details}
                                                            onChange={e => handleDetailChange(gw.id, e.target.value)}
                                                            onBlur={() => handleDetailBlur(gw.id)}
                                                            placeholder="Enter account details or payment instructions..."
                                                            style={{ width: '100%', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '1rem', color: '#fff', fontSize: '0.9rem', minHeight: '80px', resize: 'none' }}
                                                        />
                                                    </div>
                                                )
                                            }
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="admin-card" style={{ background: 'rgba(201,169,106,0.02)', border: '1px solid rgba(201,169,106,0.1)' }}>
                                <FiInfo size={32} color="var(--color-gold)" style={{ marginBottom: '1.5rem' }} />
                                <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Gateway Architecture</h3>
                                <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                    When you enable a gateway, it becomes visible to all executive members during their settlement phase.
                                    Instructions provided here will be displayed to guide the user through the physical or digital orchestration of liquidity.
                                </p>
                                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#000', borderRadius: '15px' }}>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: '900', marginBottom: '0.5rem' }}>SYSTEM STATUS</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#444', fontSize: '0.8rem' }}>
                                        <span>Orchestrator Heartbeat</span>
                                        <span style={{ color: '#4caf50' }}>OPTIMAL</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual Add Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="modal active" onClick={() => setIsAdding(false)}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                maxWidth: '750px',
                                maxHeight: '95vh',
                                overflowY: 'auto',
                                padding: '3rem',
                                borderRadius: '35px',
                                background: '#111',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'var(--color-gold) transparent'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                <div>
                                    <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.4rem', fontFamily: 'var(--font-heading)' }}>Revenue Core Injection</h2>
                                    <p style={{ color: '#555', fontSize: '0.9rem' }}>Synchronize manual liquidity into the authoritative cloud ledger.</p>
                                </div>
                                <button onClick={() => setIsAdding(false)} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={20} /></button>
                            </div>

                            <form onSubmit={handleAddTrx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Target Member Profile</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiUser style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)' }} />
                                        <select
                                            value={newTrx.userId}
                                            onChange={e => setNewTrx({ ...newTrx, userId: e.target.value })}
                                            required
                                            style={{ width: '100%', paddingLeft: '3.5rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff', height: '55px' }}
                                        >
                                            <option value="">Locate entry originator...</option>
                                            {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '1rem', letterSpacing: '0.05em' }}>Asset Classification</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#0d0d0d', padding: '0.5rem', borderRadius: '18px', border: '1px solid #222' }}>
                                        {['Service', 'Subscription'].map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => handleCategoryChange(cat)}
                                                style={{
                                                    padding: '1rem', borderRadius: '13px', border: 'none',
                                                    background: newTrx.category === cat ? 'var(--color-gold)' : 'transparent',
                                                    color: newTrx.category === cat ? '#000' : '#555',
                                                    fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
                                                }}
                                            >
                                                {cat === 'Service' ? <FiPackage size={18} /> : <FiLayers size={18} />}
                                                {cat.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
                                        {newTrx.category === 'Service' ? 'Applied Treatment' : 'Premium Tier'}
                                    </label>
                                    <select
                                        value={newTrx.itemId}
                                        onChange={e => handleItemChange(e.target.value)}
                                        required
                                        style={{ width: '100%', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff', height: '55px' }}
                                    >
                                        <option value="">Select registry item...</option>
                                        {newTrx.category === 'Service'
                                            ? services.map(s => <option key={s.id} value={s.id}>{s.title} ({s.price})</option>)
                                            : plans.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)
                                        }
                                    </select>
                                </div>

                                <div>
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Settlement Currency</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#0d0d0d', padding: '0.5rem', borderRadius: '15px', border: '1px solid #222' }}>
                                        {['USD', 'ETB'].map(curr => (
                                            <button
                                                key={curr}
                                                type="button"
                                                onClick={() => setNewTrx({ ...newTrx, currency: curr })}
                                                style={{
                                                    padding: '0.6rem', borderRadius: '10px', border: 'none',
                                                    background: newTrx.currency === curr ? 'var(--color-gold)' : 'transparent',
                                                    color: newTrx.currency === curr ? '#000' : '#444',
                                                    fontWeight: '900', fontSize: '0.7rem', cursor: 'pointer', transition: '0.3s'
                                                }}
                                            >
                                                {curr}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Effective Liquidity ({newTrx.currency})</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)', fontWeight: 'bold' }}>{newTrx.currency === 'USD' ? '$' : 'Br'}</div>
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={newTrx.amount}
                                            onChange={e => setNewTrx({ ...newTrx, amount: e.target.value })}
                                            required
                                            style={{ width: '100%', paddingLeft: '3.5rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff', fontSize: '1.3rem', fontWeight: '900', height: '55px' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Injection Mechanism</label>
                                    <select value={['Cash Injection', 'Bank Orchestration', 'Card Terminal', 'Mobile Wallet'].includes(newTrx.paymentMethod) ? newTrx.paymentMethod : 'custom'} onChange={e => setNewTrx({ ...newTrx, paymentMethod: e.target.value === 'custom' ? '' : e.target.value })} style={{ width: '100%', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff', height: '55px' }}>
                                        <option value="Cash Injection">Physical Cash Injection</option>
                                        <option value="Bank Orchestration">Bank Orchestration (FT)</option>
                                        <option value="Card Terminal">Direct Card Terminal</option>
                                        <option value="Mobile Wallet">Mobile Money Wallet</option>
                                        <option value="custom">Bespoke Mechanism...</option>
                                    </select>
                                    {(!['Cash Injection', 'Bank Orchestration', 'Card Terminal', 'Mobile Wallet'].includes(newTrx.paymentMethod) || newTrx.paymentMethod === '') && (
                                        <input
                                            placeholder="Specify Mechanism..."
                                            value={newTrx.paymentMethod === 'custom' ? '' : newTrx.paymentMethod}
                                            onChange={e => setNewTrx({ ...newTrx, paymentMethod: e.target.value })}
                                            style={{ width: '100%', marginTop: '0.5rem', background: '#0d0d0d', border: '1px solid #c9a96a44', borderRadius: '10px', color: '#fff', padding: '0.8rem' }}
                                        />
                                    )}
                                </div>

                                <div>
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Injection Date</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiCalendar style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
                                        <input
                                            type="date"
                                            value={newTrx.date}
                                            onChange={e => setNewTrx({ ...newTrx, date: e.target.value })}
                                            style={{ width: '100%', paddingLeft: '3.5rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff', height: '55px' }}
                                        />
                                    </div>
                                </div>

                                {newTrx.paymentMethod !== 'Cash Injection' && (
                                    <div style={{ gridColumn: 'span 2', animation: 'fadeInDown 0.4s ease' }}>
                                        <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Registry Reference / FT Identifier</label>
                                        <input
                                            placeholder="e.g. CORE-FT-82374923"
                                            value={newTrx.referenceNo}
                                            onChange={e => setNewTrx({ ...newTrx, referenceNo: e.target.value })}
                                            style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: 'var(--color-gold)', fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.1em' }}
                                        />
                                    </div>
                                )}

                                <div style={{ gridColumn: 'span 2', marginTop: '1.5rem', display: 'flex', gap: '1.5rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 2, padding: '1.2rem', fontWeight: '900', fontSize: '0.9rem', letterSpacing: '0.1em' }}>AUTHORIZE INJECTION</button>
                                    <button type="button" className="btn btn-secondary" style={{ flex: 1, padding: '1.2rem', fontWeight: '900', fontSize: '0.9rem', color: '#444' }} onClick={() => setIsAdding(false)}>ABORT</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Memo Modal */}
            <AnimatePresence>
                {viewingTrx && (
                    <div className="modal active" onClick={() => setViewingTrx(null)}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                maxWidth: '460px',
                                padding: '2.5rem',
                                borderRadius: '35px',
                                background: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}
                        >
                            <div className="admin-flex-between" style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '50px', height: '50px', background: 'rgba(76,175,80,0.1)', color: '#4caf50', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiCheckCircle size={24} /></div>
                                    <div>
                                        <div style={{ color: '#444', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase' }}>Ledger Record</div>
                                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{viewingTrx.id}</div>
                                    </div>
                                </div>
                                <button className="btn btn-secondary" style={{ padding: '0.5rem', color: '#ff4444' }} onClick={() => { deleteTransaction(viewingTrx.id); setViewingTrx(null); }}><FiTrash2 /></button>
                            </div>

                            <div style={{ background: '#050505', padding: '2rem', borderRadius: '20px', border: '1px solid #111', display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', color: 'rgba(255,255,255,0.02)', fontWeight: '900', zIndex: 0 }}>MBC</div>
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div className="admin-flex-between"><span style={{ color: '#444', fontSize: '0.8rem' }}>Originator</span><span style={{ color: '#fff', fontWeight: 'bold' }}>{viewingTrx.user}</span></div>
                                    <div className="admin-flex-between"><span style={{ color: '#444', fontSize: '0.8rem' }}>System Classification</span><span style={{ color: '#fff' }}>{viewingTrx.category}</span></div>
                                    <div className="admin-flex-between"><span style={{ color: '#444', fontSize: '0.8rem' }}>Specific Item</span><span style={{ color: '#fff' }}>{viewingTrx.item || viewingTrx.item_name || viewingTrx.type || 'N/A'}</span></div>
                                    <div className="admin-flex-between"><span style={{ color: '#444', fontSize: '0.8rem' }}>Liquidity</span><span style={{ color: 'var(--color-gold)', fontWeight: '900', fontSize: '1.2rem' }}>${viewingTrx.amount.toLocaleString()}</span></div>
                                    <div className="admin-flex-between">
                                        <span style={{ color: '#444', fontSize: '0.8rem' }}>Mechanism / Ref</span>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#fff' }}>{viewingTrx.paymentMethod}</div>
                                            <div style={{ color: '#555', fontSize: '0.7rem', fontFamily: 'monospace' }}>{viewingTrx.referenceNo || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="admin-flex-between"><span style={{ color: '#444', fontSize: '0.8rem' }}>Effective Date</span><span style={{ color: '#666' }}>{viewingTrx.date || new Date(viewingTrx.timestamp).toLocaleDateString()}</span></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                    {(viewingTrx.status === 'Completed' || viewingTrx.status === 'Paid') && (
                                        <button
                                            className="btn btn-primary"
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                                            onClick={async () => {
                                                const invoiceDate = viewingTrx.date || new Date(viewingTrx.timestamp).toLocaleDateString();

                                                // Create a hidden container for the invoice capture (A4 Ratio)
                                                const container = document.createElement('div');
                                                container.style.position = 'fixed';
                                                container.style.top = '-10000px';
                                                container.style.left = '-10000px';
                                                container.style.width = '1200px';
                                                container.style.background = '#fff';

                                                // High-Fidelity Exact Match Layout (Based on Reference Image)
                                                container.innerHTML = `
                                                    <div style="padding: 100px; font-family: 'Montserrat', sans-serif; color: #1a1a1a; min-height: 1600px; position: relative; background: #fff; overflow: hidden;">
                                                        <!-- Watermark Layer -->
                                                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 180px; color: rgba(0,0,0,0.02); pointer-events: none; z-index: 1; font-weight: 900; white-space: nowrap; text-transform: uppercase;">
                                                            METRO BLACKLINE METRO BLACKLINE<br/>METRO BLACKLINE METRO BLACKLINE<br/>METRO BLACKLINE METRO BLACKLINE
                                                        </div>

                                                        <div style="position: relative; z-index: 2;">
                                                            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #c9a96a; padding-bottom: 40px; margin-bottom: 60px;">
                                                                <div style="font-family: 'Cormorant Garamond', serif; font-size: 38px; font-weight: bold; color: #000; letter-spacing: 2px;">METRO BLACKLINE CARE</div>
                                                                <div style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 700; color: #c9a96a; text-transform: uppercase; letter-spacing: 4px;">EXECUTIVE LEDGER</div>
                                                            </div>
                                                            
                                                            <div style="display: flex; justify-content: space-between; margin-bottom: 80px;">
                                                                <div>
                                                                    <div style="font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Verified Beneficiary</div>
                                                                    <div style="font-size: 24px; font-weight: 700; color: #000; margin-bottom: 4px;">${viewingTrx.user_name || viewingTrx.user}</div>
                                                                    <div style="font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Private Client Registry</div>
                                                                </div>
                                                                <div style="text-align: right;">
                                                                    <div style="margin-bottom: 30px;">
                                                                        <div style="font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Audit Index</div>
                                                                        <div style="font-size: 16px; font-weight: 700; color: #000;">${viewingTrx.id}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div style="font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Effective Date</div>
                                                                        <div style="font-size: 18px; font-weight: 700; color: #000;">${invoiceDate}</div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 100px;">
                                                                <thead>
                                                                    <tr style="background: rgba(0,0,0,0.02);">
                                                                        <th style="text-align: left; padding: 25px 15px; color: #aaa; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">Asset Classification</th>
                                                                        <th style="text-align: left; padding: 25px 15px; color: #aaa; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">Description</th>
                                                                        <th style="text-align: left; padding: 25px 15px; color: #aaa; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">Mechanism</th>
                                                                        <th style="text-align: right; padding: 25px 15px; color: #aaa; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900;">Yield</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr style="border-bottom: 1px solid #eee;">
                                                                        <td style="padding: 40px 15px; font-weight: 800; font-size: 16px; color: #000;">${viewingTrx.category.toUpperCase()}</td>
                                                                        <td style="padding: 40px 15px; font-size: 16px; color: #444;">${viewingTrx.item || viewingTrx.item_name || viewingTrx.type || 'Standard Service'}</td>
                                                                        <td style="padding: 40px 15px; font-size: 16px; color: #444;">${viewingTrx.paymentMethod || 'Auth Transfer'}</td>
                                                                        <td style="padding: 40px 15px; text-align: right; font-weight: 900; font-size: 20px; color: #000;">$${viewingTrx.amount.toLocaleString()}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>

                                                            <div style="display: flex; justify-content: flex-end; margin-top: 50px;">
                                                                <div style="background: #000; color: #fff; padding: 40px 60px; border-radius: 4px 4px 4px 50px; text-align: right; min-width: 350px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
                                                                    <div style="font-size: 11px; color: #c9a96a; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px;">Authorized Liquidity</div>
                                                                    <div style="font-size: 48px; font-weight: 900; font-family: 'Cormorant Garamond', serif;">$${viewingTrx.amount.toLocaleString()}</div>
                                                                </div>
                                                            </div>

                                                            <div style="margin-top: 200px; text-align: center;">
                                                                <div style="font-size: 9px; color: #bbb; text-transform: uppercase; letter-spacing: 2px; line-height: 2;">
                                                                    This is an authoritative digital record generated by Metro Blackline Care Systems.<br/>
                                                                    Authenticated by Executive Command Portal. All rights reserved 2026.
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                `;

                                                document.body.appendChild(container);

                                                try {
                                                    const canvas = await html2canvas(container, {
                                                        useCORS: true,
                                                        scale: 2,
                                                        backgroundColor: '#ffffff'
                                                    });
                                                    const dataUrl = canvas.toDataURL('image/png');
                                                    const a = document.createElement('a');
                                                    a.href = dataUrl;
                                                    a.download = `MBC_Invoice_${viewingTrx.id}.png`;
                                                    a.click();
                                                } catch (err) {
                                                    console.error("Capture Failed:", err);
                                                } finally {
                                                    document.body.removeChild(container);
                                                }
                                            }}>
                                            <FiDownload /> Download Invoice
                                        </button>
                                    )}
                                    {viewingTrx.status === 'Pending' && (
                                        <>
                                            <button
                                                className="btn btn-primary"
                                                style={{ background: '#4caf50', borderColor: '#4caf50', color: '#fff', padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                                                onClick={() => handleApprovePayment(viewingTrx)}
                                            >
                                                <FiCheckCircle /> APPROVE
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ color: '#ff4444', borderColor: 'rgba(255,68,68,0.2)', padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                                                onClick={() => handleDenyPayment(viewingTrx)}
                                            >
                                                DENY
                                            </button>
                                        </>
                                    )}
                                </div>
                                <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem', width: 'fit-content' }} onClick={() => setViewingTrx(null)}>DISMISS</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isAddingGateway && (
                    <div className="modal active" onClick={() => setIsAddingGateway(false)}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                maxWidth: '600px',
                                padding: '3rem',
                                borderRadius: '35px',
                                background: '#111',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Deploy Custom Gateway</h2>
                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>Expand your executive settlement surface by adding a new payment architecture.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="admin-field">
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Gateway Name</label>
                                    <input
                                        placeholder="e.g. Crypto Ledger, PayPal Business"
                                        value={newGateway.name}
                                        onChange={e => setNewGateway({ ...newGateway, name: e.target.value, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff' }}
                                    />
                                </div>
                                <div className="admin-field">
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Access Description</label>
                                    <input
                                        placeholder="Small catchphrase for the member UI..."
                                        value={newGateway.description}
                                        onChange={e => setNewGateway({ ...newGateway, description: e.target.value })}
                                        style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff' }}
                                    />
                                </div>
                                <div className="admin-field">
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Gateway Category</label>
                                    <select
                                        value={newGateway.type || 'bank_eth'}
                                        onChange={e => setNewGateway({ ...newGateway, type: e.target.value, name: '', bankProvider: '', details: '' })}
                                        style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff' }}
                                    >
                                        <option value="bank_eth">Ethiopian Bank</option>
                                        <option value="bank_int">International Bank/Platform</option>
                                        <option value="telebirr">TeleBirr</option>
                                        <option value="cash">Cash / Physical Payment</option>
                                        <option value="crypto">Cryptocurrency</option>
                                        <option value="other">Other Architecture</option>
                                    </select>
                                </div>

                                {(newGateway.type === 'bank_eth' || newGateway.type === 'bank_int') && (
                                    <>
                                        <div className="admin-field">
                                            <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>
                                                Select {newGateway.type === 'bank_eth' ? 'Ethiopian Bank' : 'International Platform'}
                                            </label>
                                            <select
                                                value={newGateway.bankProvider}
                                                onChange={e => setNewGateway({ ...newGateway, bankProvider: e.target.value, name: `${e.target.value} Transfer` })}
                                                style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff' }}
                                            >
                                                <option value="">Choose Provider...</option>
                                                {(newGateway.type === 'bank_eth' ? ETHIOPIAN_BANKS : INTERNATIONAL_PLATFORMS).map(b => (
                                                    <option key={b} value={b}>{b}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="admin-field">
                                            <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Account Holder Name</label>
                                            <input
                                                placeholder="e.g. Metro Blackline Care PLC"
                                                value={newGateway.accountHolder}
                                                onChange={e => setNewGateway({ ...newGateway, accountHolder: e.target.value })}
                                                style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff' }}
                                            />
                                        </div>
                                        <div className="admin-field">
                                            <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Account Number</label>
                                            <input
                                                placeholder="Enter full account number..."
                                                value={newGateway.accountNumber}
                                                onChange={e => setNewGateway({ ...newGateway, accountNumber: e.target.value })}
                                                style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff' }}
                                            />
                                        </div>
                                    </>
                                )}

                                {newGateway.type === 'telebirr' && (
                                    <>
                                        <div className="admin-field">
                                            <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Merchant Phone / ID</label>
                                            <input
                                                placeholder="e.g. 0911223344"
                                                value={newGateway.accountNumber}
                                                onChange={e => setNewGateway({ ...newGateway, accountNumber: e.target.value, name: 'TeleBirr Payment' })}
                                                style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff' }}
                                            />
                                        </div>
                                        <div className="admin-field">
                                            <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Merchant Name</label>
                                            <input
                                                placeholder="Display name for TeleBirr account..."
                                                value={newGateway.accountHolder}
                                                onChange={e => setNewGateway({ ...newGateway, accountHolder: e.target.value })}
                                                style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff' }}
                                            />
                                        </div>
                                    </>
                                )}

                                {newGateway.type === 'cash' && (
                                    <div className="admin-field">
                                        <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Cash Payment Name</label>
                                        <input
                                            placeholder="e.g. Office Collection, Field Agent"
                                            value={newGateway.name}
                                            onChange={e => setNewGateway({ ...newGateway, name: e.target.value, type: 'cash' })}
                                            style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff' }}
                                        />
                                    </div>
                                )}

                                <div className="admin-field">
                                    <label style={{ color: '#666', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Final Instructions / Credentials</label>
                                    <textarea
                                        placeholder="This will be shown to users at checkout..."
                                        value={newGateway.details || (
                                            newGateway.type?.startsWith('bank')
                                                ? `Account: ${newGateway.accountNumber}\nName: ${newGateway.accountHolder}`
                                                : newGateway.type === 'telebirr'
                                                    ? `Merchant: ${newGateway.accountHolder}\nNumber: ${newGateway.accountNumber}`
                                                    : ''
                                        )}
                                        onChange={e => setNewGateway({ ...newGateway, details: e.target.value })}
                                        style={{ width: '100%', padding: '1.2rem', background: '#0d0d0d', border: '1px solid #222', borderRadius: '15px', color: '#fff', minHeight: '100px', resize: 'none' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 2, padding: '1.2rem', fontWeight: '900' }}
                                        onClick={() => {
                                            if (!newGateway.name) return;
                                            // Ensure unique ID
                                            const baseId = newGateway.name.toLowerCase().replace(/\s+/g, '-');
                                            let finalId = baseId;
                                            let counter = 1;
                                            const existingIds = allGateways.map(g => g.id);
                                            while (existingIds.includes(finalId)) {
                                                finalId = `${baseId}-${counter}`;
                                                counter++;
                                            }

                                            // Compute auto-details if empty
                                            const finalDetails = newGateway.details || (
                                                newGateway.type?.startsWith('bank')
                                                    ? `Account: ${newGateway.accountNumber}\nName: ${newGateway.accountHolder}`
                                                    : newGateway.type === 'telebirr'
                                                        ? `Merchant: ${newGateway.accountHolder}\nNumber: ${newGateway.accountNumber}`
                                                        : ''
                                            );

                                            updateSettings(prev => ({
                                                ...prev,
                                                paymentGateways: [...(prev.paymentGateways || []), { ...newGateway, details: finalDetails, id: finalId, enabled: true }]
                                            }));
                                            setIsAddingGateway(false);
                                            setNewGateway({
                                                id: '',
                                                name: '',
                                                description: '',
                                                details: '',
                                                enabled: true,
                                                type: 'bank_eth',
                                                bankProvider: '',
                                                accountHolder: '',
                                                accountNumber: ''
                                            });
                                        }}
                                    >AUTHORIZE DEPLOYMENT</button>
                                    <button className="btn btn-secondary" style={{ flex: 1, padding: '1.2rem' }} onClick={() => setIsAddingGateway(false)}>ABORT</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default AdminPayments;
