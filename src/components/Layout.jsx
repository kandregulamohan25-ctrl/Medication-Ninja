import React, { useState, useEffect } from "react";
import "./Layout.css";
import MenuBar from "./MenuBar";
import StreakCounter from "./StreakCounter";
import { useUser } from "./UserContext";

const Layout = ({ children, currentPage, onNavigate, medicines = [], history = [] }) => {
    const { user } = useUser();
    const [darkMode, setDarkMode] = useState(() => {
        try { return localStorage.getItem("ninja_theme") === "dark"; }
        catch (e) { return false; }
    });

    useEffect(() => {
        if (darkMode) {
            document.body.setAttribute("data-theme", "dark");
            localStorage.setItem("ninja_theme", "dark");
        } else {
            document.body.removeAttribute("data-theme");
            localStorage.setItem("ninja_theme", "light");
        }
    }, [darkMode]);

    return (
        <div className="layout-wrapper">
            <header className="app-controls" role="banner">
                <StreakCounter />
                <MenuBar
                    darkMode={darkMode}
                    toggleTheme={() => setDarkMode(!darkMode)}
                    currentPage={currentPage}
                    onNavigate={onNavigate}
                    medicines={medicines}
                    history={history}
                />
            </header>

            <main className="main-content animate-fade-in" role="main">
                <div className="logo-watermark" aria-hidden="true">Medication Ninja</div>
                {children}
            </main>

            <footer className="app-footer" role="contentinfo">
                <small>&copy; 2026 Medication Ninja &mdash; Fighting Antibiotic Resistance</small>
            </footer>
        </div>
    );
};

export default Layout;
