import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import ThemeInjector from './components/ThemeInjector';
import DocumentViewer from './components/DocumentViewer';
import ScrollToTop from './components/ScrollToTop';
import { ToastProvider } from './context/ToastContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid rgba(201, 169, 106, 0.1)',
        borderTopColor: '#c9a96a',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <div style={{
        fontFamily: 'var(--font-heading)',
        color: '#c9a96a',
        letterSpacing: '0.2em',
        fontSize: '0.8rem',
        textTransform: 'uppercase'
      }}>
        Authenticating Securely...
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  // Mandatory password reset check
  if (user.requiresPasswordChange && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />;
  }

  if (role && user.role?.toLowerCase() !== role.toLowerCase()) return <Navigate to="/" replace />;
  return children;
};

// Analytics Tracker Component
const PageTracker = () => {
  const location = useLocation();
  const { logAnalyticsEvent } = useData();
  const { user } = useAuth();

  React.useEffect(() => {
    logAnalyticsEvent({
      event_type: 'page_view',
      page_path: location.pathname,
      user_id: user?.id || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }, [location.pathname, user?.id]);

  return null;
};

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <ToastProvider>
          <ThemeInjector />
          <DocumentViewer />
          <ScrollToTop />
          <AuthProvider>
            <PageTracker />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={
                <ProtectedRoute>
                  <ResetPassword />
                </ProtectedRoute>
              } />

              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } />

              <Route path="/booking" element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin-bookings" element={<Navigate to="/admin/calendar" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
