import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import { FiLock, FiCheck, FiAlertCircle } from 'react-icons/fi';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match');
        }
        if (newPassword.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);
        setError('');

        try {
            // 1. Update password in Supabase Auth
            const { error: authError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (authError) throw authError;

            // 2. Update profiles table flag
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ requires_password_change: false })
            if (profileError) throw profileError;

            // 3. Sync React State
            await refreshProfile();

            // 4. Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050505',
            padding: '2rem'
        }}>
            <motion.div
                className="auth-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'rgba(15,15,15,0.8)',
                    padding: '3rem',
                    borderRadius: '24px',
                    border: '1px solid #222',
                    width: '100%',
                    maxWidth: '450px',
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center'
                }}
            >
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(var(--color-gold-rgb), 0.1)',
                    margin: '0 auto 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-gold)',
                    fontSize: '1.5rem'
                }}>
                    <FiLock />
                </div>

                <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>Secure Your Account</h2>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Please set a new password to continue.</p>

                {error && (
                    <div style={{
                        background: 'rgba(255,68,68,0.1)',
                        color: '#ff4444',
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <FiAlertCircle /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ color: '#444', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                        <input
                            type="password"
                            placeholder="At least 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#0a0a0a',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                color: '#fff',
                                outline: 'none',
                                transition: '0.2s'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ color: '#444', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '0.5rem' }}>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Repeat your new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: '#0a0a0a',
                                border: '1px solid #333',
                                borderRadius: '12px',
                                color: '#fff',
                                outline: 'none',
                                transition: '0.2s'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1.2rem',
                            background: 'var(--color-gold)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.8rem',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Updating...' : <><FiCheck /> Update Password & Continue</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
