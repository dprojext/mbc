import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FiStar, FiCreditCard, FiZap, FiCheck, FiArrowRight, FiInfo, FiX, FiPhone, FiMessageSquare, FiMapPin, FiDollarSign, FiClock, FiActivity, FiFileText, FiLayers, FiPackage } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import ConciergeModal from '../../components/ConciergeModal';

const UserSubscription = () => {
    const { user, refreshProfile } = useAuth();
    const { plans = [], settings = {}, updateUserSubscription, sendUserNotification, addTransaction, addAdminNotification } = useData();
    const navigate = useNavigate();
    const [confirmAction, setConfirmAction] = useState(null);
    const [successAction, setSuccessAction] = useState(null);
    const [paymentModal, setPaymentModal] = useState(null); // { plan, type: 'membership' | 'one-time' }
    const [contactModal, setContactModal] = useState(null); // { plan, type }
    const [selectedGateway, setSelectedGateway] = useState(null);
    const [ftNo, setFtNo] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isConciergeOpen, setIsConciergeOpen] = useState(false);
    const [conciergeData, setConciergeData] = useState({ name: '', price: '' });

    const currentPlanName = user?.subscriptionPlan || 'No Active Plan';
    const currentPlan = plans.find(p => p.name === currentPlanName) || null;
    const paymentsEnabled = settings?.paymentsEnabled !== false;

    const enabledGateways = React.useMemo(() => {
        const coreGateways = [
            { id: 'bank', name: 'Bank Transfer', type: 'bank', icon: <FiDollarSign />, details: '100012345678 - MBC PLC' },
            { id: 'mobile', name: 'Mobile Money', type: 'mobile', icon: <FiClock />, details: '*889#' },
            { id: 'card', name: 'Card Payment', type: 'card', icon: <FiActivity />, details: 'Stripe/Flutterwave' }
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

    const handleSelectPlan = (plan, type) => {
        if (paymentsEnabled && enabledGateways.length > 0) {
            setPaymentModal({ plan, type });
        } else {
            setConciergeData({ name: plan.name, price: `$${plan.price}` });
            setIsConciergeOpen(true);
        }
    };

    const handlePayment = async () => {
        if (!paymentModal || !selectedGateway || !user?.id) return;
        setIsProcessing(true);

        try {
            const { plan, type } = paymentModal;
            const gateway = enabledGateways.find(g => g.id === selectedGateway);

            // Create transaction record
            const transactionId = `TRX-${Date.now()}`;
            const transaction = {
                id: transactionId,
                userId: user.id,
                user: user.name || user.email,
                amount: plan.price,
                category: type === 'membership' ? 'Subscription' : 'Service',
                item: plan.name,
                status: 'Pending',
                paymentMethod: gateway?.name || 'Unknown',
                referenceNo: ftNo || 'Pending Submission',
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };

            await addTransaction(transaction);

            // Add notification for admin
            await addAdminNotification({
                type: 'payment',
                title: 'New Payment Received',
                message: `${user.name || user.email} submitted a payment of $${plan.price} via ${gateway?.name} (${ftNo || 'No FT No'})`,
                data: { transactionId }
            });

            // Send payment request notification to user
            await sendUserNotification(user.id, {
                title: 'Payment Under Review',
                message: `Your payment request for ${plan.name} ($${plan.price}) has been received and is currently under review. Your ${type === 'membership' ? 'membership' : 'service'} will be activated once confirmed.`,
                type: 'info',
                data: {
                    transactionId,
                    planName: plan.name,
                    amount: plan.price,
                    gateway: gateway?.name,
                    gatewayDetails: gateway?.details
                }
            });

            setPaymentModal(null);
            setSelectedGateway(null);
            setFtNo('');
            setSuccessAction({
                title: 'Payment Submitted',
                desc: `Your payment reference has been submitted for review. Our team will verify the transaction and activate your ${type === 'membership' ? 'membership' : 'service'} shortly. You will receive an invoice once approved.`
            });
        } catch (err) {
            console.error('Payment error:', err);
            setSuccessAction({
                title: 'Payment Error',
                desc: 'There was an issue processing your request. Please try again or contact support.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleContactAdmin = () => {
        setContactModal(null);
        navigate('/dashboard/messages');
    };

    const handleSwitchPlan = async (planName) => {
        const plan = plans.find(p => p.name === planName);
        if (plan) {
            handleSelectPlan(plan, 'membership');
        }
    };

    const handleAction = (type) => {
        if (type === 'Manage Billing') {
            setConfirmAction({
                title: 'Executive Billing Portal',
                desc: 'You are about to be redirected to our secure payment orchestration layer to manage your payment methods and invoice history.',
                label: 'Enter Portal',
                action: () => {
                    setConfirmAction(null);
                    navigate('/dashboard/notifications');
                }
            });
        } else if (type === 'Cancel Plan') {
            setConfirmAction({
                title: 'Terminate Membership?',
                desc: 'Are you sure you wish to relinquish your premium benefits? Priority support and maintenance windows will be deactivated at the end of the current term.',
                label: 'Confirm Cancellation',
                action: async () => {
                    const res = await updateUserSubscription(user.id, 'None');
                    if (res.success) {
                        await refreshProfile();
                        setSuccessAction({ title: 'Membership Terminated', desc: 'Your subscription has been canceled. Benefits remain active until the billing cycle concludes.' });
                    }
                    setConfirmAction(null);
                }
            });
        }
    };

    return (
        <div className="user-subscription">
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>My <span className="gold">Subscription</span></h1>
                <p style={{ color: '#888', marginTop: '0.4rem' }}>Manage your membership level and billing preferences.</p>
            </header>

            <div className="admin-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Current Plan Card */}
                    <motion.div
                        className="admin-card"
                        style={{
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                            border: '1px solid var(--color-gold)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'var(--color-gold)', opacity: 0.05, borderRadius: '50%' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div>
                                <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Current Membership</span>
                                <h2 style={{ color: '#fff', fontSize: '2.2rem', margin: '0.5rem 0' }}>{currentPlanName}</h2>
                            </div>
                            <div style={{ width: '60px', height: '60px', borderRadius: '15px', background: 'rgba(201,169,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', fontSize: '2rem' }}>
                                <FiStar />
                            </div>
                        </div>

                        {currentPlan ? (
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <span style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}>${currentPlan.price}</span>
                                    <span style={{ color: '#666' }}>/{currentPlan.period || 'month'}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                    {(currentPlan.features || []).map((feature, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#888', fontSize: '0.85rem' }}>
                                            <FiCheck color="var(--color-gold)" size={14} /> {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#888', marginBottom: '2.5rem', lineHeight: '1.6' }}>You currently don't have an active subscription plan. Upgrade now to unlock premium benefits and regular maintenance washes.</p>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleAction('Manage Billing')}>Manage Billing</button>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleAction('Cancel Plan')}>Cancel Plan</button>
                        </div>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                        {/* Switch Membership Section */}
                        <div className="admin-card">
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <FiStar color="var(--color-gold)" /> Switch Membership
                            </h3>
                            <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Change your membership tier to access different levels of service.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {plans.filter(p => p.type === 'subscription').map(plan => {
                                    const isCurrent = plan.name === currentPlanName;
                                    return (
                                        <div
                                            key={plan.id}
                                            style={{
                                                padding: '1rem',
                                                border: isCurrent ? '1px solid var(--color-gold)' : '1px solid #222',
                                                borderRadius: '12px',
                                                background: isCurrent ? 'rgba(201,169,106,0.05)' : 'rgba(0,0,0,0.2)',
                                                transition: '0.3s',
                                                position: 'relative'
                                            }}
                                            className="plan-choice-card"
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>{plan.name}</div>
                                                    {isCurrent && <span style={{ background: 'var(--color-gold)', color: '#000', fontSize: '0.6rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '900' }}>CURRENT</span>}
                                                </div>
                                                <div style={{ color: 'var(--color-gold)', fontWeight: 'bold', fontSize: '0.9rem' }}>${plan.price}</div>
                                            </div>
                                            {!isCurrent && (
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ width: '100%', padding: '0.4rem', fontSize: '0.7rem', marginTop: '0.5rem', opacity: isUpdating ? 0.7 : 1 }}
                                                    disabled={isUpdating}
                                                    onClick={() => handleSelectPlan(plan, 'membership')}
                                                >
                                                    {isUpdating ? 'Updating...' : `Switch to ${plan.name.split(' ')[0]}`}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* One-Time Use Section */}
                        <div className="admin-card">
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <FiZap color="var(--color-gold)" /> One-Time Use
                            </h3>
                            <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1.5rem' }}>Need a single professional treatment? Book an executive session.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
                                {plans.filter(p => p.type === 'one-time').map(plan => (
                                    <div
                                        key={plan.id}
                                        onClick={() => handleSelectPlan(plan, 'one-time')}
                                        style={{
                                            padding: '1rem',
                                            background: '#111',
                                            borderRadius: '12px',
                                            border: '1px solid #222',
                                            cursor: 'pointer',
                                            transition: '0.3s',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        className="service-one-time-card"
                                    >
                                        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.85rem' }}>{plan.name}</div>
                                        <div style={{ color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: 'bold' }}>${plan.price}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Stats/Benefits */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="admin-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <FiZap color="var(--color-gold)" size={24} style={{ marginBottom: '0.8rem' }} />
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>24h</div>
                            <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Priority Support</div>
                        </div>
                        <div className="admin-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <FiCreditCard color="var(--color-gold)" size={24} style={{ marginBottom: '0.8rem' }} />
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>15% Off</div>
                            <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Extra Services</div>
                        </div>
                    </div>

                    <div className="admin-card" style={{ background: 'rgba(var(--color-gold-rgb), 0.03)' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <FiInfo color="var(--color-gold)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                                <h4 style={{ color: '#fff', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>Membership Policy</h4>
                                <p style={{ color: '#666', fontSize: '0.8rem', margin: 0, lineHeight: '1.5' }}>Plans are billed monthly. You can upgrade or downgrade at any time. Cancellation takes effect at the end of the current billing cycle.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {paymentModal && (
                    <div className="modal active" onClick={() => { setPaymentModal(null); setSelectedGateway(null); }}>
                        <motion.div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ padding: '2rem', maxWidth: '440px', width: '95%', borderRadius: '24px', position: 'relative' }}
                        >
                            <button
                                onClick={() => { setPaymentModal(null); setSelectedGateway(null); }}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <FiX size={18} />
                            </button>

                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'rgba(201,169,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--color-gold)' }}>
                                    <FiCreditCard size={24} />
                                </div>
                                <h2 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 0.4rem' }}>Complete Payment</h2>
                                <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>{paymentModal.plan.name} Membership</p>
                                <div style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.4rem 1rem', background: 'rgba(201,169,106,0.1)', borderRadius: '50px', color: 'var(--color-gold)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    ${paymentModal.plan.price}
                                </div>
                            </div>

                            {/* Plan Features Review */}
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ color: '#555', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>Included Benefits</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {(paymentModal.plan.features || []).map((f, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#aaa', fontSize: '0.8rem' }}>
                                            <FiCheck size={12} color="var(--color-gold)" /> {f}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ color: '#888', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>Payment Method</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {enabledGateways.map(gw => (
                                        <div
                                            key={gw.id}
                                            onClick={() => setSelectedGateway(gw.id)}
                                            style={{
                                                padding: '1rem',
                                                borderRadius: '12px',
                                                border: selectedGateway === gw.id ? '1px solid var(--color-gold)' : '1px solid #222',
                                                background: selectedGateway === gw.id ? 'rgba(201,169,106,0.08)' : 'rgba(255,255,255,0.02)',
                                                cursor: 'pointer',
                                                transition: '0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.8rem'
                                            }}
                                        >
                                            <div style={{ color: selectedGateway === gw.id ? 'var(--color-gold)' : '#444' }}>{gw.icon}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: selectedGateway === gw.id ? '#fff' : '#ccc', fontWeight: '700', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{gw.name}</div>
                                                <div style={{
                                                    color: selectedGateway === gw.id ? '#ddd' : '#888',
                                                    fontSize: '0.8rem',
                                                    lineHeight: '1.4',
                                                    whiteSpace: 'pre-wrap'
                                                }}>
                                                    {(() => {
                                                        if (!gw.details) return "";
                                                        const lines = gw.details.split('\n');
                                                        if (lines.length > 0) {
                                                            const firstLine = lines[0].trim().toLowerCase();
                                                            const cleanName = gw.name.trim().toLowerCase();
                                                            // Suppress redundant headers in detail blob
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
                                            </div>
                                            {selectedGateway === gw.id && <FiCheck color="var(--color-gold)" size={20} />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedGateway && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ marginBottom: '1.5rem' }}
                                >
                                    <div style={{ color: '#888', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Verification Identifier (FT No.)</div>
                                    <input
                                        placeholder="Enter Bank/Mobile Transfer Reference..."
                                        value={ftNo}
                                        onChange={e => setFtNo(e.target.value)}
                                        style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff', fontSize: '0.9rem' }}
                                    />
                                </motion.div>
                            )}

                            <button
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    fontSize: '0.8rem',
                                    opacity: !selectedGateway || !ftNo || isProcessing ? 0.6 : 1,
                                    boxShadow: '0 10px 25px rgba(var(--color-gold-rgb), 0.2)'
                                }}
                                disabled={!selectedGateway || !ftNo || isProcessing}
                                onClick={handlePayment}
                            >
                                {isProcessing ? 'PROCESSING...' : 'COMPLETE PURCHASE'}
                            </button>
                        </motion.div>

                    </div>
                )}

                <ConciergeModal
                    isOpen={isConciergeOpen}
                    onClose={() => setIsConciergeOpen(false)}
                    itemName={conciergeData.name}
                    itemPrice={conciergeData.price}
                />

                {confirmAction && (
                    <div className="modal active" onClick={() => setConfirmAction(null)}>
                        <motion.div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center', padding: '3rem 2.5rem', position: 'relative' }}
                        >
                            <button
                                onClick={() => setConfirmAction(null)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#444', cursor: 'pointer', transition: '0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => e.currentTarget.style.color = '#444'}
                            >
                                <FiX size={24} />
                            </button>

                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>{confirmAction.title}</h2>
                            <p style={{ color: '#888', lineHeight: '1.7', marginBottom: '2.5rem', fontSize: '1rem' }}>{confirmAction.desc}</p>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '1.2rem' }} onClick={() => setConfirmAction(null)}>DISMISS</button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '1.2rem', boxShadow: '0 10px 25px rgba(var(--color-gold-rgb), 0.15)' }}
                                    onClick={confirmAction.action}
                                >
                                    {confirmAction.label?.toUpperCase() || 'CONFIRM'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {successAction && (
                    <div className="modal active" onClick={() => setSuccessAction(null)}>
                        <motion.div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: 'center', padding: '3.5rem 2.5rem' }}
                        >
                            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(76,175,80,0.1)', color: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2.5rem' }}>
                                <FiCheck />
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>{successAction.title}</h2>
                            <p style={{ color: '#888', lineHeight: '1.7', marginBottom: '2.5rem', fontSize: '1.1rem' }}>{successAction.desc}</p>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', boxShadow: '0 10px 25px rgba(var(--color-gold-rgb), 0.15)' }} onClick={() => setSuccessAction(null)}>RETURN TO DASHBOARD</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <style>{`
                .plan-choice-card:hover { border-color: #444; background: rgba(255,255,255,0.02); }
                .service-one-time-card:hover { border-color: var(--color-gold); background: rgba(201,169,106,0.05) !important; transform: translateY(-3px); }
            `}</style>
        </div>
    );
};

export default UserSubscription;
