import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiLayers, FiDollarSign, FiArrowUpRight, FiActivity, FiPackage, FiStar } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSubscriptions = () => {
    const { plans = [], addPlan, updatePlan, deletePlan, users = [], transactions = [], currency, setCurrency } = useData();
    const { showToast } = useToast();
    const [editingPlan, setEditingPlan] = useState(null);
    const [deletingPlan, setDeletingPlan] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const stats = React.useMemo(() => {
        const subTrx = transactions.filter(t => t.category === 'Subscription' && (t.status === 'Completed' || t.status === 'Paid'));
        const totalRevenue = subTrx.reduce((acc, t) => {
            const amount = currency === 'ETB' ? (t.amount_etb || (t.amount_usd || t.amount || 0) * 120) : (t.amount_usd || t.amount || 0);
            return acc + amount;
        }, 0);
        const activeSubscribers = users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'None').length;
        return {
            totalRevenue,
            activeSubscribers,
            planCount: plans.length
        };
    }, [transactions, users, plans, currency]);

    const handleSave = async () => {
        try {
            const planData = {
                ...editingPlan,
                price: editingPlan.price_usd || editingPlan.price,
                price_usd: editingPlan.price_usd || editingPlan.price,
                price_etb: editingPlan.price_etb
            };

            if (isCreating) {
                const payload = {
                    ...planData,
                    id: `plan-${Date.now()}`,
                    active_users: 0
                };
                await addPlan(payload);
                showToast('New subscription model deployed successfully.', 'success');
            } else {
                await updatePlan(planData);
                showToast('Subscription model synchronized.', 'success');
            }
            setEditingPlan(null);
            setIsCreating(false);
        } catch (err) {
            console.error("Critical Plan Save Error:", err);
            showToast(`Synchronization failed: ${err.message}`, 'error');
        }
    };

    const handleDelete = async () => {
        if (!deletingPlan) return;
        try {
            await deletePlan(deletingPlan.id);
            showToast('Subscription model purged from registry.', 'success');
            setDeletingPlan(null);
        } catch (err) {
            console.error("Plan Deletion Error:", err);
            showToast(`Deletion failed: ${err.message}`, 'error');
        }
    };

    const renderPlanSection = (title, type, subtitle) => {
        const filteredPlans = plans.filter(p => p.type === type);
        return (
            <div style={{ marginBottom: '4rem' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{type === 'subscription' ? 'Subscription' : 'One-Time Use'} Segment</div>
                    <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 0.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{title}</h2>
                    <p style={{ color: '#555', margin: 0, fontSize: '0.9rem' }}>{subtitle}</p>
                </div>
                <div className="admin-stats-grid">
                    {filteredPlans.map(plan => (
                        <div key={plan.id} className="admin-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ padding: '2.5rem', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <div className="admin-flex-between" style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: 0, fontWeight: '800' }}>{plan.name}</h3>
                                    <div style={{ background: 'rgba(76,175,80,0.1)', color: '#4caf50', padding: '0.4rem 0.8rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.1em' }}>
                                        {plan.activeUsers || 0} ACTIVE
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                                    <span style={{ color: 'var(--color-gold)', fontSize: '2.8rem', fontWeight: '900', fontFamily: 'var(--font-heading)' }}>
                                        {currency === 'ETB'
                                            ? (plan.price_etb ? `ETB ${plan.price_etb}` : `~ETB ${(parseFloat(plan.price_usd || plan.price || 0) * 120).toLocaleString()}`)
                                            : `$${plan.price_usd || plan.price}`}
                                    </span>
                                    <span style={{ color: '#666', fontSize: '1rem', fontWeight: '600' }}>/{type === 'subscription' ? 'MO' : 'ONCE'}</span>
                                </div>
                            </div>
                            <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ color: 'var(--color-gold)', fontSize: '0.6rem', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.2rem', opacity: 0.5 }}>Package Deliverables</div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {(plan.features || []).map((f, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#aaa', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                            <FiCheck color="var(--color-gold)" size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                                    <button onClick={() => setEditingPlan(plan)} style={{ flex: 1, padding: '1rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontWeight: '700' }}>
                                        <FiEdit2 size={16} /> Audit
                                    </button>
                                    <button onClick={() => setDeletingPlan(plan)} style={{ width: '50px', height: '50px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FiTrash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="admin-plans-container" style={{ animation: 'fadeIn 0.5s ease' }}>
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>Subscription Command</h1>
                    <p style={{ color: '#666', fontSize: '0.95rem', marginTop: '0.6rem' }}>Configure high-fidelity subscription tiers and recurring revenue architecture.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginLeft: 'auto', marginRight: '1rem' }}>
                    {['USD', 'ETB'].map(curr => (
                        <button
                            key={curr}
                            onClick={() => setCurrency(curr)}
                            style={{
                                padding: '0.4rem 1rem', borderRadius: '8px', border: 'none',
                                background: currency === curr ? 'var(--color-gold)' : 'transparent',
                                color: currency === curr ? '#000' : '#888',
                                fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer', transition: '0.2s'
                            }}
                        >
                            {curr}
                        </button>
                    ))}
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingPlan({ name: '', price_usd: '', price_etb: '', type: 'subscription', features: [''], currency: 'USD' }); setIsCreating(true); }} style={{ padding: '1rem 2rem', borderRadius: '15px', fontWeight: '900', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
                    <FiPlus /> DEPLOY NEW TIER
                </button>
            </header>

            {/* Subscription Dashboard Overlay */}
            <div className="admin-stats-grid" style={{ marginBottom: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="admin-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: '60px', height: '60px', background: 'rgba(201,169,106,0.1)', color: 'var(--color-gold)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiStar size={24} /></div>
                    <div>
                        <div style={{ color: '#444', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Active Subscribers</div>
                        <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '800' }}>{stats.activeSubscribers}</div>
                    </div>
                </div>
                <div className="admin-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: '60px', height: '60px', background: 'rgba(76,175,80,0.1)', color: '#4caf50', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiDollarSign size={24} /></div>
                    <div>
                        <div style={{ color: '#444', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Cumulative Sub Revenue</div>
                        <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '800' }}>{currency === 'ETB' ? 'ETB ' : '$'}{stats.totalRevenue.toLocaleString()}</div>
                    </div>
                </div>
                <div className="admin-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.03)', color: '#888', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiActivity size={24} /></div>
                    <div>
                        <div style={{ color: '#444', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Configured Tiers</div>
                        <div style={{ color: '#fff', fontSize: '2rem', fontWeight: '800' }}>{stats.planCount}</div>
                    </div>
                </div>
            </div>

            {renderPlanSection('Subscriptions', 'subscription', 'Authoritative recurring monthly service tiers.')}
            {renderPlanSection('One-Time Use', 'one-time', 'High-value single-transaction premium packages.')}

            <AnimatePresence>
                {editingPlan && (
                    <div className="modal active" onClick={() => { setEditingPlan(null); setIsCreating(false); }}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            style={{
                                maxWidth: '850px',
                                width: '95%',
                                padding: '3.5rem',
                                borderRadius: '35px',
                                background: 'rgba(20,20,20,0.98)',
                                backdropFilter: 'blur(50px)',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <div className="admin-flex-between" style={{ marginBottom: '3.5rem' }}>
                                <div>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Registry Configuration</div>
                                    <h2 style={{ color: '#fff', fontSize: '2.4rem', margin: 0, fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                                        {isCreating ? 'Deploy Model' : 'Refine Registry Item'}
                                    </h2>
                                </div>
                                <button onClick={() => { setEditingPlan(null); setIsCreating(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: '#fff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                    <div className="admin-field">
                                        <label style={{ color: '#888', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Model Primary Title</label>
                                        <input placeholder="e.g. Diamond Executive Membership" value={editingPlan?.name || ''} onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })} style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '15px', color: '#fff', fontSize: '1.1rem', fontWeight: '700' }} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="admin-field">
                                            <label style={{ color: '#888', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>USD Price ($)</label>
                                            <input placeholder="99.99" value={editingPlan?.price_usd || ''} onChange={e => setEditingPlan({ ...editingPlan, price_usd: e.target.value })} style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '15px', color: 'var(--color-gold)', fontSize: '1.1rem', fontWeight: '900', textAlign: 'center' }} />
                                        </div>
                                        <div className="admin-field">
                                            <label style={{ color: '#888', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>ETB Price (BR)</label>
                                            <input placeholder="12000" value={editingPlan?.price_etb || ''} onChange={e => setEditingPlan({ ...editingPlan, price_etb: e.target.value })} style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '15px', color: '#4caf50', fontSize: '1.1rem', fontWeight: '900', textAlign: 'center' }} />
                                        </div>
                                    </div>
                                    <div className="admin-field">
                                        <label style={{ color: '#888', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Revenue Logic</label>
                                        <select
                                            value={editingPlan?.type || 'subscription'}
                                            onChange={e => setEditingPlan({ ...editingPlan, type: e.target.value })}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid #c9a96a44', borderRadius: '15px', height: '58px', color: '#fff', paddingLeft: '1.2rem', appearance: 'auto' }}
                                        >
                                            <option value="subscription">Recurring Subscription</option>
                                            <option value="one-time">One-Time Pack</option>
                                        </select>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.01)', padding: '2rem', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#888', fontSize: '0.85rem', lineHeight: '1.6' }}>
                                            <FiLayers size={32} color="var(--color-gold)" style={{ opacity: 0.5 }} />
                                            Revenue models define how customers interact with your pricing architecture. Tiers are recurring, while Packages are single-use.
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div className="admin-field" style={{ flex: 1 }}>
                                        <label style={{ color: '#888', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                                            Premium Feature Matrix
                                            <span style={{ color: 'var(--color-gold)', cursor: 'pointer', fontSize: '0.6rem' }} onClick={() => setEditingPlan({ ...editingPlan, features: [...(editingPlan?.features || []), ''] })}>+ ADD DELIVERABLE</span>
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                            {(editingPlan?.features || []).map((feat, fidx) => (
                                                <div key={fidx} style={{ position: 'relative' }}>
                                                    <input
                                                        value={feat}
                                                        onChange={e => {
                                                            const newFeats = [...editingPlan.features];
                                                            newFeats[fidx] = e.target.value;
                                                            setEditingPlan({ ...editingPlan, features: newFeats });
                                                        }}
                                                        style={{ padding: '1rem 1.2rem', width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                                                        placeholder="e.g. Ceramic Protection (1 Year)"
                                                    />
                                                    <FiX
                                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#333' }}
                                                        onClick={() => {
                                                            const newFeats = editingPlan.features.filter((_, i) => i !== fidx);
                                                            setEditingPlan({ ...editingPlan, features: newFeats });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '3.5rem', display: 'flex', gap: '1.5rem' }}>
                                        <button className="btn btn-secondary" style={{ flex: 0.4, padding: '1.2rem' }} onClick={() => { setEditingPlan(null); setIsCreating(false); }}>DISCARD</button>
                                        <button className="btn btn-primary" style={{ flex: 1, padding: '1.2rem', fontSize: '1rem', fontWeight: '900', letterSpacing: '0.1em' }} onClick={handleSave}>
                                            {isCreating ? 'AUTHORIZE DEPLOYMENT' : 'SYNCHRONIZE MODEL'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {deletingPlan && (
                    <div className="modal active" onClick={() => setDeletingPlan(null)}>
                        <motion.div
                            className="modal-content glass-modal"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                maxWidth: '450px',
                                padding: '3.5rem',
                                textAlign: 'center',
                                borderRadius: '35px',
                                background: 'rgba(20,20,20,0.98)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                backdropFilter: 'blur(40px)'
                            }}
                        >
                            <div style={{ width: '80px', height: '80px', background: 'rgba(239,68,68,0.1)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 2rem', border: '1px solid rgba(239,68,68,0.1)' }}>
                                <FiTrash2 size={32} />
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Purge Registry?</h2>
                            <p style={{ color: '#666', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                                Are you sure you want to authorize the permanent deletion of the <b>{deletingPlan.name}</b> model? This action cannot be reversed.
                            </p>
                            <div style={{ display: 'flex', gap: '1.2rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }} onClick={() => setDeletingPlan(null)}>ABORT</button>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '1rem', background: '#ef4444', border: 'none', color: '#fff', fontWeight: '900' }} onClick={handleDelete}>AUTHORIZE PURGE</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminSubscriptions;
