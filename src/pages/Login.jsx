import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMapPin, FiCamera, FiTruck, FiX, FiCheck } from 'react-icons/fi';
import { supabase } from '../supabase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showProfileSetup, setShowProfileSetup] = useState(false);
    const [profileData, setProfileData] = useState({
        vehicleYear: '',
        vehicleModel: '',
        location: '',
        lat: null,
        lng: null,
        profileImg: null
    });
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapSearch, setMapSearch] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);
    const { login, user, loading: authLoading, refreshProfile } = useAuth();
    const { settings } = useData();
    const navigate = useNavigate();

    const handleMapSelect = (address, lat, lng) => {
        setProfileData(prev => ({ ...prev, location: address, lat, lng }));
        setShowMapModal(false);
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, profileImg: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        try {
            const updates = {
                profile_complete: true
            };
            if (profileData.vehicleModel) {
                updates.saved_vehicles = [{
                    name: `${profileData.vehicleYear} ${profileData.vehicleModel}`.trim(),
                    year: profileData.vehicleYear,
                    model: profileData.vehicleModel
                }];
            }
            if (profileData.location) {
                updates.saved_addresses = [{
                    address: profileData.location,
                    lat: profileData.lat,
                    lng: profileData.lng
                }];
            }
            if (profileData.profileImg) {
                updates.profile_img = profileData.profileImg;
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (profileError) throw profileError;
            await refreshProfile();
            navigate('/dashboard');
        } catch (err) {
            console.error("Profile setup error:", err);
            setError("Failed to save profile. Please try again.");
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSkipProfile = async () => {
        try {
            await supabase.from('profiles').update({ profile_complete: true }).eq('id', user.id);
            await refreshProfile();
            navigate('/dashboard');
        } catch (err) {
            console.error("Skip profile error:", err);
            navigate('/dashboard');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await login(email, password);
            if (!res.success) {
                setError(res.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('An unexpected error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (user && !authLoading) {
            if (user.requiresPasswordChange) {
                navigate('/reset-password');
            } else if (!user.profileComplete && user.role !== 'admin') {
                setShowProfileSetup(true);
            } else {
                if (user.role?.toLowerCase() === 'admin') navigate('/admin');
                else navigate('/dashboard');
            }
        }
    }, [user, authLoading, navigate]);

    return (
        <div className="auth-page" style={{ background: '#0f0f0f' }}>
            {/* Map Picker Modal */}
            <AnimatePresence>
                {showMapModal && (
                    <div className="modal active" style={{ zIndex: 10000 }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{
                                background: '#0a0a0a',
                                borderRadius: '30px',
                                padding: '2rem',
                                maxWidth: '700px',
                                width: '95%',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ color: '#fff', margin: 0 }}>Select Location</h3>
                                <button onClick={() => setShowMapModal(false)} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer' }}><FiX size={20} /></button>
                            </div>

                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search for your address..."
                                    value={mapSearch}
                                    onChange={(e) => setMapSearch(e.target.value)}
                                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '15px', color: '#fff' }}
                                />
                                <FiMapPin style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)' }} />
                            </div>

                            <div style={{ height: '350px', borderRadius: '20px', background: '#111', overflow: 'hidden', position: 'relative', border: '1px solid #222' }}>
                                <iframe
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapSearch || 'Addis Ababa')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"
                                ></iframe>
                                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleMapSelect(mapSearch || 'Current Map View', 0, 0)}
                                        className="btn btn-primary" style={{ flex: 1, padding: '0.8rem' }}
                                    >Confirm Selected Location</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Complete Profile Popup */}
            <AnimatePresence>
                {showProfileSetup && (
                    <div className="modal active" style={{ zIndex: 9999 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                                background: 'rgba(10, 10, 10, 0.98)',
                                backdropFilter: 'blur(30px)',
                                borderRadius: '30px',
                                padding: '2rem',
                                maxWidth: '500px',
                                width: '90%',
                                border: '1px solid rgba(201, 169, 106, 0.2)',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Welcome Aboard</div>
                                    <h2 style={{ color: '#fff', fontSize: '1.6rem', margin: 0, fontFamily: 'var(--font-heading)' }}>Complete Your Profile</h2>
                                </div>
                                <button onClick={handleSkipProfile} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', padding: '0.5rem' }}>
                                    <FiX size={24} />
                                </button>
                            </div>

                            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                Add your vehicle and location for a faster booking experience.
                            </p>

                            {/* Profile Image */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '18px',
                                        background: profileData.profileImg ? `url(${profileData.profileImg})` : 'linear-gradient(135deg, var(--color-gold) 0%, #8a6d3b 100%)',
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem', color: '#000', fontWeight: '900'
                                    }}>
                                        {!profileData.profileImg && <FiUser size={24} />}
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleProfileImageChange} id="profile-img-input" hidden />
                                    <label htmlFor="profile-img-input" style={{
                                        position: 'absolute', bottom: '-5px', right: '-5px',
                                        width: '24px', height: '24px', borderRadius: '8px',
                                        background: '#111', border: '1px solid #333', color: 'var(--color-gold)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                    }}>
                                        <FiCamera size={12} />
                                    </label>
                                </div>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>Profile Photo</div>
                                    <div style={{ color: '#555', fontSize: '0.75rem' }}>Add a photo to personalize your account</div>
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: '#666', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiTruck size={14} /> Vehicle Information
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Year"
                                        value={profileData.vehicleYear}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, vehicleYear: e.target.value }))}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Exact Model (e.g. BMW M4)"
                                        value={profileData.vehicleModel}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                                        style={{ width: '100%', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ color: '#666', fontSize: '0.7rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiMapPin size={14} /> Preferred Location
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Select location or enter address"
                                        value={profileData.location}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                                        style={{ width: '100%', padding: '0.9rem 3.5rem 0.9rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => { setMapSearch(profileData.location); setShowMapModal(true); }}
                                        style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(201,169,106,0.1)', border: '1px solid rgba(201,169,106,0.2)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-gold)' }}
                                    >
                                        <FiMapPin size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={handleSkipProfile} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#888', cursor: 'pointer', fontWeight: '600' }}>
                                    Later
                                </button>
                                <button onClick={handleSaveProfile} disabled={savingProfile} className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>
                                    <FiCheck style={{ marginRight: '0.5rem' }} /> {savingProfile ? 'Done' : 'Complete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            <motion.div
                className="auth-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    {settings?.logo && (settings.logo.startsWith('data:') || settings.logo.startsWith('http') || settings.logo.startsWith('/')) ? (
                        <img src={settings.logo} alt={settings.siteName || 'Logo'} style={{ height: '70px', width: 'auto', display: 'block', margin: '0 auto' }} />
                    ) : (
                        <span className="logo-main" style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-gold)' }}>{settings?.logo || settings?.siteName || 'MBC'}</span>
                    )}
                </div>

                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to manage your appointments</p>

                {error && <div style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                        <span>{loading ? 'Verifying...' : 'Sign In'}</span>
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
                <div className="auth-footer" style={{ marginTop: '0.5rem' }}>
                    <Link to="/" className="auth-link" style={{ fontSize: '0.8rem', color: '#666' }}>Back to Home</Link>
                </div>

                {(settings?.documents || []).some(d => d.showOnLogin) && (
                    <div className="auth-footer" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #333', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {(settings?.documents || []).filter(d => d.showOnLogin).map(doc => (
                            <a key={doc.id} href={`#doc-${doc.id}`} className="auth-link" style={{ fontSize: '0.75rem', color: '#555' }}>{doc.name}</a>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
