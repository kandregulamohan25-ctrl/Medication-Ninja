import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from './UserContext';
import './LoginScreen.css';
import NinjaAvatar from './NinjaAvatar';

const LoginScreen = () => {
    const { login } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setMsg('');
        
        if (!email.trim() || !password.trim()) {
            setErrorMsg("Email and password are required.");
            return;
        }
        
        setIsLoading(true);
        try {
            const data = await login(email, password, isSignUp);
            if (isSignUp && data?.user?.identities?.length === 0) {
                // Supabase sometimes returns this if account exists
                setErrorMsg("Account already exists. Try logging in.");
            } else if (isSignUp && data?.session === null) {
                setMsg("Sign up successful! Please check your email to confirm.");
            }
        } catch (err) {
            setErrorMsg(err.message || "Authentication failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
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
                        <div className="input-wrapper" style={{ marginBottom: '1rem' }}>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="login-input"
                                required
                            />
                            <span className="input-highlight"></span>
                        </div>

                        <div className="input-wrapper" style={{ marginBottom: '1.5rem' }}>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="login-input"
                                required
                                minLength="6"
                            />
                            <span className="input-highlight"></span>
                        </div>

                        {errorMsg && <div style={{ color: '#EF233C', marginBottom: '1rem', fontSize: '0.85rem' }}>{errorMsg}</div>}
                        {msg && <div style={{ color: '#4cc9f0', marginBottom: '1rem', fontSize: '0.85rem' }}>{msg}</div>}

                        <button
                            type="submit"
                            className="btn-login"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Enter Dojo ⛩️')}
                        </button>
                        
                        <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                            <button 
                                type="button" 
                                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setMsg(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LoginScreen;
