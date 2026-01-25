import React, { useState } from 'react';
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminOverview from './admin/AdminOverview';
import AdminUsers from './admin/AdminUsers';
import AdminAnalytics from './admin/AdminAnalytics';
import AdminContent from './admin/AdminContent';
import AdminData from './admin/AdminData';
import AdminSubscriptions from './admin/AdminSubscriptions';
import AdminPayments from './admin/AdminPayments';
import AdminServices from './admin/AdminServices';
import AdminCalendar from './admin/AdminCalendar';
import AdminChat from './admin/AdminChat';
import AdminBroadcast from './admin/AdminBroadcast';
import AdminNotifications from '../components/AdminNotifications';
import { useData } from '../context/DataContext';
import {
    FiGrid, FiCalendar, FiUsers, FiBarChart2,
    FiPackage, FiLayers, FiCreditCard, FiDatabase,
    FiSettings, FiLogOut, FiMenu, FiChevronLeft, FiMessageSquare, FiVolume2, FiBell
} from 'react-icons/fi';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const { settings } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path || (path === '/admin' && location.pathname === '/admin/');

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: <FiGrid /> },
        { path: '/admin/calendar', label: 'Calendar', icon: <FiCalendar /> },
        { path: '/admin/chat', label: 'Messages', icon: <FiMessageSquare /> },
        { path: '/admin/broadcast', label: 'Broadcast', icon: <FiVolume2 /> },
        { path: '/admin/users', label: 'Users', icon: <FiUsers /> },
        { path: '/admin/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
        { path: '/admin/services', label: 'Services', icon: <FiPackage /> },
        { path: '/admin/subscriptions', label: 'Subscriptions', icon: <FiLayers /> },
        { path: '/admin/payments', label: 'Payments', icon: <FiCreditCard /> },
        { path: '/admin/data', label: 'Data Hub', icon: <FiDatabase /> },
        { path: '/admin/content', label: 'Settings', icon: <FiSettings /> },
    ];

    const sidebarWidth = sidebarCollapsed ? '72px' : '260px';

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a0a0a 100%)',
            color: '#fff'
        }}>
            {/* Sticky Sidebar */}
            <aside style={{
                width: sidebarWidth,
                minWidth: sidebarWidth,
                height: '100vh',
                position: 'sticky',
                top: 0,
                background: '#0d0d0d',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                zIndex: 100
            }}>
                {/* Logo Section */}
                <div style={{
                    padding: sidebarCollapsed ? '1.2rem' : '1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    gap: '0.8rem',
                    minHeight: '70px'
                }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: '#000',
                        flexShrink: 0,
                        overflow: 'hidden'
                    }}>
                        {settings?.logo && (settings.logo.startsWith('data:') || settings.logo.startsWith('http') || settings.logo.startsWith('/')) ? (
                            <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            settings?.logo || 'M'
                        )}
                    </div>
                    {!sidebarCollapsed && (
                        <div>
                            <div style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                color: '#fff',
                                letterSpacing: '0.02em',
                                maxWidth: '140px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {settings?.siteName || 'MBC Admin'}
                            </div>
                            <div style={{
                                fontSize: '0.65rem',
                                color: '#555',
                                letterSpacing: '0.05em'
                            }}>
                                Control Panel
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{
                    flex: 1,
                    padding: sidebarCollapsed ? '1rem 0.6rem' : '1rem 0.8rem',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }}>
                    {!sidebarCollapsed && (
                        <div style={{
                            fontSize: '0.6rem',
                            color: '#444',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            marginBottom: '0.6rem',
                            paddingLeft: '0.8rem'
                        }}>
                            Menu
                        </div>
                    )}
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            title={sidebarCollapsed ? item.label : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                                gap: '0.7rem',
                                padding: sidebarCollapsed ? '0.75rem' : '0.7rem 0.8rem',
                                color: isActive(item.path) ? '#fff' : '#666',
                                background: isActive(item.path)
                                    ? 'rgba(var(--color-gold-rgb), 0.12)'
                                    : 'transparent',
                                borderRadius: '8px',
                                marginBottom: '0.2rem',
                                textDecoration: 'none',
                                fontWeight: isActive(item.path) ? '500' : '400',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s ease',
                                position: 'relative'
                            }}
                        >
                            <span style={{
                                fontSize: sidebarCollapsed ? '1.2rem' : '1rem',
                                opacity: isActive(item.path) ? 1 : 0.7
                            }}>
                                {item.icon}
                            </span>
                            {!sidebarCollapsed && <span>{item.label}</span>}
                            {isActive(item.path) && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '3px',
                                    height: '60%',
                                    background: 'var(--color-gold)',
                                    borderRadius: '0 2px 2px 0'
                                }} />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Bottom Section - Toggle & Logout */}
                <div style={{
                    padding: sidebarCollapsed ? '0.8rem 0.6rem' : '0.8rem',
                    borderTop: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            gap: '0.7rem',
                            padding: sidebarCollapsed ? '0.7rem' : '0.7rem 0.8rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            color: '#888',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease',
                            width: '100%'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                            <path d="M11 19l-7-7 7-7M4 12h16" />
                        </svg>
                        {!sidebarCollapsed && <span>Collapse</span>}
                    </button>

                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                            gap: '0.7rem',
                            padding: sidebarCollapsed ? '0.7rem' : '0.7rem 0.8rem',
                            background: 'transparent',
                            border: '1px solid rgba(255,68,68,0.15)',
                            borderRadius: '8px',
                            color: '#ff6b6b',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s ease',
                            width: '100%'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                        {!sidebarCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                padding: '2rem 2.5rem',
                overflowY: 'auto'
            }}>
                {/* Top Header Bar with Notifications */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    gap: '1rem'
                }}>
                    <AdminNotifications />
                </div>
                <div style={{ position: 'relative' }}>
                    <Routes>
                        <Route path="/" element={<AdminOverview />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                        <Route path="calendar" element={<AdminCalendar />} />
                        <Route path="chat" element={<AdminChat />} />
                        <Route path="broadcast" element={<AdminBroadcast />} />
                        <Route path="content" element={<AdminContent />} />
                        <Route path="data" element={<AdminData />} />
                        <Route path="services" element={<AdminServices />} />
                        <Route path="subscriptions" element={<AdminSubscriptions />} />
                        <Route path="payments" element={<AdminPayments />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
