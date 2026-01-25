import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FiStar, FiCreditCard, FiZap, FiCheck, FiArrowRight, FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserSubscription = () => {
    const { user, refreshProfile } = useAuth();
    const { plans = [], updateUserSubscription } = useData();
    const [isUpdating, setIsUpdating] = useState(false);

    const currentPlanName = user?.subscriptionPlan || 'No Active Plan';
    const currentPlan = plans.find(p => p.name === currentPlanName) || null;

    const handleSwitchPlan = async (planName) => {
        if (!user?.id) return;
        setIsUpdating(true);
        const res = await updateUserSubscription(user.id, planName);
        if (res.success) {
            await refreshProfile();
            alert(`Plan updated to ${planName} successfully!`);
        } else {
            alert("Failed to update plan. Please try again.");
        }
        setIsUpdating(false);
    };

    const handleAction = (action) => {
        alert(`${action} feature is being prepared. Your executive care team will contact you shortly regarding billing updates.`);
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
                                            <FiCheck color="#4caf50" size={14} /> {feature}
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

                    {/* Stats/Benefits */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="admin-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <FiZap color="var(--color-gold)" size={24} style={{ marginBottom: '0.8rem' }} />
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>24h</div>
                            <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Priority Support</div>
                        </div>
                        <div className="admin-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <FiCreditCard color="#2196f3" size={24} style={{ marginBottom: '0.8rem' }} />
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}>15% Off</div>
                            <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>Extra Services</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="admin-card">
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Switch Membership</h3>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>Looking for more? Change your plan anytime to fit your automotive care needs.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {plans.filter(p => !p.name.toLowerCase().includes(currentPlanName.toLowerCase().replace(' plan', ''))).map(plan => (
                                <div key={plan.id} style={{ padding: '1.2rem', border: '1px solid #222', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', transition: '0.3s' }} className="plan-choice-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <div style={{ color: '#fff', fontWeight: 'bold' }}>{plan.name}</div>
                                        <div style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>${plan.price}</div>
                                    </div>
                                    <div style={{ color: '#555', fontSize: '0.75rem', marginBottom: '1rem' }}>{plan.features?.slice(0, 2).join(' • ')}</div>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', opacity: isUpdating ? 0.7 : 1 }}
                                        disabled={isUpdating}
                                        onClick={() => handleSwitchPlan(plan.name)}
                                    >
                                        {isUpdating ? 'Pulsing...' : `Upgrade to ${plan.name.split(' ')[0]}`} <FiArrowRight style={{ marginLeft: '5px' }} />
                                    </button>
                                </div>
                            ))}
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
            <style>{`
                .plan-choice-card:hover { border-color: #444; background: rgba(255,255,255,0.02); }
            `}</style>
        </div>
    );
};

export default UserSubscription;
