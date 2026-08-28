import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from './UserContext';
import { supabase } from '../utils/supabaseClient';
import NinjaAvatar from './NinjaAvatar';

const ProfileScreen = () => {
    const { user, updateProfileLocally } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [age, setAge] = useState(user?.age || '');
    const [gender, setGender] = useState(user?.gender || '');
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMsg('');

        try {
            const ageInt = age ? parseInt(age) : null;
            if (ageInt !== null && (ageInt < 0 || ageInt > 120)) {
                throw new Error("Please enter a valid age.");
            }

            const updates = {
                full_name: fullName,
                age: ageInt,
                gender: gender,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            updateProfileLocally(updates);
            setMsg('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setMsg(err.message || 'Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '600px', margin: '0 auto' }}
        >
            <h2 className="section-heading">My Profile</h2>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '100px', height: '100px', margin: '0 auto' }}>
                    <NinjaAvatar expression="happy" />
                </div>
                <h3 style={{ marginTop: '1rem', color: 'var(--text-color)' }}>{user?.full_name || 'Ninja'}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>

            {msg && <div style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '4px', background: msg.includes('success') ? 'rgba(76,201,240,0.1)' : 'rgba(239,35,60,0.1)', color: msg.includes('success') ? '#4cc9f0' : '#EF233C', textAlign: 'center' }}>{msg}</div>}

            <form onSubmit={handleSave}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email (Read Only)</label>
                    <input 
                        type="email" 
                        value={user?.email || ''} 
                        disabled 
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)' }} 
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
                    <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        disabled={!isEditing || isSaving}
                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: isEditing ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)', color: 'var(--text-color)' }} 
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Age</label>
                        <input 
                            type="number" 
                            value={age} 
                            onChange={(e) => setAge(e.target.value)} 
                            disabled={!isEditing || isSaving}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: isEditing ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)', color: 'var(--text-color)' }} 
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Gender</label>
                        <select 
                            value={gender} 
                            onChange={(e) => setGender(e.target.value)} 
                            disabled={!isEditing || isSaving}
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: isEditing ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)', color: 'var(--text-color)', appearance: 'none' }}
                        >
                            <option value="">Select...</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    {!isEditing ? (
                        <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                        </button>
                    ) : (
                        <>
                            <button type="button" onClick={() => setIsEditing(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-color)', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </button>
                        </>
                    )}
                </div>
            </form>
        </motion.div>
    );
};

export default ProfileScreen;
