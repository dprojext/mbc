import React from 'react';
import { useData } from '../../context/DataContext';
import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight, FiInfo } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const UserServices = () => {
    const { services = [] } = useData();

    return (
        <div className="user-services">
            <header className="admin-flex-between" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>Available <span className="gold">Services</span></h1>
                    <p style={{ color: '#888', marginTop: '0.4rem' }}>Premium automotive treatments for your exclusive fleet.</p>
                </div>
                <div style={{ background: 'rgba(201,169,106,0.1)', padding: '0.6rem 1.2rem', borderRadius: '50px', border: '1px solid rgba(201,169,106,0.2)' }}>
                    <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', fontWeight: 'bold' }}>Member Discount Active</span>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {services.map((service, idx) => (
                    <motion.div
                        key={service.id}
                        className="admin-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                    >
                        <div style={{ height: '180px', position: 'relative' }}>
                            <img src={service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                            <div style={{ position: 'absolute', bottom: '1.2rem', left: '1.2rem' }}>
                                <h3 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>{service.title}</h3>
                            </div>
                            <div style={{ position: 'absolute', top: '1.2rem', right: '1.2rem', background: 'var(--color-gold)', color: '#000', padding: '0.4rem 0.8rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {service.price}
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{service.description}</p>

                            <ul style={{ padding: 0, margin: '0 0 2rem 0', listStyle: 'none' }}>
                                {(service.features || []).slice(0, 3).map((f, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#666', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                        <FiCheck color="var(--color-gold)" /> {f}
                                    </li>
                                ))}
                            </ul>

                            <Link to="/booking" className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
                                <span>Book This Service</span> <FiArrowRight style={{ marginLeft: '8px' }} />
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="admin-card" style={{ marginTop: '3rem', background: 'rgba(255,255,255,0.02)', textAlign: 'center', padding: '3rem' }}>
                <FiInfo size={32} color="var(--color-gold)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Bespoke Requirements?</h3>
                <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto 2rem' }}>Talk to our specialists about custom ceramic applications or multi-vehicle fleet discounts.</p>
                <Link to="/dashboard/chat" className="btn btn-secondary">Contact Concierge Team</Link>
            </div>
        </div>
    );
};

export default UserServices;
