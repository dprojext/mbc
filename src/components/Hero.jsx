import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { useData } from '../context/DataContext';

const Hero = () => {
    const { settings } = useData();

    // Parse tagline into two lines if present
    const taglineParts = (settings?.tagline || 'Luxury Car Care, Wherever You Are.').split(',');
    const titleLine1 = taglineParts[0] ? taglineParts[0].trim() + (taglineParts.length > 1 ? ',' : '') : 'Luxury Car Care,';
    const titleLine2 = taglineParts[1] ? taglineParts[1].trim() : 'Wherever You Are.';

    return (
        <section className="hero" id="hero">
            <div className="hero-bg">
                <div className="hexagon-pattern"></div>
                <div className="hero-gradient"></div>
            </div>

            <div className="hero-content">
                <motion.div
                    className="hero-badge"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="badge-icon">★</span>
                    <span>Premium Mobile Detailing</span>
                </motion.div>

                <motion.h1
                    className="hero-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <span className="title-line">{titleLine1}</span>
                    <span className="title-line title-accent">{titleLine2}</span>
                </motion.h1>

                <motion.p
                    className="hero-description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    {settings?.description || `Experience unparalleled automotive excellence with ${settings?.siteName || 'Metro BLACKLINE CARE'}. We bring world-class detailing services directly to your location, treating every vehicle with the meticulous attention it deserves.`}
                </motion.p>

                <motion.div
                    className="hero-cta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <Link to="booking" smooth={true} duration={500} className="btn btn-primary">
                        <span>Book Your Detail</span>
                        <div className="btn-shine"></div>
                    </Link>
                    <Link to="services" smooth={true} duration={500} className="btn btn-secondary">
                        <span>Explore Services</span>
                    </Link>
                </motion.div>

                <motion.div
                    className="hero-stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                >
                    <div className="stat-item">
                        <span className="stat-number">500+</span>
                        <span className="stat-label">Luxury Vehicles Detailed</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-number">100%</span>
                        <span className="stat-label">Client Satisfaction</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-number">5★</span>
                        <span className="stat-label">Premium Rating</span>
                    </div>
                </motion.div>

                {settings?.partners?.length > 0 && (
                    <motion.div
                        className="hero-partners"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1 }}
                    >
                        <span className="partners-label">Trusted Partners</span>
                        <div className="partners-list">
                            {settings.partners.map(partner => (
                                <div key={partner.id} className="partner-item" title={partner.detail || partner.name}>
                                    <div className="partner-logo-wrapper">
                                        {partner.logo ? (
                                            <>
                                                <img src={partner.logo} alt={partner.name} />
                                                <div className="partner-color-overlay" style={{ backgroundColor: settings.colors.primary }}></div>
                                            </>
                                        ) : (
                                            <span style={{ color: settings.colors.primary, fontSize: '0.9rem', fontWeight: 'bold' }}>{partner.name}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <motion.div
                className="hero-image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
            >
                <div className="image-frame">
                    <img src={settings?.landingImages?.hero || "/images/hero-car.jpg"} alt="Luxury car detailing" className="hero-img" />
                    <div className="image-overlay"></div>
                </div>
                <div className="floating-card">
                    <div className="card-icon">✓</div>
                    <div className="card-content">
                        <span className="card-title">Trusted by Elite Collectors</span>
                        <span className="card-text">Premium Care Guaranteed</span>
                    </div>
                </div>
            </motion.div>

            <div className="scroll-indicator">
                <span>Scroll to Explore</span>
                <div className="scroll-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                </div>
            </div>
        </section>
    );
};

export default Hero;
