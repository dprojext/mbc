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
                            {contact?.socials?.instagram && contact.socials.instagram !== '#' && (
                                <a href={contact.socials.instagram} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                    </svg>
                                </a>
                            )}
                            {contact?.socials?.facebook && contact.socials.facebook !== '#' && (
                                <a href={contact.socials.facebook} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                    </svg>
                                </a>
                            )}
                            {contact?.socials?.twitter && contact.socials.twitter !== '#' && (
                                <a href={contact.socials.twitter} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                                    </svg>
                                </a>
                            )}
                            {contact?.socials?.linkedin && contact.socials.linkedin !== '#' && (
                                <a href={contact.socials.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                        <rect x="2" y="9" width="4" height="12" />
                                        <circle cx="4" cy="4" r="2" />
                                    </svg>
                                </a>
                            )}
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
                                    <a href="#booking" className="btn btn-secondary"><span>Check Availability</span></a>
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
