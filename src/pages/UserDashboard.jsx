import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import UserOverview from './user/UserOverview';
import UserServices from './user/UserServices';
import UserSubscription from './user/UserSubscription';
import UserBookings from './user/UserBookings';
import UserChat from './user/UserChat';
import UserNotificationCenter from './user/UserNotificationCenter';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const UserDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();

    return (
        <div style={{ background: '#050505', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <main style={{ flex: 1, padding: '8rem 0 4rem' }}>
                <div className="section-container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Routes>
                                <Route index element={<UserOverview />} />
                                <Route path="services" element={<UserServices />} />
                                <Route path="subscription" element={<UserSubscription />} />
                                <Route path="bookings" element={<UserBookings />} />
                                <Route path="chat" element={<UserChat />} />
                                <Route path="notifications" element={<UserNotificationCenter />} />
                            </Routes>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <Footer />

            <style>{`
                .user-overview, .user-services, .user-subscription, .user-bookings, .user-chat-container, .user-notifications {
                    animation: fadeIn 0.4s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .gold { color: var(--color-gold); }
            `}</style>
        </div>
    );
};

export default UserDashboard;
