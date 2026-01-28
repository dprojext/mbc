import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiCheckCircle } from 'react-icons/fi';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const { signup, user, loading: authLoading } = useAuth();
    const { settings } = useData();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user && !authLoading) {
            if (user.role?.toLowerCase() === 'admin') navigate('/admin');
            else navigate('/dashboard');
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signup(name, email, password, phone);
            if (res.success) {
                // Show email confirmation popup instead of navigating
                setShowConfirmation(true);
            } else {
                setError(res.message);
            }
        } catch (err) {
            setError('Account creation failed. Please check your details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Email Confirmation Popup */}
            <AnimatePresence>
                {showConfirmation && (
                    <div className="modal active" style={{ zIndex: 9999 }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            style={{
                                background: 'rgba(24, 24, 24, 0.98)',
                                backdropFilter: 'blur(30px)',
                                borderRadius: '30px',
                                padding: '3rem',
                                maxWidth: '450px',
                                width: '90%',
                                textAlign: 'center',
                                border: '1px solid rgba(201, 169, 106, 0.2)'
                            }}
                        >
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(201,169,106,0.2) 0%, rgba(201,169,106,0.05) 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1.5rem', border: '2px solid rgba(201,169,106,0.3)'
                            }}>
                                <FiMail size={36} color="var(--color-gold)" />
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>
                                Check Your Email
                            </h2>
                            <p style={{ color: '#888', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                                We've sent a confirmation link to <strong style={{ color: 'var(--color-gold)' }}>{email}</strong>.
                                Please click the link in your email to verify your account before signing in.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                                >
                                    <FiCheckCircle style={{ marginRight: '0.5rem' }} /> Go to Login
                                </button>
                                <p style={{ color: '#555', fontSize: '0.8rem' }}>
                                    Didn't receive the email? Check your spam folder.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div
                className="auth-container"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    {settings?.logo && (settings.logo.startsWith('data:') || settings.logo.startsWith('http') || settings.logo.startsWith('/')) ? (
                        <img src={settings.logo} alt={settings.siteName || 'Logo'} style={{ height: '70px', width: 'auto', display: 'block', margin: '0 auto' }} />
                    ) : (
                        <span className="logo-main" style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--color-gold)' }}>{settings?.logo || settings?.siteName || 'MBC'}</span>
                    )}
                </div>

                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join the elite automotive club</p>

                {error && <div style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>
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
                        <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                    </button>
                </form>

                <div className="auth-footer">
                    Already members? <Link to="/login" className="auth-link">Sign In</Link>
                </div>
                <div className="auth-footer" style={{ marginTop: '0.5rem' }}>
                    <Link to="/" className="auth-link" style={{ fontSize: '0.8rem', color: '#666' }}>Back to Home</Link>
                </div>

                {(settings?.documents || []).some(d => d.showOnSignup) && (
                    <div className="auth-footer" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #333', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {(settings?.documents || []).filter(d => d.showOnSignup).map(doc => (
                            <a key={doc.id} href={`#doc-${doc.id}`} className="auth-link" style={{ fontSize: '0.75rem', color: '#555' }}>{doc.name}</a>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Signup;
