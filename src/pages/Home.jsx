import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import Membership from '../components/Membership';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { incrementViewCount } = useData();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        incrementViewCount();
        const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
        if (user && !isPreview) {
            if (user.role?.toLowerCase() === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }
    }, [user, navigate]);

    return (
        <div className="home-page">
            <Navbar />
            <main>
                <Hero />
                <Services />
                <About />
                <Membership />
                {/* Booking moved to separate page */}
                <Contact />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
