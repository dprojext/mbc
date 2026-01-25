import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { settings } = useData();
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        console.log("[LOGIN PAGE] Submitting login...");

        try {
            const res = await login(email, password);
            console.log("[LOGIN PAGE] Login result:", res);
            if (res.success) {
                console.log("[LOGIN PAGE] Success! Role:", res.role);
                if (res.requiresPasswordChange) {
                    console.log("[LOGIN PAGE] Redirecting to reset-password");
                    navigate('/reset-password');
                } else if (res.role === 'admin') {
                    console.log("[LOGIN PAGE] Redirecting to /admin");
                    navigate('/admin');
                } else {
                    console.log("[LOGIN PAGE] Redirecting to /dashboard");
                    navigate('/dashboard');
                }
            } else {
                console.log("[LOGIN PAGE] Failed:", res.message);
                setError(res.message);
            }
        } catch (err) {
            console.error("[LOGIN PAGE] Exception:", err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <motion.div
                className="auth-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-logo">
                    {settings?.logo && (settings.logo.startsWith('data:') || settings.logo.startsWith('http') || settings.logo.startsWith('/')) ? (
                        <img src={settings.logo} alt={settings.siteName || 'Logo'} style={{ height: '60px', width: 'auto' }} />
                    ) : (
                        <span className="logo-main" style={{ fontSize: '2rem' }}>{settings?.logo || settings?.siteName || 'MBC'}</span>
                    )}
                </div>

                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to manage your appointments</p>

                {error && <div style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="btn btn-primary" type="submit" style={{ width: '100%' }} disabled={loading}>
                        <span>{loading ? 'Verifying...' : 'Sign In'}</span>
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
                </div>
                <div className="auth-footer" style={{ marginTop: '0.5rem' }}>
                    <Link to="/" className="auth-link" style={{ fontSize: '0.8rem', color: '#666' }}>Back to Home</Link>
                </div>

                {(settings?.documents || []).some(d => d.showInLogin) && (
                    <div className="auth-footer" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #333', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {(settings?.documents || []).filter(d => d.showInLogin).map(doc => (
                            <a key={doc.id} href={`#doc-${doc.id}`} className="auth-link" style={{ fontSize: '0.75rem', color: '#555' }}>{doc.name}</a>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
