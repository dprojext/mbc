import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';

const Contact = () => {
    const { settings } = useData();
    const contact = settings?.contact;

    return (
        <section className="contact" id="contact">
            <div className="section-container">
                <div className="contact-grid">
                    <motion.div
                        className="contact-info"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="section-tag">Get in Touch</span>
                        <h2 className="section-title">Contact <span className="gold">MBC</span></h2>
                        <p className="section-description">
                            Have questions about our services? Our team is here to provide personalized assistance
                            for all your automotive care needs.
                        </p>

                        <div className="contact-methods">
                            <div className="contact-method">
                                <div className="method-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <div className="method-content">
                                    <span className="method-label">Call Us</span>
                                    <a href={`tel:${contact?.phone}`} className="method-value">{contact?.phone || '+1 (555) 000-0000'}</a>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div className="method-content">
                                    <span className="method-label">Email Us</span>
                                    <a href={`mailto:${contact?.email}`} className="method-value">{contact?.email || 'care@metroblackline.com'}</a>
                                </div>
                            </div>

                            <div className="contact-method">
                                <div className="method-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12,6 12,12 16,14" />
                                    </svg>
                                </div>
                                <div className="method-content">
                                    <span className="method-label">Hours</span>
                                    <span className="method-value">{contact?.hours || 'Mon - Sun: 7AM - 8PM'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="social-links">
                            {Object.entries(contact?.socials || {}).filter(([_, url]) => url && url.length > 5).map(([network, url]) => (
                                <a key={network} href={url} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={network} title={network}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{network[0].toUpperCase()}</span>
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        className="contact-visual"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="map-container" style={{
                            position: 'relative',
                            overflow: 'hidden',
                            height: '100%',
                            minHeight: '450px'
                        }}>
                            {(contact?.googleMapLink || contact?.address) ? (
                                <iframe
                                    src={contact.googleMapLink || `https://maps.google.com/maps?q=${encodeURIComponent(contact?.address || 'Addis Ababa')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Service Area Map"
                                ></iframe>
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundImage: `url(${settings?.landingImages?.contact})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}></div>
                            )}

                            <div className="map-overlay" style={{ pointerEvents: 'none', position: 'absolute', inset: 0 }}>
                                <div className="service-area" style={{ pointerEvents: 'auto' }}>
                                    <h4>Service Area</h4>
                                    <p>We proudly serve <strong>{contact?.address || 'the entire metropolitan area'}</strong> and surrounding luxury communities.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
