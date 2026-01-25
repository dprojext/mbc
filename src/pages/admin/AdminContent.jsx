import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { FiLayout, FiGlobe, FiShield, FiX, FiCheck, FiSave, FiUpload, FiTrash2, FiSearch, FiLayers, FiFileText, FiLink, FiImage, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const AdminContent = () => {
    const { settings, updateSettings } = useData();
    const [formData, setFormData] = useState(settings);
    const [activeTab, setActiveTab] = useState('branding');
    const [isDirty, setIsDirty] = useState(false);
    const [notification, setNotification] = useState('');

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleSave = async () => {
        try {
            await updateSettings(formData);
            setIsDirty(false);
            setNotification('Configuration deployed successfully!');
            setTimeout(() => setNotification(''), 4000);
        } catch (error) {
            setNotification('Deployment failed.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleSubChange = (section, key, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [key]: value }
        }));
        setIsDirty(true);
    };

    return (
        <div className="admin-content-container" style={{ animation: 'fadeIn 0.5s ease' }}>
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="admin-title" style={{ margin: 0 }}>System Configuration</h1>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.4rem' }}>Global platform settings and content management.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {notification && <span style={{ color: '#4caf50', fontSize: '0.85rem', fontWeight: 'bold' }}>{notification}</span>}
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        style={{ opacity: isDirty ? 1 : 0.6, background: isDirty ? 'var(--color-gold)' : '#222' }}
                    >
                        {isDirty ? 'Deploy Updates' : 'System Sync'}
                    </button>
                </div>
            </header>

            <div className="admin-card" style={{ padding: '0.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: '2rem', minWidth: 'max-content' }}>
                    {[
                        { id: 'branding', label: 'Branding', icon: <FiLayout /> },
                        { id: 'landing', label: 'Landing Experience', icon: <FiGlobe /> },
                        { id: 'legal', label: 'Security & Legal', icon: <FiShield /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '1rem 1.5rem', background: 'none', border: 'none',
                                color: activeTab === tab.id ? 'var(--color-gold)' : '#555',
                                fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '0.8rem', transition: '0.3s'
                            }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-grid-2">
                <AnimatePresence mode="wait">
                    {activeTab === 'branding' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="admin-card">
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '2rem' }}>Corporate Identity</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Platform Name</label>
                                    <input value={formData?.appName || ''} name="appName" onChange={handleChange} style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', color: '#fff' }} />
                                </div>
                                <div>
                                    <label style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Primary Accent Color</label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input type="color" value={formData?.colors?.primary || '#c9a96a'} onChange={e => handleSubChange('colors', 'primary', e.target.value)} style={{ width: '50px', height: '50px', border: 'none', background: 'none', cursor: 'pointer' }} />
                                        <input value={formData?.colors?.primary || ''} onChange={e => handleSubChange('colors', 'primary', e.target.value)} style={{ flex: 1, padding: '0.8rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', color: '#fff' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Typography Engine</label>
                                    <select value={formData?.typography || ''} onChange={e => handleSubChange('typography', null, e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', color: '#fff' }}>
                                        <option value="Outfit">Outfit (Modern)</option>
                                        <option value="Inter">Inter (Clean)</option>
                                        <option value="Playfair Display">Playfair (Classic)</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'landing' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="admin-card">
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '2rem' }}>Experience Management</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>SEO Meta Title</label>
                                    <input value={formData?.seo?.title || ''} onChange={e => handleSubChange('seo', 'title', e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', color: '#fff' }} />
                                </div>
                                <div>
                                    <label style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>SEO Meta Description</label>
                                    <textarea value={formData?.seo?.description || ''} onChange={e => handleSubChange('seo', 'description', e.target.value)} style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', color: '#fff', minHeight: '100px' }} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'legal' && (
                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="admin-card">
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '2rem' }}>Policy & Compliance</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {(formData?.documents || []).map(doc => (
                                    <div key={doc.id} style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: '500' }}>{doc.title}</div>
                                            <div style={{ color: '#444', fontSize: '0.7rem' }}>Last updated: {doc.updated}</div>
                                        </div>
                                        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Edit Document</button>
                                    </div>
                                ))}
                                <button className="btn btn-primary" style={{ marginTop: '1rem', background: 'transparent', border: '1px dashed var(--color-gold)', color: 'var(--color-gold)' }}>
                                    <FiPlus /> New Policy Draft
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="admin-card">
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '2rem' }}>System Status</h3>
                    <div style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '16px', border: '1px solid #222' }}>
                        <div className="admin-flex-between" style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Database Integrity</span>
                            <span style={{ color: '#4caf50', fontWeight: 'bold' }}>OPTIMAL</span>
                        </div>
                        <div className="admin-flex-between" style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>SSL Termination</span>
                            <span style={{ color: '#4caf50', fontWeight: 'bold' }}>ACTIVE</span>
                        </div>
                        <div className="admin-flex-between">
                            <span style={{ color: '#666', fontSize: '0.9rem' }}>Load Balancer</span>
                            <span style={{ color: '#4caf50', fontWeight: 'bold' }}>STABLE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminContent;
