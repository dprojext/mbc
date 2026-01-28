import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
    FiCalendar, FiCheckCircle, FiUser, FiUsers, FiTruck,
    FiMapPin, FiClock, FiMessageSquare, FiArrowRight,
    FiChevronDown, FiMap, FiShield, FiZap, FiPhone, FiSearch
} from 'react-icons/fi';

const Booking = () => {
    const { services, plans, addBooking, bookings = [], users = [] } = useData();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();

    const [bookingFor, setBookingFor] = useState('myself');
    const [vehicleChoice, setVehicleChoice] = useState('previous');
    const [modalOpen, setModalOpen] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
    const [timePeriod, setTimePeriod] = useState('AM');
    const [userSearchText, setUserSearchText] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [mapSearchText, setMapSearchText] = useState('');

    // Combine previous booking data with saved profile data
    const userPrevBookings = bookings.filter(b => b.customer_id === user?.id || b.email === user?.email);
    const historyVehicles = [...new Set(userPrevBookings.map(b => b.vehicleType).filter(Boolean))];
    const profileVehicles = (user?.savedVehicles || []).map(v => typeof v === 'string' ? v : v.name);
    const prevVehicles = [...new Set([...profileVehicles, ...historyVehicles])];

    const profileAddresses = (user?.savedAddresses || []).map(a => typeof a === 'string' ? a : a.address);

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        vehicleType: prevVehicles[0] || '',
        service: '',
        date: '',
        time: '',
        location: profileAddresses[0] || '',
        notes: ''
    });

    // Robust pre-selection from search params
    useEffect(() => {
        const serviceParam = searchParams.get('service');
        if (serviceParam && services.length > 0) {
            const match = services.find(s => s.title.toLowerCase() === serviceParam.toLowerCase()) ||
                plans.find(p => p.name.toLowerCase().includes(serviceParam.toLowerCase()));

            if (match) {
                setFormData(prev => ({ ...prev, service: match.title || match.name }));
            }
        }
    }, [searchParams, services, plans]);

    const showContactFields = bookingFor === 'other' || (!user?.name || !user?.phone);

    useEffect(() => {
        if (userSearchText.trim().length > 1) {
            const filtered = users.filter(u =>
                (u.name && u.name.toLowerCase().includes(userSearchText.toLowerCase())) ||
                (u.email && u.email.toLowerCase().includes(userSearchText.toLowerCase()))
            ).slice(0, 5);
            setFilteredUsers(filtered);
        } else {
            setFilteredUsers([]);
        }
    }, [userSearchText, users]);

    const selectUserFromSearch = (u) => {
        setFormData(prev => ({
            ...prev,
            fullName: u.name || '',
            email: u.email || '',
            phone: u.phone || ''
        }));
        setUserSearchText('');
        setFilteredUsers([]);
        setBookingFor('other'); // Switch to 'other' so fields are visible
    };

    useEffect(() => {
        if (bookingFor === 'myself') {
            setFormData(prev => ({
                ...prev,
                fullName: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                vehicleType: vehicleChoice === 'previous' && prevVehicles.length > 0 ? (prevVehicles[0] || '') : ''
            }));
        }
    }, [bookingFor, user, vehicleChoice, prevVehicles.length]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'location') setIsLocationConfirmed(false);
    };

    const handleMapConfirm = (lat, lng, label) => {
        setFormData(prev => ({ ...prev, location: label || `${lat.toFixed(4)}, ${lng.toFixed(4)}` }));
        setIsLocationConfirmed(true);
        setShowMap(false);
    };

    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        addBooking({
            ...formData,
            bookingFor,
            customerId: user?.id,
            timestamp: new Date().toISOString()
        });
        setModalOpen(true);
        setVehicleChoice('previous');
        setBookingFor('myself');
    };

    const closeModal = () => {
        setModalOpen(false);
        navigate('/dashboard/bookings');
    };
    const today = new Date().toISOString().split('T')[0];

    const morningSlots = ['8:00 AM', '9:30 AM', '11:00 AM'];
    const afternoonSlots = ['1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'];

    const benefits = [
        { icon: <FiShield />, title: 'Professional Insurance', desc: 'Full multi-point liability coverage.' },
        { icon: <FiTruck />, title: 'Executive Mobile Service', desc: 'We come to your home or office.' },
        { icon: <FiClock />, title: 'Strict Punctuality', desc: 'On-time arrival, guaranteed.' },
        { icon: <FiCheckCircle />, title: 'Certified Detailing Experts', desc: 'Masters in automotive surface restoration.' },
        { icon: <FiZap />, title: '24/7 Digital Concierge', desc: 'Manage your garage from anywhere, anytime.' }
    ];

    return (
        <section className="booking" id="booking">
            <div className="section-container">
                <div className="booking-grid">
                    <motion.div
                        className="booking-content"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="section-tag" style={{ color: 'var(--color-gold)', letterSpacing: '2px', fontWeight: 'bold' }}>LUXURY CONCIERGE</span>
                        <h2 className="section-title">Schedule Your <span className="gold">Appointment</span></h2>
                        <p className="section-description" style={{ color: '#888', maxWidth: '500px', marginBottom: '3rem' }}>
                            Choose between our tailored packages or executive subscription services.
                            Our team brings the professional garage experience directly to your driveway.
                        </p>

                        <div className="booking-benefits" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {benefits.map((benefit, i) => (
                                <div className="benefit-item" key={i} style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(201,169,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                                        {benefit.icon}
                                    </div>
                                    <div>
                                        <h4 style={{ color: '#fff', margin: 0, fontSize: '0.95rem' }}>{benefit.title}</h4>
                                        <p style={{ color: '#666', fontSize: '0.8rem', margin: '0.2rem 0 0 0' }}>{benefit.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="booking-form-card"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        style={{
                            background: 'rgba(20,20,20,0.8)', padding: '3rem', borderRadius: '24px',
                            border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                            <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Back to Home
                            </Link>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Admin Search for Users */}
                            {user?.role?.toLowerCase() === 'admin' && (
                                <div style={{ marginBottom: '2rem', position: 'relative' }}>
                                    <label style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', marginBottom: '0.8rem', display: 'block' }}>Search Member Account</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                        <input
                                            placeholder="Find user by name or email..."
                                            value={userSearchText}
                                            onChange={e => setUserSearchText(e.target.value)}
                                            style={{ width: '100%', padding: '1rem 1rem 1rem 2.8rem', background: 'rgba(201,169,106,0.05)', border: '1px solid rgba(201,169,106,0.2)', borderRadius: '12px', color: '#fff', outline: 'none' }}
                                        />
                                    </div>
                                    <AnimatePresence>
                                        {filteredUsers.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', marginTop: '0.4rem', zIndex: 100, overflow: 'hidden' }}
                                            >
                                                {filteredUsers.map(u => (
                                                    <div
                                                        key={u.id}
                                                        onClick={() => selectUserFromSearch(u)}
                                                        style={{ padding: '0.8rem 1rem', cursor: 'pointer', borderBottom: '1px solid #222', display: 'flex', flexDirection: 'column' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,106,0.1)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{u.name}</span>
                                                        <span style={{ color: '#666', fontSize: '0.75rem' }}>{u.email}</span>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Selection: Myself vs Other */}
                            <div style={{ marginBottom: '2.5rem' }}>
                                <label style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', display: 'block' }}>Who are you booking for?</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <button type="button" onClick={() => setBookingFor('myself')}
                                        style={{
                                            padding: '1rem', borderRadius: '12px', border: '1px solid',
                                            borderColor: bookingFor === 'myself' ? 'var(--color-gold)' : '#333',
                                            background: bookingFor === 'myself' ? 'rgba(201,169,106,0.1)' : 'transparent',
                                            color: bookingFor === 'myself' ? 'var(--color-gold)' : '#666',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
                                        }}
                                    >
                                        <FiUser /> For Myself
                                    </button>
                                    <button type="button" onClick={() => setBookingFor('other')}
                                        style={{
                                            padding: '1rem', borderRadius: '12px', border: '1px solid',
                                            borderColor: bookingFor === 'other' ? 'var(--color-gold)' : '#333',
                                            background: bookingFor === 'other' ? 'rgba(201,169,106,0.1)' : 'transparent',
                                            color: bookingFor === 'other' ? 'var(--color-gold)' : '#666',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
                                        }}
                                    >
                                        <FiUsers /> For Someone Else
                                    </button>
                                </div>
                            </div>

                            {/* ... existing fields ... */}
                            {showContactFields && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="form-input-group">
                                        <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Recipient Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <input name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Enter name"
                                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }}
                                            />
                                            <FiUser style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                        </div>
                                    </div>
                                    <div className="form-input-group">
                                        <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Phone Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="+251..."
                                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff', outline: 'none' }}
                                            />
                                            <FiPhone style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ color: '#888', fontSize: '0.75rem', display: 'block' }}>Vehicle Information</label>
                                {bookingFor === 'myself' && prevVehicles.length > 0 && (
                                    <button type="button" onClick={() => setVehicleChoice(vehicleChoice === 'previous' ? 'another' : 'previous')}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>
                                        {vehicleChoice === 'previous' ? '+ Add New Vehicle' : 'Select From History'}
                                    </button>
                                )}
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                {bookingFor === 'myself' && vehicleChoice === 'previous' && prevVehicles.length > 0 ? (
                                    <div style={{ position: 'relative' }}>
                                        <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff', appearance: 'none', textAlign: 'left', textAlignLast: 'left' }}
                                        >
                                            <option value="">Choose vehicle...</option>
                                            {prevVehicles.map(v => <option key={v} value={v}>{v}</option>)}
                                        </select>
                                        <FiTruck style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)' }} />
                                        <FiChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <input name="vehicleType" value={formData.vehicleType} onChange={handleChange} required placeholder="e.g. 2024 Mercedes-AMG G63"
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                        />
                                        <FiTruck style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Service Type</label>
                                <div style={{ position: 'relative' }}>
                                    <select name="service" value={formData.service} onChange={handleChange} required
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff', appearance: 'none', textAlign: 'left', textAlignLast: 'left' }}
                                    >
                                        <option value="">Choose a treatment...</option>
                                        {services.map(s => <option key={s.id} value={s.title}>{s.title} ({s.price})</option>)}
                                        {plans.map(p => <option key={p.id} value={p.name}>{p.name} Membership</option>)}
                                    </select>
                                    <FiCheckCircle style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                    <FiChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.8rem', display: 'block' }}>Preferred Date</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="date" name="date" min={today} value={formData.date} onChange={handleChange} required
                                        style={{
                                            width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333',
                                            borderRadius: '10px', color: '#fff'
                                        }}
                                    />
                                    <FiCalendar style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.8rem', display: 'block' }}>Preferred Time</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="time" name="time" value={formData.time} onChange={handleChange} required
                                        style={{
                                            width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333',
                                            borderRadius: '10px', color: '#fff'
                                        }}
                                    />
                                    <FiClock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ color: '#888', fontSize: '0.75rem', display: 'block' }}>Service Location</label>
                                    {bookingFor === 'myself' && profileAddresses.length > 0 && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <select
                                                onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))}
                                                style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '0.7rem', cursor: 'pointer', outline: 'none', textAlign: 'left', textAlignLast: 'left' }}
                                            >
                                                <option value="" style={{ background: '#111' }}>Use Saved Address...</option>
                                                {profileAddresses.map(a => <option key={a} value={a} style={{ background: '#111' }}>{a}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: showMap ? '1rem' : '0' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input name="location" value={formData.location} onChange={handleChange} required placeholder="Search address..."
                                            style={{
                                                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111',
                                                border: isLocationConfirmed ? '1px solid var(--color-gold)' : '1px solid #333',
                                                borderRadius: '10px', color: '#fff', transition: '0.3s'
                                            }}
                                        />
                                        <FiMapPin style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: isLocationConfirmed ? 'var(--color-gold)' : '#555' }} />
                                    </div>
                                    <button type="button" onClick={() => setShowMap(!showMap)}
                                        style={{
                                            padding: '0 1rem', borderRadius: '10px',
                                            background: isLocationConfirmed ? 'var(--color-gold)' : 'rgba(201,169,106,0.1)',
                                            border: '1px solid rgba(201,169,106,0.2)',
                                            color: isLocationConfirmed ? '#000' : 'var(--color-gold)',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: '0.3s'
                                        }}
                                    >
                                        <FiMap /> <span style={{ fontSize: '0.8rem' }}>{showMap ? 'Close Map' : isLocationConfirmed ? 'Location Set' : 'Map Select'}</span>
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showMap && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: '400px' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            style={{
                                                width: '100%', background: '#0a0a0a', border: '1px solid #333',
                                                borderRadius: '12px', overflow: 'hidden', position: 'relative'
                                            }}
                                        >
                                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', right: '1rem', zIndex: 1000 }}>
                                                <div style={{ position: 'relative' }}>
                                                    <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)' }} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search location address..."
                                                        value={mapSearchText}
                                                        onChange={e => setMapSearchText(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                const query = mapSearchText;
                                                                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
                                                                    .then(res => res.json())
                                                                    .then(data => {
                                                                        if (data && data.length > 0) {
                                                                            const { lat, lon, display_name } = data[0];
                                                                            handleMapConfirm(parseFloat(lat), parseFloat(lon), display_name);
                                                                        }
                                                                    });
                                                            }
                                                        }}
                                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-gold)', borderRadius: '12px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                            <div id="map-container" style={{ width: '100%', height: '100%' }}></div>
                                            <MapLogic onLocationSelect={handleMapConfirm} />
                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 1000 }}>
                                                <FiMapPin size={32} color="var(--color-gold)" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                            </div>
                                            <div style={{
                                                position: 'absolute', bottom: '1rem', left: '0', right: '0',
                                                display: 'flex', justifyContent: 'center', zIndex: 1000
                                            }}>
                                                <div style={{
                                                    background: 'rgba(0,0,0,0.8)', padding: '0.5rem 1rem',
                                                    borderRadius: '50px', fontSize: '0.75rem', color: '#fff',
                                                    border: '1px solid var(--color-gold)'
                                                }}>
                                                    Tap map to set executive service location
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Special Requirements</label>
                                <div style={{ position: 'relative' }}>
                                    <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Specific vehicle concerns..." rows="3"
                                        style={{ width: '100%', padding: '0.8rem 1.5rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff', outline: 'none', resize: 'none' }}
                                    />
                                    <FiMessageSquare style={{ position: 'absolute', left: '1rem', top: '1.2rem', color: '#555' }} />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                                <FiCheckCircle size={20} />
                                <span style={{ fontWeight: 'bold' }}>Schedule Executive Service</span>
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Success Modal */}
            <AnimatePresence>
                {modalOpen && (
                    <div className="modal active" onClick={closeModal}>
                        <motion.div
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: '#111', border: '1px solid #222', padding: '3rem', textAlign: 'center' }}
                        >
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(76,175,80,0.1)', color: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <FiCheckCircle size={32} />
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Booking Received!</h3>
                            <p style={{ color: '#888', marginBottom: '2rem' }}>Our concierge team has received your request and will contact you within 60 minutes for confirmation.</p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={closeModal}>
                                <span>Complete</span>
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1) hue-rotate(180deg) brightness(0.7);
                }
                .form-input-group label { transition: 0.3s; }
                .form-input-group:focus-within label { color: var(--color-gold); }
            `}</style>
        </section >
    );
};

const MapLogic = ({ onLocationSelect, lang = 'en' }) => {
    const onLocationSelectRef = React.useRef(onLocationSelect);
    const lastCoordsRef = React.useRef(null);
    const markerRef = React.useRef(null);
    const mapRef = React.useRef(null);

    React.useEffect(() => {
        onLocationSelectRef.current = onLocationSelect;
    });

    const selectLocation = React.useCallback((lat, lng, label) => {
        lastCoordsRef.current = { lat, lng };
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else if (mapRef.current) {
            markerRef.current = window.L.marker([lat, lng]).addTo(mapRef.current);
        }

        if (mapRef.current) mapRef.current.setView([lat, lng], 16);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${lang}`)
            .then(res => res.json())
            .then(data => {
                onLocationSelectRef.current(lat, lng, data.display_name || label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            })
            .catch(() => {
                onLocationSelectRef.current(lat, lng, label || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            });
    }, [lang]);

    React.useEffect(() => {
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        }

        const runMap = () => {
            if (!window.L) return;
            const container = document.getElementById('map-container');
            if (!container) return;
            if (container._leaflet_id) return;

            const map = window.L.map('map-container').setView([9.0192, 38.7525], 13);
            mapRef.current = map;

            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            map.on('click', (e) => {
                selectLocation(e.latlng.lat, e.latlng.lng);
            });

            if (container.querySelector('.leaflet-tile-pane')) {
                container.querySelector('.leaflet-tile-pane').style.filter = 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)';
            }
        };

        if (window.L) {
            runMap();
        } else {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = runMap;
            document.head.appendChild(script);
        }
    }, [lang, selectLocation]);

    return null;
};

export default Booking;
