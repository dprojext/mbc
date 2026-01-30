import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiCamera, FiSave, FiAlertCircle, FiTruck, FiMapPin, FiX, FiActivity, FiSend, FiStar, FiZap, FiEdit2, FiCheckCircle, FiUserCheck, FiTarget, FiAward, FiNavigation, FiSettings, FiShield, FiBriefcase, FiAnchor, FiCpu, FiGlobe, FiHexagon, FiPackage, FiServer, FiSmartphone, FiSun, FiTool, FiWatch, FiWifi, FiWind, FiBox, FiCast, FiCloud, FiCode, FiCommand, FiCompass, FiDatabase, FiDisc, FiDroplet, FiEye, FiFeather, FiFilm, FiFlag, FiFolder, FiGift, FiGrid, FiHardDrive, FiHeadphones, FiHeart, FiHome, FiImage, FiKey, FiLayers, FiLayout, FiLifeBuoy, FiLink, FiLoader, FiMap, FiMic, FiMonitor, FiMoon, FiMusic, FiPieChart, FiPower, FiPrinter, FiRadio, FiRefreshCw, FiRss, FiScissors, FiSearch, FiShare, FiShoppingBag, FiShoppingCart, FiShuffle, FiSidebar, FiSlack, FiSlash, FiSliders, FiSpeaker, FiSquare, FiTablet, FiTag, FiTerminal, FiThermometer, FiThumbsUp, FiToggleLeft, FiToggleRight, FiTrash, FiTrash2, FiTrello, FiTv, FiTwitter, FiTrendingUp, FiType, FiUmbrella, FiUnlock, FiUpload, FiUploadCloud, FiUserMinus, FiUserPlus, FiUserX, FiVideo, FiVoicemail, FiVolume, FiVolume1, FiVolume2, FiVolumeX, FiWifiOff, FiXCircle, FiXOctagon, FiXSquare, FiYoutube, FiZoomIn, FiZoomOut } from 'react-icons/fi';
import {
    FaUser, FaUserTie, FaUserGraduate, FaUserAstronaut, FaUserSecret, FaUserDoctor, FaUserNinja,
    FaPersonDress, FaUserPlus, FaUserLarge, FaUserGear,
    FaCar, FaCarSide, FaCarOn, FaCarRear,
    FaTruck, FaTruckFast, FaTruckMonster, FaVanShuttle,
    FaPlane, FaPlaneUp, FaPlaneDeparture, FaPlaneArrival
} from 'react-icons/fa6';
import { MdPerson, MdFace, MdEmojiPeople, MdBusiness } from 'react-icons/md';
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
    const [newAddress, setNewAddress] = useState('');
    const [showMapModal, setShowMapModal] = useState(false);
    const [mapSearch, setMapSearch] = useState('');
    const [profileImg, setProfileImg] = useState(user?.profileImg || user?.user_metadata?.profile_img || null);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    // Optimized Executive Iconography - People & Vehicles
    const avatars = React.useMemo(() => {
        return [
            // 4 Young Men
            { id: 'ym1', icon: <FaUser size={22} />, label: 'Young Man 1' },
            { id: 'ym2', icon: <MdPerson size={24} />, label: 'Young Man 2' },
            { id: 'ym3', icon: <FaUserGraduate size={22} />, label: 'Young Man 3' },
            { id: 'ym4', icon: <FaUserAstronaut size={22} />, label: 'Young Man 4' },

            // 4 Older Men
            { id: 'om1', icon: <FaUserTie size={22} />, label: 'Older Man 1' },
            { id: 'om2', icon: <FaUserSecret size={22} />, label: 'Older Man 2' },
            { id: 'om3', icon: <FaUserDoctor size={22} />, label: 'Older Man 3' },
            { id: 'om4', icon: <MdBusiness size={24} />, label: 'Older Man 4' },

            // 4 Young Ladies
            { id: 'yl1', icon: <FaPersonDress size={24} />, label: 'Young Lady 1' },
            { id: 'yl2', icon: <MdFace size={24} />, label: 'Young Lady 2' },
            { id: 'yl3', icon: <FaUserPlus size={22} />, label: 'Young Lady 3' },
            { id: 'yl4', icon: <MdEmojiPeople size={24} />, label: 'Young Lady 4' },

            // 4 Older Ladies
            { id: 'ol1', icon: <FaUserLarge size={22} />, label: 'Older Lady 1' },
            { id: 'ol2', icon: <FaUserNinja size={22} />, label: 'Older Lady 2' },
            { id: 'ol3', icon: <FaPersonDress size={24} style={{ opacity: 0.8 }} />, label: 'Older Lady 3' },
            { id: 'ol4', icon: <FaUserGear size={22} />, label: 'Older Lady 4' },

            // 4 Cars
            { id: 'car1', icon: <FaCar size={22} />, label: 'Sport Car' },
            { id: 'car2', icon: <FaCarSide size={22} />, label: 'Sedan' },
            { id: 'car3', icon: <FaCarOn size={22} />, label: 'EV' },
            { id: 'car4', icon: <FaCarRear size={22} />, label: 'Coupe' },

            // 4 Trucks
            { id: 'truck1', icon: <FaTruck size={22} />, label: 'Hauler' },
            { id: 'truck2', icon: <FaTruckFast size={22} />, label: 'Express' },
            { id: 'truck3', icon: <FaTruckMonster size={22} />, label: 'Offroad' },
            { id: 'truck4', icon: <FaVanShuttle size={22} />, label: 'Transporter' },

            // 4 Planes
            { id: 'plane1', icon: <FaPlane size={22} />, label: 'Private Jet' },
            { id: 'plane2', icon: <FaPlaneUp size={22} />, label: 'Takeoff' },
            { id: 'plane3', icon: <FaPlaneDeparture size={22} />, label: 'Departure' },
            { id: 'plane4', icon: <FaPlaneArrival size={22} />, label: 'Arrival' }
        ];
    }, []);

    const handleMapSelect = (address) => {
        setNewAddress(address);
        setShowMapModal(false);
    };

    React.useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                // Check if editing to avoid overwrite
                email: isEditingEmail ? prev.email : (user.email || prev.email),
                phone: user.phone || prev.phone
            }));
            setVehicles(user.savedVehicles || []);
            setAddresses(user.savedAddresses || []);

            // CRITICAL FIX: Prioritize database profile image over metadata (which may truncate large base64 strings)
            const remoteImg = user.profileImg || user.user_metadata?.profile_img;
            if (remoteImg) {
                setProfileImg(remoteImg);
            }
        }
    }, [user, isEditingEmail]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImg(reader.result);
                setShowAvatarSelector(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (!formData.currentPassword) {
            return showToast('Please enter your current password to authorize changes', 'error');
        }

        setLoading(true);
        try {
            // 1. Verify credentials using direct fetch (matching AuthContext pattern for reliability)
            const verifyRes = await fetch('https://khrsyauspfdszripxetm.supabase.co/auth/v1/token?grant_type=password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocnN5YXVzcGZkc3pyaXB4ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODM2MDQsImV4cCI6MjA4NDY1OTYwNH0.nyRZeQF0_ZCqEKgmpa1kglzsnPVSuEJjOZlCf-NXahE'
                },
                body: JSON.stringify({ email: user.email, password: formData.currentPassword })
            });

            if (!verifyRes.ok) {
                const errorData = await verifyRes.json();
                throw new Error(errorData.error_description || 'Invalid current password. Authorization denied.');
            }

            const verifyData = await verifyRes.json();

            // Sync the client with this session to ensure subsequent updates work
            if (verifyData.access_token) {
                await supabase.auth.setSession({
                    access_token: verifyData.access_token,
                    refresh_token: verifyData.refresh_token
                });
            }

            // 2. Prepare Updates
            const updates = {
                data: {
                    display_name: formData.name,
                    phone: formData.phone,
                    profile_img: profileImg
                }
            };
            if (isEditingEmail && formData.email !== user.email) {
                updates.email = formData.email;
            }

            // 3. Update Auth
            const { data: updatedAuth, error: authUpdateError } = await supabase.auth.updateUser(updates);
            if (authUpdateError) throw authUpdateError;

            // 4. Update DB Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    display_name: formData.name,
                    phone: formData.phone,
                    profile_img: profileImg,
                    saved_vehicles: vehicles,
                    saved_addresses: addresses
                })
                .eq('id', user.id);

            if (profileError) console.warn("DB Profile sync warning:", profileError.message);

            // 5. Update Local State (Optional override if metadata returned)
            if (updatedAuth?.user?.user_metadata?.profile_img) {
                setProfileImg(updatedAuth.user.user_metadata.profile_img);
            }

            if (isEditingEmail) {
                showToast('Executive profile and email updated. Verify new email if changed.', 'success');
                setIsEditingEmail(false);
            } else {
                showToast('Executive profile updated and synchronized.', 'success');
            }

            await refreshProfile();
            setFormData(prev => ({ ...prev, currentPassword: '' }));
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return showToast('Passwords do not match', 'error');
        }
        if (!formData.currentPassword) {
            return showToast('Current password is required to update security protocols', 'error');
        }

        setLoading(true);
        try {
            // Re-authenticate using direct fetch
            const verifyRes = await fetch('https://khrsyauspfdszripxetm.supabase.co/auth/v1/token?grant_type=password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtocnN5YXVzcGZkc3pyaXB4ZXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwODM2MDQsImV4cCI6MjA4NDY1OTYwNH0.nyRZeQF0_ZCqEKgmpa1kglzsnPVSuEJjOZlCf-NXahE'
                },
                body: JSON.stringify({ email: user.email, password: formData.currentPassword })
            });

            if (!verifyRes.ok) {
                const errorData = await verifyRes.json();
                throw new Error(errorData.error_description || 'Current password verification failed.');
            }

            const verifyData = await verifyRes.json();
            if (verifyData.access_token) {
                await supabase.auth.setSession({
                    access_token: verifyData.access_token,
                    refresh_token: verifyData.refresh_token
                });
            }

            const { error } = await supabase.auth.updateUser({
                password: formData.newPassword
            });
            if (error) throw error;
            showToast('Authorization vault updated successfully.', 'success');
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
                    <div className="modal active" style={{ zIndex: 10000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            style={{
                                background: '#080808',
                                borderRadius: '35px',
                                padding: isMobile ? '1.5rem' : '3rem',
                                maxWidth: '800px',
                                width: '95%',
                                border: '1px solid rgba(255,255,255,0.05)',
                                boxShadow: '0 0 100px rgba(0,0,0,1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ color: '#fff', fontSize: '1.5rem', margin: 0, fontWeight: '900' }}>Precision <span className="gold">Locator</span></h3>
                                    <p style={{ color: '#555', fontSize: '0.8rem', margin: '0.3rem 0 0 0' }}>Define your primary service location</p>
                                </div>
                                <button onClick={() => setShowMapModal(false)} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a', borderRadius: '12px', width: '40px', height: '40px', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={20} /></button>
                            </div>
                            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Enter your exact area or coordinates..."
                                    value={mapSearch}
                                    onChange={(e) => setMapSearch(e.target.value)}
                                    style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '0.9rem' }}
                                />
                                <FiMapPin style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)' }} />
                            </div>
                            <div style={{ height: isMobile ? '250px' : '400px', borderRadius: '25px', background: '#000', overflow: 'hidden', border: '1px solid #1a1a1a' }}>
                                <iframe src={`https://maps.google.com/maps?q=${encodeURIComponent(mapSearch || 'Addis Ababa')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy"></iframe>
                            </div >
                            <button onClick={() => handleMapSelect(mapSearch)} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', padding: '1.2rem', borderRadius: '15px', fontWeight: '900', letterSpacing: '0.05em' }}>CONFIRM LOCATION</button>
                        </motion.div >
                    </div >
                )}
            </AnimatePresence >

            <header style={{ marginBottom: isMobile ? '1.5rem' : '3rem', textAlign: isMobile ? 'center' : 'left' }}>
                <h1 style={{ color: '#fff', fontSize: isMobile ? '1.8rem' : '2.8rem', margin: 0, fontWeight: '900', letterSpacing: '-0.02em' }}>Identity <span className="gold">& Assets</span></h1>
                <p style={{ color: '#666', marginTop: '0.4rem', fontSize: isMobile ? '0.85rem' : '1rem' }}>Securely manage your executive profile and personal holdings.</p>
            </header>

            <div className="user-profile-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Basic Info */}
                    <motion.div
                        className="admin-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ padding: isMobile ? '1.5rem' : '3rem', borderRadius: '35px', background: '#0a0a0a', border: '1px solid #1a1a1a' }}
                    >
                        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: isMobile ? '1.5rem' : '3rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <div style={{ position: 'relative' }}>
                                <div
                                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                    style={{
                                        width: isMobile ? '100px' : '140px', height: isMobile ? '100px' : '140px', borderRadius: '30px',
                                        background: '#111',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: isMobile ? '2.5rem' : '3.5rem', color: 'var(--color-gold)', fontWeight: '900', textTransform: 'uppercase',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                        overflow: 'hidden',
                                        border: '1px solid rgba(201,169,106,0.15)',
                                        backgroundImage: profileImg && !avatars.find(a => a.id === profileImg) ? `url("${profileImg}")` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        cursor: 'pointer'
                                    }}>
                                    {/* Render the selected icon or fallback */}
                                    {(!profileImg || avatars.find(a => a.id === profileImg)) && (
                                        profileImg ? avatars.find(a => a.id === profileImg)?.icon : (formData.name && !formData.name.includes('@') ? formData.name : user?.email || 'M').charAt(0)
                                    )}
                                </div>

                                {/* Edit/Change Button */}
                                <input type="file" accept="image/*" onChange={handleProfileImageChange} id="profile-upload" hidden />
                                <button
                                    onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                                    style={{
                                        position: 'absolute', bottom: '-8px', right: '-8px',
                                        height: '42px', borderRadius: '14px', padding: '0 1rem',
                                        background: '#c9a96a', border: 'none', color: '#000',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
                                        boxShadow: '0 8px 20px rgba(201,169,106,0.3)', transition: '0.3s',
                                        zIndex: 5, fontWeight: 'bold', fontSize: '0.75rem'
                                    }}
                                >
                                    <FiCamera size={16} /> CHANGE
                                </button>

                                <AnimatePresence>
                                    {showAvatarSelector && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, x: '-50%' }}
                                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                                            exit={{ opacity: 0, y: 10, x: '-50%' }}
                                            style={{
                                                position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '1rem',
                                                background: '#0a0a0a', border: '1px solid #222', borderRadius: '25px',
                                                padding: '1.5rem 1rem 1.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
                                                zIndex: 100, boxShadow: '0 20px 50px rgba(0,0,0,0.8)', width: '300px',
                                                maxHeight: '320px', overflowY: 'auto', overflowX: 'hidden', justifyItems: 'center'
                                            }}
                                        >
                                            <button
                                                onClick={() => document.getElementById('profile-upload').click()}
                                                style={{
                                                    gridColumn: 'span 4', padding: '1rem', marginBottom: '0.5rem',
                                                    background: 'rgba(201,169,106,0.1)', border: '1px dashed var(--color-gold)',
                                                    borderRadius: '15px', color: 'var(--color-gold)', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                                                    fontSize: '0.8rem', fontWeight: 'bold', width: '100%'
                                                }}
                                            >
                                                <FiCamera size={18} /> UPLOAD CUSTOM IMAGE
                                            </button>
                                            {avatars.map(av => (
                                                <button
                                                    key={av.id}
                                                    onClick={() => { setProfileImg(av.id); setShowAvatarSelector(false); }}
                                                    style={{
                                                        padding: '0.8rem', background: profileImg === av.id ? 'var(--color-gold)' : 'rgba(255,255,255,0.03)',
                                                        border: profileImg === av.id ? '1px solid var(--color-gold)' : '1px solid transparent',
                                                        borderRadius: '12px', color: profileImg === av.id ? '#000' : '#888', cursor: 'pointer', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center', transition: '0.2s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = profileImg === av.id ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = profileImg === av.id ? 'var(--color-gold)' : 'rgba(255,255,255,0.03)'}
                                                    title={av.label}
                                                >
                                                    {av.icon}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                                <h2 style={{ color: '#fff', fontSize: isMobile ? '1.6rem' : '2.2rem', margin: '0 0 0.5rem 0', fontWeight: '900' }}>{formData.name && !formData.name.includes('@') ? formData.name : user?.email}</h2>
                                <div style={{ display: 'flex', gap: '0.8rem', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
                                    <span style={{ color: '#000', background: 'var(--color-gold)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', border: '1px solid var(--color-gold)', boxShadow: '0 5px 15px rgba(201,169,106,0.3)' }}>
                                        {user?.subscriptionPlan || 'MBC MEMBER'}
                                    </span>
                                    <span style={{ color: '#aaa', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        #{user?.id?.slice(0, 8).toUpperCase()}
                                    </span>
                                </div>
                                <p style={{ color: '#888', margin: '0.8rem 0 0 0', fontSize: '0.75rem', fontWeight: '600' }}>Credentialed {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}</p>
                            </div>
                        </div>

                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', fontWeight: '900', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '0.95rem' }}
                                        />
                                        <FiUser style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#333' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', fontWeight: '900', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+251 900 000 000"
                                            style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '0.95rem' }}
                                        />
                                        <FiPhone style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#333' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Email Address with Conditional Edit */}
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', fontWeight: '900', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verified Email Address</label>
                                <div style={{ position: 'relative', display: 'flex', gap: '1rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={!isEditingEmail}
                                            style={{
                                                width: '100%',
                                                padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                                                background: isEditingEmail ? 'rgba(255,255,255,0.05)' : '#050505',
                                                border: isEditingEmail ? '1px solid var(--color-gold)' : '1px solid #111',
                                                borderRadius: '15px',
                                                color: isEditingEmail ? '#fff' : '#444',
                                                fontSize: '0.95rem',
                                                cursor: isEditingEmail ? 'text' : 'not-allowed',
                                                transition: '0.3s'
                                            }}
                                        />
                                        <FiMail style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: isEditingEmail ? 'var(--color-gold)' : '#222' }} />
                                    </div>

                                    {/* Show Change Button only if password is entered and not yet editing */}
                                    {formData.currentPassword && !isEditingEmail && (
                                        <motion.button
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            type="button"
                                            onClick={() => setIsEditingEmail(true)}
                                            style={{
                                                padding: '0 1.5rem',
                                                background: 'rgba(201,169,106,0.1)',
                                                border: '1px solid var(--color-gold)',
                                                borderRadius: '15px',
                                                color: 'var(--color-gold)',
                                                fontWeight: '900',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                letterSpacing: '0.05em'
                                            }}
                                        >
                                            CHANGE
                                        </motion.button>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#333', marginTop: '0.6rem', fontWeight: '600' }}>Credential verification is mandatory for all architectural profile modifications.</p>
                            </div>

                            <div style={{ marginBottom: '3rem' }}>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.7rem', fontWeight: '900', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Password (Required)</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        name="currentPassword"
                                        type="password"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Enter current password to authorize updates"
                                        style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '0.95rem' }}
                                    />
                                    <FiLock style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)' }} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '1.2rem', borderRadius: '15px', fontWeight: '900', letterSpacing: '0.05em' }}
                            >
                                <FiSave style={{ marginRight: '10px' }} /> {loading ? 'SYNCING...' : 'AUTHORIZE UPDATES'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Security */}
                    <div className="admin-card" style={{ padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '30px', background: 'linear-gradient(135deg, #0d0d0d 0%, #050505 100%)', border: '1px solid #1a1a1a' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '900' }}>
                            <FiLock color="var(--color-gold)" /> Security Protocol
                        </h3>
                        <form onSubmit={handleChangePassword}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.65rem', fontWeight: '900', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Security Verification (Current Password)</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.65rem', fontWeight: '900', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Authorization Vault (New Password)</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '0.95rem' }}
                                />
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', color: '#444', fontSize: '0.65rem', fontWeight: '900', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Verify Authorization Code</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '15px', color: '#fff', fontSize: '0.95rem' }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !formData.newPassword}
                                className="btn btn-secondary"
                                style={{ width: '100%', padding: '1.1rem', borderRadius: '15px', fontWeight: '900' }}
                            >
                                UPDATE PROTOCOLS
                            </button>
                        </form>
                    </div>

                    {/* Saved Assets */}
                    <div className="admin-card" style={{ padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '30px', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '900' }}>
                            <FiTruck color="var(--color-gold)" /> Personal Fleet
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.8rem', marginBottom: '0.8rem' }}>
                            <input
                                value={newVehicleYear}
                                onChange={(e) => setNewVehicleYear(e.target.value)}
                                placeholder="Year"
                                style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                            />
                            <input
                                value={newVehicleModel}
                                onChange={(e) => setNewVehicleModel(e.target.value)}
                                placeholder="Exact Model (e.g. BMW M4)"
                                style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
                            <button
                                onClick={() => { if (newVehicleModel) { setVehicles([...vehicles, { name: `${newVehicleYear} ${newVehicleModel}`.trim(), year: newVehicleYear, model: newVehicleModel }]); setNewVehicleYear(''); setNewVehicleModel(''); } }}
                                className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '0.8rem', fontWeight: '900', borderRadius: '12px' }}
                            >REGISTER VEHICLE</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', marginBottom: '3rem' }}>
                            {vehicles.map((v, i) => (
                                <div key={i} style={{
                                    padding: '0.8rem 1.2rem',
                                    background: 'rgba(201,169,106,0.03)',
                                    border: '1px solid rgba(201,169,106,0.1)',
                                    borderRadius: '16px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: '#fff', fontWeight: '700' }}>{typeof v === 'string' ? v : v.name}</span>
                                    </div>
                                    <button onClick={() => setVehicles(vehicles.filter((_, idx) => idx !== i))} style={{ background: 'rgba(255,0,0,0.1)', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', display: 'flex' }}><FiX size={14} /></button>
                                </div>
                            ))}
                            {vehicles.length === 0 && <p style={{ color: '#333', fontSize: '0.8rem', margin: 0, fontStyle: 'italic' }}>No vehicles registered in your personal fleet.</p>}
                        </div>

                        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '900' }}>
                            <FiMapPin color="var(--color-gold)" /> Strategic Locations
                        </h3>
                        <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    value={newAddress}
                                    onChange={(e) => setNewAddress(e.target.value)}
                                    placeholder="Executive Address Line"
                                    style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.02)', border: '1px solid #1a1a1a', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                                />
                                <FiMapPin style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#333' }} />
                            </div>
                            <button
                                onClick={() => { setMapSearch(newAddress); setShowMapModal(true); }}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '0 1.2rem', color: 'var(--color-gold)', cursor: 'pointer', transition: '0.3s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,106,0.1)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            ><FiMapPin /></button>
                            <button
                                onClick={() => { if (newAddress) { setAddresses([...addresses, newAddress]); setNewAddress(''); } }}
                                className="btn btn-primary" style={{ padding: '0 1.5rem', fontSize: '0.75rem', fontWeight: '900', borderRadius: '12px' }}
                            >ADD</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {addresses.map((a, i) => (
                                <div key={i} style={{
                                    padding: '1.2rem',
                                    background: 'rgba(255,255,255,0.01)',
                                    border: '1px solid #1a1a1a',
                                    borderRadius: '16px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1.2rem',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FiMapPin size={14} color="#333" />
                                        </div>
                                        <span style={{ color: '#888', fontWeight: '600' }}>{typeof a === 'string' ? a : a.address}</span>
                                    </div>
                                    <button onClick={() => setAddresses(addresses.filter((_, idx) => idx !== i))} style={{ background: 'rgba(255,0,0,0.05)', border: 'none', color: '#ff4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}><FiX size={14} /></button>
                                </div>
                            ))}
                            {addresses.length === 0 && <p style={{ color: '#333', fontSize: '0.8rem', margin: 0, fontStyle: 'italic' }}>No strategic locations established.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div >

    );
};

export default UserProfile;
