import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FiCalendar, FiClock, FiMapPin, FiTruck, FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserBookings = () => {
    const { user } = useAuth();
    const { bookings = [] } = useData();

    const myBookings = bookings
        .filter(b => b.customer_id === user?.id || b.email === user?.email)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return '#4caf50';
            case 'Pending': return '#ff9800';
            case 'Completed': return '#2196f3';
            case 'Cancelled': return '#f44336';
            default: return 'var(--color-gold)';
        }
    };

    return (
        <div className="user-bookings">
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Booking <span className="gold">History</span></h1>
                    <p style={{ color: '#888', marginTop: '0.4rem' }}>View and manage your service appointments.</p>
                </div>
                <Link to="/booking" className="btn btn-primary">
                    <FiCalendar style={{ marginRight: '8px' }} /> Schedule New Wash
                </Link>
            </header>

            {myBookings.length > 0 ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {myBookings.map((booking, idx) => (
                        <motion.div
                            key={booking.id}
                            className="admin-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{ padding: '1.5rem' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '15px',
                                        background: 'rgba(255,255,255,0.03)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', fontSize: '1.8rem'
                                    }}>
                                        <FiTruck />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.3rem' }}>
                                            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>{booking.service}</h3>
                                            <span style={{
                                                padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold',
                                                background: `${getStatusColor(booking.status)}15`,
                                                color: getStatusColor(booking.status),
                                                textTransform: 'uppercase', letterSpacing: '0.05em'
                                            }}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem' }}>
                                                <FiCalendar size={14} /> {booking.date}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem' }}>
                                                <FiClock size={14} /> {booking.time}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem' }}>
                                                <FiMapPin size={14} /> {booking.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        {booking.price ? `$${booking.price}` : 'TBD'}
                                    </div>
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed #333' }}>
                    <FiInfo size={48} style={{ color: '#333', marginBottom: '1.5rem' }} />
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No bookings found</h3>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>Ready to experience the best car care in the city?</p>
                    <Link to="/booking" className="btn btn-primary">Book Your First Service</Link>
                </div>
            )}
        </div>
    );
};

export default UserBookings;
