import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-scroll';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { settings } = useData();
    const isHomePage = location.pathname === '/';

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

    const navLinks = (
        <>
            <li>
                {isHomePage ? (
                    <Link to="hero" smooth={true} duration={500} className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
                ) : (
                    <RouterLink to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</RouterLink>
                )}
            </li>
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
    );

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
                        {navLinks}
                        {user && (
                            <>
                                <li><RouterLink to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>My Garage</RouterLink></li>
                                <li><RouterLink to="/booking" className="nav-link" onClick={() => setIsOpen(false)}>Book Service</RouterLink></li>
                                {user.role === 'admin' && (
                                    <li><RouterLink to="/admin" className="nav-link admin-link" onClick={() => setIsOpen(false)}>Admin Panel</RouterLink></li>
                                )}
                            </>
                        )}
                    </ul>

                    {/* Mobile Only: Auth Actions */}
                    {!user && (
                        <div className="mobile-auth-actions">
                            <RouterLink to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Sign In</RouterLink>
                            <RouterLink to="/signup" className="btn btn-primary" style={{ width: '100%' }} onClick={() => setIsOpen(false)}>
                                <span>Sign Up</span>
                            </RouterLink>
                        </div>
                    )}
                    {user && (
                        <div className="mobile-auth-actions">
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', borderRadius: '50px' }}>Sign Out</button>
                        </div>
                    )}
                </div>

                {/* Desktop & Toggle Actions */}
                <div className="nav-actions">
                    {user ? (
                        <div className="user-nav-actions">
                            {user.role === 'admin' && (
                                <RouterLink to="/admin" className="nav-link admin-link">Admin</RouterLink>
                            )}
                            <span className="user-greeting">Hi, {user.name?.split(' ')[0]}</span>
                            <button onClick={handleLogout} className="btn-logout">Sign Out</button>
                        </div>
                    ) : (
                        <div className="auth-nav-actions">
                            <RouterLink to="/login" className="nav-link signin-link">Sign In</RouterLink>
                            <RouterLink to="/signup" className="btn btn-primary signup-btn">
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
