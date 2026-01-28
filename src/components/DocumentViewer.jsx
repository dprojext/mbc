import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const DocumentViewer = () => {
    const { settings } = useData();
    const [activeDoc, setActiveDoc] = useState(null);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.startsWith('#doc-')) {
                const docIdStr = hash.replace('#doc-', '');
                // Try finding by direct string ID first, then by numeric conversion
                const doc = settings?.documents?.find(d => String(d.id) === docIdStr || String(d.id) === `doc-${docIdStr}`);
                if (doc) {
                    setActiveDoc(doc);
                }
            } else if (activeDoc) {
                setActiveDoc(null);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Check on initial load

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [settings, activeDoc]);

    const closeModal = () => {
        setActiveDoc(null);
        // Clear hash without jump
        window.history.pushState("", document.title, window.location.pathname + window.location.search);
    };

    return (
        <AnimatePresence>
            {activeDoc && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 11000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)' }}
                    />
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '800px',
                            maxHeight: '80vh',
                            background: '#1a1a1a',
                            borderRadius: '16px',
                            border: '1px solid #333',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontFamily: 'var(--font-heading)' }}>{activeDoc.name}</h2>
                                <p style={{ margin: '0.2rem 0 0', color: '#666', fontSize: '0.8rem' }}>Last Updated: {activeDoc.date}</p>
                            </div>
                            <button onClick={closeModal} style={{ background: '#222', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <FiX />
                            </button>
                        </div>
                        <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', color: '#ccc', lineHeight: '1.8' }}>
                            <div className="legal-content-render" dangerouslySetInnerHTML={{ __html: activeDoc.content }} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DocumentViewer;
