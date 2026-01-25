import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-scroll';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { FiBell, FiMessageSquare, FiUser, FiCalendar, FiCreditCard, FiZap } from 'react-icons/fi';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { settings, userNotifications = [] } = useData();
    const isHomePage = location.pathname === '/';

    const unreadNotifications = userNotifications.filter(n => !n.read && n.user_id === user?.id).length;

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <RouterLink to="/" className="nav-logo">
                    {settings?.logo && (settings.logo.startsWith('data:') || settings.logo.startsWith('http') || settings.logo.startsWith('/')) ? (
                        <img src={settings.logo} alt={settings.siteName || 'Logo'} className="logo-img" />
                    ) : settings?.logo ? (
                        <span className="logo-img" style={{ fontSize: '2rem' }}>{settings.logo}</span>
                    ) : (
                        <img src="/images/logo.png" alt="MBC" className="logo-img" />
                    )}
                    <div className="logo-text">
                        <span className="logo-main" style={{ fontSize: '1.2rem' }}>{settings?.siteName || 'MBC'}</span>
                    </div>
                </RouterLink>

                {/* Content Menu & Mobile Actions */}
                <div className={`nav-menu-wrapper ${isOpen ? 'active' : ''}`}>
                    <ul className="nav-menu">
                        {/* Always Home */}
                        <li>
                            {isHomePage ? (
                                <Link to="hero" smooth={true} duration={500} className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
                            ) : (
                                <RouterLink to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</RouterLink>
                            )}
                        </li>

                        {!user ? (
                            <>
                                <li>
                                    {isHomePage ? (
                                        <Link to="services" smooth={true} duration={500} className="nav-link" onClick={() => setIsOpen(false)}>Services</Link>
                                    ) : (
                                        <RouterLink to="/#services" className="nav-link" onClick={() => setIsOpen(false)}>Services</RouterLink>
                                    )}
                                </li>
                                <li>
                                    {isHomePage ? (
                                        <Link to="subscriptions" smooth={true} duration={500} className="nav-link" onClick={() => setIsOpen(false)}>Membership</Link>
                                    ) : (
                                        <RouterLink to="/#subscriptions" className="nav-link" onClick={() => setIsOpen(false)}>Membership</RouterLink>
                                    )}
                                </li>
                            </>
                        ) : (
                            <>
                                <li><RouterLink to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>Dashboard</RouterLink></li>
                                <li><RouterLink to="/dashboard/services" className="nav-link" onClick={() => setIsOpen(false)}>Services</RouterLink></li>
                                <li><RouterLink to="/dashboard/subscription" className="nav-link" onClick={() => setIsOpen(false)}>Subscription</RouterLink></li>
                                <li><RouterLink to="/dashboard/bookings" className="nav-link" onClick={() => setIsOpen(false)}>Previous Books</RouterLink></li>
                                <li><RouterLink to="/dashboard/chat" className="nav-link" onClick={() => setIsOpen(false)}>Chat</RouterLink></li>
                            </>
                        )}
                    </ul>

                    {/* Mobile Only: Auth Actions (Hidden on Desktop via CSS) */}
                    {!user && (
                        <div className="mobile-auth-actions">
                            <RouterLink to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Sign In</RouterLink>
                            <RouterLink to="/signup" className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }} onClick={() => setIsOpen(false)}>
                                <span>Sign Up</span>
                            </RouterLink>
                        </div>
                    )}
                    {user && (
                        <div className="mobile-auth-actions">
                            <RouterLink to="/booking" className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem' }} onClick={() => setIsOpen(false)}>Book Service</RouterLink>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', borderRadius: '12px' }}>Sign Out</button>
                        </div>
                    )}
                </div>

                {/* Right Side Actions (Desktop) */}
                <div className="nav-actions">
                    {user ? (
                        <div className="user-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <RouterLink to="/booking" className="btn btn-primary btn-sm desktop-only-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
                                <FiZap style={{ marginRight: '5px' }} /> Book Now
                            </RouterLink>

                            <RouterLink to="/dashboard/notifications" className="nav-icon-btn" aria-label="Notifications">
                                <FiBell />
                                {unreadNotifications > 0 && <span className="icon-badge">{unreadNotifications}</span>}
                            </RouterLink>

                            <RouterLink to="/dashboard/chat" className="nav-icon-btn" aria-label="Messages">
                                <FiMessageSquare />
                            </RouterLink>

                            <div className="user-profile-trigger">
                                <span className="user-greeting">Hi, {user.name?.split(' ')[0]}</span>
                                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '50px', fontSize: '0.7rem', marginLeft: '0.5rem' }}>Sign Out</button>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-nav-actions">
                            <RouterLink to="/login" className="nav-link signin-link">Sign In</RouterLink>
                            <RouterLink to="/signup" className="btn btn-primary signup-btn" style={{ marginLeft: '1rem' }}>
                                <span>Sign Up</span>
                            </RouterLink>
                        </div>
                    )}

                    <button
                        className={`nav-toggle ${isOpen ? 'active' : ''}`}
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle navigation"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
