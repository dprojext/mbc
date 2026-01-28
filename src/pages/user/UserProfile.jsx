import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiCamera, FiSave, FiAlertCircle, FiTruck, FiMapPin } from 'react-icons/fi';
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
    const [newVehicleYear, setNewVehicleYear] = useState('');
    const [newVehicleModel, setNewVehicleModel] = useState('');
    const [newVehiclePlate, setNewVehiclePlate] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapSearch, setMapSearch] = useState('');
    const [profileImg, setProfileImg] = useState(user?.profileImg || null);
    const fileInputRef = React.useRef(null);

    const handleMapSelect = (address) => {
        setNewAddress(address);
        setShowMapModal(false);
    };

    React.useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone
            }));
            setVehicles(user.savedVehicles || []);
            setAddresses(user.savedAddresses || []);
            setProfileImg(user.profileImg || null);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update profiles table - skip auth move to avoid "session missing" on older tokens
            // The profiles table is our source of truth for UI display
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    display_name: formData.name,
                    phone: formData.phone,
                    saved_vehicles: vehicles,
                    saved_addresses: addresses,
                    profile_img: profileImg
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
            {/* Map Picker Modal */}
            <AnimatePresence>
                {showMapModal && (
                    <div className="modal active" style={{ zIndex: 10000 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ background: '#161616', borderRadius: '30px', padding: '2rem', maxWidth: '700px', width: '95%', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#fff', margin: 0 }}>Select Location</h3>
                                <button onClick={() => setShowMapModal(false)} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}>×</button>
                            </div>
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <input type="text" placeholder="Search for your area..." value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '15px', color: '#fff' }} />
                            </div>
                            <div style={{ height: '350px', borderRadius: '20px', background: '#111', overflow: 'hidden', border: '1px solid #222' }}>
                                <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(mapSearch || 'Addis Ababa')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
                            </div>
                            <button onClick={() => handleMapSelect(mapSearch)} className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}>Confirm This Location</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>My <span className="gold">Profile</span></h1>
                <p style={{ color: '#888', marginTop: '0.4rem' }}>Manage your personal information and account security.</p>
            </header>

            <div className="user-profile-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Basic Info */}
                    <motion.div
                        className="admin-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    width: '120px', height: '120px', borderRadius: '24px',
                                    background: profileImg ? `url(${profileImg})` : 'linear-gradient(135deg, var(--color-gold) 0%, #8a6d3b 100%)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '3rem', color: '#000', fontWeight: '900', textTransform: 'uppercase',
                                    boxShadow: '0 10px 30px rgba(201,169,106,0.2)',
                                    overflow: 'hidden',
                                    border: '2px solid rgba(201,169,106,0.3)'
                                }}>
                                    {!profileImg && (formData.name && !formData.name.includes('@') ? formData.name : user?.email || 'M').charAt(0)}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setProfileImg(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        position: 'absolute', bottom: '-10px', right: '-10px',
                                        width: '36px', height: '36px', borderRadius: '12px',
                                        background: '#111', border: '1px solid #333', color: 'var(--color-gold)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <FiCamera size={16} />
                                </button>
                            </div>
                            <div>
                                <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 0.3rem 0' }}>{formData.name && !formData.name.includes('@') ? formData.name : user?.email}</h2>
                                <p style={{ color: 'var(--color-gold)', margin: 0, fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{user?.role === 'admin' ? 'MBC ARCHITECT' : 'EXECUTIVE MEMBER'}</p>
                                <p style={{ color: '#555', margin: '0.3rem 0 0 0', fontSize: '0.8rem' }}>Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Subscriber'}</p>
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
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
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
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
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
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: '#111', border: '1px solid #222', borderRadius: '10px', color: '#444', cursor: 'not-allowed' }}
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
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
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
                            <FiTruck color="var(--color-gold)" /> Saved Vehicles
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                value={newVehicleYear}
                                onChange={(e) => setNewVehicleYear(e.target.value)}
                                placeholder="Year"
                                style={{ padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                            <input
                                value={newVehicleModel}
                                onChange={(e) => setNewVehicleModel(e.target.value)}
                                placeholder="Exact Model (e.g. BMW M4)"
                                style={{ padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <input
                                value={newVehiclePlate}
                                onChange={(e) => setNewVehiclePlate(e.target.value)}
                                placeholder="Plate (Optional)"
                                style={{ flex: 1, padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                            <button
                                onClick={() => { if (newVehicleModel) { setVehicles([...vehicles, { name: `${newVehicleYear} ${newVehicleModel}`.trim(), year: newVehicleYear, model: newVehicleModel, plate: newVehiclePlate }]); setNewVehicleYear(''); setNewVehicleModel(''); setNewVehiclePlate(''); } }}
                                className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}
                            >Add</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                            {vehicles.map((v, i) => (
                                <span key={i} style={{ padding: '0.4rem 0.8rem', background: 'rgba(201,169,106,0.1)', border: '1px solid rgba(201,169,106,0.2)', borderRadius: '20px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {typeof v === 'string' ? v : v.name} <button onClick={() => setVehicles(vehicles.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: 0 }}>×</button>
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
                                style={{ flex: 1, padding: '0.6rem', background: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                            />
                            <button
                                onClick={() => { setMapSearch(newAddress); setShowMapModal(true); }}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', padding: '0 0.8rem', color: 'var(--color-gold)', cursor: 'pointer' }}
                            ><FiMapPin /></button>
                            <button
                                onClick={() => { if (newAddress) { setAddresses([...addresses, newAddress]); setNewAddress(''); } }}
                                className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.7rem' }}
                            >Add</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {addresses.map((a, i) => (
                                <span key={i} style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.03)', border: '1px solid #333', borderRadius: '20px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {typeof a === 'string' ? a : a.address} <button onClick={() => setAddresses(addresses.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', padding: 0 }}>×</button>
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
