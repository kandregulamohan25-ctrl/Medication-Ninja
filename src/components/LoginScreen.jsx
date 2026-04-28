import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './LoginScreen.css';
import NinjaAvatar from './NinjaAvatar';

const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [isExiting, setIsExiting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim() && username.includes('@')) {
            const name = username.split('@')[0];
            const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
            
            // Trigger exit animation before actually logging in
            setIsExiting(true);
            setTimeout(() => {
                onLogin(formattedName);
            }, 600); // Slightly longer than the CSS animation duration
        }
    };

    return (
        <AnimatePresence>
            {!isExiting && (
                <motion.div 
                    className="login-screen"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    key="login-screen-wrapper"
                >
                    <motion.div
                        className="login-card glass-panel"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        key="login-card"
                    >
                        <div className="login-avatar">
                            <NinjaAvatar expression="happy" />
                        </div>

                        <motion.h1
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                        >
                            Medication Ninja
                        </motion.h1>

                        <p className="login-subtitle">Master your health. Join the clan.</p>

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    placeholder="Enter your Email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="login-input"
                                    required
                                />
                                <span className="input-highlight"></span>
                            </div>

                            <button
                                type="submit"
                                className="btn-login"
                            >
                                Enter Dojo 🥋
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoginScreen;
