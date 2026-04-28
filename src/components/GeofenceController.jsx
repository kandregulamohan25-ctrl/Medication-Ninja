import React, { useState, useEffect } from 'react';
import { requestNotificationPermission, sendNotification } from '../utils/NotificationManager';

const GeofenceController = () => {
    const [homeLocation, setHomeLocation] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        const savedHome = localStorage.getItem('ninja_home_location');
        if (savedHome) {
            setHomeLocation(JSON.parse(savedHome));
            checkProximity(JSON.parse(savedHome));
        }
    }, []);

    const setHome = () => {
        if (!navigator.geolocation) {
            setStatus('Geolocation not supported');
            return;
        }

        setStatus('Locating...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const loc = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setHomeLocation(loc);
                localStorage.setItem('ninja_home_location', JSON.stringify(loc));
                setStatus('Home Location Set! 🏠');
                requestNotificationPermission(); // Ask for permission when they engage
                sendNotification("Home Base Established", "We will remind you to check your meds when you arrive here.");
            },
            (error) => {
                setStatus('Location Error: ' + error.message);
            }
        );
    };

    const checkProximity = (home) => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition((position) => {
            const current = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            const distance = calculateDistance(home.lat, home.lng, current.lat, current.lng);

            // If within 100 meters
            if (distance < 0.1) {
                // Check if we already alerted recently to avoid spam (simple sessionStorage check)
                if (!sessionStorage.getItem('home_alert_sent')) {
                    sendNotification("Welcome Home Ninja! 🏠", "Have you taken your medications today?");
                    sessionStorage.setItem('home_alert_sent', 'true');
                }
            }
        });
    };

    // Haversine formula for distance in km
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2 - lat1);
        var dLon = deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    }

    return (
        <div style={{ padding: '10px', fontSize: '0.8rem', color: '#666', borderTop: '1px solid #eee', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>📍 Smart Location</span>
                <button
                    onClick={setHome}
                    style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        background: '#f9f9f9',
                        cursor: 'pointer'
                    }}
                >
                    {homeLocation ? 'Update Home' : 'Set as Home'}
                </button>
            </div>
            {status && <div style={{ marginTop: '5px', color: '#4361ee' }}>{status}</div>}
        </div>
    );
};

export default GeofenceController;
