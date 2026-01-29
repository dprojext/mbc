import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { FiCalendar, FiClock, FiMapPin, FiTruck, FiCheckCircle, FiXCircle, FiInfo, FiX, FiSearch, FiFilter, FiChevronDown, FiArrowUp, FiArrowDown, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserBookings = () => {
    const { user } = useAuth();
    const { bookings = [], services = [] } = useData();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('All');
    const [sortBy, setSortBy] = React.useState('recently'); // 'recently', 'newest', 'oldest', 'price-high', 'price-low'
    const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getPrice = (booking) => {
        const p = booking.price;
        const isValidPrice = p !== null && p !== undefined && String(p) !== 'null' && String(p) !== 'undefined' && String(p) !== '';

        if (isValidPrice) {
            return String(p).includes('$') ? p : `$${p}`;
        }
        // Fallback to service price
        const svc = services.find(s => s.title === booking.service);
        if (svc) {
            const sp = svc.price;
            return String(sp).includes('$') ? sp : `$${sp}`;
        }
        return '---';
    };

    const getNumericPrice = (p) => {
        const val = getPrice({ price: p });
        if (val === '---') return 0;
        const matches = val.match(/\d+/);
        return matches ? Number(matches[0]) : 0;
    };

    const filteredBookings = React.useMemo(() => {
        let result = bookings.filter(b => b.customer_id === user?.id || b.email === user?.email);

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(b =>
                b.service.toLowerCase().includes(lower) ||
                b.location.toLowerCase().includes(lower) ||
                (b.vehicleType && b.vehicleType.toLowerCase().includes(lower))
            );
        }

        // Status Filter
        if (statusFilter !== 'All') {
            result = result.filter(b => b.status === statusFilter);
        }

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'recently') return new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0);
            if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
            if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
            if (sortBy === 'price-high') return getNumericPrice(b.price) - getNumericPrice(a.price);
            if (sortBy === 'price-low') return getNumericPrice(a.price) - getNumericPrice(b.price);
            return 0;
        });

        return result;
    }, [bookings, user, searchTerm, statusFilter, sortBy, services]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return '#4caf50';
            case 'Approved': return '#4caf50';
            case 'Pending': return '#ff9800';
            case 'Completed': return '#2196f3';
            case 'Cancelled': return '#f44336';
            case 'Rejected': return '#f44336';
            default: return 'var(--color-gold)';
        }
    };

    const [selectedBooking, setSelectedBooking] = React.useState(null);

    return (
        <div className="user-bookings">
            <header className="admin-flex-between stack-on-mobile" style={{ marginBottom: '2.5rem', gap: '1.5rem' }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: isMobile ? '1.8rem' : '2.5rem', margin: 0 }}>Booking <span className="gold">History</span></h1>
                    <p style={{ color: '#888', marginTop: '0.4rem', fontSize: '0.9rem' }}>View and manage your service appointments.</p>
                </div>
                <Link to="/booking" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
                    <FiCalendar style={{ marginRight: '8px' }} /> Schedule New Wash
                </Link>
            </header>

            {/* Filters Bar */}
            <div className="admin-card" style={{ padding: '1.2rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                        <input
                            placeholder="Search by service, vehicle, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', color: '#fff', appearance: 'none' }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <FiChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', color: '#fff', appearance: 'none' }}
                        >
                            <option value="recently">Recently Booked</option>
                            <option value="newest">Newest First (Date)</option>
                            <option value="oldest">Oldest First (Date)</option>
                            <option value="price-high">Highest Price</option>
                            <option value="price-low">Lowest Price</option>
                        </select>
                        <FiChevronDown style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
                    </div>
                </div>
            </div>

            {filteredBookings.length > 0 ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {filteredBookings.map((booking, idx) => (
                        <motion.div
                            key={booking.id}
                            className="admin-card"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{ padding: '1.5rem' }}
                        >
                            <div className="admin-flex-between stack-on-mobile" style={{ alignItems: 'flex-start' }}>
                                <div className="stack-on-mobile" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '60px', height: '60px', borderRadius: '15px',
                                        background: 'rgba(255,255,255,0.03)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', fontSize: '1.8rem',
                                        flexShrink: 0
                                    }}>
                                        <FiTruck />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.0rem', marginBottom: '0.5rem' }}>
                                            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>{booking.service}</h3>
                                            <span style={{
                                                padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800',
                                                background: booking.status === 'Confirmed' || booking.status === 'Approved' ? 'rgba(76,175,80,0.1)' :
                                                    booking.status === 'Rejected' ? 'rgba(244,67,54,0.1)' :
                                                        'rgba(255,152,0,0.1)',
                                                color: booking.status === 'Confirmed' || booking.status === 'Approved' ? '#4caf50' :
                                                    booking.status === 'Rejected' ? '#f44336' :
                                                        '#ff9800',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                <FiCalendar size={14} color="var(--color-gold)" /> {booking.date}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                <FiClock size={14} color="var(--color-gold)" /> {booking.time}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem' }}>
                                                <FiMapPin size={14} color="var(--color-gold)" /> {booking.location.length > 20 ? booking.location.substring(0, 20) + '...' : booking.location}
                                            </div>
                                        </div>
                                        {booking.rejection_reason && (
                                            <div style={{ marginTop: '0.8rem', padding: '0.6rem 1rem', background: 'rgba(244,67,54,0.05)', borderRadius: '8px', border: '1px solid rgba(244,67,54,0.1)', color: '#ffcdd2', fontSize: '0.75rem' }}>
                                                <strong>Feedback:</strong> {booking.rejection_reason.substring(0, 60)}{booking.rejection_reason.length > 60 ? '...' : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="stack-on-mobile" style={{
                                    textAlign: 'right',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    gap: '1rem'
                                }}>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                        {getPrice(booking)}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                                        {(booking.status === 'Approved' || booking.status === 'Confirmed') && (
                                            <Link
                                                to="/dashboard/payments"
                                                className="btn btn-primary"
                                                style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}
                                            >
                                                PAY NOW
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => setSelectedBooking(booking)}
                                            className="btn btn-secondary"
                                            style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}
                                        >
                                            View Details
                                        </button>
                                    </div>
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

            <AnimatePresence>
                {selectedBooking && (
                    <div className="modal active" onClick={() => setSelectedBooking(null)}>
                        <motion.div
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                maxWidth: '600px',
                                width: '95%',
                                maxHeight: '85vh',
                                overflowY: 'auto',
                                padding: '0',
                                borderRadius: '24px',
                                background: '#0d0d0d',
                                border: '1px solid #222',
                                position: 'relative'
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{ padding: '2rem', borderBottom: '1px solid #1a1a1a', position: 'sticky', top: 0, background: '#0d0d0d', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Appointment Detail</div>
                                    <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: 0 }}>{selectedBooking.service}</h2>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div style={{ padding: '2rem' }}>
                                {/* Status Banner */}
                                <div style={{
                                    padding: '1.5rem',
                                    borderRadius: '16px',
                                    background: selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Approved' ? 'rgba(76,175,80,0.05)' :
                                        selectedBooking.status === 'Rejected' ? 'rgba(244,67,54,0.05)' :
                                            'rgba(255,152,0,0.05)',
                                    border: '1px solid ' + (selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Approved' ? 'rgba(76,175,80,0.1)' :
                                        selectedBooking.status === 'Rejected' ? 'rgba(244,67,54,0.1)' :
                                            'rgba(255,152,0,0.1)'),
                                    marginBottom: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div>
                                        <div style={{
                                            color: selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Approved' ? '#4caf50' :
                                                selectedBooking.status === 'Rejected' ? '#f44336' :
                                                    '#ff9800', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase'
                                        }}>Current Status</div>
                                        <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700', marginTop: '0.2rem' }}>{selectedBooking.status}</div>
                                    </div>
                                    <div style={{
                                        fontSize: '2rem', opacity: 0.3, color: selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Approved' ? '#4caf50' :
                                            selectedBooking.status === 'Rejected' ? '#f44336' :
                                                '#ff9800'
                                    }}>
                                        {selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Approved' ? <FiCheckCircle /> :
                                            selectedBooking.status === 'Rejected' ? <FiX /> :
                                                <FiClock />}
                                    </div>
                                </div>

                                {selectedBooking.rejection_reason && (
                                    <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(244,67,54,0.05)', borderRadius: '16px', border: '1px solid rgba(244,67,54,0.1)' }}>
                                        <div style={{ color: '#ff4444', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Reason for Rejection</div>
                                        <p style={{ color: '#ffcdd2', fontSize: '0.95rem', margin: 0, lineHeight: '1.6' }}>{selectedBooking.rejection_reason}</p>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Scheduled Date</div>
                                        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><FiCalendar className="gold" /> {selectedBooking.date}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Arrival Window</div>
                                        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><FiClock className="gold" /> {selectedBooking.time}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>Executive Service Location</div>
                                    <div style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(201,169,106,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)', flexShrink: 0 }}>
                                            <FiMapPin />
                                        </div>
                                        <span style={{ color: '#fff', fontSize: '0.95rem', lineHeight: '1.5' }}>{selectedBooking.location}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Vehicle Profile</div>
                                        <div style={{ color: '#fff', fontSize: '1rem', fontWeight: '600' }}>{selectedBooking.vehicleType}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        <div style={{ color: '#666', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Investment</div>
                                        <div style={{ color: 'var(--color-gold)', fontSize: '1.2rem', fontWeight: '800' }}>
                                            {getPrice(selectedBooking)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '2rem', borderTop: '1px solid #1a1a1a', display: 'flex', justifyContent: 'center' }}>
                                <button className="btn btn-secondary" style={{ width: '100%', padding: '1rem' }} onClick={() => setSelectedBooking(null)}>Close Detail View</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserBookings;
