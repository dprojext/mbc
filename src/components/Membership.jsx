import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import ConciergeModal from './ConciergeModal';
import { FiStar, FiCheckCircle, FiMessageSquare, FiLink } from 'react-icons/fi';

const Membership = () => {
    const { plans = [], services = [], settings = {} } = useData();
    const navigate = useNavigate();
    const [isConciergeOpen, setIsConciergeOpen] = useState(false);
    const [conciergeData, setConciergeData] = useState({ name: '', price: '' });
    const [currency, setCurrency] = useState('USD');
    const [exchangeRate, setExchangeRate] = useState(1);

    const scrollRef = React.useRef(null);
    const [scrollProgress, setScrollProgress] = React.useState(0);

    const handleScroll = () => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const totalScroll = container.scrollWidth - container.clientWidth;
            const currentScroll = container.scrollLeft;
            const progress = totalScroll > 0 ? (currentScroll / totalScroll) * 100 : 0;
            setScrollProgress(progress);
        }
    };

    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
        }
    }, []);

    const formatPrice = (price, planCurrency) => {
        if (currency === planCurrency) return price;
        return currency === 'ETB' ? Math.round(price * exchangeRate) : Math.round(price / exchangeRate);
    };

    // Show all plans on the landing page
    const allPlans = plans;

    // Find the 'most popular' plan - Gold Plan or the second one
    const getFeaturedIndex = () => {
        const goldIndex = allPlans.findIndex(p => p.name.toLowerCase().includes('gold'));
        return goldIndex !== -1 ? goldIndex : 1;
    };
    const featuredIndex = getFeaturedIndex();

    const getPlanClass = (plan, index) => {
        if (index === featuredIndex) return 'plan-card featured';
        if (plan.name.toLowerCase().includes('platinum')) return 'plan-card platinum';
        return 'plan-card';
    };

    const getPlanTagline = (plan) => {
        const name = plan.name.toLowerCase();
        if (name.includes('silver')) return 'Essential Care Package';
        if (name.includes('gold')) return 'Premium Care Experience';
        if (name.includes('platinum')) return 'The Ultimate Experience';
        if (plan.type === 'package') return 'One-Time Service';
        return 'Exclusive Offering';
    };

    return (
        <section
            className="subscriptions"
            id="subscriptions"
            style={{
                position: 'relative',
                backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.9), rgba(10, 10, 10, 0.9)), url(${settings?.landingImages?.membership})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="section-container">
                <div className="section-header">
                    <span className="section-tag">Exclusive Offerings</span>
                    <h2 className="section-title">Elite <span className="gold">Subscription</span> Plans & Packages</h2>
                    <p className="section-description">
                        Join our exclusive membership programs or choose from our premium one-time
                        service packages designed for those who demand excellence.
                    </p>
                </div>

                {/* Currency Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', gap: '0.5rem' }}>
                    {['USD', 'ETB'].map(curr => (
                        <button
                            key={curr}
                            onClick={() => setCurrency(curr)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                borderRadius: '50px',
                                border: '1px solid',
                                borderColor: currency === curr ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)',
                                background: currency === curr ? 'rgba(var(--color-gold-rgb), 0.1)' : 'transparent',
                                color: currency === curr ? 'var(--color-gold)' : '#888',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                transition: '0.3s'
                            }}
                        >
                            {curr}
                        </button>
                    ))}
                </div>

                <div
                    className="plans-grid"
                    ref={scrollRef}
                    onScroll={handleScroll}
                >
                    {allPlans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            className={getPlanClass(plan, index)}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                        >
                            {index === featuredIndex && <div className="plan-badge">Most Popular</div>}
                            {plan.type === 'package' && index !== featuredIndex && (
                                <div className="plan-badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--color-gold)' }}>One-Time</div>
                            )}
                            <div className="plan-header">
                                <span className="plan-tier">{plan.name.replace(' Plan', '')}</span>
                                <div className="plan-price">
                                    <span className="currency">{currency === 'USD' ? '$' : 'Br'}</span>
                                    <span className="amount">{formatPrice(plan.price, plan.currency)}</span>
                                    <span className="period">/{plan.type === 'subscription' ? plan.period : 'one-time'}</span>
                                </div>
                                <p className="plan-tagline">{getPlanTagline(plan)}</p>
                            </div>
                            <div className="plan-content">
                                <ul className="plan-features">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20,6 9,17 4,12" />
                                            </svg>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                    {/* Linked Services */}
                                    {services.filter(s => (s.includedInPlans || []).includes(plan.id)).map(service => (
                                        <li key={`svc-${service.id}`}>
                                            <FiLink style={{ color: 'var(--color-gold)', fontSize: '0.9rem', flexShrink: 0, marginTop: '4px' }} />
                                            <a
                                                href="#services"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    const element = document.getElementById('services');
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: 'smooth' });
                                                        // Note: We could also highlight the specific service if we had its ID
                                                    }
                                                }}
                                                style={{ color: 'var(--color-gold)', textDecoration: 'none', fontWeight: '600', borderBottom: '1px dashed rgba(201,169,106,0.3)', transition: '0.2s' }}
                                                onMouseOver={(e) => e.target.style.borderBottomColor = 'var(--color-gold)'}
                                                onMouseOut={(e) => e.target.style.borderBottomColor = 'rgba(201,169,106,0.3)'}
                                            >
                                                {service.title} (Included)
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => {
                                        if (settings?.paymentsEnabled === false) {
                                            setConciergeData({ name: plan.name, price: `$${plan.price}` });
                                            setIsConciergeOpen(true);
                                        } else {
                                            navigate('/signup');
                                        }
                                    }}
                                    className={index === featuredIndex ? "btn btn-primary plan-btn" : "btn btn-secondary plan-btn"}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                                >
                                    {settings?.paymentsEnabled === false ? <FiMessageSquare /> : (index === featuredIndex ? <FiStar className="btn-icon" /> : <FiCheckCircle className="btn-icon" />)}
                                    <span>{settings?.paymentsEnabled === false ? 'Contact to Join' : (plan.type === 'subscription' ? 'Select Plan' : 'Book Now')}</span>
                                    {index === featuredIndex && <div className="btn-shine"></div>}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Scroll Pagination Dots - Mobile Only */}
                <div className="mobile-scroll-dots">
                    {allPlans.map((_, i) => {
                        const activeIndex = Math.round((scrollProgress / 100) * (allPlans.length - 1));
                        return (
                            <div
                                key={i}
                                className={`scroll-dot ${i === activeIndex ? 'active' : ''}`}
                            />
                        );
                    })}
                </div>
            </div>
            <ConciergeModal
                isOpen={isConciergeOpen}
                onClose={() => setIsConciergeOpen(false)}
                itemName={conciergeData.name}
                itemPrice={conciergeData.price}
            />
        </section >
    );
};

export default Membership;
