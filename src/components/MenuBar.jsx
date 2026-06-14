import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "./UserContext";
import { getClass } from "../utils/riskLogic";
import "./MenuBar.css";
import { generateDoctorReport } from "../utils/DoctorExport";
import GeofenceController from "./GeofenceController";

const MenuBar = ({ darkMode, toggleTheme, currentPage, onNavigate, medicines = [], history = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useUser();

    const totalXP = useMemo(() => {
        let xp = 0;
        const activeAntibiotics = medicines.filter(m => getClass(m.name));
        if (activeAntibiotics.length === 0) xp += 50;
        const historyAntibiotics = history.filter(m => getClass(m.name));
        historyAntibiotics.forEach((med, index) => {
            const duration = parseInt(med.duration) || 0;
            if (duration >= 5) xp += 40;
            else xp -= 30;
            const previousMeds = historyAntibiotics.slice(index + 1);
            if (previousMeds.some(p => p.name.toLowerCase() === med.name.toLowerCase())) xp -= 25;
            else if (previousMeds.some(p => getClass(p.name) === getClass(med.name))) xp -= 15;
        });
        const nonAntibioticHistory = history.filter(m => !getClass(m.name));
        xp += nonAntibioticHistory.length * 10;
        return Math.max(0, xp);
    }, [medicines, history]);

    const ninjaLevel = Math.floor(totalXP / 100) + 1;
    const xpProgress = totalXP % 100;
    const activeCount = medicines.length;

    const handleExport = () => { generateDoctorReport(user, medicines, history, "Moderate", 85); setIsOpen(false); };
    const handleNavigate = (page) => { if (onNavigate) { onNavigate(page); window.scrollTo({ top: 0, behavior: "smooth" }); } setIsOpen(false); };
    const toggleOpen = () => setIsOpen(!isOpen);

    const menuVariants = {
        closed: { x: "-100%", transition: { type: "spring", stiffness: 400, damping: 40 } },
        open:   { x: 0,      transition: { type: "spring", stiffness: 300, damping: 30 } }
    };

    return (
        <>
            <button className="menu-toggle" onClick={toggleOpen} aria-label="Open navigation menu">
                <div className={`hamburger ${isOpen ? "open" : ""}`}>
                    <span></span><span></span><span></span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div className="menu-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleOpen} />
                        <motion.div className="menu-sidebar" variants={menuVariants} initial="closed" animate="open" exit="closed" role="dialog" aria-label="Navigation menu">

                            <div className="menu-header">
                                <span className="menu-logo">🥷 Ninja Scroll</span>
                                <button className="btn-close-menu" onClick={toggleOpen} aria-label="Close menu">✕</button>
                            </div>

                            <div className="user-profile-section">
                                <div className="avatar-circle">{user?.name?.charAt(0)?.toUpperCase() || "N"}</div>
                                <h3 className="user-name">{user?.name || "Ninja"}</h3>

                                <div className="ninja-stats-panel">
                                    <div className="stats-row-top">
                                        <div className="stat-chip">
                                            <span className="stat-chip-label">Level</span>
                                            <span className="stat-chip-value">{ninjaLevel}</span>
                                        </div>
                                        <div className="stat-chip">
                                            <span className="stat-chip-label">Meds</span>
                                            <span className="stat-chip-value">{activeCount}</span>
                                        </div>
                                        <div className="stat-chip">
                                            <span className="stat-chip-label">Total XP</span>
                                            <span className="stat-chip-value">{totalXP}</span>
                                        </div>
                                    </div>
                                    <div className="xp-section">
                                        <div className="xp-label-row">
                                            <span>XP Progress</span>
                                            <span>{xpProgress} / 100</span>
                                        </div>
                                        <div className="xp-bar-track">
                                            <motion.div className="xp-bar-fill" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} />
                                        </div>
                                        <p className="xp-next">Next level in {100 - xpProgress} XP</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="menu-nav" aria-label="Sidebar navigation">
                                <button className={`menu-item ${currentPage === "home" ? "active" : ""}`} onClick={() => handleNavigate("home")}>🏠 Home</button>
                                <button className={`menu-item ${currentPage === "insights" ? "active" : ""}`} onClick={() => handleNavigate("insights")}>📊 Health Insights</button>
                                <button className={`menu-item ${currentPage === "learn" ? "active" : ""}`} onClick={() => handleNavigate("learn")}>📚 Knowledge Dojo</button>
                                <div className="divider" />
                                <button className="menu-item" onClick={toggleTheme}>{darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}</button>
                                <button className="menu-item" onClick={handleExport}>📄 Export Doctor Report</button>
                            </nav>

                            <div className="menu-footer">
                                <GeofenceController />
                                <button className="menu-item logout" onClick={logout}>🚪 Logout</button>
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
