import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiSave, FiAward, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminServices = () => {
    const { services = [], addService, updateService, deleteService } = useData();
    const [editingService, setEditingService] = useState(null);
    const [deletingService, setDeletingService] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const fileInputRef = useRef(null);

    const handleSave = () => {
        if (isCreating) {
            addService({ ...editingService, id: Date.now() });
        } else {
            updateService(editingService);
        }
        setEditingService(null);
        setIsCreating(false);
    };

    const handleDelete = () => {
        if (deletingService) {
            deleteService(deletingService.id);
            setDeletingService(null);
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
                        setEditingService({ title: '', price: '', description: '', features: [''], featured: false, image: '/images/service-wash.jpg' });
                        setIsCreating(true);
                    }}
                >
                    <FiPlus /> Create Service
                </button>
            </header>

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
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div className="admin-flex-between" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0, fontFamily: 'var(--font-heading)' }}>{service.title}</h3>
                                <div style={{ color: 'var(--color-gold)', fontWeight: 'bold', fontSize: '1.1rem' }}>${service.price}</div>
                            </div>
                            <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{service.description}</p>
                            <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
                                <button
                                    onClick={() => setEditingService(service)}
                                    style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #333', background: 'rgba(255,255,255,0.03)', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    <FiEdit2 /> Edit
                                </button>
                                <button
                                    onClick={() => setDeletingService(service)}
                                    style={{ padding: '0.6rem', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {(editingService || isCreating) && (
                    <div className="modal active" onClick={() => { setEditingService(null); setIsCreating(false); }}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <h2 className="admin-title" style={{ fontSize: '1.5rem' }}>{isCreating ? 'New Service' : 'Edit Service'}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1.5rem' }}>
                                <input placeholder="Service Title" value={editingService.title} onChange={e => setEditingService({ ...editingService, title: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                                <input placeholder="Price" value={editingService.price} onChange={e => setEditingService({ ...editingService, price: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff' }} />
                                <textarea placeholder="Service Description" value={editingService.description} onChange={e => setEditingService({ ...editingService, description: e.target.value })} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff', minHeight: '100px' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input type="checkbox" checked={editingService.featured} onChange={e => setEditingService({ ...editingService, featured: e.target.checked })} id="featured-check" />
                                    <label htmlFor="featured-check" style={{ color: '#fff' }}>Featured Service</label>
                                </div>
                                <button className="btn btn-primary" onClick={handleSave}>{isCreating ? 'Create Service' : 'Save Changes'}</button>
                                <button className="btn btn-secondary" onClick={() => { setEditingService(null); setIsCreating(false); }}>Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {deletingService && (
                    <div className="modal active" onClick={() => setDeletingService(null)}>
                        <motion.div className="modal-content" onClick={e => e.stopPropagation()} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ maxWidth: '400px', textAlign: 'center' }}>
                            <FiTrash2 size={48} color="#ff4444" style={{ marginBottom: '1.5rem' }} />
                            <h2 style={{ color: '#fff' }}>Remove Service?</h2>
                            <p style={{ color: '#888', marginBottom: '2rem' }}>Are you sure you want to delete <b>{deletingService.title}</b>? This will remove it from the catalog.</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeletingService(null)}>Cancel</button>
                                <button className="btn btn-primary" style={{ flex: 1, background: '#ff4444' }} onClick={handleDelete}>Delete Now</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminServices;
