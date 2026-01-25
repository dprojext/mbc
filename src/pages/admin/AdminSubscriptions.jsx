import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiLayers, FiDollarSign } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminSubscriptions = () => {
    const { plans = [], updatePlans } = useData();
    const [editingPlan, setEditingPlan] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [displayCurrency, setDisplayCurrency] = useState('USD');

    const handleSave = () => {
        if (isCreating) {
            updatePlans([...plans, { ...editingPlan, id: Date.now(), activeUsers: 0 }]);
        } else {
            updatePlans(plans.map(p => p.id === editingPlan.id ? editingPlan : p));
        }
        setEditingPlan(null);
        setIsCreating(false);
    };

    const handleDelete = (id) => {
        updatePlans(plans.filter(p => p.id !== id));
    };

    const renderPlanSection = (title, type, subtitle) => {
        const filteredPlans = plans.filter(p => p.type === type);
        return (
            <div style={{ marginBottom: '4rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.4rem', margin: '0 0 0.4rem', fontFamily: 'var(--font-heading)' }}>{title}</h2>
                    <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>{subtitle}</p>
                </div>
                <div className="admin-stats-grid">
                    {filteredPlans.map(plan => (
                        <div key={plan.id} className="admin-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '2rem', borderBottom: '1px solid #1a1a1a', background: 'rgba(255,255,255,0.02)' }}>
                                <div className="admin-flex-between" style={{ marginBottom: '1rem' }}>
                                    <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600' }}>{plan.name}</div>
                                    <div style={{ background: 'rgba(201,169,106,0.1)', color: 'var(--color-gold)', padding: '0.2rem 0.6rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 'bold' }}>{plan.activeUsers} Active</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                                    <span style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}>${plan.priceUSD || plan.price}</span>
                                    <span style={{ color: '#555', fontSize: '0.9rem' }}>/{type === 'subscription' ? 'mo' : 'once'}</span>
                                </div>
                            </div>
                            <div style={{ padding: '2rem', flex: 1 }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {(plan.features || []).map((f, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#888', fontSize: '0.9rem' }}>
                                            <FiCheck color="var(--color-gold)" size={14} /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <button onClick={() => setEditingPlan(plan)} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #333', background: 'rgba(255,255,255,0.03)', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                        <FiEdit2 /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(plan.id)} style={{ padding: '0.6rem', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', borderRadius: '8px', cursor: 'pointer' }}>
                                        <FiTrash2 />
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
            <header className="admin-flex-between" style={{ marginBottom: '3rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>Revenue Models</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem' }}>Configure membership tiers and one-time service packages.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingPlan({ name: '', price: '', type: 'subscription', features: [''], currency: 'USD' }); setIsCreating(true); }}>
                    <FiPlus /> New Model
                </button>
            </header>

            {renderPlanSection('Membership Tiers', 'subscription', 'Recurring monthly revenue streams.')}
            {renderPlanSection('Fixed Packages', 'one-time', 'Single-transaction premium services.')}

            <AnimatePresence>
                {(editingPlan || isCreating) && (
                    <div className="modal active" onClick={() => { setEditingPlan(null); setIsCreating(false); }}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="admin-title" style={{ fontSize: '1.5rem' }}>{isCreating ? 'Design Revenue Model' : 'Edit Model'}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
                                <input placeholder="Plan Name" value={editingPlan.name} onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input placeholder="Price (USD)" value={editingPlan.price} onChange={e => setEditingPlan({ ...editingPlan, price: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                                    <select value={editingPlan.type} onChange={e => setEditingPlan({ ...editingPlan, type: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}>
                                        <option value="subscription">Subscription</option>
                                        <option value="one-time">One-Time</option>
                                    </select>
                                </div>
                                <button className="btn btn-primary" onClick={handleSave}>Confirm Model</button>
                                <button className="btn btn-secondary" onClick={() => { setEditingPlan(null); setIsCreating(false); }}>Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminSubscriptions;
