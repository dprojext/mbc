import React, { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiSave, FiAward, FiEye } from 'react-icons/fi';

const iconOptions = [
    { value: 'wash', label: 'Hand Wash' },
    { value: 'interior', label: 'Interior' },
    { value: 'ceramic', label: 'Ceramic' },
    { value: 'package', label: 'Package' },
    { value: 'polish', label: 'Polish' },
    { value: 'protection', label: 'Protection' }
];

const AdminServices = () => {
    const { services = [], addService, updateService, deleteService } = useData();
    const [editingService, setEditingService] = useState(null);
    const [deletingService, setDeletingService] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditingService(prev => ({ ...prev, image: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (isCreating) {
            addService(editingService);
        } else {
            updateService(editingService);
        }
        setEditingService(null);
        setIsCreating(false);
    };

    const handleDelete = () => {
        deleteService(deletingService.id);
        setDeletingService(null);
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: '#666', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Content Management</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', margin: 0, color: '#fff' }}>Services Catalog</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>Manage services displayed on the landing page.</p>
                </div>
                <button
                    className="btn btn-primary"
                    style={{ padding: '0.7rem 1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => {
                        setEditingService({
                            title: '',
                            price: '',
                            image: '/images/service-wash.jpg',
                            description: '',
                            features: [''],
                            featured: false,
                            iconType: 'wash'
                        });
                        setIsCreating(true);
                    }}
                >
                    <FiPlus /> Add Service
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {services.map(service => (
                    <div key={service.id} style={{
                        background: 'rgba(20,20,20,0.8)',
                        borderRadius: '24px',
                        border: service.featured ? '1px solid rgba(var(--color-gold-rgb), 0.3)' : '1px solid rgba(255,255,255,0.05)',
                        overflow: 'hidden',
                        transition: '0.3s',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.borderColor = 'rgba(var(--color-gold-rgb), 0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = service.featured ? 'rgba(var(--color-gold-rgb), 0.3)' : 'rgba(255,255,255,0.05)';
                        }}
                    >
                        {/* Image Preview */}
                        <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                            <img
                                src={service.image}
                                alt={service.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
                            />
                            {service.featured && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    padding: '4px 12px',
                                    background: 'var(--color-gold)',
                                    color: '#000',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    borderRadius: '50px'
                                }}>
                                    Featured
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                bottom: '12px',
                                left: '12px',
                                padding: '6px 14px',
                                background: 'rgba(0,0,0,0.7)',
                                color: 'var(--color-gold)',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                borderRadius: '8px',
                                backdropFilter: 'blur(5px)'
                            }}>
                                {service.price}
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.8rem', fontWeight: '600' }}>{service.title}</h3>
                            <p style={{ color: '#666', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.2rem', flex: 1 }}>
                                {service.description.length > 120 ? service.description.substring(0, 120) + '...' : service.description}
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                {service.features.slice(0, 3).map((feature, idx) => (
                                    <span key={idx} style={{
                                        padding: '4px 10px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        color: '#888'
                                    }}>
                                        {feature}
                                    </span>
                                ))}
                                {service.features.length > 3 && (
                                    <span style={{
                                        padding: '4px 10px',
                                        background: 'rgba(var(--color-gold-rgb), 0.1)',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        color: 'var(--color-gold)'
                                    }}>
                                        +{service.features.length - 3} more
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button
                                    className="btn btn-secondary"
                                    style={{ flex: 1, padding: '0.7rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    onClick={() => {
                                        setEditingService({ ...service });
                                        setIsCreating(false);
                                    }}
                                >
                                    <FiEdit2 /> Edit
                                </button>
                                <button
                                    style={{
                                        background: 'rgba(255,68,68,0.05)',
                                        border: '1px solid rgba(255,68,68,0.1)',
                                        color: '#ff4444',
                                        borderRadius: '50px',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        transition: '0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,68,68,0.05)'}
                                    onClick={() => setDeletingService(service)}
                                    title="Delete Service"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit / Create Modal */}
            {editingService && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: '#0d0d0d', padding: '2.5rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ color: '#fff', marginBottom: '2rem', fontFamily: 'var(--font-heading)' }}>{isCreating ? 'Add New Service' : 'Edit Service'}</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Service Title</label>
                                <input
                                    type="text"
                                    value={editingService.title}
                                    onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none' }}
                                    placeholder="e.g., Premium Detailing"
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Price Display</label>
                                    <input
                                        type="text"
                                        value={editingService.price}
                                        onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none' }}
                                        placeholder="e.g., From $150"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Icon Style</label>
                                    <select
                                        value={editingService.iconType}
                                        onChange={(e) => setEditingService({ ...editingService, iconType: e.target.value })}
                                        style={{ width: '100%', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none' }}
                                    >
                                        {iconOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Service Image</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#0a0a0a', border: '1px solid #333', flexShrink: 0 }}>
                                        {editingService.image && <img src={editingService.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current.click()}
                                            style={{ background: '#222', color: '#fff', border: '1px solid #333', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block', width: '100%' }}
                                        >
                                            Upload from Local
                                        </button>
                                        <input
                                            type="text"
                                            value={editingService.image}
                                            onChange={(e) => setEditingService({ ...editingService, image: e.target.value })}
                                            style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #222', color: '#666', fontSize: '0.7rem', outline: 'none' }}
                                            placeholder="or paste URL here..."
                                        />
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Description</label>
                                <textarea
                                    value={editingService.description}
                                    onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                    rows={3}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none', resize: 'none' }}
                                    placeholder="Describe the service..."
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Features (One per line)</label>
                                <textarea
                                    value={editingService.features.join('\n')}
                                    onChange={(e) => setEditingService({ ...editingService, features: e.target.value.split('\n') })}
                                    rows={4}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '0.9rem', color: '#fff', outline: 'none', resize: 'none' }}
                                    placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                <button
                                    onClick={() => setEditingService({ ...editingService, featured: !editingService.featured })}
                                    style={{
                                        width: '48px',
                                        height: '28px',
                                        borderRadius: '50px',
                                        background: editingService.featured ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: '0.3s'
                                    }}
                                >
                                    <div style={{
                                        width: '22px',
                                        height: '22px',
                                        borderRadius: '50%',
                                        background: '#fff',
                                        position: 'absolute',
                                        top: '3px',
                                        left: editingService.featured ? '23px' : '3px',
                                        transition: '0.3s'
                                    }}></div>
                                </button>
                                <span style={{ color: '#888', fontSize: '0.85rem' }}>Mark as Featured (shows "Most Popular" badge)</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 2, padding: '1rem' }}
                                onClick={handleSave}
                            >
                                {isCreating ? 'Add Service' : 'Save Changes'}
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ flex: 1, padding: '1rem' }}
                                onClick={() => { setEditingService(null); setIsCreating(false); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingService && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(15px)' }}>
                    <div style={{ background: '#0d0d0d', padding: '3rem', borderRadius: '32px', border: '1px solid rgba(255,68,68,0.2)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🗑️</div>
                        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Delete Service?</h2>
                        <p style={{ color: '#888', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                            Are you sure you want to delete <span style={{ color: '#fff', fontWeight: 'bold' }}>{deletingService.title}</span>? This will remove it from the landing page.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                style={{ flex: 1, padding: '1rem', background: '#ff4444', border: 'none', color: '#fff', borderRadius: '50px', cursor: 'pointer', fontWeight: '600' }}
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                            <button
                                style={{ flex: 1, padding: '1rem', background: '#222', border: 'none', color: '#888', borderRadius: '50px', cursor: 'pointer' }}
                                onClick={() => setDeletingService(null)}
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

export default AdminServices;
