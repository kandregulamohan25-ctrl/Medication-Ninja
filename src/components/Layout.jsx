import React, { useState, useEffect } from 'react';
import './Layout.css';
import MenuBar from './MenuBar';
import StreakCounter from './StreakCounter';
import { useUser } from './UserContext';

const Layout = ({ children }) => {
    const { user, login, logout } = useUser();
    const [darkMode, setDarkMode] = useState(() => {
        try {
            return localStorage.getItem('ninja_theme') === 'dark';
        } catch (e) {
            console.log('Theme persistence error', e);
            return false;
        }
    });
    const [activeUsers, setActiveUsers] = useState(1240);

    useEffect(() => {
        // Mock live counter
        const interval = setInterval(() => {
            setActiveUsers(prev => prev + Math.floor(Math.random() * 3) - 1);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('ninja_theme', 'dark');
        } else {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('ninja_theme', 'light');
        }
    }, [darkMode]);

    return (
        <div className="layout-wrapper">
            <div className="app-controls">
                <StreakCounter />
                <MenuBar
                    medicines={children.props?.medicines}
                    history={children.props?.history}
                    darkMode={darkMode}
                    toggleTheme={() => setDarkMode(!darkMode)}
                />
            </div>

            <main className="main-content container animate-fade-in">
                <div className="logo-watermark">Medication Ninja</div>
                {children}
            </main>
        </div >
    );
};

export default Layout;
