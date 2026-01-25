import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';

const features = [
    // ... same features
];

const About = () => {
    const { settings } = useData();
    const aboutImage = settings?.landingImages?.about || '/images/service-wash.jpg';

    return (
        <section className="why-us">
            <div className="section-container">
                <div className="why-us-grid">
                    <motion.div
                        className="why-us-content"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="section-tag">The MBC Difference</span>
                        <h2 className="section-title">Why <span className="gold">Discerning Owners</span> Choose Us</h2>
                        <p className="section-description">
                            We don't just clean cars—we preserve automotive investments. Our team understands that
                            your vehicle is more than transportation; it's a statement of excellence.
                        </p>
                        <div className="features-list">
                            {[
                                {
                                    title: "Fully Insured & Bonded",
                                    desc: "Complete peace of mind with comprehensive coverage for your prized vehicles.",
                                    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                },
                                {
                                    title: "Convenient Mobile Service",
                                    desc: "We come to you—home, office, or anywhere. Your time is valuable.",
                                    icon: <><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></>
                                },
                                {
                                    title: "Exotic Car Specialists",
                                    desc: "Trained on Ferrari, Lamborghini, Bentley, and all prestigious marques.",
                                    icon: <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                },
                                {
                                    title: "Premium Products Only",
                                    desc: "We use only the finest detailing products trusted by manufacturers.",
                                    icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></>
                                }
                            ].map((feature, index) => (
                                <div className="feature-item" key={index}>
                                    <div className="feature-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            {feature.icon}
                                        </svg>
                                    </div>
                                    <div className="feature-content">
                                        <h4>{feature.title}</h4>
                                        <p>{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="why-us-visual"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="visual-card" style={{ height: '500px', overflow: 'hidden', padding: 0 }}>
                            <div className="visual-img-container" style={{ position: 'absolute', inset: 0 }}>
                                <img src={aboutImage} alt="Excellence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}></div>
                            </div>
                            <div className="visual-content" style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'flex-end', padding: '2.5rem' }}>
                                <div className="testimonial" style={{ textAlign: 'left' }}>
                                    <div className="quote-icon" style={{ fontSize: '4rem', marginBottom: '-1rem' }}>"</div>
                                    <p className="testimonial-text" style={{ fontSize: '1.2rem', color: '#fff' }}>
                                        The attention to detail is unmatched. My Porsche 911 GT3 has never looked better.
                                        MBC understands what true car enthusiasts expect.
                                    </p>
                                    <div className="testimonial-author">
                                        <div className="author-info">
                                            <span className="author-name">Michael R.</span>
                                            <span className="author-car">Porsche 911 Owner</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default About;
