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
    FiSettings, FiLogOut, FiMenu, FiChevronLeft, FiMessageSquare, FiVolume2, FiBell, FiX
} from 'react-icons/fi';
import '../admin.css';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const { settings } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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

    return (
        <div className="admin-layout">
            {/* Sidebar with Mobile Support */}
            <div
                className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
                onClick={() => setMobileOpen(false)}
            >
                <div className="admin-sidebar-logo">
                    <div className="admin-logo-icon">
                        {settings?.logo && (settings.logo.startsWith('data:') || settings.logo.startsWith('http') || settings.logo.startsWith('/')) ? (
                            <img src={settings.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            settings?.logo || 'M'
                        )}
                    </div>
                    {(!sidebarCollapsed || mobileOpen) && (
                        <div className="admin-logo-text">
                            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
                                {settings?.siteName || 'MBC'}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: '#555' }}>Control Panel</div>
                        </div>
                    )}
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setMobileOpen(false)}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            {(!sidebarCollapsed || mobileOpen) && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="admin-sidebar-footer" style={{ padding: '1rem', borderTop: '1px solid var(--admin-border)' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(!sidebarCollapsed); }}
                        className="admin-nav-item"
                        style={{ background: 'rgba(255,255,255,0.03)', border: 'none', width: '100%', cursor: 'pointer' }}
                    >
                        <FiChevronLeft style={{ transform: sidebarCollapsed ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                        {(!sidebarCollapsed || mobileOpen) && <span>Collapse</span>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="admin-nav-item"
                        style={{ color: '#ff6b6b', border: 'none', background: 'transparent', width: '100%', cursor: 'pointer', marginTop: '0.5rem' }}
                    >
                        <FiLogOut />
                        {(!sidebarCollapsed || mobileOpen) && <span>Sign Out</span>}
                    </button>
                </div>
            </div>

            {/* Mobile Toggle Button */}
            <button
                className="admin-mobile-toggle"
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ display: 'none' }}
            >
                {mobileOpen ? <FiX /> : <FiMenu />}
            </button>

            <main className="admin-main">
                <header className="admin-header">
                    <AdminNotifications />
                </header>

                <div className="admin-content-view">
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

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 999
                    }}
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
