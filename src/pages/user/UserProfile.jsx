import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiCamera, FiSave, FiAlertCircle } from 'react-icons/fi';
import { supabase } from '../../supabase';

const UserProfile = () => {
    const { user, refreshProfile } = useAuth();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [vehicles, setVehicles] = useState(user?.savedVehicles || []);
    const [addresses, setAddresses] = useState(user?.savedAddresses || []);
    const [newVehicle, setNewVehicle] = useState('');
    const [newAddress, setNewAddress] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update Auth Metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    display_name: formData.name,
                    phone: formData.phone
                }
            });

            if (authError) throw authError;

            // Update profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    name: formData.name,
                    phone: formData.phone,
                    saved_vehicles: vehicles,
                    saved_addresses: addresses
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            await refreshProfile();
            showToast('Profile updated successfully!', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return showToast('Passwords do not match', 'error');
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: formData.newPassword
            });
            if (error) throw error;
            showToast('Password updated successfully!', 'success');
            setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="user-profile">
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>My <span className="gold">Profile</span></h1>
                <p style={{ color: '#888', marginTop: '0.4rem' }}>Manage your personal information and account security.</p>
            </header>

            <div className="admin-grid-2">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Basic Info */}
                    <motion.div
                        className="admin-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '100px', height: '100px', borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--color-gold) 0%, #8a6d3b 100%)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2.5rem', color: '#000', fontWeight: 'bold'
                                }}>
                                    {user?.name?.charAt(0)}
                                </div>
                                <button style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    background: '#111', border: '1px solid #333', color: 'var(--color-gold)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                }}>
                                    <FiCamera size={14} />
                                </button>
                            </div>
                            <div>
                                <h2 style={{ color: '#fff', margin: '0 0 0.3rem 0' }}>{user?.name}</h2>
                                <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Member since {new Date(user?.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                        />
                                        <FiUser style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+1 (555) 000-0000"
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                        />
                                        <FiPhone style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        value={formData.email}
                                        disabled
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '10px', color: '#444', cursor: 'not-allowed' }}
                                    />
                                    <FiMail style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#333' }} />
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#444', marginTop: '0.4rem' }}>Contact support to change your verified email address.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1rem' }}
                            >
                                <FiSave style={{ marginRight: '8px' }} /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Security */}
                    <div className="admin-card">
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <FiLock /> Security Settings
                        </h3>
                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '1.2rem' }}>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem' }}>New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.8rem', background: '#050505', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.8rem', background: '#050505', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !formData.newPassword}
                                className="btn btn-secondary"
                                style={{ width: '100%' }}
                            >
                                Update Password
                            </button>
                        </form>
                    </div>

                    {/* Saved Assets */}
                    <div className="admin-card">
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <FiSave color="var(--color-gold)" /> Saved Vehicles
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                value={newVehicle}
                                onChange={(e) => setNewVehicle(e.target.value)}
                                placeholder="e.g. 2024 BMW M4"
                                style={{ flex: 1, padding: '0.6rem', background: '#050505', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                            <button
                                onClick={() => { if (newVehicle) { setVehicles([...vehicles, newVehicle]); setNewVehicle(''); } }}
                                className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}
                            >Add</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                            {vehicles.map((v, i) => (
                                <span key={i} style={{ padding: '0.4rem 0.8rem', background: 'rgba(201,169,106,0.1)', border: '1px solid rgba(201,169,106,0.2)', borderRadius: '20px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {v} <button onClick={() => setVehicles(vehicles.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: 0 }}>×</button>
                                </span>
                            ))}
                        </div>

                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            Saved Addresses
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                value={newAddress}
                                onChange={(e) => setNewAddress(e.target.value)}
                                placeholder="Street, Building, Door"
                                style={{ flex: 1, padding: '0.6rem', background: '#050505', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                            <button
                                onClick={() => { if (newAddress) { setAddresses([...addresses, newAddress]); setNewAddress(''); } }}
                                className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}
                            >Add</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {addresses.map((a, i) => (
                                <span key={i} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '20px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {a} <button onClick={() => setAddresses(addresses.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: 0 }}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
