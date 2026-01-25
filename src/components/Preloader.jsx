import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2200);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            className="preloader"
            id="preloader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="preloader-content">
                <div className="logo-animation">
                    <span className="logo-letter">M</span>
                    <span className="logo-letter">B</span>
                    <span className="logo-letter">C</span>
                </div>
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
            </div>
        </motion.div>
    );
};

export default Preloader;
