import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import About from '../components/About';
import Membership from '../components/Membership';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';

const Home = () => {
    const { incrementViewCount } = useData();

    useEffect(() => {
        incrementViewCount();
    }, []);

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
