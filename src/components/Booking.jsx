import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiCheckCircle, FiUser, FiUsers, FiTruck, FiMapPin, FiClock, FiMessageSquare, FiArrowRight, FiChevronDown, FiMap } from 'react-icons/fi';

const Booking = () => {
    const { services, plans, addBooking, bookings = [] } = useData();
    const { user } = useAuth();

    const [bookingFor, setBookingFor] = useState('myself');
    const [vehicleChoice, setVehicleChoice] = useState('previous');
    const [modalOpen, setModalOpen] = useState(false);

    // Find previous vehicles for this user
    const userPrevBookings = bookings.filter(b => b.customer_id === user?.id || b.email === user?.email);
    const prevVehicles = [...new Set(userPrevBookings.map(b => b.vehicleType).filter(Boolean))];

    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        vehicleType: prevVehicles[0] || '',
        service: '',
        date: '',
        time: '',
        location: '',
        notes: ''
    });

    // Determine if we should show contact fields
    const showContactFields = bookingFor === 'other' || (!user?.name || !user?.phone);

    useEffect(() => {
        if (bookingFor === 'myself') {
            setFormData(prev => ({
                ...prev,
                fullName: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                vehicleType: vehicleChoice === 'previous' && prevVehicles.length > 0 ? (prevVehicles[0] || '') : ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                fullName: '',
                email: '',
                phone: '',
                vehicleType: ''
            }));
        }
    }, [bookingFor, user, vehicleChoice, prevVehicles.length]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    const closeModal = () => setModalOpen(false);
    const today = new Date().toISOString().split('T')[0];

    const timeSlots = [];
    for (let hour = 8; hour <= 19; hour++) {
        const h = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        timeSlots.push(`${h}:00 ${ampm}`);
        timeSlots.push(`${h}:30 ${ampm}`);
    }

    const benefits = [
        { icon: <FiTruck />, title: 'Executive Mobile Service', desc: 'We come to your home or office.' },
        { icon: <FiClock />, title: 'Strict Punctuality', desc: 'On-time arrival, guaranteed.' },
        { icon: <FiCheckCircle />, title: 'Ceramic Coating Specialists', desc: 'Certified application experts available.' },
        { icon: <FiTruck />, title: 'Eco-Friendly Tech', desc: 'Waterless systems for sustainable care.' },
        { icon: <FiMapPin />, title: 'Real-time GPS Tracking', desc: 'Monitor our team\'s arrival to your pin.' },
        { icon: <FiUser />, title: 'Professional Insurance', desc: 'Full multi-point liability coverage.' },
        { icon: <FiMessageSquare />, title: 'Key Concierge', desc: 'Secure pickup and drop-off service.' }
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
                            border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                        }}
                    >
                        <form onSubmit={handleSubmit}>
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

                            {/* Show Name/Phone only for Other or if profile is missing details */}
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
                                            <FiCheckCircle style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ color: '#888', fontSize: '0.75rem', display: 'block' }}>Vehicle Information</label>
                                {bookingFor === 'myself' && prevVehicles.length > 0 && (
                                    <button type="button" onClick={() => setVehicleChoice(vehicleChoice === 'previous' ? 'another' : 'previous')}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}>
                                        {vehicleChoice === 'previous' ? '+ Add New Vehicle' : 'Select From History'}
                                    </button>
                                )}
                            </div>

                            {/* Vehicle Input */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                {bookingFor === 'myself' && vehicleChoice === 'previous' && prevVehicles.length > 0 ? (
                                    <div style={{ position: 'relative' }}>
                                        <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} required
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff', appearance: 'none' }}
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

                            {/* Service Type */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Service Type</label>
                                <div style={{ position: 'relative' }}>
                                    <select name="service" value={formData.service} onChange={handleChange} required
                                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff', appearance: 'none' }}
                                    >
                                        <option value="">Choose a treatment...</option>
                                        {services.map(s => <option key={s.id} value={s.title}>{s.title} ({s.price})</option>)}
                                        {plans.map(p => <option key={p.id} value={p.name}>{p.name} Membership</option>)}
                                    </select>
                                    <FiCheckCircle style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                    <FiChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div className="form-input-group">
                                    <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Preferred Date</label>
                                    <div style={{ position: 'relative' }}>
                                        <input type="date" name="date" min={today} value={formData.date} onChange={handleChange} required
                                            style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff', paddingLeft: '2.8rem' }}
                                        />
                                        <FiCalendar style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                    </div>
                                </div>
                                <div className="form-input-group">
                                    <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Preferred Time</label>
                                    <div style={{ position: 'relative' }}>
                                        <select name="time" value={formData.time} onChange={handleChange} required
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff', appearance: 'none' }}
                                        >
                                            <option value="">Select time...</option>
                                            {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                        </select>
                                        <FiClock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                        <FiChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Service Location</label>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <input name="location" value={formData.location} onChange={handleChange} required placeholder="Search address..."
                                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                        />
                                        <FiMapPin style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />
                                    </div>
                                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, location: "Current Location Captured" }))}
                                        style={{
                                            padding: '0 1rem', borderRadius: '10px', background: 'rgba(201,169,106,0.1)', border: '1px solid rgba(201,169,106,0.2)',
                                            color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'
                                        }}
                                    >
                                        <FiMap /> <span style={{ fontSize: '0.8rem' }}>Map Select</span>
                                    </button>
                                </div>
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
            {/* Modal remains same */}

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
        </section>
    );
};

export default Booking;
