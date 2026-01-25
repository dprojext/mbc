import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';

const Booking = () => {
    const { services, plans, addBooking } = useData();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        vehicleType: '',
        service: '',
        date: '',
        time: '',
        location: '',
        notes: ''
    });

    const [modalOpen, setModalOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Save to context
        addBooking(formData);
        setModalOpen(true);
        // Reset form
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            vehicleType: '',
            service: '',
            date: '',
            time: '',
            location: '',
            notes: ''
        });
    };

    const closeModal = () => setModalOpen(false);

    // Get today's date for 'min' attribute
    const today = new Date().toISOString().split('T')[0];

    // Generate specific time slots for selection
    const timeSlots = [];
    for (let hour = 8; hour <= 19; hour++) {
        const h = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        timeSlots.push(`${h}:00 ${ampm}`);
        timeSlots.push(`${h}:30 ${ampm}`);
    }

    return (
        <section className="booking" id="booking">
            <div className="section-container">
                <div className="booking-grid">
                    <motion.div
                        className="booking-content"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="section-tag">Easy Scheduling</span>
                        <h2 className="section-title">Book Your <span className="gold">Detail</span></h2>
                        <p className="section-description">
                            Experience the MBC difference. Schedule your appointment in minutes and let us bring
                            premium car care directly to you.
                        </p>

                        <div className="booking-benefits">
                            <div className="benefit">
                                <div className="benefit-icon">📍</div>
                                <div className="benefit-text">
                                    <strong>Mobile Service</strong>
                                    <span>We come to your location</span>
                                </div>
                            </div>
                            <div className="benefit">
                                <div className="benefit-icon">⏰</div>
                                <div className="benefit-text">
                                    <strong>Flexible Hours</strong>
                                    <span>7 days a week availability</span>
                                </div>
                            </div>
                            <div className="benefit">
                                <div className="benefit-icon">💳</div>
                                <div className="benefit-text">
                                    <strong>Secure Payment</strong>
                                    <span>Pay after service completion</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="booking-form-container"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <form className="booking-form" onSubmit={handleSubmit}>
                            <div className="form-header">
                                <h3>Request Appointment</h3>
                                <p>We'll confirm within 2 hours</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Your full name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="+251 9... or +1 (555)..."
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="vehicleType">Vehicle Information</label>
                                <input
                                    type="text"
                                    id="vehicleType"
                                    name="vehicleType"
                                    placeholder="e.g., 2024 Mercedes-AMG GT"
                                    value={formData.vehicleType}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="service">Select Service</label>
                                <select
                                    id="service"
                                    name="service"
                                    value={formData.service}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Choose a service...</option>
                                    <optgroup label="Luxury Services">
                                        {services.map(s => (
                                            <option key={s.id} value={s.title}>{s.title} ({s.price})</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Subscriptions & Packages">
                                        {plans.map(p => (
                                            <option key={p.id} value={p.name}>
                                                {p.name} - {p.currency === 'USD' ? '$' : 'Br'}{p.price}/{p.type === 'subscription' ? 'mo' : 'once'}
                                            </option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="date">Preferred Date</label>
                                    <input
                                        type="date"
                                        id="date"
                                        name="date"
                                        min={today}
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="time">Preferred Time</label>
                                    <select
                                        id="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select exact time...</option>
                                        {timeSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Service Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    placeholder="Address or Landmark (e.g. Bole Medhanialem)"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Additional Notes (Optional)</label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    placeholder="Any special requests or vehicle concerns..."
                                    rows="3"
                                    value={formData.notes}
                                    onChange={handleChange}
                                ></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary form-submit">
                                <span>Request Appointment</span>
                                <div className="btn-shine"></div>
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
                        >
                            <div className="modal-icon">✓</div>
                            <h3>Appointment Requested!</h3>
                            <p>Thank you for choosing Metro BLACKLINE CARE. Our team will review your requested time and contact you shortly to confirm.</p>
                            <button className="btn btn-primary modal-close" onClick={closeModal}>
                                <span>Close</span>
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Booking;
