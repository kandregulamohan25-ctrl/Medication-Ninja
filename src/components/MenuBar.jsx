import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from './UserContext';
import './MenuBar.css';

import { generateDoctorReport } from '../utils/DoctorExport';
import GeofenceController from './GeofenceController';

const MenuBar = ({ darkMode, toggleTheme, currentPage, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useUser();

    const handleExport = () => {
        // Mock calculation for report (In real app, pass actual risk/score)
        generateDoctorReport(user, [], [], 'Moderate', 85);
        setIsOpen(false);
    };

    const handleNavigate = (page) => {
        if (onNavigate) {
            onNavigate(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setIsOpen(false);
    };

    const toggleOpen = () => setIsOpen(!isOpen);

    const menuVariants = {
        closed: { x: "-100%", transition: { type: "spring", stiffness: 400, damping: 40 } }, // Slide from LEFT
        open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    return (
        <>
            <button className="menu-toggle fab-interaction" onClick={toggleOpen} aria-label="Open navigation menu">
                <div className={`hamburger ${isOpen ? 'open' : ''}`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="menu-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={toggleOpen}
                        />

                        <motion.div
                            className="menu-sidebar glass-panel"
                            variants={menuVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            role="dialog"
                            aria-label="Navigation menu"
                        >
                            <div className="menu-header">
                                <h2>Ninja Scroll</h2>
                                <button className="btn-close-menu" onClick={toggleOpen} aria-label="Close menu">×</button>
                            </div>

                            <div className="user-profile-section">
                                <div className="profile-avatar">
                                    <div className="avatar-circle">{user?.name?.charAt(0) || 'N'}</div>
                                </div>
                                <h3>{user?.name || 'Ninja'}</h3>
                                <div className="user-stats-mini">
                                    <span>Level {user?.level || 1}</span> • <span>XP: {(user?.level || 1) * 100}</span>
                                </div>
                            </div>

                            <nav className="menu-nav" aria-label="Sidebar navigation">
                                <button
                                    className={`menu-item ${currentPage === 'home' ? 'active' : ''}`}
                                    onClick={() => handleNavigate('home')}
                                >
                                    🏠 Home
                                </button>
                                <button
                                    className={`menu-item ${currentPage === 'insights' ? 'active' : ''}`}
                                    onClick={() => handleNavigate('insights')}
                                >
                                    📊 Health Insights
                                </button>
                                <button
                                    className={`menu-item ${currentPage === 'learn' ? 'active' : ''}`}
                                    onClick={() => handleNavigate('learn')}
                                >
                                    📚 Knowledge Dojo
                                </button>

                                <div className="divider"></div>

                                <button className="menu-item" onClick={() => toggleTheme()}>
                                    {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                                </button>
                                <button className="menu-item" onClick={handleExport}>📄 Export Doctor Report</button>

                                <div className="divider"></div>

                                <button className="menu-item logout" onClick={logout}>
                                    🚪 Logout
                                </button>
                            </nav>

                            <div className="menu-footer">
                                <GeofenceController />
                                <small>Medication Ninja v2.1</small>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default MenuBar;
