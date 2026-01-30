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
    const {
        bookings = [],
        transactions = [],
        conversations = [],
        settings,
        services = [],
        addTransaction,
        addAdminNotification,
        addConversation,
        sendMessage
    } = useData() || {};
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrx, setSelectedTrx] = useState(null);
    const [showDocPreview, setShowDocPreview] = useState(false);
    const [isSupporting, setIsSupporting] = useState(false);
    const [supportProblem, setSupportProblem] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

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
            const rawPrice = (b.price !== null && b.price !== undefined && String(b.price) !== 'null' && String(b.price) !== 'undefined') ? b.price : (svc ? svc.price : 0);
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
        // Check if booking has a valid price, otherwise fallback to service price or 0
        const bookingPrice = (booking.price && String(booking.price) !== 'null' && String(booking.price) !== 'undefined') ? booking.price : null;
        const svcPrice = svc ? svc.price : 0;
        const finalPrice = getNumericPrice(bookingPrice || svcPrice);

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
            <header style={{ marginBottom: isMobile ? '1.2rem' : '2.5rem', textAlign: isMobile ? 'center' : 'left' }}>
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
                                    <div style={{ marginBottom: '0.8rem', textAlign: isMobile ? 'center' : 'left' }}>
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
                                    myTransactions.filter(t =>
                                        String(t.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        String(t.item || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        String(t.amount || '').includes(searchTerm) ||
                                        String(t.status || '').toLowerCase().includes(searchTerm.toLowerCase())
                                    ).map(t => (
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
                                            <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>
                                                {(t.status === 'Pending' || t.status === 'Denied' || t.status === 'Rejected') ? '—' : t.paymentMethod}
                                            </td>
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
                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                        onClick={() => setIsSupporting(true)}
                    >
                        OPEN SUPPORT TICKET
                    </button>
                </div>
            </div>

            {/* Support Ticket Modal */}
            <AnimatePresence>
                {isSupporting && (
                    <div className="modal active" onClick={() => setIsSupporting(false)} style={{ zIndex: 3000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ maxWidth: '500px', width: '95%', padding: '2.5rem', borderRadius: '30px', background: '#0d0d0d', border: '1px solid #1a1a1a' }}
                        >
                            <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '900' }}>Executive <span className="gold">Support</span></h2>
                            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '2rem' }}>Please describe the issue you are encountering with your settlement records.</p>

                            <textarea
                                value={supportProblem}
                                onChange={e => setSupportProblem(e.target.value)}
                                placeholder="Describe the problem in detail..."
                                style={{ width: '100%', minHeight: '150px', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '15px', color: '#fff', marginBottom: '2rem', resize: 'none' }}
                            />

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                                    disabled={loading}
                                    onClick={async () => {
                                        if (!supportProblem.trim()) return;
                                        setLoading(true);
                                        try {
                                            // Find or create conversation
                                            let targetConvo = conversations.find(c => String(c.customerId) === String(user.id) || String(c.customer_id) === String(user.id));
                                            let cId = targetConvo?.id;

                                            if (!cId) {
                                                const newC = await addConversation({
                                                    customerName: user.name || user.email,
                                                    customerId: user.id,
                                                    lastMessage: `[PROBLEM REPORTED] ${supportProblem.slice(0, 50)}...`,
                                                    lastMessageTime: new Date().toISOString()
                                                });
                                                if (newC) {
                                                    cId = newC.id;
                                                }
                                            }

                                            if (cId) {
                                                // Send actual message
                                                await sendMessage({
                                                    conversationId: cId,
                                                    sender: 'user',
                                                    text: `[PROBLEM REPORTED] ${supportProblem}`,
                                                    timestamp: new Date().toISOString()
                                                });
                                            }

                                            // Also send administrative notification for high visibility
                                            await addAdminNotification({
                                                type: 'message',
                                                title: 'CRITICAL: Billing Issue',
                                                message: `User ${user.name || user.email} authorized a support ticket.`,
                                                data: { userId: user.id, isProblem: true, problem: supportProblem }
                                            });

                                            setIsSupporting(false);
                                            setSupportProblem('');
                                            setShowSuccess(true);
                                        } catch (err) {
                                            console.error(err);
                                            // Fallback for error remains alert for now as it's critical, or could be stylized too
                                            alert("Failed to synchronize support ticket. Please try again.");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                >
                                    {loading ? 'LOGGING...' : 'LOG ISSUE'}
                                </button>
                                <button className="btn btn-secondary" style={{ flex: 0.5 }} onClick={() => setIsSupporting(false)}>CANCEL</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
                                                    padding: '1.5rem',
                                                    background: 'rgba(201,169,106,0.05)',
                                                    border: '1px solid rgba(201,169,106,0.2)',
                                                    borderRadius: '20px',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: '0.3s',
                                                    width: '100%',
                                                    position: 'relative',
                                                    overflow: 'hidden'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = 'var(--color-gold)';
                                                    e.currentTarget.style.background = 'rgba(201,169,106,0.08)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = 'rgba(201,169,106,0.2)';
                                                    e.currentTarget.style.background = 'rgba(201,169,106,0.05)';
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    {/* Rich Details Rendering */}
                                                    {gw.type?.startsWith('bank') || gw.bankProvider ? (
                                                        <div className="stack-on-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                                                            {gw.bankProvider && (
                                                                <div style={{ gridColumn: 'span 2', marginBottom: '0.4rem' }}>
                                                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financial Institution</div>
                                                                    <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>{gw.bankProvider}</div>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Name</div>
                                                                <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>{gw.accountHolder || gw.bankName || 'N/A'}</div>
                                                            </div>
                                                            <div>
                                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account No.</div>
                                                                <div style={{ color: 'var(--color-gold)', fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.05em' }}>{gw.accountNumber || 'N/A'}</div>
                                                            </div>
                                                        </div>
                                                    ) : gw.type === 'telebirr' ? (
                                                        <div>
                                                            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TeleBirr Merchant</div>
                                                            <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.6rem' }}>{gw.accountHolder}</div>
                                                            <div style={{ color: 'var(--color-gold)', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.1em' }}>{gw.accountNumber}</div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ color: '#fff', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
                                                            {(() => {
                                                                if (!gw.details) return gw.name;
                                                                const lines = gw.details.split('\n');
                                                                if (lines.length > 0) {
                                                                    const firstLine = lines[0].trim().toLowerCase();
                                                                    const cleanName = (gw.name || '').trim().toLowerCase();
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
                                                <FiArrowRight color="var(--color-gold)" style={{ marginLeft: '1.5rem', fontSize: '1.2rem', opacity: 0.5 }} />
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
                    </div >
                )}
            </AnimatePresence >

            <AnimatePresence>
                {selectedTrx && (
                    <div className="modal active" onClick={() => setSelectedTrx(null)} style={{ zIndex: 1000 }}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                maxWidth: '450px', // Balanced width: wider than before but not 700px
                                width: '95%',
                                padding: isMobile ? '1.5rem' : '2.5rem',
                                borderRadius: '35px',
                                background: '#0a0a0a',
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <span style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Originator</span>
                                        <span style={{ color: '#fff', fontWeight: '800', textAlign: 'right' }}>{selectedTrx.user}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <span style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Category</span>
                                        <span style={{ color: '#fff', textAlign: 'right' }}>{selectedTrx.category}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <span style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Executive Item</span>
                                        <span style={{ color: 'var(--color-gold)', fontWeight: '700', textAlign: 'right' }}>{selectedTrx.item || selectedTrx.type || 'Executive Service'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <span style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Settlement Amount</span>
                                        <span style={{ color: '#fff', fontWeight: '900', fontSize: '1.2rem', textAlign: 'right' }}>${selectedTrx.amount}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <span style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Method / Ref</span>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#fff', fontWeight: '600' }}>
                                                {(selectedTrx.status === 'Pending' || selectedTrx.status === 'Denied' || selectedTrx.status === 'Rejected') ? '—' : selectedTrx.paymentMethod}
                                            </div>
                                            <div style={{ color: '#555', fontSize: '0.7rem', fontFamily: 'monospace', marginTop: '0.2rem', wordBreak: 'break-all' }}>
                                                {(selectedTrx.status === 'Pending' || selectedTrx.status === 'Denied' || selectedTrx.status === 'Rejected') ? '—' : (selectedTrx.referenceNo || 'N/A')}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                        <span style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Settlement Date</span>
                                        <span style={{ color: '#888', textAlign: 'right' }}>{selectedTrx.date || new Date(selectedTrx.timestamp).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {(selectedTrx.status === 'Completed' || selectedTrx.status === 'Paid' || selectedTrx.status === 'Pending') && (
                                    <button
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', fontSize: '0.8rem' }}
                                        onClick={() => setShowDocPreview(true)}
                                    >
                                        <FiActivity /> VIEW DOCUMENT
                                    </button>
                                )}
                                <button className="btn btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }} onClick={() => setSelectedTrx(null)}>DISMISS</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDocPreview && selectedTrx && (
                    <div
                        className="modal active"
                        onClick={() => setShowDocPreview(false)}
                        style={{
                            zIndex: 9999, // Absolute priority: Guaranteed to be on top of everything
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.98)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(15px)'
                        }}
                    >
                        <motion.div
                            className="modal-content glass-modal-large"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            style={{
                                maxWidth: '900px',
                                width: '95%',
                                padding: '0',
                                borderRadius: '35px',
                                background: '#080808',
                                border: '1px solid rgba(255,255,255,0.05)',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                maxHeight: '95vh',
                                boxShadow: '0 0 100px rgba(0,0,0,1)'
                            }}
                        >
                            {/* Toolbar */}
                            <div style={{ padding: isMobile ? '0.8rem 1rem' : '1rem 2rem', background: '#0a0a0a', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ color: '#fff', fontSize: isMobile ? '0.65rem' : '0.8rem', fontWeight: 'bold' }}>MBC Executive Document Explorer</div>
                                <div style={{ display: 'flex', gap: isMobile ? '0.5rem' : '1rem' }}>
                                    <button
                                        onClick={async () => {
                                            const element = document.getElementById('mbc-invoice-render');
                                            try {
                                                const canvas = await (await import('html2canvas')).default(element, {
                                                    scale: 3, // High DPI scaling
                                                    useCORS: true,
                                                    backgroundColor: '#ffffff',
                                                    width: 794, // Standard A4 ratio base
                                                    height: 1123
                                                });
                                                const img = canvas.toDataURL('image/png');
                                                const a = document.createElement('a');
                                                a.href = img;
                                                const isPending = selectedTrx.status === 'Pending';
                                                a.download = `MBC-${isPending ? 'INVOICE' : 'RECEIPT'}-${selectedTrx.id}.png`;
                                                a.click();
                                            } catch (err) { console.error("Capture Failed:", err); }
                                        }}
                                        className="btn btn-primary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <FiDownload /> Export PNG
                                    </button>
                                    <button onClick={() => setShowDocPreview(false)} style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
                                </div>
                            </div>

                            {/* Scrollable Document Content */}
                            <div style={{ overflowY: 'auto', padding: isMobile ? '1rem' : '3rem', background: '#111' }}>
                                <div id="mbc-invoice-render" style={{
                                    background: '#ffffff',
                                    padding: isMobile ? '2rem 1.5rem' : '4rem',
                                    color: '#000',
                                    fontFamily: "'Inter', sans-serif",
                                    position: 'relative',
                                    width: isMobile ? '100%' : '794px', // A4 width at 96dpi for web preview
                                    margin: '0 auto',
                                    minHeight: isMobile ? 'auto' : '1123px',
                                    border: '1px solid #ddd',
                                    borderRadius: '2px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                }}>
                                    {/* Design Elements */}
                                    <div style={{ position: 'absolute', top: '0', right: '0', width: isMobile ? '150px' : '300px', height: isMobile ? '150px' : '300px', background: 'radial-gradient(circle, rgba(201,169,106,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                                    {/* Appealing Pro-Forma Header Badge */}
                                    {selectedTrx.status === 'Pending' && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '0',
                                            left: '0',
                                            right: '0',
                                            background: 'linear-gradient(90deg, #c9a96a 0%, #b89850 100%)',
                                            color: '#000',
                                            padding: '0.6rem',
                                            textAlign: 'center',
                                            fontSize: '0.7rem',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5em',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}>
                                            Official Pro-Forma Issuance
                                        </div>
                                    )}

                                    {/* Header Section */}
                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', marginTop: selectedTrx.status === 'Pending' ? '3rem' : '0', marginBottom: isMobile ? '3rem' : '5rem', gap: '2rem' }}>
                                        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                                            <div style={{ color: 'var(--color-gold)', fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>MBC</div>
                                            <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Metro Blackline Care</div>
                                        </div>
                                        <div style={{ textAlign: isMobile ? 'center' : 'right' }}>
                                            <div style={{ color: 'var(--color-gold)', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Document Type</div>
                                            <div style={{ color: '#000', fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: '800' }}>
                                                {selectedTrx.status === 'Pending' ? 'Invoice' : 'Receipt'}
                                            </div>
                                            <div style={{ color: '#999', fontSize: '0.7rem', marginTop: '0.5rem' }}>Ref: {selectedTrx.id}</div>
                                        </div>
                                    </div>

                                    {/* Account Info Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1rem' : '4rem', marginBottom: isMobile ? '3rem' : '5rem' }}>
                                        <div style={{ padding: isMobile ? '1.2rem' : '2rem', background: '#fcfcfc', borderRadius: '8px', border: '1px solid #eee' }}>
                                            <div style={{ color: '#999', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.2rem', letterSpacing: '0.1em' }}>Billing Information</div>
                                            <div style={{ color: '#000', fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.4rem' }}>{selectedTrx.user}</div>
                                            <div style={{ color: '#666', fontSize: '0.8rem' }}>VIP Executive Client</div>
                                        </div>
                                        <div style={{ textAlign: isMobile ? 'left' : 'right', padding: isMobile ? '1.2rem' : '2rem' }}>
                                            <div style={{ color: '#999', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.2rem', letterSpacing: '0.1em' }}>Dates & Processing</div>
                                            <div style={{ color: '#333', fontSize: '0.9rem', marginBottom: '0.4rem' }}>Issued: {selectedTrx.date || new Date().toLocaleDateString()}</div>
                                            <div style={{ color: '#333', fontSize: '0.9rem' }}>
                                                Method: {(selectedTrx.status === 'Pending' || selectedTrx.status === 'Denied' || selectedTrx.status === 'Rejected') ? 'TBD' : selectedTrx.paymentMethod}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Table */}
                                    <div style={{ marginBottom: isMobile ? '3rem' : '5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1.5fr 1fr' : '2fr 1fr 1fr', padding: '0.8rem 1.2rem', background: '#f5f5f5', borderRadius: '4px', marginBottom: '1rem' }}>
                                            <div style={{ color: '#888', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase' }}>Description</div>
                                            {!isMobile && <div style={{ color: '#888', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' }}>Category</div>}
                                            <div style={{ color: '#888', fontSize: '0.6rem', fontWeight: '900', textTransform: 'uppercase', textAlign: 'right' }}>Total</div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1.5fr 1fr' : '2fr 1fr 1fr', padding: isMobile ? '1.2rem' : '2rem', borderBottom: '1px solid #f0f0f0' }}>
                                            <div style={{ color: '#000', fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: '600' }}>{selectedTrx.item || 'Executive Maintenance'}</div>
                                            {!isMobile && <div style={{ color: '#666', textAlign: 'center' }}>{selectedTrx.category}</div>}
                                            <div style={{ color: 'var(--color-gold)', fontWeight: '900', fontSize: isMobile ? '1.1rem' : '1.2rem', textAlign: 'right' }}>${selectedTrx.amount}</div>
                                        </div>
                                    </div>

                                    {/* Totals Section */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: isMobile ? '4rem' : '8rem' }}>
                                        <div style={{ width: isMobile ? '100%' : '300px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                                <span style={{ color: '#999', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '900' }}>Subtotal</span>
                                                <span style={{ color: '#000', fontSize: '0.9rem' }}>${selectedTrx.amount}.00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', paddingBottom: '1.2rem', borderBottom: '1px solid #eee' }}>
                                                <span style={{ color: '#999', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '900' }}>Tax (0%)</span>
                                                <span style={{ color: '#000', fontSize: '0.9rem' }}>$0.00</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ color: 'var(--color-gold)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '900' }}>Grand Total</span>
                                                <span style={{ color: '#000', fontSize: isMobile ? '1.6rem' : '2rem', fontWeight: '900' }}>${selectedTrx.amount}.00</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer & Auth Seal */}
                                    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-end', gap: '3rem' }}>
                                        <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                                            <div style={{ color: '#c9a96a', fontSize: '0.55rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>Official Correspondence</div>
                                            <div style={{ color: '#999', fontSize: '0.7rem', maxWidth: isMobile ? '100%' : '300px', lineHeight: '1.6' }}>
                                                This document is electronically generated by Metro Blackline Care's executive financial orchestration layer.
                                            </div>
                                        </div>
                                        <div style={{
                                            width: isMobile ? '100px' : '120px',
                                            height: isMobile ? '100px' : '120px',
                                            borderRadius: '50%',
                                            border: '2px dashed ' + (selectedTrx.status === 'Pending' ? '#ff9800' : '#4caf50'),
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transform: isMobile ? 'none' : 'rotate(-15deg)',
                                            background: 'rgba(255,255,255,0.01)',
                                            flexShrink: 0
                                        }}>
                                            <div style={{ color: selectedTrx.status === 'Pending' ? '#ff9800' : '#4caf50', fontSize: '0.5rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>MBC Auth</div>
                                            <div style={{ color: selectedTrx.status === 'Pending' ? '#ff9800' : '#4caf50', fontSize: isMobile ? '0.75rem' : '0.9rem', fontWeight: '900', margin: '2px 0' }}>
                                                {selectedTrx.status === 'Pending' ? 'ISSUED' : 'PAID'}
                                            </div>
                                            <div style={{ color: selectedTrx.status === 'Pending' ? '#ff9800' : '#4caf50', fontSize: '0.35rem' }}>{new Date().toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccess && (
                    <div className="modal active" onClick={() => setShowSuccess(false)} style={{ zIndex: 4000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(15px)' }}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            style={{
                                maxWidth: '450px',
                                width: '90%',
                                padding: '3rem',
                                borderRadius: '35px',
                                textAlign: 'center',
                                background: '#0a0a0a',
                                border: '1px solid rgba(201,169,106,0.2)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            <div style={{ width: '80px', height: '80px', background: 'rgba(201,169,106,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                                <FiCheckCircle size={40} color="var(--color-gold)" />
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '900', marginBottom: '1rem' }}>Ticket <span className="gold">Logged</span></h2>
                            <p style={{ color: '#888', lineHeight: '1.6', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                                Your strategic support request has been synchronized with our executive concierge. Track the status in your messages.
                            </p>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', fontWeight: '900', letterSpacing: '0.05em' }} onClick={() => setShowSuccess(false)}>CONTINUE</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .gold { color: var(--color-gold); }
                .glass-modal { background: rgba(10,10,10,0.95); backdrop-filter: blur(20px); }
            `}</style>
        </div >
    );
};

export default UserPayments;
