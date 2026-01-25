import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserOverview from './user/UserOverview';
import UserServices from './user/UserServices';
import UserSubscription from './user/UserSubscription';
import UserBookings from './user/UserBookings';
import UserChat from './user/UserChat';
import UserNotificationCenter from './user/UserNotificationCenter';
import UserProfile from './user/UserProfile';
import { useAuth } from '../context/AuthContext';
import '../admin.css';

const UserDashboard = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="user-dashboard-wrapper" style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '8rem 0 4rem', position: 'relative' }}>
                <div className="section-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                    <div className="dashboard-content-fade-in">
                        <Routes>
                            <Route index element={<UserOverview />} />
                            <Route path="services" element={<UserServices />} />
                            <Route path="subscription" element={<UserSubscription />} />
                            <Route path="bookings" element={<UserBookings />} />
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
                    font-family: 'Inter', sans-serif;
                }
                .dashboard-content-fade-in {
                    animation: dashboardFadeIn 0.5s ease-out;
                }
                @keyframes dashboardFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .gold { color: #c9a96a; }
                /* Critical overrides to prevent dark-on-dark text */
                .user-dashboard-wrapper h1, 
                .user-dashboard-wrapper h2, 
                .user-dashboard-wrapper h3,
                .user-dashboard-wrapper p,
                .user-dashboard-wrapper span,
                .user-dashboard-wrapper div {
                    color: inherit;
                }
            `}</style>
        </div>
    );
};

export default UserDashboard;
