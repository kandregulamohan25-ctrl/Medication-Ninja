import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("Install prompt not ready yet. Ensure you are visiting via HTTPS or localhost, and that the app is not already installed.");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsVisible(false);
        }
    };

    if (!isVisible) {
        // Debug / Manual Trigger for troubleshooting
        return (
            <div style={{ position: 'fixed', bottom: '10px', left: '10px', zIndex: 9999 }}>
                <button
                    onClick={() => {
                        if (deferredPrompt) {
                            setIsVisible(true);
                        } else {
                            alert("🛑 Browser has NOT fired the install event yet.\n\nPossible reasons:\n1. App is already installed.\n2. Running in Incognito.\n3. Browser doesn't support PWA install.\n4. Page not fully loaded.");
                        }
                    }}
                    style={{ fontSize: '0.7rem', opacity: 0.5, background: '#eee', border: '1px solid #ccc', padding: '2px 5px' }}
                >
                    Debug Install
                </button>
            </div>
        );
    }

    return (
        <div className="install-prompt">
            <div className="install-content">
                <span className="install-icon">📲</span>
                <div className="install-text">
                    <strong>Install App</strong>
                    <span>Add to Home Screen for offline access</span>
                </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleInstallClick}>
                Install
            </button>
            <button className="btn-close" onClick={() => setIsVisible(false)}>×</button>
        </div>
    );
};

export default InstallPrompt;
