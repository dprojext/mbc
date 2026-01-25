import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';

const iconMap = {
    wash: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
    ),
    interior: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6v6H9z" />
        </svg>
    ),
    ceramic: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M12 22V12" />
            <path d="M20 16.7V7" />
            <path d="M4 16.7V7" />
        </svg>
    ),
    package: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
        </svg>
    ),
    polish: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    ),
    protection: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    )
};

const Services = () => {
    const { services } = useData();
    const scrollRef = React.useRef(null);
    const [scrollProgress, setScrollProgress] = React.useState(0);

    const handleScroll = () => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const totalScroll = container.scrollWidth - container.clientWidth;
            const currentScroll = container.scrollLeft;
            const progress = (currentScroll / totalScroll) * 100;
            setScrollProgress(progress);
        }
    };

    return (
        <section className="services" id="services">
            <div className="section-container">
                <div className="section-header">
                    <span className="section-tag">Our Expertise</span>
                    <h2 className="section-title">Luxury <span className="gold">Services</span></h2>
                    <p className="section-description">
                        Every service is performed with surgical precision using only premium-grade products
                        trusted by exotic car manufacturers worldwide.
                    </p>
                </div>

                <div
                    className="services-grid"
                    ref={scrollRef}
                    onScroll={handleScroll}
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            className={`service-card ${service.featured ? 'featured' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {service.featured && <div className="featured-badge">Most Popular</div>}
                            <div className="service-image">
                                <img src={service.image} alt={service.title} />
                                <div className="service-overlay">
                                    <span className="service-price">{service.price}</span>
                                </div>
                            </div>
                            <div className="service-content">
                                <div className="service-icon">
                                    {iconMap[service.iconType] || iconMap.wash}
                                </div>
                                <h3 className="service-title">{service.title}</h3>
                                <p className="service-description">
                                    {service.description}
                                </p>
                                <ul className="service-features">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                                <a href="#booking" className="service-link">
                                    <span>Book This Service</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Scroll Pagination Dots - Mobile Only */}
                <div className="mobile-scroll-dots">
                    {services.map((_, i) => {
                        const activeIndex = Math.round((scrollProgress / 100) * (services.length - 1));
                        return (
                            <div
                                key={i}
                                className={`scroll-dot ${i === activeIndex ? 'active' : ''}`}
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;
