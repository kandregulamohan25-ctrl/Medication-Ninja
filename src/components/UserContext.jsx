import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabaseClient';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                if (session?.user) {
                    await handleUserSession(session.user);
                } else {
                    if (isMounted) setUser(null);
                }
            } catch (err) {
                console.error("Auth init error:", err.message);
                if (isMounted) setUser(null);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initializeAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await handleUserSession(session.user);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('medication_ninja_user');
            }
        });

        return () => {
            isMounted = false;
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    const handleUserSession = async (authUser) => {
        try {
            // Check if profile exists
            let { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            // If table doesn't exist yet (PGRST205) or row doesn't exist, handle gracefully
            if (error && error.code === 'PGRST116') {
                // No rows found, create one
                const newProfile = {
                    id: authUser.id,
                    full_name: authUser.email.split('@')[0],
                    age: null,
                    gender: null,
                    avatar_url: 'ninja-happy.png'
                };
                const { data: inserted, error: insertError } = await supabase
                    .from('profiles')
                    .insert([newProfile])
                    .select()
                    .single();
                
                if (insertError) throw insertError;
                profile = inserted;
            } else if (error) {
                console.error("Profile fetch error:", error.message);
                // Fallback to basic auth user info if profiles table is missing temporarily
                profile = {
                    id: authUser.id,
                    full_name: authUser.email.split('@')[0],
                    avatar_url: 'ninja-happy.png'
                };
            }

            // Streak Logic
            const now = new Date();
            let newStreak = 1;
            const savedUserStr = localStorage.getItem('medication_ninja_user');
            if (savedUserStr) {
                try {
                    const parsed = JSON.parse(savedUserStr);
                    if (parsed.id === authUser.id) {
                        const lastLogin = parsed.lastLogin ? new Date(parsed.lastLogin) : new Date();
                        const diffHours = Math.abs(now - lastLogin) / 36e5;
                        if (diffHours >= 24 && diffHours < 48) newStreak = (parsed.streak || 1) + 1;
                        else if (diffHours < 24) newStreak = parsed.streak || 1;
                    }
                } catch (e) {}
            }

            const combinedUser = {
                ...profile,
                email: authUser.email,
                streak: newStreak,
                lastLogin: now.toISOString(),
                onboardingCompleted: true,
                baseRiskScore: 0
            };

            setUser(combinedUser);
            localStorage.setItem('medication_ninja_user', JSON.stringify(combinedUser));

        } catch (err) {
            console.error("Session handler error:", err.message);
            // Fallback so user isn't permanently locked out of UI
            setUser({ id: authUser.id, email: authUser.email, full_name: authUser.email.split('@')[0], onboardingCompleted: true });
        }
    };

    const login = async (email, password, isSignUp) => {
        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
    };

    const completeOnboarding = (baseRiskScore) => {
        if (user) setUser({ ...user, baseRiskScore });
    };

    const updateProfileLocally = (updatedData) => {
        if (user) {
            const newUser = { ...user, ...updatedData };
            setUser(newUser);
            localStorage.setItem('medication_ninja_user', JSON.stringify(newUser));
        }
    };

    return (
        <UserContext.Provider value={{ user, loading, login, logout, completeOnboarding, updateProfileLocally }}>
            {children}
        </UserContext.Provider>
    );
};
