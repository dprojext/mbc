import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const AdminSubscriptions = () => {
    const { plans = [], updatePlans, transactions = [] } = useData();

    const [editingPlan, setEditingPlan] = useState(null);
    const [deletingPlan, setDeletingPlan] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [displayCurrency, setDisplayCurrency] = useState('USD'); // Global view toggle

    const exchangeRate = 56.5; // Simulated rate for conversion logic

    const formatPrice = (price, planCurrency, plan = null) => {
        if (displayCurrency === 'USD' && plan?.priceUSD) return plan.priceUSD;
        // If display is ETB and we have an explicit ETB price, use it
        if (displayCurrency === 'ETB' && plan?.priceETB) return plan.priceETB;

        // Fallback to conversion if no explicit override
        if (displayCurrency === planCurrency) return price;
        return displayCurrency === 'ETB' ? Math.round(price * exchangeRate) : Math.round(price / exchangeRate);
    };

    const handleUpdatePlan = (updatedPlan) => {
        updatePlans(plans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        setEditingPlan(null);
    };

    const handleDeletePlan = () => {
        updatePlans(plans.filter(p => p.id !== deletingPlan.id));
        setDeletingPlan(null);
    };

    const handleCreatePlan = (newPlan) => {
        const nextId = plans.length > 0 ? Math.max(...plans.map(p => p.id)) + 1 : 1;
        updatePlans([...plans, { ...newPlan, id: nextId, activeUsers: 0 }]);
        setIsCreating(false);
    };


    const renderPlanSection = (title, type, subtitle) => {
        const filteredPlans = plans.filter(p => p.type === type);

        return (
            <div style={{ marginBottom: '4rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 0.4rem', fontFamily: 'var(--font-heading)' }}>{title}</h2>
                    <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>{subtitle}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredPlans.map(plan => (
                        <div key={plan.id} style={{
                            background: 'rgba(20,20,20,0.8)',
                            borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                            transition: '0.3s',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.borderColor = 'rgba(var(--color-gold-rgb), 0.2)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                            }}
                        >
                            <div style={{ padding: '2rem', background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: '600' }}>{plan.name}</div>
                                    {plan.type === 'subscription' && (
                                        <div style={{
                                            padding: '4px 10px',
                                            background: 'rgba(var(--color-gold-rgb), 0.1)',
                                            color: 'var(--color-gold)',
                                            fontSize: '0.7rem',
                                            borderRadius: '50px',
                                            fontWeight: '600'
                                        }}>
                                            {plan.activeUsers} Members
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                                    <span style={{ color: '#aaa', fontSize: '1rem', fontWeight: '500' }}>{displayCurrency === 'USD' ? '$' : 'Br'}</span>
                                    <span style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 'bold' }}>{formatPrice(plan.price, plan.currency, plan)}</span>
                                    <span style={{ color: '#555', fontSize: '0.9rem' }}>
                                        /{plan.type === 'subscription' ? 'monthly' : 'one-time'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ color: '#444', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.2rem' }}>Package Includes</div>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#888', fontSize: '0.9rem' }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ flex: 1, padding: '0.7rem', fontSize: '0.85rem' }}
                                        onClick={() => {
                                            setEditingPlan({ ...plan });
                                            setIsCreating(false);
                                        }}
                                    >
                                        Edit Details
                                    </button>
                                    <button
                                        style={{
                                            background: 'rgba(255,68,68,0.05)',
                                            border: '1px solid rgba(255,68,68,0.1)',
                                            color: '#ff4444',
                                            borderRadius: '50px',
                                            padding: '0.7rem 1rem',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            transition: '0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.1)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.05)'}
                                        onClick={() => setDeletingPlan(plan)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Calculate Real-Time Stats
    const mrr = plans.reduce((acc, plan) => {
        return plan.type === 'subscription' ? acc + (plan.price * (plan.activeUsers || 0)) : acc;
    }, 0);

    const oneTimeRevenue = transactions
        .filter(t => t.status === 'Completed' && t.type !== 'Subscription')
        .reduce((acc, t) => acc + t.amount, 0);

    const churnRate = 0; // Placeholder until historical data logic is implemented

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Inventory Management</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', margin: 0, color: '#fff' }}>Products & Services</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>Manage recurring membership subscriptions and one-time service packages.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.03)',
                        padding: '4px',
                        borderRadius: '50px',
                        display: 'flex',
                        border: '1px solid rgba(255,255,255,0.08)',
                        marginRight: '1rem'
                    }}>
                        {['USD', 'ETB'].map(curr => (
                            <button
                                key={curr}
                                onClick={() => setDisplayCurrency(curr)}
                                style={{
                                    padding: '0.5rem 1.2rem',
                                    borderRadius: '50px',
                                    border: 'none',
                                    background: displayCurrency === curr ? 'var(--color-gold)' : 'transparent',
                                    color: displayCurrency === curr ? '#000' : '#888',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                {curr}
                            </button>
                        ))}
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.7rem 1.5rem', fontSize: '0.85rem' }}
                        onClick={() => {
                            setEditingPlan({ name: '', price: 0, currency: displayCurrency, type: 'subscription', period: 'month', features: [''] });
                            setIsCreating(true);
                        }}
                    >
                        + Create Offering
                    </button>
                </div>
            </div>

            {/* Revenue Statistics (Moved to Top) */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ background: 'rgba(20,20,20,0.8)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
                        <div>
                            <div style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Monthly Subscription Revenue</div>
                            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>
                                {displayCurrency === 'USD' ? '$' : 'Br'} {formatPrice(mrr, 'USD').toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>One-Time Package Sales</div>
                            <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>
                                {displayCurrency === 'USD' ? '$' : 'Br'} {formatPrice(oneTimeRevenue, 'USD').toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div style={{ color: '#555', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Churn Rate (30d)</div>
                            <div style={{ color: churnRate > 0 ? '#ff4444' : '#4caf50', fontSize: '1.5rem', fontWeight: '700' }}>{churnRate}%</div>
                        </div>
                    </div>
                </div>
            </div>

            {renderPlanSection('Membership Tiers', 'subscription', 'Recurring monthly plans with ongoing benefits.')}

            {renderPlanSection('Single-Use Packages', 'package', 'One-time specialized service bundles.')}

            {/* Edit / Create Modal */}
            {editingPlan && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: '#0d0d0d', padding: '2.5rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ color: '#fff', marginBottom: '2rem', fontFamily: 'var(--font-heading)' }}>{isCreating ? 'Create New Offering' : 'Edit Offering Details'}</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Offering Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {['subscription', 'package'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setEditingPlan({ ...editingPlan, type })}
                                            style={{
                                                flex: 1,
                                                padding: '0.8rem',
                                                borderRadius: '12px',
                                                border: '1px solid',
                                                borderColor: editingPlan.type === type ? 'var(--color-gold)' : 'rgba(255,255,255,0.05)',
                                                background: editingPlan.type === type ? 'rgba(var(--color-gold-rgb), 0.1)' : 'rgba(255,255,255,0.02)',
                                                color: editingPlan.type === type ? 'var(--color-gold)' : '#666',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                textTransform: 'capitalize',
                                                transition: '0.3s'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Name</label>
                                <input
                                    type="text"
                                    value={editingPlan.name}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Price (USD $)</label>
                                    <input
                                        type="number"
                                        value={editingPlan.price}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0, currency: 'USD' })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Price (ETB Br)</label>
                                    <input
                                        type="number"
                                        value={editingPlan.priceETB || Math.round(editingPlan.price * exchangeRate)}
                                        onChange={(e) => setEditingPlan({ ...editingPlan, priceETB: parseInt(e.target.value) || 0 })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none' }}
                                    />
                                </div>

                                {/* Yearly Billing Section */}
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                        <h3 style={{ fontSize: '0.9rem', color: '#ccc', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Yearly Billing Option</h3>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                                            <span style={{ color: editingPlan.hasYearly ? '#fff' : '#666', fontSize: '0.8rem', fontWeight: 'bold' }}>{editingPlan.hasYearly ? 'Enabled' : 'Disabled'}</span>
                                            <div style={{
                                                width: '44px', height: '24px', background: editingPlan.hasYearly ? 'var(--color-gold)' : '#222',
                                                borderRadius: '50px', position: 'relative', transition: '0.3s', border: '1px solid rgba(255,255,255,0.1)'
                                            }}>
                                                <div style={{
                                                    width: '18px', height: '18px', background: '#fff', borderRadius: '50%',
                                                    position: 'absolute', top: '2px',
                                                    left: editingPlan.hasYearly ? '22px' : '2px', transition: '0.3s'
                                                }} />
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={editingPlan.hasYearly || false}
                                                onChange={(e) => setEditingPlan({ ...editingPlan, hasYearly: e.target.checked })}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    </div>

                                    {editingPlan.hasYearly && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
                                            <div>
                                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Yearly Price (USD $)</label>
                                                <input
                                                    type="number"
                                                    value={editingPlan.priceYearly || ''}
                                                    placeholder={editingPlan.price ? Math.round(editingPlan.price * 10) : '0'} // Suggest 10x monthly
                                                    onChange={(e) => setEditingPlan({ ...editingPlan, priceYearly: parseInt(e.target.value) || 0 })}
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none' }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Yearly Price (ETB Br)</label>
                                                <input
                                                    type="number"
                                                    value={editingPlan.priceYearlyETB || ''}
                                                    placeholder={editingPlan.priceETB ? Math.round(editingPlan.priceETB * 10) : (editingPlan.price ? Math.round(editingPlan.price * 10 * exchangeRate) : '0')}
                                                    onChange={(e) => setEditingPlan({ ...editingPlan, priceYearlyETB: parseInt(e.target.value) || 0 })}
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none' }}
                                                />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Discount Label (e.g. "Save 17%")</label>
                                                <input
                                                    type="text"
                                                    value={editingPlan.yearlyDiscount || ''}
                                                    placeholder="e.g. Save 20% or 2 Months Free"
                                                    onChange={(e) => setEditingPlan({ ...editingPlan, yearlyDiscount: e.target.value })}
                                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none' }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Features (One per line)</label>
                                <textarea
                                    value={editingPlan.features.join('\n')}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split('\n') })}
                                    rows={4}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none', resize: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2, padding: '1rem' }}
                                onClick={() => isCreating ? handleCreatePlan(editingPlan) : handleUpdatePlan(editingPlan)}
                            >
                                {isCreating ? 'Create Offering' : 'Save Changes'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ flex: 1, padding: '1rem' }}
                                onClick={() => setEditingPlan(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingPlan && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(15px)' }}>
                    <div style={{ background: '#0d0d0d', padding: '3rem', borderRadius: '32px', border: '1px solid rgba(255,68,68,0.2)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🗑️</div>
                        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Delete Offering?</h2>
                        <p style={{ color: '#888', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                            Are you sure you want to delete the <span style={{ color: '#fff', fontWeight: 'bold' }}>{deletingPlan.name}</span>? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                style={{ flex: 1, padding: '1rem', background: '#ff4444', border: 'none', color: '#fff', borderRadius: '50px', cursor: 'pointer', fontWeight: '600' }}
                                onClick={handleDeletePlan}
                            >
                                Delete Plan
                            </button>
                            <button
                                style={{ flex: 1, padding: '1rem', background: '#222', border: 'none', color: '#888', borderRadius: '50px', cursor: 'pointer' }}
                                onClick={() => setDeletingPlan(null)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}



            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                select option {
                    background: #0d0d0d;
                    color: #fff;
                }
            `}</style>
        </div>
    );
};

export default AdminSubscriptions;
