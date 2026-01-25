import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import {
    FiChevronLeft, FiChevronRight, FiSearch, FiMapPin,
    FiCalendar, FiX, FiCopy, FiPhone, FiMessageCircle,
    FiMail, FiArrowRight, FiRotateCcw, FiTrash2, FiCheckCircle
} from 'react-icons/fi';

const AdminCalendar = () => {
    const { bookings = [], updateBooking, deleteBooking, addBooking, services = [], users = [], addUser } = useData();
    const [viewingBooking, setViewingBooking] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('Calendar'); // 'Calendar' or 'List'
    const [filterStatus, setFilterStatus] = useState('Active'); // 'Active', 'Pending', 'Approved', 'Archive', 'All'
    const [searchQuery, setSearchQuery] = useState('');

    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [customerSearch, setCustomerSearch] = useState('');

    const [newBooking, setNewBooking] = useState({
        fullName: '',
        email: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        service: '',
        vehicleType: 'Sedan',
        location: '',
        price: '',
        customerId: null
    });

    const handleSelectUser = (user) => {
        setNewBooking({
            ...newBooking,
            fullName: user.name || user.display_name,
            email: user.email,
            phone: user.phone || '',
            customerId: user.id
        });
        setIsExistingUser(true);
        setCustomerSearch('');
    };

    const handleAddBooking = async (e) => {
        e.preventDefault();

        let customerId = newBooking.customerId;

        // If it's a new user, add them to profiles first
        if (!isExistingUser || !customerId) {
            const tempId = `USR-${Date.now()}`; // For local state until DB returns real ID if possible
            const userToAdd = {
                id: tempId,
                name: newBooking.fullName,
                email: newBooking.email,
                phone: newBooking.phone,
                role: 'user',
                joined: new Date().toISOString().split('T')[0]
            };
            await addUser(userToAdd);
            // Note: DataContext addUser currently doesn't return the ID, but it updates state.
            // Ideally we'd get the UUID back if it were a real DB operation.
        }

        addBooking(newBooking);
        setIsAddModalOpen(false);
        resetForm();
    };

    const resetForm = () => {
        setNewBooking({
            fullName: '',
            email: '',
            phone: '',
            date: new Date().toISOString().split('T')[0],
            time: '10:00 AM',
            service: '',
            vehicleType: 'Sedan',
            location: '',
            price: '',
            customerId: null
        });
        setIsExistingUser(false);
    };

    const handleApprove = (booking) => {
        updateBooking({ ...booking, status: 'Approved' });
        setViewingBooking(null);
    };

    const handleComplete = (booking) => {
        updateBooking({ ...booking, status: 'Completed' });
        setViewingBooking(null);
    };

    const handleReject = (booking) => {
        updateBooking({ ...booking, status: 'Rejected' });
        setViewingBooking(null);
    };

    const handleUndo = (booking) => {
        // Revert to Pending for safety, allowing user to re-approve if needed
        updateBooking({ ...booking, status: 'Pending' });
        setViewingBooking(null);
    };

    // Calendar logic
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDayOfMonth = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Filtering logic for the List View
    const filteredBookings = bookings.filter(b => {
        const matchesSearch = b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.id.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterStatus === 'Active') {
            return matchesSearch && (b.status === 'Pending' || b.status === 'Approved');
        } else if (filterStatus === 'Archive') {
            return matchesSearch && (b.status === 'Completed' || b.status === 'Rejected');
        } else if (filterStatus === 'All') {
            return matchesSearch;
        }
        return matchesSearch && b.status === filterStatus;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));

    const getBookingsForDate = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // USER REQUEST: Don't show if rejected or completed in calendar view
        return bookings.filter(b => b.date === dateStr && (b.status === 'Pending' || b.status === 'Approved'));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'var(--color-gold)';
            case 'Approved': return '#4caf50';
            case 'Completed': return '#2196f3';
            case 'Rejected': return '#ff4444';
            default: return '#888';
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: '600' }}>Schedule Manager</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', margin: 0, color: '#fff' }}>Booking Calendar</h1>
                    <p style={{ color: '#666', marginTop: '0.5rem' }}>Visual calendar for active schedules and archival manager.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            padding: '0.8rem 1.5rem', borderRadius: '12px', border: '1px solid var(--color-gold)',
                            background: 'rgba(var(--color-gold-rgb), 0.1)',
                            color: 'var(--color-gold)',
                            fontSize: '0.9rem', fontWeight: '700', cursor: 'pointer', transition: '0.3s',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-gold)'; e.currentTarget.style.color = '#000'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(var(--color-gold-rgb), 0.1)'; e.currentTarget.style.color = 'var(--color-gold)'; }}
                    >
                        <FiCalendar /> Add Manual Booking
                    </button>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                            onClick={() => setViewMode('Calendar')}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
                                background: viewMode === 'Calendar' ? 'var(--color-gold)' : 'transparent',
                                color: viewMode === 'Calendar' ? '#000' : '#888',
                                fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: '0.2s'
                            }}
                        >Calendar</button>
                        <button
                            onClick={() => setViewMode('List')}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
                                background: viewMode === 'List' ? 'var(--color-gold)' : 'transparent',
                                color: viewMode === 'List' ? '#000' : '#888',
                                fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', transition: '0.2s'
                            }}
                        >List</button>
                    </div>
                </div>
            </div>

            {viewMode === 'Calendar' ? (
                <div style={{ background: '#0d0d0d', borderRadius: '24px', border: '1px solid #222', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ color: '#fff', fontSize: '1.5rem', margin: 0 }}>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={prevMonth} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem' }}><FiChevronLeft /></button>
                            <button onClick={nextMonth} style={{ background: '#1a1a1a', border: '1px solid #333', color: '#fff', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem' }}><FiChevronRight /></button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#222', borderRadius: '12px', overflow: 'hidden' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ background: '#151515', color: '#555', padding: '1rem', textAlign: 'center', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>{day}</div>
                        ))}
                        {[...Array(firstDayOfMonth)].map((_, i) => (
                            <div key={`empty-${i}`} style={{ background: '#0a0a0a', minHeight: '120px' }}></div>
                        ))}
                        {[...Array(daysInMonth)].map((_, i) => {
                            const day = i + 1;
                            const dayBookings = getBookingsForDate(day);
                            return (
                                <div key={day} style={{ background: '#0d0d0d', minHeight: '120px', padding: '0.8rem', border: '1px solid #151515', position: 'relative' }}>
                                    <span style={{ color: dayBookings.length > 0 ? '#fff' : '#333', fontSize: '1.1rem', fontWeight: '600' }}>{day}</span>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {dayBookings.map(b => (
                                            <div
                                                key={b.id}
                                                onClick={() => setViewingBooking(b)}
                                                style={{
                                                    background: getStatusColor(b.status),
                                                    color: '#000',
                                                    fontSize: '0.7rem',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontWeight: '700',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                {b.time.split(' ')[0]} - {b.fullName.split(' ')[0]}
                                            </div>
                                        ))}
                                    </div>
                                    {dayBookings.length > 0 && (
                                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-gold)' }}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', padding: '1rem', background: '#0a0a0a', borderRadius: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--color-gold)' }}></div> Pending
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#4caf50' }}></div> Approved
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#444', marginLeft: 'auto' }}>Note: Calendar view only shows Active schedules. Past & Rejected items are in the Archive.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.4rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {['Active', 'Pending', 'Approved', 'Archive', 'All'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                                        background: filterStatus === status ? 'var(--color-gold)' : 'transparent',
                                        color: filterStatus === status ? '#000' : '#888',
                                        fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: '0.2s'
                                    }}
                                >{status}</button>
                            ))}
                        </div>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <input
                                type="text"
                                placeholder="Search by name, service, or ID..."
                                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, color: 'var(--color-gold)', display: 'flex', alignItems: 'center' }}>
                                <FiSearch />
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                        {filteredBookings.map(booking => (
                            <div
                                key={booking.id}
                                onClick={() => setViewingBooking(booking)}
                                style={{
                                    background: 'rgba(20,20,20,0.8)',
                                    padding: '1.5rem',
                                    borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    transition: '0.3s',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    opacity: (booking.status === 'Completed' || booking.status === 'Rejected') ? 0.7 : 1
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.borderColor = 'rgba(var(--color-gold-rgb), 0.3)';
                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: '700', marginBottom: '0.3rem' }}>{booking.date} @ {booking.time}</div>
                                        <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>{booking.fullName}</h3>
                                    </div>
                                    <span style={{
                                        padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase',
                                        background: booking.status === 'Approved' ? 'rgba(76, 175, 80, 0.1)' :
                                            booking.status === 'Pending' ? 'rgba(var(--color-gold-rgb), 0.1)' :
                                                booking.status === 'Completed' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(255, 68, 68, 0.1)',
                                        color: booking.status === 'Approved' ? '#4caf50' :
                                            booking.status === 'Pending' ? 'var(--color-gold)' :
                                                booking.status === 'Completed' ? '#2196f3' : '#ff4444'
                                    }}>{booking.status}</span>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1.2rem' }}>
                                    <div style={{ color: '#888', fontSize: '0.75rem', marginBottom: '0.3rem' }}>Service & Vehicle</div>
                                    <div style={{ color: '#eee', fontSize: '0.9rem', fontWeight: '500' }}>{booking.service}</div>
                                    <div style={{ color: '#666', fontSize: '0.8rem' }}>{booking.vehicleType}</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.85rem' }}>
                                    <FiMapPin style={{ color: 'var(--color-gold)', opacity: 0.7 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.location}</span>
                                </div>

                                <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', color: 'var(--color-gold)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    View Details <FiArrowRight />
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredBookings.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '5rem', color: '#444' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.2 }}>
                                <FiCalendar style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ color: '#666' }}>No bookings found matching filters</h3>
                        </div>
                    )}
                </>
            )}

            {/* Booking Detail Modal (Shared) */}
            {viewingBooking && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        background: '#151515', padding: '2.5rem', borderRadius: '24px',
                        border: '1px solid #333', width: '95%', maxWidth: '550px',
                        position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
                    }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewingBooking(null)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#555', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#555'}><FiX /></button>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ color: 'var(--color-gold)', fontWeight: '600', marginBottom: '0.5rem' }}>Appointment Detail</div>
                            <h2 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>{viewingBooking.fullName}</h2>
                            <p style={{ color: '#888', margin: '0.5rem 0 0 0' }}>Booking ID: <span style={{ fontFamily: 'monospace', color: 'var(--color-gold)' }}>{viewingBooking.id}</span></p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ background: '#0a0a0a', padding: '1.2rem', borderRadius: '12px', border: '1px solid #222' }}>
                                <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Date</div>
                                <div style={{ color: '#fff', fontWeight: '600' }}>{viewingBooking.date}</div>
                            </div>
                            <div style={{ background: '#0a0a0a', padding: '1.2rem', borderRadius: '12px', border: '1px solid #222' }}>
                                <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Time</div>
                                <div style={{ color: '#fff', fontWeight: '600' }}>{viewingBooking.time}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ borderBottom: '1px solid #222', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                                <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Vehicle & Service</div>
                                <div style={{ color: '#fff' }}>{viewingBooking.vehicleType}</div>
                                <div style={{ color: 'var(--color-gold)', fontSize: '0.9rem' }}>{viewingBooking.service}</div>
                            </div>
                            <div style={{ borderBottom: '1px solid #222', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                                <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Location</div>
                                <div style={{ color: '#fff' }}>{viewingBooking.location}</div>
                            </div>
                        </div>

                        <div style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '16px', border: '1px solid #222', marginBottom: '2rem' }}>
                            <div style={{ color: '#444', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Contact Customer</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', fontFamily: 'monospace' }}>{viewingBooking.phone}</div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(viewingBooking.phone);
                                    }}
                                    title="Copy Phone Number"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid #222', borderRadius: '8px',
                                        padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#666',
                                        transition: '0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--color-gold)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#666'; }}
                                >
                                    <FiCopy />
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <a href={`tel:${viewingBooking.phone}`} style={{ flex: 1, textDecoration: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', border: '1px solid #333', transition: '0.2s' }}>
                                    <FiPhone />
                                    Call
                                </a>
                                <a href={`https://wa.me/${viewingBooking.phone}`} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none', background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', padding: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', border: '1px solid rgba(37, 211, 102, 0.3)', transition: '0.2s' }}>
                                    <FiMessageCircle />
                                    WhatsApp
                                </a>
                                <a href={`mailto:${viewingBooking.email}`} style={{ flex: 1, textDecoration: 'none', background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', border: '1px solid #333', transition: '0.2s' }}>
                                    <FiMail />
                                    Email
                                </a>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {viewingBooking.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => handleApprove(viewingBooking)}
                                        style={{ flex: 2, padding: '1rem', background: 'var(--color-gold)', border: 'none', color: '#000', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    ><FiCheckCircle /> Approve Booking</button>
                                    <button
                                        onClick={() => handleReject(viewingBooking)}
                                        style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    ><FiX /> Reject</button>
                                </>
                            )}
                            {viewingBooking.status === 'Approved' && (
                                <>
                                    <button
                                        onClick={() => handleComplete(viewingBooking)}
                                        style={{ flex: 2, padding: '1rem', background: '#4caf50', border: 'none', color: '#fff', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    ><FiCheckCircle /> Mark as Completed</button>
                                    <button
                                        onClick={() => handleReject(viewingBooking)}
                                        style={{ flex: 1, padding: '1rem', background: 'transparent', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    ><FiX /> Reject</button>
                                </>
                            )}
                            {(viewingBooking.status === 'Completed' || viewingBooking.status === 'Rejected') && (
                                <>
                                    <button
                                        onClick={() => handleUndo(viewingBooking)}
                                        style={{ flex: 2, padding: '1rem', background: 'var(--color-gold)', border: 'none', color: '#000', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    ><FiRotateCcw /> Undo to Pending</button>
                                    <button
                                        onClick={() => { deleteBooking(viewingBooking.id); setViewingBooking(null); }}
                                        style={{ flex: 1, padding: '1rem', background: 'rgba(255, 68, 68, 0.1)', border: '1px solid #ff4444', color: '#ff4444', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                    ><FiTrash2 /> Delete</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {isAddModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1100, backdropFilter: 'blur(10px)'
                }}>
                    <div style={{
                        background: '#151515', padding: '2.5rem', borderRadius: '24px',
                        border: '1px solid #333', width: '95%', maxWidth: '600px',
                        position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
                        maxHeight: '90vh', overflowY: 'auto'
                    }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsAddModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#555', fontSize: '1.5rem', cursor: 'pointer' }}><FiX /></button>

                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: 0 }}>Add Manual Booking</h2>
                            <p style={{ color: '#666', marginTop: '0.5rem' }}>Manually register a customer booking into the system.</p>
                        </div>

                        <div style={{ background: '#0a0a0a', padding: '1.5rem', borderRadius: '16px', border: '1px solid #222', marginBottom: '2rem' }}>
                            <label style={{ display: 'block', color: 'var(--color-gold)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: '700' }}>Customer Selection</label>

                            <div style={{ position: 'relative', marginBottom: isExistingUser ? '0' : '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search existing customer by name or email..."
                                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: '#111', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                    value={customerSearch}
                                    onChange={e => {
                                        setCustomerSearch(e.target.value);
                                        setIsExistingUser(false);
                                    }}
                                />
                                <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#555' }} />

                                {customerSearch && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '1px solid #333', borderRadius: '0 0 10px 10px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                        {users.filter(u => (u.name || u.display_name || '').toLowerCase().includes(customerSearch.toLowerCase()) || u.email.toLowerCase().includes(customerSearch.toLowerCase())).map(user => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleSelectUser(user)}
                                                style={{ padding: '0.8rem 1rem', cursor: 'pointer', borderBottom: '1px solid #222', display: 'flex', flexDirection: 'column' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <span style={{ color: '#fff', fontWeight: '600' }}>{user.name || user.display_name}</span>
                                                <span style={{ color: '#666', fontSize: '0.8rem' }}>{user.email}</span>
                                            </div>
                                        ))}
                                        {users.filter(u => (u.name || u.display_name || '').toLowerCase().includes(customerSearch.toLowerCase()) || u.email.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                                            <div style={{ padding: '1rem', color: '#555', fontSize: '0.85rem' }}>No customers found. Fill details below to add as new.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isExistingUser && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(var(--color-gold-rgb), 0.1)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(var(--color-gold-rgb), 0.2)', marginTop: '0.5rem' }}>
                                    <div>
                                        <div style={{ color: 'var(--color-gold)', fontWeight: '700', fontSize: '0.9rem' }}>{newBooking.fullName}</div>
                                        <div style={{ color: '#888', fontSize: '0.8rem' }}>{newBooking.email}</div>
                                    </div>
                                    <button onClick={() => { setIsExistingUser(false); resetForm(); }} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.8rem' }}>Change</button>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAddBooking} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            {!isExistingUser && (
                                <>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Customer Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. John Doe"
                                            style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                            value={newBooking.fullName}
                                            onChange={e => setNewBooking({ ...newBooking, fullName: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="john@example.com"
                                            style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                            value={newBooking.email}
                                            onChange={e => setNewBooking({ ...newBooking, email: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Phone Number</label>
                                        <input
                                            required
                                            type="tel"
                                            placeholder="+1 234 567 890"
                                            style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                            value={newBooking.phone}
                                            onChange={e => setNewBooking({ ...newBooking, phone: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Service</label>
                                <select
                                    required
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                    value={newBooking.service}
                                    onChange={e => {
                                        const s = services.find(sv => sv.title === e.target.value);
                                        setNewBooking({ ...newBooking, service: e.target.value, price: s ? s.price : '' });
                                    }}
                                >
                                    <option value="">Select Service</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.title}>{s.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Vehicle Type</label>
                                <select
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                    value={newBooking.vehicleType}
                                    onChange={e => setNewBooking({ ...newBooking, vehicleType: e.target.value })}
                                >
                                    <option value="Sedan">Sedan</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Truck">Truck</option>
                                    <option value="Luxury">Luxury</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Date</label>
                                <input
                                    required
                                    type="date"
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                    value={newBooking.date}
                                    onChange={e => setNewBooking({ ...newBooking, date: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Time</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 10:00 AM"
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                    value={newBooking.time}
                                    onChange={e => setNewBooking({ ...newBooking, time: e.target.value })}
                                />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <label style={{ display: 'block', color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', margin: 0 }}>Service Location</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsMapPickerOpen(!isMapPickerOpen)}
                                        style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '0.7rem', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}
                                    >
                                        <FiMapPin /> {isMapPickerOpen ? 'Close Map Picker' : 'Select on Map'}
                                    </button>
                                </div>

                                {isMapPickerOpen && (
                                    <div style={{ marginBottom: '1rem', animation: 'fadeIn 0.3s ease' }}>
                                        <div style={{ background: '#111', padding: '10px', borderRadius: '12px 12px 0 0', border: '1px solid #333', borderBottom: 'none', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <input
                                                    id="map-search-input"
                                                    type="text"
                                                    placeholder="Search location (e.g. Bole, Addis Ababa)..."
                                                    style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', background: '#000', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            const query = e.target.value;
                                                            if (query) window.dispatchEvent(new CustomEvent('map-search', { detail: query }));
                                                        }
                                                    }}
                                                />
                                                <FiSearch style={{ position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#555', fontSize: '0.9rem' }} />
                                            </div>
                                        </div>
                                        <div
                                            id="map-container"
                                            style={{ height: '300px', width: '100%', borderRadius: '0 0 12px 12px', background: '#000', border: '1px solid #333', overflow: 'hidden' }}
                                        >
                                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: '0.8rem' }}>
                                                Initializing Map Registry...
                                            </div>
                                        </div>
                                        <p style={{ color: '#666', fontSize: '0.7rem', marginTop: '0.5rem' }}>Search for a place or click on the map to select the service location.</p>
                                        <MapLogic
                                            lang="am,en"
                                            onLocationSelect={(lat, lng, address) => setNewBooking(prev => ({ ...prev, location: address }))}
                                        />
                                    </div>
                                )}

                                <input
                                    required
                                    type="text"
                                    placeholder="Enter address or paste Google Maps link..."
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: '#0a0a0a', border: '1px solid #333', borderRadius: '10px', color: '#fff' }}
                                    value={newBooking.location}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setNewBooking(prev => ({ ...prev, location: val }));
                                    }}
                                />
                                <p style={{ color: '#444', fontSize: '0.7rem', marginTop: '0.5rem' }}>Tip: You can search your location in Google Maps and paste the address or link here.</p>
                            </div>

                            <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                <button
                                    type="submit"
                                    style={{
                                        width: '100%', padding: '1.2rem', background: 'var(--color-gold)',
                                        border: 'none', borderRadius: '12px', color: '#000',
                                        fontSize: '1rem', fontWeight: '800', cursor: 'pointer',
                                        boxShadow: '0 10px 20px rgba(var(--color-gold-rgb), 0.2)',
                                        transition: '0.3s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >Confirm & Register Booking</button>
                            </div>
                        </form>
                    </div>
                </div >
            )
            }

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
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

    // Update location name if language changes and we have a point selected
    React.useEffect(() => {
        if (lastCoordsRef.current) {
            selectLocation(lastCoordsRef.current.lat, lastCoordsRef.current.lng);
        }
    }, [lang, selectLocation]);

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

            const handleSearch = (e) => {
                const query = e.detail;
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&accept-language=${lang}&limit=1`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data[0]) {
                            const { lat, lon, display_name } = data[0];
                            selectLocation(parseFloat(lat), parseFloat(lon), display_name);
                        }
                    });
            };

            window.addEventListener('map-search', handleSearch);
            if (container.querySelector('.leaflet-tile-pane')) {
                container.querySelector('.leaflet-tile-pane').style.filter = 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)';
            }

            return () => {
                window.removeEventListener('map-search', handleSearch);
            };
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

export default AdminCalendar;
