import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Booking from '../components/Booking';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BookingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="booking-page_wrapper" style={{ paddingTop: '100px', background: 'var(--color-black)', position: 'relative', zIndex: 1 }}>
            <Navbar />
            <Booking />
            <Footer />
        </div>
    );
};

export default BookingPage;
