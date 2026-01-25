import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
    const { settings } = useData();
    const { user } = useAuth();

    // Helper to check if logo is an image URL
    const isImageLogo = (str) => {
        return str && (str.startsWith('data:') || str.startsWith('http') || str.startsWith('/'));
    };

    if (user) {
        return (
            <footer className="footer minimalistic-footer" style={{ padding: '2rem 0', background: 'rgba(5,5,5,0.8)', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="section-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        {/* Left: Small Logo & Short Name */}
                        <div className="footer-brand-mini" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            {isImageLogo(settings?.logo) ? (
                                <img src={settings.logo} alt="Logo" style={{ height: '24px' }} />
                            ) : (
                                <span style={{ color: 'var(--color-gold)', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px' }}>{settings?.logo || 'MBC'}</span>
                            )}
                            <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>{settings?.siteName?.split(' ')[0] || 'METRO'}</span>
                        </div>

                        {/* Right: Documentation */}
                        <div className="footer-doc-mini" style={{ display: 'flex', gap: '1.5rem' }}>
                            {(settings?.documents || []).filter(d => d.showInFooter).map(doc => (
                                <a key={doc.id} href={`#doc-${doc.id}`} style={{ color: '#666', fontSize: '0.75rem', textDecoration: 'none', transition: '0.3s' }} className="mini-link">{doc.name}</a>
                            ))}
                            {!settings?.documents && (
                                <>
                                    <a href="#tos" style={{ color: '#666', fontSize: '0.75rem', textDecoration: 'none' }} className="mini-link">Terms</a>
                                    <a href="#privacy" style={{ color: '#666', fontSize: '0.75rem', textDecoration: 'none' }} className="mini-link">Privacy</a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Center Below: Copyright */}
                    <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.02)', paddingTop: '1.5rem' }}>
                        <p style={{ color: '#444', fontSize: '0.65rem', margin: 0, letterSpacing: '1px' }}>
                            &copy; {new Date().getFullYear()} {settings?.siteName || 'METRO BLACKLINE CARE'}. ALL RIGHTS RESERVED.
                        </p>
                    </div>
                </div>
                <style>{`
                    .mini-link:hover { color: var(--color-gold) !important; }
                    @media (max-width: 600px) {
                        .minimalistic-footer .section-container > div:first-child { flex-direction: column; text-align: center; }
                    }
                `}</style>
            </footer>
        );
    }

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            {isImageLogo(settings?.logo) ? (
                                <img src={settings.logo} alt={settings.siteName || 'Logo'} style={{ height: '40px', marginBottom: '0.5rem' }} />
                            ) : (
                                <span className="logo-main">{settings?.logo || 'MBC'}</span>
                            )}
                            <span className="logo-sub">{settings?.siteName || 'METRO BLACKLINE CARE'}</span>
                        </div>
                        <p className="footer-tagline">{settings?.tagline || 'Luxury Car Care, Wherever You Are.'}</p>

                        <div className="footer-socials">
                            {settings?.contact?.socials?.instagram && (
                                <a href={settings.contact.socials.instagram} target="_blank" rel="noreferrer" className="social-icon-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                </a>
                            )}
                            {settings?.contact?.socials?.facebook && (
                                <a href={settings.contact.socials.facebook} target="_blank" rel="noreferrer" className="social-icon-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                </a>
                            )}
                            {settings?.contact?.socials?.twitter && (
                                <a href={settings.contact.socials.twitter} target="_blank" rel="noreferrer" className="social-icon-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                                </a>
                            )}
                            {settings?.contact?.socials?.linkedin && (
                                <a href={settings.contact.socials.linkedin} target="_blank" rel="noreferrer" className="social-icon-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="footer-links">
                        {(settings?.footerSections || []).map((section, idx) => (
                            <div key={idx} className="footer-column">
                                <h4>{section.title}</h4>
                                <ul>
                                    {section.links.map((link, lIdx) => (
                                        <li key={lIdx}><a href={link.url}>{link.label}</a></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        {!settings?.footerSections && (
                            <>
                                <div className="footer-column">
                                    <h4>Services</h4>
                                    <ul>
                                        <li><a href="#services">Signature Hand Wash</a></li>
                                        <li><a href="#services">Interior Detail</a></li>
                                        <li><a href="#services">Ceramic Coating</a></li>
                                    </ul>
                                </div>
                                <div className="footer-column">
                                    <h4>Company</h4>
                                    <ul>
                                        <li><a href="#hero">About Us</a></li>
                                        <li><a href="#contact">Contact</a></li>
                                        <li><a href="#booking">Book Now</a></li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="copyright-area">
                        <p className="copyright">{settings?.legalText || `© ${new Date().getFullYear()} ${settings?.siteName || 'Metro BLACKLINE CARE'}. All rights reserved.`}</p>
                        {settings?.showLegal && (
                            <div className="legal-links">
                                {(settings.documents || []).filter(d => d.showInFooter).map((doc, dIdx, filtered) => (
                                    <React.Fragment key={doc.id}>
                                        <a href={`#doc-${doc.id}`}>{doc.name}</a>
                                        {dIdx < filtered.length - 1 && <span className="divider">|</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                    <p className="footer-note">Designed for automotive excellence.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
