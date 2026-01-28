import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserOverview from './user/UserOverview';
import UserServices from './user/UserServices';
import UserSubscription from './user/UserSubscription';
import UserBookings from './user/UserBookings';
import UserChat from './user/UserChat';
import UserNotificationCenter from './user/UserNotificationCenter';
import UserProfile from './user/UserProfile';
import UserPayments from './user/UserPayments';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { FiBell } from 'react-icons/fi';
import '../admin.css';

const UserDashboard = () => {
    const { user } = useAuth();
    const data = useData() || {};
    const settings = data.settings || {};
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = React.useState(typeof window !== 'undefined' && window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
        if (user?.role?.toLowerCase() === 'admin' && window.location.pathname === '/dashboard' && !isPreview) {
            navigate('/admin');
        }
    }, [user, navigate]);

    if (!user) return null;

    const navLinks = [
        { label: 'Dashboard', path: '' },
        { label: 'Service', path: 'services' },
        { label: 'Subscription', path: 'subscription' },
        { label: 'Previous Books', path: 'bookings' },
        { label: 'Payments', path: 'payments' },
        { label: 'Chat', path: 'chat' },
        { label: 'Profile', path: 'profile' }
    ].filter(link => {
        if (link.label === 'Payments' && settings?.paymentsEnabled === false) return false;
        return true;
    });

    if (!settings && !user) return null;

    return (
        <div className="user-dashboard-wrapper" style={{ background: 'var(--color-background, #0c0c0c)', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff' }}>
            <Navbar />



            <div className="user-sub-nav">
                <div className="user-sub-nav-container">
                    {navLinks.map(link => {
                        const isActive = (window.location.pathname === `/dashboard/${link.path}` || (link.path === '' && window.location.pathname === '/dashboard'));
                        return (
                            <button
                                key={link.label}
                                onClick={() => navigate(`/dashboard/${link.path}`)}
                                className={`user-sub-nav-item ${isActive ? 'active' : ''}`}
                            >
                                {link.label}
                                {isActive && <span className="active-indicator" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            <main style={{ flex: 1, padding: '2rem 0 4rem', position: 'relative' }}>
                <div className="section-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {/* Mobile Only Greeting */}
                    <div className="mobile-only-block" style={{ marginBottom: '2rem', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: '800', margin: 0 }}>
                                {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, <span className="gold">{user?.name && !user.name.includes('@') ? user.name.split(' ')[0] : 'MBC'}</span>
                            </h2>
                            <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '0.4rem' }}>Welcome back to your executive dashboard.</p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/notifications')}
                            style={{
                                position: 'relative', background: 'rgba(201,169,106,0.1)', border: '1px solid rgba(201,169,106,0.2)',
                                width: '50px', height: '50px', borderRadius: '15px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)',
                                cursor: 'pointer', transition: '0.3s', boxShadow: '0 8px 20px rgba(0,0,0,0.3)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,169,106,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(201,169,106,0.1)'}
                        >
                            <FiBell size={24} />
                            {/* Unread badge logic could be added here */}
                        </button>
                    </div>

                    <div className="dashboard-content-fade-in">
                        <Routes>
                            <Route index element={<UserOverview />} />
                            <Route path="services" element={<UserServices />} />
                            <Route path="subscription" element={<UserSubscription />} />
                            <Route path="bookings" element={<UserBookings />} />
                            <Route path="payments" element={<UserPayments />} />
                            <Route path="chat" element={<UserChat />} />
                            <Route path="notifications" element={<UserNotificationCenter />} />
                            <Route path="profile" element={<UserProfile />} />
                        </Routes>
                    </div>
                </div>
            </main>

            <Footer />

            <style>{`
                .user-dashboard-wrapper {
                    font-family: var(--font-body);
                }
                .mobile-only-block {
                    display: none;
                }
                @media (max-width: 768px) {
                    .mobile-only-block {
                        display: flex;
                    }
                    .admin-flex-between {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 1.5rem;
                    }
                    .admin-grid-2 {
                        grid-template-columns: 1fr !important;
                    }
                    .stack-on-mobile {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 1.5rem !important;
                    }
                    .section-container {
                        padding: 0 0.5rem !important;
                    }
                    .admin-card {
                        padding: 1rem !important;
                    }
                    main {
                        padding: 1rem 0 5rem !important;
                    }
                }
                .dashboard-content-fade-in {
                    animation: dashboardFadeIn 0.5s ease-out;
                }
                @keyframes dashboardFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .gold { color: var(--color-gold); }
                .user-dashboard-wrapper h1, 
                .user-dashboard-wrapper h2, 
                .user-dashboard-wrapper h3,
                .user-dashboard-wrapper p,
                .user-dashboard-wrapper span,
                .user-dashboard-wrapper div {
                    color: inherit;
                }
                /* Mobile optimized table scroll */
                .responsive-table-v2 {
                    width: 100%;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    margin-bottom: 1rem;
                }
                .responsive-table-v2 table {
                    min-width: 600px;
                }
            `}</style>
        </div>
    );
};

export default UserDashboard;
