import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
                pointerEvents: 'none'
            }}>
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.9 }}
                            style={{
                                background: '#111',
                                border: `1px solid ${toast.type === 'success' ? '#4caf5033' :
                                        toast.type === 'error' ? '#ff444433' : '#c9a96a33'
                                    }`,
                                backdropFilter: 'blur(10px)',
                                padding: '1rem 1.5rem',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                color: '#fff',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                pointerEvents: 'auto',
                                minWidth: '300px'
                            }}
                        >
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `${toast.type === 'success' ? '#4caf5015' :
                                        toast.type === 'error' ? '#ff444415' : '#c9a96a15'
                                    }`,
                                color: toast.type === 'success' ? '#4caf50' :
                                    toast.type === 'error' ? '#ff4444' : '#c9a96a'
                            }}>
                                {toast.type === 'success' ? <FiCheckCircle /> :
                                    toast.type === 'error' ? <FiAlertCircle /> : <FiInfo />}
                            </div>
                            <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: '500' }}>
                                {toast.message}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '4px' }}
                            >
                                <FiX />
                            </button>
                            {/* Progress bar */}
                            <motion.div
                                initial={{ width: '100%' }}
                                animate={{ width: 0 }}
                                transition={{ duration: 4, ease: 'linear' }}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    height: '2px',
                                    background: toast.type === 'success' ? '#4caf50' :
                                        toast.type === 'error' ? '#ff4444' : '#c9a96a',
                                    borderRadius: '0 0 16px 16px'
                                }}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
