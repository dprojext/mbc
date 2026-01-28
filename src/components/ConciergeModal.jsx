import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInfo, FiMessageSquare, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const ConciergeModal = ({ isOpen, onClose, itemName, itemPrice }) => {
    const navigate = useNavigate();
    const { settings = {} } = useData();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="modal active" onClick={onClose} style={{ zIndex: 9999 }}>
                <motion.div
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    style={{
                        padding: '3rem',
                        maxWidth: '500px',
                        width: '90%',
                        textAlign: 'center',
                        background: '#0a0a0a',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '30px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'rgba(201,169,106,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        border: '1px solid rgba(201,169,106,0.2)'
                    }}>
                        <FiInfo size={40} color="var(--color-gold)" />
                    </div>

                    <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                        Contact <span className="gold">Required</span>
                    </h2>

                    <p style={{ color: '#888', lineHeight: '1.8', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
                        Online settlements are currently being optimized. To procure {itemName ? <strong className="gold">{itemName}</strong> : 'this service'} {itemPrice ? `(${itemPrice})` : ''}, please coordinate with our concierge through one of the following secure channels:
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '3rem' }}>
                        <button
                            onClick={() => { onClose(); navigate('/dashboard/chat'); }}
                            style={{
                                padding: '1.2rem',
                                background: 'rgba(201,169,106,0.05)',
                                border: '1px solid rgba(201,169,106,0.1)',
                                borderRadius: '15px',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.2rem',
                                transition: '0.3s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,106,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,169,106,0.05)'}
                        >
                            <div style={{ width: '45px', height: '45px', background: 'rgba(201,169,106,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiMessageSquare size={22} color="var(--color-gold)" />
                            </div>
                            <div style={{ textAlign: 'left', flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '1rem' }}>Send Message</div>
                                <div style={{ color: '#555', fontSize: '0.8rem' }}>Instant chat with executive support</div>
                            </div>
                            <FiArrowRight color="#333" />
                        </button>

                        <a
                            href={`tel:${settings?.contact?.phone || '+251 900 000 000'}`}
                            style={{
                                padding: '1.2rem',
                                background: 'rgba(76,175,80,0.03)',
                                border: '1px solid rgba(76,175,80,0.1)',
                                borderRadius: '15px',
                                color: '#fff',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.2rem',
                                transition: '0.3s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(76,175,80,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(76,175,80,0.03)'}
                        >
                            <div style={{ width: '45px', height: '45px', background: 'rgba(76,175,80,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiPhone size={22} color="#4caf50" />
                            </div>
                            <div style={{ textAlign: 'left', flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '1rem' }}>Direct Line</div>
                                <div style={{ color: '#555', fontSize: '0.8rem' }}>{settings?.contact?.phone || '+251 900 000 000'}</div>
                            </div>
                            <FiArrowRight color="#333" />
                        </a>

                        <div style={{
                            padding: '1.2rem',
                            background: 'rgba(33,150,243,0.03)',
                            border: '1px solid rgba(33,150,243,0.1)',
                            borderRadius: '15px',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.2rem'
                        }}>
                            <div style={{ width: '45px', height: '45px', background: 'rgba(33,150,243,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiMapPin size={22} color="#2196f3" />
                            </div>
                            <div style={{ textAlign: 'left', flex: 1 }}>
                                <div style={{ fontWeight: '700', fontSize: '1rem' }}>HQ Concierge</div>
                                <div style={{ color: '#555', fontSize: '0.8rem' }}>{settings?.contact?.address || 'Addis Ababa, Ethiopia'}</div>
                            </div>
                        </div>
                    </div>

                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '1.2rem', border: '1px solid #1a1a1a', background: 'transparent', color: '#fff' }}
                        onClick={onClose}
                    >
                        CLOSE
                    </button>

                    <style>{`
                        .gold { color: var(--color-gold); }
                    `}</style>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ConciergeModal;
