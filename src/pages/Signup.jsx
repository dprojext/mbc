import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { motion } from 'framer-motion';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const { settings } = useData();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await signup(name, email, password, phone);
            if (res.success) {
                navigate('/dashboard');
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
            </motion.div>
        </div>
    );
};

export default Signup;
