import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
    FiDollarSign, FiClock, FiCheckCircle, FiAlertCircle,
    FiCreditCard, FiArrowRight, FiInfo, FiDownload, FiSearch,
    FiShield, FiLayers, FiPackage, FiActivity, FiZap, FiMessageSquare, FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const UserPayments = () => {
    const { user } = useAuth();
    const { bookings = [], transactions = [], settings, services = [], addTransaction, addAdminNotification } = useData() || {};
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrx, setSelectedTrx] = useState(null);

    const getNumericPrice = (p) => {
        if (p === null || p === undefined || String(p) === 'null' || p === '') return 0;
        if (typeof p === 'number') return p;
        const matches = String(p).match(/\d+/);
        return matches ? Number(matches[0]) : 0;
    };
    const [isPaying, setIsPaying] = useState(false);
    const [payStep, setPayStep] = useState(1); // 1: Choose item, 2: Payment method, 3: Processing, 4: Success

    const enabledGateways = useMemo(() => {
        const coreGateways = [
            { id: 'bank', name: 'Bank Transfer', type: 'bank', icon: <FiDollarSign />, details: '100012345678 - MBC PLC' },
        ];

        const saved = settings?.paymentGateways || [];

        // Merge core
        const merged = coreGateways.map(core => {
            const match = saved.find(s => s.id === core.id);
            return match ? { ...core, ...match } : core;
        });

        // Add custom with default icons
        const custom = saved.filter(s => !coreGateways.find(c => c.id === s.id)).map(g => ({
            ...g,
            icon: g.type === 'telebirr' ? <FiZap /> : g.type === 'crypto' ? <FiLayers /> : <FiPackage />
        }));

        return [...merged, ...custom].filter(g => g.enabled !== false);
    }, [settings]);

    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const myTransactions = useMemo(() => {
        return transactions.filter(t => t.userId === user?.id || t.user_id === user?.id)
            .sort((a, b) => new Date(b.date || b.timestamp) - new Date(a.date || a.timestamp));
    }, [transactions, user]);

    const approvedBookings = useMemo(() => {
        // Bookings that are approved/confirmed but not linked to a COMPLETED transaction yet
        const completedTrxRefs = transactions
            .filter(t => t.status === 'Completed' || t.status === 'Paid')
            .map(t => String(t.itemId));

        return bookings.filter(b =>
            (b.customer_id === user?.id || b.email === user?.email) &&
            (b.status === 'Approved' || b.status === 'Confirmed') &&
            !completedTrxRefs.includes(String(b.id))
        ).map(b => {
            // Inject price from services if missing in booking object
            const svc = services.find(s => s.title === b.service);
            const rawPrice = (b.price !== null && b.price !== undefined && String(b.price) !== 'null') ? b.price : (svc ? svc.price : 0);
            return { ...b, price: rawPrice };
        });
    }, [bookings, transactions, user, services]);

    const [paymentForm, setPaymentForm] = useState({
        bookingId: '',
        gatewayId: '',
        reference: ''
    });

    const handleInitiatePayment = (booking) => {
        setPaymentForm({ ...paymentForm, bookingId: booking.id });
        setIsPaying(true);
        setPayStep(1);
    };

    const handleSubmitPayment = async () => {
        setPayStep(3);
        const booking = bookings.find(b => String(b.id) === String(paymentForm.bookingId));
        const gateway = enabledGateways.find(g => g.id === paymentForm.gatewayId);
        const svc = services.find(s => s.title === booking.service);
        const finalPrice = getNumericPrice(booking.price || (svc ? svc.price : 0));

        // Create transaction record
        const newTrx = {
            id: `TRX-${Date.now()}`,
            userId: user.id,
            user: user.name || user.email,
            amount: finalPrice,
            category: 'Service',
            itemId: String(booking.id),
            status: 'Pending', // Administrator will verify
            paymentMethod: gateway.name,
            referenceNo: paymentForm.reference,
            date: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };

        try {
            await addTransaction(newTrx);

            // Notify Admin
            await addAdminNotification({
                type: 'payment',
                title: 'Payment Initiated',
                message: `${user.name || user.email} submitted ${gateway.name} payment for ${booking.service} ($${booking.price})`,
                data: { transactionId: newTrx.id }
            });

            setPayStep(4);
        } catch (err) {
            console.error("Payment Submission Error:", err);
            setPayStep(1);
            // Error toast would be good here if available
        }
    };

    return (
        <div className="user-payments" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
            <header style={{ marginBottom: isMobile ? '1.2rem' : '2.5rem' }}>
                <h1 style={{ color: '#fff', fontSize: isMobile ? '1.6rem' : '2.5rem', margin: 0, fontWeight: '900' }}>Financial <span className="gold">Ledger</span></h1>
                <p style={{ color: '#888', marginTop: '0.2rem', fontSize: isMobile ? '0.75rem' : '1rem' }}>Manage your payments and settlement history.</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Active Invoices / Pending Payments */}
                <div className="admin-card" style={{ border: '1px solid rgba(201,169,106,0.3)', background: 'rgba(201,169,106,0.02)', padding: isMobile ? '1rem' : '3rem', textAlign: 'center', boxSizing: 'border-box' }}>
                    {settings?.paymentsEnabled === false ? (
                        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
                            <div style={{
                                width: '80px', height: '80px', background: 'rgba(201,169,106,0.1)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 2rem',
                                border: '1px solid rgba(201,169,106,0.2)'
                            }}>
                                <FiShield size={40} color="var(--color-gold)" />
                            </div>
                            <h1 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Settlement Services <span className="gold">Offline</span></h1>
                            <p style={{ color: '#888', fontSize: '1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
                                We are currently optimizing our financial orchestration systems. Please coordinate directly with our executive concierge.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left', marginBottom: '3rem' }}>
                                <button
                                    onClick={() => navigate('/dashboard/chat')}
                                    style={{
                                        padding: '1.2rem',
                                        background: 'rgba(201,169,106,0.05)',
                                        border: '1px solid rgba(201,169,106,0.1)',
                                        borderRadius: '15px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.2rem',
                                        transition: '0.3s'
                                    }}
                                >
                                    <div style={{ width: '45px', height: '45px', background: 'rgba(201,169,106,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiMessageSquare size={22} color="var(--color-gold)" />
                                    </div>
                                    <div style={{ textAlign: 'left', flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>Send Message</div>
                                        <div style={{ color: '#555', fontSize: '0.8rem' }}>Instant chat with executive support</div>
                                    </div>
                                    <FiArrowRight color="#333" />
                                </button>

                                <a
                                    href={`tel:${settings?.contact?.phone || '+251 900 000 000'}`}
                                    style={{
                                        padding: '1.2rem',
                                        background: 'rgba(76,175,80,0.03)',
                                        border: '1px solid rgba(76,175,80,0.1)',
                                        borderRadius: '15px',
                                        color: '#fff',
                                        textDecoration: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.2rem'
                                    }}
                                >
                                    <div style={{ width: '45px', height: '45px', background: 'rgba(76,175,80,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiActivity size={22} color="#4caf50" />
                                    </div>
                                    <div style={{ textAlign: 'left', flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>Direct Line</div>
                                        <div style={{ color: '#555', fontSize: '0.8rem' }}>{settings?.contact?.phone || '+251 900 000 000'}</div>
                                    </div>
                                    <FiArrowRight color="#333" />
                                </a>

                                <div style={{
                                    padding: '1.2rem',
                                    background: 'rgba(33,150,243,0.03)',
                                    border: '1px solid rgba(33,150,243,0.1)',
                                    borderRadius: '15px',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.2rem'
                                }}>
                                    <div style={{ width: '45px', height: '45px', background: 'rgba(33,150,243,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiShield size={22} color="#2196f3" />
                                    </div>
                                    <div style={{ textAlign: 'left', flex: 1 }}>
                                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>HQ Concierge</div>
                                        <div style={{ color: '#555', fontSize: '0.8rem' }}>{settings?.contact?.address || 'Addis Ababa, Ethiopia'}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button onClick={() => navigate('/dashboard')} className="btn btn-secondary" style={{ width: isMobile ? '100%' : 'auto', padding: '1rem 3rem' }}>RETURN TO DASHBOARD</button>
                            </div>
                        </div>
                    ) : approvedBookings.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {approvedBookings.map(booking => (
                                <div key={booking.id} style={{
                                    padding: isMobile ? '1rem' : '1.5rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    boxSizing: 'border-box',
                                    width: '100%'
                                }}>
                                    <div style={{ marginBottom: '0.8rem' }}>
                                        <div style={{ color: '#fff', fontWeight: '700', fontSize: isMobile ? '0.95rem' : '1.1rem', marginBottom: '0.15rem' }}>{booking.service}</div>
                                        <div style={{ color: '#666', fontSize: '0.7rem' }}>Approved for {booking.date}</div>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingTop: '0.8rem',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        gap: '0.5rem'
                                    }}>
                                        <div style={{ color: 'var(--color-gold)', fontWeight: '900', fontSize: isMobile ? '1.25rem' : '1.5rem' }}>
                                            ${getNumericPrice(booking.price)}
                                        </div>
                                        {transactions.some(t => String(t.itemId) === String(booking.id) && t.status === 'Pending') ? (
                                            <button
                                                className="btn btn-secondary"
                                                style={{ padding: '0.6rem 0.8rem', fontSize: '0.6rem', opacity: 0.6, borderRadius: '8px' }}
                                                disabled
                                            >
                                                WAITING
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleInitiatePayment(booking)}
                                                className="btn btn-primary"
                                                style={{ padding: '0.6rem 1rem', fontSize: '0.65rem', fontWeight: '700', borderRadius: '8px' }}
                                            >
                                                PAY NOW
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#444' }}>
                            <FiCheckCircle size={32} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                            <p style={{ fontSize: '0.9rem' }}>All accounts are currently settled.</p>
                        </div>
                    )}
                </div>

                {/* Transaction History */}
                <div className="admin-card">
                    <div className="admin-flex-between stack-on-mobile" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>Payment History</h3>
                        <div style={{ position: 'relative', width: isMobile ? '100%' : '200px' }}>
                            <FiSearch style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                            <input
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.22rem', background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                            />
                        </div>
                    </div>

                    <div className="responsive-table-v2" style={{ margin: isMobile ? '0 -1.25rem' : '0' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '500px' : '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase' }}>Reference</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase' }}>Amount</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase' }}>Method</th>
                                    <th style={{ padding: '1rem', textAlign: 'left', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '1rem', textAlign: 'right', color: '#444', fontSize: '0.65rem', textTransform: 'uppercase' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myTransactions.length > 0 ? (
                                    myTransactions.filter(t => String(t.id || '').toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                                        <tr
                                            key={t.id}
                                            onClick={() => setSelectedTrx(t)}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer', transition: '0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1rem', color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                                {isMobile ? `TRX...${String(t.id || '').slice(-4)}` : t.id}
                                            </td>
                                            <td style={{ padding: '1rem', color: '#fff', fontWeight: '800' }}>${t.amount}</td>
                                            <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>{t.paymentMethod}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 'bold',
                                                    background: t.status === 'Completed' || t.status === 'Paid' ? 'rgba(76,175,80,0.1)' : 'rgba(255,152,0,0.1)',
                                                    color: t.status === 'Completed' || t.status === 'Paid' ? '#4caf50' : '#ff9800'
                                                }}>
                                                    {t.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: '#444', fontSize: '0.8rem' }}>{t.date || new Date(t.timestamp).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                                            <div style={{ opacity: 0.3, marginBottom: '0.5rem' }}>
                                                <FiClock size={24} color="#555" />
                                            </div>
                                            <div style={{ color: '#444', fontSize: '0.8rem' }}>No settlement records found.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Security Info */}
                <div className="admin-card" style={{ background: 'linear-gradient(135deg, #0d0d0d 0%, #050505 100%)' }}>
                    <FiShield size={32} color="var(--color-gold)" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem' }}>Secure Settlements</h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                        All payments are processed through our secure executive orchestration layer. Once a payment is initiated, our accounts team will verify the reference within 1-2 operational hours.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <FiInfo color="var(--color-gold)" />
                            <span style={{ color: '#888', fontSize: '0.75rem' }}>Save your reference numbers for verification.</span>
                        </div>
                    </div>
                </div>

                {/* Quick Support */}
                <div className="admin-card">
                    <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Billing Issues?</h3>
                    <p style={{ color: '#444', fontSize: '0.8rem', marginBottom: '1.5rem' }}>If you encounter any issues during the settlement process, please contact our concierge team immediately.</p>
                    <button className="btn btn-secondary" style={{ width: '100%' }}>OPEN SUPPORT TICKET</button>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {isPaying && (
                    <div className="modal active" onClick={() => setIsPaying(false)}>
                        <motion.div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                maxWidth: '500px',
                                width: '95%',
                                padding: isMobile ? '1.5rem' : '3rem',
                                borderRadius: '30px',
                                background: '#0d0d0d',
                                border: '1px solid #222'
                            }}
                        >
                            {payStep === 1 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Select Method</h2>
                                    <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '2rem' }}>How would you like to settle this service?</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {enabledGateways.filter(g => g.enabled !== false).map(gw => (
                                            <button
                                                key={gw.id}
                                                onClick={() => { setPaymentForm({ ...paymentForm, gatewayId: gw.id }); setPayStep(2); }}
                                                style={{
                                                    padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #222',
                                                    borderRadius: '15px', color: '#fff', cursor: 'pointer', textAlign: 'left',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.3s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.4rem' }}>{gw.name}</div>

                                                    {/* Rich Details Rendering */}
                                                    {gw.type?.startsWith('bank') || gw.bankProvider ? (
                                                        <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(201,169,106,0.3)' }}>
                                                            {gw.bankProvider && (
                                                                <div style={{ gridColumn: 'span 2', marginBottom: '0.4rem' }}>
                                                                    <div style={{ color: '#888', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Institution</div>
                                                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{gw.bankProvider}</div>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div style={{ color: '#888', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Name</div>
                                                                <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 'bold' }}>{gw.accountHolder || gw.bankName || 'N/A'}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: '#888', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account No.</div>
                                                                <div style={{ color: 'var(--color-gold)', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.05em' }}>{gw.accountNumber || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    ) : gw.type === 'telebirr' ? (
                                                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.2rem', borderRadius: '15px', border: '1px solid rgba(201,169,106,0.3)' }}>
                                                            <div style={{ color: '#888', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TeleBirr Merchant</div>
                                                            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.6rem' }}>{gw.accountHolder}</div>
                                                            <div style={{ color: 'var(--color-gold)', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.1em' }}>{gw.accountNumber}</div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ color: '#555', fontSize: '0.85rem', whiteSpace: 'pre-line' }}>
                                                            {(() => {
                                                                if (!gw.details) return "";
                                                                const lines = gw.details.split('\n');
                                                                if (lines.length > 0) {
                                                                    const firstLine = lines[0].trim().toLowerCase();
                                                                    const cleanName = gw.name.trim().toLowerCase();
                                                                    if (firstLine === cleanName ||
                                                                        firstLine.includes(cleanName) && firstLine.length < cleanName.length + 15 ||
                                                                        firstLine.startsWith('transfer to:') ||
                                                                        firstLine.endsWith('payment')) {
                                                                        return lines.slice(1).join('\n').trim();
                                                                    }
                                                                }
                                                                return gw.details;
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                                <FiArrowRight color="var(--color-gold)" style={{ marginLeft: '1rem' }} />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {payStep === 2 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>Confirm Details</h2>
                                    <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '2rem' }}>Enter your transaction reference for verification.</p>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem' }}>Reference / Screenshot ID</label>
                                        <input
                                            placeholder="e.g. CORE-FT-82374923"
                                            value={paymentForm.reference}
                                            onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                                            style={{ width: '100%', padding: '1.2rem', background: '#050505', border: '1px solid #222', borderRadius: '15px', color: 'var(--color-gold)', fontFamily: 'monospace' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button className="btn btn-secondary" onClick={() => setPayStep(1)}>BACK</button>
                                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmitPayment} disabled={!paymentForm.reference}>CONFIRM PAYMENT</button>
                                    </div>
                                </motion.div>
                            )}

                            {payStep === 3 && (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <div className="loading-spinner" style={{ width: '60px', height: '60px', border: '4px solid rgba(201,169,106,0.1)', borderTopColor: 'var(--color-gold)', borderRadius: '50%', margin: '0 auto 2rem', animation: 'spin 1s linear infinite' }} />
                                    <h2 style={{ color: '#fff', fontSize: '1.5rem' }}>Processing Auth</h2>
                                    <p style={{ color: '#555' }}>Enrolling your reference into the MBC cloud ledger...</p>
                                </div>
                            )}

                            {payStep === 4 && (
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', background: 'rgba(76,175,80,0.1)', color: '#4caf50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2.5rem' }}>
                                        <FiCheckCircle />
                                    </div>
                                    <h2 style={{ color: '#fff', fontSize: '1.6rem', marginBottom: '1rem' }}>Initiated Successfully</h2>
                                    <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '2.5rem' }}>
                                        Your payment reference has been submitted. Our accounting team will verify the transaction within our next operational window.
                                    </p>
                                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsPaying(false)}>BACK TO LEDGER</button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedTrx && (
                    <div className="modal active" onClick={() => setSelectedTrx(null)}>
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
                                    <div style={{ width: '50px', height: '50px', background: 'rgba(76,175,80,0.1)', color: '#4caf50', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiCheckCircle size={24} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#444', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase' }}>Financial Record</div>
                                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{selectedTrx.id}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#050505', padding: '2rem', borderRadius: '20px', border: '1px solid #111', display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', color: 'rgba(255,255,255,0.02)', fontWeight: '900', zIndex: 0 }}>MBC</div>
                                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#444', fontSize: '0.8rem' }}>Originator</span><span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedTrx.user}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#444', fontSize: '0.8rem' }}>Category</span><span style={{ color: '#fff' }}>{selectedTrx.category}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#444', fontSize: '0.8rem' }}>Item</span><span style={{ color: 'var(--color-gold)' }}>{selectedTrx.item || selectedTrx.type || 'Executive Service'}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#444', fontSize: '0.8rem' }}>Amount</span><span style={{ color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>${selectedTrx.amount}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: '#444', fontSize: '0.8rem' }}>Method / Ref</span>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#fff' }}>{selectedTrx.paymentMethod}</div>
                                            <div style={{ color: '#555', fontSize: '0.7rem', fontFamily: 'monospace' }}>{selectedTrx.referenceNo || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: '#444', fontSize: '0.8rem' }}>Settlement Date</span><span style={{ color: '#666' }}>{selectedTrx.date || new Date(selectedTrx.timestamp).toLocaleDateString()}</span></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {(selectedTrx.status === 'Completed' || selectedTrx.status === 'Paid') && (
                                    <button
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                                        onClick={async () => {
                                            const invoiceDate = selectedTrx.date || new Date(selectedTrx.timestamp).toLocaleDateString();
                                            const container = document.createElement('div');
                                            container.style.position = 'fixed';
                                            container.style.top = '-10000px';
                                            container.style.left = '-10000px';
                                            container.style.width = '1200px';
                                            container.style.background = '#fff';
                                            container.innerHTML = `
                                                 <div style="padding: 100px; font-family: 'Montserrat', sans-serif; color: #1a1a1a; min-height: 1600px; position: relative; background: #fff; overflow: hidden;">
                                                     <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 180px; color: rgba(0,0,0,0.02); pointer-events: none; z-index: 1; font-weight: 900; white-space: nowrap; text-transform: uppercase;">MBC CARE</div>
                                                     <div style="position: relative; z-index: 2;">
                                                         <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #c9a96a; padding-bottom: 40px; margin-bottom: 60px;">
                                                             <div style="font-size: 38px; font-weight: bold; color: #000; letter-spacing: 2px;">METRO BLACKLINE CARE</div>
                                                             <div style="font-size: 32px; font-weight: 700; color: #c9a96a; text-transform: uppercase; letter-spacing: 4px;">RECEIPT</div>
                                                         </div>
                                                         <div style="display: flex; justify-content: space-between; margin-bottom: 80px;">
                                                             <div>
                                                                 <div style="font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Customer</div>
                                                                 <div style="font-size: 24px; font-weight: 700; color: #000;">${selectedTrx.user}</div>
                                                             </div>
                                                             <div style="text-align: right;">
                                                                 <div style="font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Order Ref</div>
                                                                 <div style="font-size: 16px; font-weight: 700; color: #000;">${selectedTrx.id}</div>
                                                                 <div style="margin-top: 20px; font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase;">Dated</div>
                                                                 <div style="font-size: 18px; font-weight: 700; color: #000;">${invoiceDate}</div>
                                                             </div>
                                                         </div>
                                                         <table style="width: 100%; border-collapse: collapse; margin-bottom: 60px;">
                                                             <thead>
                                                                 <tr style="border-bottom: 1px solid #eee;">
                                                                     <th style="padding: 20px 0; text-align: left; font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase;">Description</th>
                                                                     <th style="padding: 20px 0; text-align: right; font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase;">Method</th>
                                                                     <th style="padding: 20px 0; text-align: right; font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase;">Amount</th>
                                                                 </tr>
                                                             </thead>
                                                             <tbody>
                                                                 <tr>
                                                                     <td style="padding: 40px 0; font-size: 20px; color: #000; font-weight: 600;">${selectedTrx.item || selectedTrx.type || 'Executive Service'}</td>
                                                                     <td style="padding: 40px 0; text-align: right; font-size: 18px; color: #666;">${selectedTrx.paymentMethod}</td>
                                                                     <td style="padding: 40px 0; text-align: right; font-size: 24px; color: #000; font-weight: 700;">$${selectedTrx.amount}</td>
                                                                 </tr>
                                                             </tbody>
                                                         </table>
                                                         <div style="display: flex; justify-content: flex-end; border-top: 4px solid #000; padding-top: 40px;">
                                                             <div style="text-align: right;">
                                                                 <div style="font-size: 12px; font-weight: 900; color: #aaa; text-transform: uppercase; margin-bottom: 8px;">Total Settlement</div>
                                                                 <div style="font-size: 52px; font-weight: 900; color: #c9a96a;">$${selectedTrx.amount}.00</div>
                                                             </div>
                                                         </div>
                                                         <div style="margin-top: 100px; padding: 40px; background: #f9f9f9; border-left: 4px solid #c9a96a;">
                                                             <div style="font-size: 10px; font-weight: 900; color: #aaa; text-transform: uppercase; margin-bottom: 8px;">Official Status</div>
                                                             <div style="font-size: 20px; font-weight: 700; color: #4caf50;">FULLY SETTLED</div>
                                                         </div>
                                                     </div>
                                                 </div>
                                             `;
                                            document.body.appendChild(container);
                                            try {
                                                const canvas = await (await import('html2canvas')).default(container, {
                                                    scale: 2,
                                                    useCORS: true,
                                                    backgroundColor: '#ffffff'
                                                });
                                                const img = canvas.toDataURL('image/png');
                                                const a = document.createElement('a');
                                                a.href = img;
                                                a.download = `MBC-INVOICE-${selectedTrx.id}.png`;
                                                a.click();
                                            } catch (err) {
                                                console.error("Capture Failed:", err);
                                            } finally {
                                                document.body.removeChild(container);
                                            }
                                        }}
                                    >
                                        <FiDownload /> DOWNLOAD INVOICE
                                    </button>
                                )}
                                <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }} onClick={() => setSelectedTrx(null)}>DISMISS</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .gold { color: var(--color-gold); }
                .glass-modal { background: rgba(10,10,10,0.95); backdrop-filter: blur(20px); }
            `}</style>
        </div>
    );
};

export default UserPayments;
