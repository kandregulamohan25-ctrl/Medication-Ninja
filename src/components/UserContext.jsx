import React, { useState, useEffect, createContext, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    // Temporary Guest Session: bypasses login screen and onboarding to guarantee mobile access
    const [user, setUser] = useState({
        name: 'Guest Explorer',
        avatar: 'ninja-happy.png',
        level: 1,
        streak: 1,
        onboardingCompleted: true,
        baseRiskScore: 0,
        lastLogin: new Date().toISOString()
    });

    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('medication_ninja_user');
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                if (!parsedUser) return;

                // Streak Logic
                const now = new Date();
                const lastLogin = parsedUser.lastLogin ? new Date(parsedUser.lastLogin) : new Date();
                const diffHours = Math.abs(now - lastLogin) / 36e5;

                let newStreak = parsedUser.streak || 1;

                if (diffHours >= 24 && diffHours < 48) {
                    newStreak += 1;
                } else if (diffHours >= 48) {
                    newStreak = 1;
                }

                const updatedUser = { ...parsedUser, lastLogin: now.toISOString(), streak: newStreak };
                setUser(updatedUser);
                localStorage.setItem('medication_ninja_user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.warn("Storage restricted (e.g. Mobile Safari / Incognito). Running in temporary session mode.", error);
        }
    }, []);

    const login = (name) => {
        const newUser = {
            name,
            avatar: 'ninja-happy.png',
            level: 1,
            streak: 1,
            onboardingCompleted: true,
            baseRiskScore: 0,
            lastLogin: new Date().toISOString()
        };
        setUser(newUser);
        try {
            localStorage.setItem('medication_ninja_user', JSON.stringify(newUser));
        } catch (e) {
            console.warn("Could not save to localStorage. Session is temporary.");
        }
    };

    const completeOnboarding = (baseRiskScore) => {
        const updatedUser = { ...user, onboardingCompleted: true, baseRiskScore };
        setUser(updatedUser);
        try {
            localStorage.setItem('medication_ninja_user', JSON.stringify(updatedUser));
        } catch(e) {}
    };

    const logout = () => {
        setUser(null); // This will re-trigger the login screen if they explicitly click logout
        try {
            localStorage.removeItem('medication_ninja_user');
        } catch(e) {}
    }

    return (
        <UserContext.Provider value={{ user, login, logout, completeOnboarding }}>
            {children}
        </UserContext.Provider>
    );
};
