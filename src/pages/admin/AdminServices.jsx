import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiSave, FiAward, FiEye, FiStar, FiShoppingCart, FiDollarSign, FiLayers, FiLink } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminServices = () => {
    const { services = [], plans = [], bookings = [], addService, updateService, deleteService, currency, setCurrency } = useData();
    const { showToast } = useToast();
    const [editingService, setEditingService] = useState(null);
    const [deletingService, setDeletingService] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const fileInputRef = useRef(null);

    // Calculate service statistics from bookings
    const [statsFilter, setStatsFilter] = useState('Month');

    const filterByStatsRange = (list) => {
        const now = new Date();
        const cutoff = new Date();
        if (statsFilter === 'Day') cutoff.setHours(cutoff.getHours() - 24);
        if (statsFilter === 'Week') cutoff.setDate(cutoff.getDate() - 7);
        if (statsFilter === 'Month') cutoff.setDate(cutoff.getDate() - 30);

        return list.filter(b => {
            const d = new Date(b.date || b.timestamp);
            return !isNaN(d.getTime()) && d >= cutoff;
        });
    };

    const serviceBookings = bookings.filter(b => b.service_id || b.serviceId);
    const filteredBookings = filterByStatsRange(serviceBookings);
    const completedServiceBookings = filteredBookings.filter(b => b.status === 'completed' || b.status === 'Approved');

    const statsRevenue = completedServiceBookings.reduce((acc, b) => {
        const amount = currency === 'ETB' ? (b.amount_etb || (b.amount_usd || b.price || 0) * 120) : (b.amount_usd || b.amount || b.price || 0);
        return acc + (parseFloat(String(amount).replace(/[^0-9.]/g, '')) || 0);
    }, 0);

    const statsCount = filteredBookings.length;
    const statsGrowth = "+12.4%"; // Simulated for now

    const handleSave = async () => {
        try {
            // Auto-format price to include "From" if it's just a number or starts with $
            let formattedPrice = editingService.price || '';
            const priceStr = String(formattedPrice).trim();
            if (priceStr && !priceStr.toLowerCase().startsWith('from')) {
                if (/^\d/.test(priceStr)) {
                    formattedPrice = `From $${priceStr}`;
                }
            }

            const serviceData = {
                ...editingService,
                price: formattedPrice,
                price_usd: editingService.price_usd || parseFloat(String(formattedPrice).replace(/[^0-9.]/g, '')),
                price_etb: editingService.price_etb
            };

            if (isCreating) {
                const payload = {
                    ...serviceData,
                    id: `service-${Date.now()}`,
                    icon_type: 'FiPackage'
                };
                await addService(payload);
                showToast('Service package deployed successfully.', 'success');
            } else {
                await updateService(serviceData);
                showToast('Service registry synchronized.', 'success');
            }
            setEditingService(null);
            setIsCreating(false);
        } catch (err) {
            console.error("Critical Persistence Error:", err);
            showToast(`Failed to save service: ${err.message}`, 'error');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setEditingService(prev => ({ ...prev, image: event.target.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = async () => {
        if (deletingService) {
            try {
                await deleteService(deletingService.id);
                showToast('Service purged from registry.', 'success');
                setDeletingService(null);
            } catch (err) {
                console.error("Critical Deletion Error:", err);
                showToast(`Deletion failed: ${err.message}`, 'error');
            }
        }
    };

    return (
        <div className="admin-services-container" style={{ animation: 'fadeIn 0.5s ease' }}>
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>Services Catalog</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem' }}>Manage the car wash packages and specialty services offered.</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingService({ title: '', price: '', description: '', features: [''], featured: false, image: '/images/service-wash.jpg', includedInPlans: [] });
                        setIsCreating(true);
                    }}
                >
                    <FiPlus /> Create Service
                </button>
            </header>

            <div className="admin-stats-grid" style={{ marginBottom: '3rem', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="admin-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(201,169,106,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}><FiDollarSign /></div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            {['Day', 'Week', 'Month'].map(f => (
                                <button key={f} onClick={() => setStatsFilter(f)} style={{ background: statsFilter === f ? 'var(--color-gold)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '4px', fontSize: '0.5rem', padding: '2px 6px', color: statsFilter === f ? '#000' : '#888', cursor: 'pointer', fontWeight: 'bold' }}>{f}</button>
                            ))}
                        </div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{currency === 'ETB' ? 'ETB ' : '$'}{statsRevenue.toLocaleString()}</div>
                    <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginTop: '0.4rem' }}>{statsFilter} Revenue</div>
                </div>
                <div className="admin-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(76,175,80,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4caf50' }}><FiShoppingCart /></div>
                        <div style={{ color: '#4caf50', fontSize: '0.8rem', fontWeight: '900', background: 'rgba(76,175,80,0.1)', padding: '4px 8px', borderRadius: '6px' }}>{statsGrowth}</div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{statsCount}</div>
                    <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginTop: '0.4rem' }}>Total Sales</div>
                </div>
                <div className="admin-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(221,160,221,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dda0dd' }}><FiEye /></div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{Math.round(statsCount * 4.2)}</div>
                    <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginTop: '0.4rem' }}>Catalog Views</div>
                </div>
                <div className="admin-stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,165,0,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffa500' }}><FiStar /></div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>4.9</div>
                    <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', marginTop: '0.4rem' }}>Average Rating</div>
                </div>
            </div>

            <div className="admin-stats-grid">
                {services.map(service => (
                    <div key={service.id} className="admin-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ position: 'relative', height: '180px', background: '#000' }}>
                            <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                            {service.featured && (
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--color-gold)', color: '#000', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                    FEATURED
                                </div>
                            )}
                        </div>
                        <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div className="admin-flex-between">
                                <h3 style={{ color: '#fff', fontSize: '1.4rem', margin: 0, fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{service.title}</h3>
                                <div style={{ color: 'var(--color-gold)', fontWeight: '900', fontSize: '1.3rem', textAlign: 'right' }}>
                                    {currency === 'ETB' ? (
                                        service.price_etb ? `From ETB ${service.price_etb}` : `~ETB ${(parseFloat(String(service.price_usd || service.price || 0).replace(/[^0-9.]/g, '')) * 120).toLocaleString()}`
                                    ) : (
                                        service.price_usd ? `From $${service.price_usd}` : (String(service.price).startsWith('$') || String(service.price).toLowerCase().includes('from') ? service.price : `$${service.price}`)
                                    )}
                                </div>
                            </div>

                            <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: '1.8', margin: 0 }}>{service.description}</p>

                            {service.features && service.features.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.6 }}>Package Deliverables</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {service.features.slice(0, 4).map((f, i) => f && (
                                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.75rem', color: '#888', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {f}
                                            </div>
                                        ))}
                                        {service.features.length > 4 && <div style={{ fontSize: '0.75rem', color: '#444', alignSelf: 'center' }}>+{service.features.length - 4} more</div>}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem' }}>
                                <button
                                    onClick={() => setEditingService(service)}
                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontWeight: '600', fontSize: '0.9rem' }}
                                >
                                    <FiEdit2 size={16} /> Audit
                                </button>
                                <button
                                    onClick={() => setDeletingService(service)}
                                    style={{ width: '45px', height: '45px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {(editingService || isCreating) && (
                    <div className="modal active" onClick={() => { setEditingService(null); setIsCreating(false); }}>
                        <motion.div
                            className="modal-content glass-modal-large"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 30 }}
                            style={{
                                padding: '2.5rem',
                                borderRadius: '35px',
                                background: 'rgba(5,5,5,0.99)',
                                backdropFilter: 'blur(50px)',
                                border: '1px solid rgba(251,191,36,0.1)',
                                position: 'relative'
                            }}
                        >
                            <div className="admin-flex-between" style={{ marginBottom: '3rem' }}>
                                <div>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Catalog Registry</div>
                                    <h2 style={{ color: '#fff', fontSize: '2.4rem', margin: 0, fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
                                        {isCreating ? 'Deploy New Service' : 'Refine Package'}
                                    </h2>
                                </div>
                                <button onClick={() => { setEditingService(null); setIsCreating(false); }} style={{ background: 'rgba(255,255,255,0.03)', border: 'none', color: '#fff', width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3.5rem' }}>
                                {/* Image & Media Side */}
                                <div>
                                    <div style={{ color: '#555', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1.2rem', textTransform: 'uppercase' }}>Visual Assets</div>
                                    <div style={{
                                        width: '100%',
                                        height: '240px',
                                        background: 'rgba(0,0,0,0.5)',
                                        borderRadius: '25px',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        marginBottom: '1.5rem',
                                        position: 'relative'
                                    }}>
                                        <img src={editingService.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&q=80&w=1000'; }} />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                    />
                                    <div className="admin-field" style={{ display: 'flex', gap: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Package Image URL</label>
                                            <input
                                                placeholder="Paste Image URL"
                                                value={editingService.image}
                                                onChange={e => setEditingService({ ...editingService, image: e.target.value })}
                                                style={{ padding: '1rem', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid #1a1a1a', borderRadius: '12px', color: '#fff', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ alignSelf: 'flex-end', padding: '1rem', background: 'var(--color-gold)', border: 'none', borderRadius: '12px', color: '#000', cursor: 'pointer', fontWeight: '900', fontSize: '0.75rem' }}
                                        >
                                            UPLOAD MEDIA
                                        </button>
                                    </div>

                                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(251,191,36,0.02)', borderRadius: '20px', border: '1px solid rgba(251,191,36,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={editingService.featured}
                                                onChange={e => setEditingService({ ...editingService, featured: e.target.checked })}
                                                id="featured-check"
                                                style={{ width: '20px', height: '20px', accentColor: 'var(--color-gold)' }}
                                            />
                                            <label htmlFor="featured-check" style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>Enable Featured Status</label>
                                        </div>
                                        <p style={{ color: '#444', fontSize: '0.75rem', marginTop: '0.8rem', margin: '0.8rem 0 0 32px' }}>Featured services are highlighted at the top of the booking gallery.</p>
                                    </div>

                                    {/* Subscription Association */}
                                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                        <div style={{ color: 'var(--color-gold)', fontSize: '0.65rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <FiLayers /> Include in Subscriptions
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {plans.filter(p => p.type === 'subscription').map(plan => (
                                                <div key={plan.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <input
                                                        type="checkbox"
                                                        id={`plan-${plan.id}`}
                                                        checked={(editingService.includedInPlans || []).includes(plan.id)}
                                                        onChange={(e) => {
                                                            const currentPlans = editingService.includedInPlans || [];
                                                            const newPlans = e.target.checked
                                                                ? [...currentPlans, plan.id]
                                                                : currentPlans.filter(id => id !== plan.id);
                                                            setEditingService({ ...editingService, includedInPlans: newPlans });
                                                        }}
                                                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-gold)' }}
                                                    />
                                                    <label htmlFor={`plan-${plan.id}`} style={{ color: '#aaa', fontSize: '0.85rem', cursor: 'pointer' }}>{plan.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Details Side */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div className="admin-field">
                                            <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Package Title</label>
                                            <input placeholder="e.g. Signature Diamond Detail" value={editingService.title} onChange={e => setEditingService({ ...editingService, title: e.target.value })} style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '1.1rem', fontWeight: '700' }} />
                                        </div>
                                        <div className="admin-field">
                                            <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>USD Rate ($)</label>
                                            <input placeholder="150" value={editingService.price_usd || ''} onChange={e => setEditingService({ ...editingService, price_usd: e.target.value })} style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid #1a1a1a', borderRadius: '15px', color: 'var(--color-gold)', fontSize: '1.1rem', fontWeight: '900', textAlign: 'center' }} />
                                        </div>
                                        <div className="admin-field">
                                            <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>ETB Rate (BR)</label>
                                            <input placeholder="18000" value={editingService.price_etb || ''} onChange={e => setEditingService({ ...editingService, price_etb: e.target.value })} style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#4caf50', fontSize: '1.1rem', fontWeight: '900', textAlign: 'center' }} />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="admin-field">
                                            <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Category (Tag)</label>
                                            <input placeholder="e.g. Interior, Exterior, Full Detail" value={editingService.category || ''} onChange={e => setEditingService({ ...editingService, category: e.target.value })} style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '0.9rem' }} />
                                        </div>
                                        <div className="admin-field">
                                            <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Duration Approx.</label>
                                            <input placeholder="e.g. 2-3 Hours" value={editingService.duration || ''} onChange={e => setEditingService({ ...editingService, duration: e.target.value })} style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '0.9rem' }} />
                                        </div>
                                    </div>

                                    <div className="admin-field" style={{ marginBottom: '2rem' }}>
                                        <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Package Logic & Fulfillment Strategy</label>
                                        <textarea
                                            placeholder="Exhaustive description of the service deliverables, expected results, and execution methodology..."
                                            value={editingService.description}
                                            onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                                            style={{ padding: '1.5rem', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid #1a1a1a', borderRadius: '20px', color: '#aaa', minHeight: '180px', fontSize: '1rem', lineHeight: '1.7' }}
                                        />
                                    </div>

                                    <div className="admin-field">
                                        <label style={{ color: '#444', fontSize: '0.65rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Premium Feature & Deliverable Matrix
                                            <button
                                                onClick={() => setEditingService({ ...editingService, features: [...(editingService.features || []), ''] })}
                                                style={{ background: 'rgba(201,169,106,0.1)', color: 'var(--color-gold)', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.7rem', fontWeight: '900', cursor: 'pointer' }}
                                            >+ ADD REQUIREMENT</button>
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                            {(editingService.features || []).map((feat, fidx) => (
                                                <div key={fidx} style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
                                                    <div style={{ flex: 1, position: 'relative' }}>
                                                        <input
                                                            value={feat}
                                                            onChange={e => {
                                                                const newFeats = [...editingService.features];
                                                                newFeats[fidx] = e.target.value;
                                                                setEditingService({ ...editingService, features: newFeats });
                                                            }}
                                                            style={{ padding: '1rem', width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid #1a1a1a', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                                                            placeholder="e.g. Paint Correction Stage 1"
                                                        />
                                                        <FiX
                                                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#444' }}
                                                            onClick={() => {
                                                                const newFeats = editingService.features.filter((_, i) => i !== fidx);
                                                                setEditingService({ ...editingService, features: newFeats });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: '3rem', display: 'flex', gap: '1.5rem' }}>
                                        <button className="btn btn-secondary" style={{ flex: 0.4, padding: '1.2rem' }} onClick={() => { setEditingService(null); setIsCreating(false); }}>DISCARD CHANGES</button>
                                        <button className="btn btn-primary" style={{ flex: 1, padding: '1.2rem', fontSize: '1rem', fontWeight: '900' }} onClick={handleSave}>
                                            {isCreating ? 'AUTHORIZE DEPLOYMENT' : 'SYNCHRONIZE REGISTRY'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {deletingService && (
                    <div className="modal active" onClick={() => setDeletingService(null)}>
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
                                background: 'rgba(10,10,10,0.99)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                backdropFilter: 'blur(40px)'
                            }}
                        >
                            <div style={{ width: '80px', height: '80px', background: 'rgba(239,68,68,0.1)', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 2rem', border: '1px solid rgba(239,68,68,0.1)' }}>
                                <FiTrash2 size={32} />
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Purge Service?</h2>
                            <p style={{ color: '#666', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                                Are you sure you want to authorize the removal of <b>{deletingService.title}</b> from the executive catalog?
                            </p>
                            <div style={{ display: 'flex', gap: '1.2rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1, padding: '1rem' }} onClick={() => setDeletingService(null)}>ABORT</button>
                                <button className="btn btn-primary" style={{ flex: 1, padding: '1rem', background: '#ef4444', border: 'none', color: '#fff', fontWeight: '900' }} onClick={handleDelete}>AUTHORIZE PURGE</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminServices;
