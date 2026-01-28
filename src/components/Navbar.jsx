import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-scroll';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { FiBell, FiMessageSquare, FiUser, FiZap, FiSettings } from 'react-icons/fi';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { settings, userNotifications = [] } = useData();
    const isHomePage = location.pathname === '/';

    const unreadNotifications = userNotifications.filter(n => !n.read && n.user_id === user?.id);
    const recentNotifs = [...userNotifications].filter(n => n.user_id === user?.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3);

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
        setProfileOpen(false);
        setNotifOpen(false);
    };

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Get user's first name
    const getFirstName = () => {
        if (!user?.name) return '';
        if (user.name === user.email || user.name.includes('@')) return '';
        return user.name.split(' ')[0];
    };

    const isAdmin = user?.role?.toLowerCase() === 'admin';

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="nav-container">
                <RouterLink to={user ? (user.role?.toLowerCase() === 'admin' ? "/admin" : "/dashboard") : "/"} className="nav-logo" onClick={() => { setNotifOpen(false); setProfileOpen(false); }}>
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
                        {!user ? (
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
                        ) : (
                            <>
                                {/* Logged in users: links are handled by the dashboard sub-nav */}
                                <li style={{ visibility: 'hidden' }}><RouterLink to="/dashboard" className="nav-link">Dashboard</RouterLink></li>
                            </>
                        )}
                    </ul>

                    {/* Mobile Only: Auth/User Actions */}
                    {!user && (
                        <div className="mobile-auth-actions">
                            <RouterLink to="/login" className="nav-link" onClick={() => setIsOpen(false)}>Sign In</RouterLink>
                            <RouterLink to="/signup" className="btn btn-primary" style={{ width: '100%', borderRadius: '12px' }} onClick={() => setIsOpen(false)}>
                                <span>Sign Up</span>
                            </RouterLink>
                        </div>
                    )}
                    {user && (
                        <div className="mobile-auth-actions" style={{ gap: '0.8rem' }}>
                            <RouterLink to="/dashboard/notifications" className="nav-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiBell /> Notifications {unreadNotifications.length > 0 && <span className="badge-pill">{unreadNotifications.length}</span>}
                            </RouterLink>
                            {isAdmin && (
                                <RouterLink to="/admin" className="nav-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-gold)' }}>
                                    <FiSettings /> Admin Panel
                                </RouterLink>
                            )}
                            <RouterLink to="/booking" className="btn btn-primary" style={{ width: '100%', borderRadius: '12px', marginTop: '1rem' }} onClick={() => setIsOpen(false)}>
                                <FiZap style={{ marginRight: '8px' }} /> Book Now
                            </RouterLink>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', borderRadius: '12px' }}>Sign Out</button>
                        </div>
                    )}
                </div>

                {/* Right Side Actions (Desktop) */}
                <div className="nav-actions">
                    {user ? (
                        <div className="user-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                            {/* Time-based Greeting */}
                            <div className="nav-greeting desktop-only-btn" style={{ color: '#888', fontSize: '0.9rem', fontWeight: '500' }}>
                                {getGreeting()}{getFirstName() && <span style={{ color: 'var(--color-gold)', fontWeight: '700' }}>, {getFirstName()}</span>}
                            </div>
                            <RouterLink to="/booking" className="btn btn-primary btn-sm desktop-only-btn" style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem' }}>
                                <FiZap style={{ marginRight: '5px' }} /> Book Now
                            </RouterLink>

                            {/* Notification Dropdown */}
                            <div className="nav-icon-wrapper" style={{ position: 'relative' }}>
                                <button
                                    className="nav-icon-btn"
                                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', position: 'relative' }}
                                >
                                    <FiBell />
                                    {unreadNotifications.length > 0 && <span className="icon-badge">{unreadNotifications.length}</span>}
                                </button>

                                {notifOpen && (
                                    <div className="notif-dropdown" style={{
                                        position: 'absolute', top: '100%', right: 0, marginTop: '1rem',
                                        background: '#111', border: '1px solid #333', borderRadius: '12px',
                                        width: '320px', padding: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                        zIndex: 100
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #222', paddingBottom: '0.8rem' }}>
                                            <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>Notifications</span>
                                            {unreadNotifications.length > 0 && <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem' }}>{unreadNotifications.length} New</span>}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {recentNotifs.length > 0 ? recentNotifs.map(n => (
                                                <RouterLink
                                                    key={n.id}
                                                    to="/dashboard/notifications"
                                                    state={{ openNotifId: n.id }}
                                                    onClick={() => setNotifOpen(false)}
                                                    style={{ textDecoration: 'none', display: 'block', marginBottom: '0.8rem' }}
                                                >
                                                    <div style={{ padding: '0.6rem', borderRadius: '8px', background: n.read ? 'transparent' : 'rgba(201,169,106,0.05)', border: n.read ? 'none' : '1px solid rgba(201,169,106,0.1)' }}>
                                                        <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.2rem' }}>{n.title}</div>
                                                        <div style={{ color: '#888', fontSize: '0.75rem', lineBreak: 'anywhere' }}>{n.message.substring(0, 60)}...</div>
                                                    </div>
                                                </RouterLink>
                                            )) : (
                                                <div style={{ padding: '1rem', textAlign: 'center', color: '#444', fontSize: '0.85rem' }}>No recent notifications</div>
                                            )}
                                        </div>
                                        <RouterLink
                                            to="/dashboard/notifications"
                                            className="btn btn-secondary"
                                            style={{ width: '100%', marginTop: '1rem', fontSize: '0.8rem', padding: '0.5rem' }}
                                            onClick={() => setNotifOpen(false)}
                                        >
                                            View All
                                        </RouterLink>
                                    </div>
                                )}
                            </div>

                            {/* Profile Dropdown */}
                            <div className="profile-dropdown-container" style={{ position: 'relative' }}>
                                <button
                                    className="nav-profile-btn"
                                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        background: 'var(--gradient-gold)', color: '#000',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '800', fontSize: '0.85rem', border: '2px solid rgba(255,255,255,0.1)',
                                        textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                    }}>
                                        {getFirstName() ? getFirstName().charAt(0) : (user?.email?.charAt(0) || 'U')}
                                    </div>
                                </button>

                                {profileOpen && (
                                    <div className="profile-dropdown" style={{
                                        position: 'absolute', top: '100%', right: 0, marginTop: '1rem',
                                        background: '#111', border: '1px solid #333', borderRadius: '12px',
                                        width: '220px', padding: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                        zIndex: 100
                                    }}>
                                        <div style={{ padding: '0.8rem', borderBottom: '1px solid #222', marginBottom: '0.5rem' }}>
                                            <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{user.name && user.name !== user.email ? user.name : 'Member'}</div>
                                            <div style={{ color: '#666', fontSize: '0.75rem' }}>{user.email}</div>
                                        </div>

                                        <RouterLink
                                            to="/dashboard/profile"
                                            className="dropdown-item"
                                            onClick={() => setProfileOpen(false)}
                                            style={{
                                                width: '100%', padding: '0.8rem', background: 'none', border: 'none',
                                                color: '#fff', display: 'flex', alignItems: 'center', gap: '0.8rem',
                                                fontSize: '0.9rem', textDecoration: 'none', borderRadius: '8px'
                                            }}
                                        >
                                            <FiUser size={14} color="var(--color-gold)" /> Profile Settings
                                        </RouterLink>

                                        {user?.role?.toLowerCase() === 'admin' && (
                                            <RouterLink
                                                to="/admin"
                                                className="dropdown-item"
                                                onClick={() => setProfileOpen(false)}
                                                style={{
                                                    width: '100%', padding: '0.8rem', background: 'none', border: 'none',
                                                    color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '0.8rem',
                                                    fontSize: '0.9rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold'
                                                }}
                                            >
                                                <FiSettings size={14} /> Admin Panel
                                            </RouterLink>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="dropdown-item"
                                            style={{
                                                width: '100%', padding: '0.8rem', background: 'none', border: 'none',
                                                color: '#ff6b6b', textAlign: 'left', cursor: 'pointer', borderRadius: '8px',
                                                display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.9rem'
                                            }}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
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
            {(profileOpen || notifOpen) && <div style={{ position: 'fixed', inset: 0, zIndex: 90 }} onClick={() => { setProfileOpen(false); setNotifOpen(false); }} />}
            <style>{`
                .dropdown-item:hover { background: rgba(255,255,255,0.05) !important; }
            `}</style>
        </nav>
    );
};

export default Navbar;
