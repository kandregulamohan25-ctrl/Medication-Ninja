import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculateBodyLoad } from '../utils/DrNinjaAI';
import './BodyMap.css';

const BodyMap = ({ medicines }) => {
    const systems = useMemo(() => calculateBodyLoad(medicines), [medicines]);

    // Color logic: Green (Healthy) -> Orange (Stressed) -> Red (High Resistance Risk)
    const getColor = (val) => {
        if (val > 80) return '#4cc9f0'; // Healthy (Blue/Cyan)
        if (val > 50) return '#f72585'; // Warning (Pink)
        return '#EF233C'; // Danger (Red)
    };

    return (
        <div className="card glass-panel body-map-card">
            <h3 className="section-title">🧬 Biological Resistance Profile</h3>
            <div className="body-container">
                <svg viewBox="0 0 200 400" className="human-svg">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Aura / Outline */}
                    <path d="M100 20 Q130 20 135 60 Q150 70 160 150 L140 180 L140 300 L110 380 L90 380 L60 300 L60 180 L40 150 Q50 70 65 60 Q70 20 100 20 Z"
                        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

                    {/* Brain System */}
                    <motion.circle
                        cx="100" cy="50" r="25"
                        fill={getColor(systems['Brain'])}
                        opacity={0.6}
                        animate={{ opacity: [0.4, 0.7, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        filter="url(#glow)"
                    />
                    <text x="100" y="55" textAnchor="middle" fill="#fff" fontSize="10" opacity="0.8">BRAIN</text>

                    {/* Lungs System */}
                    <motion.path
                        d="M75 100 Q100 110 125 100 Q130 140 100 140 Q70 140 75 100 Z"
                        fill={getColor(systems['Lungs'])}
                        opacity={0.6}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    />
                    <text x="100" y="125" textAnchor="middle" fill="#fff" fontSize="10" opacity="0.8">LUNGS</text>

                    {/* Gut System */}
                    <motion.path
                        d="M85 160 Q115 160 115 200 Q115 230 100 230 Q85 230 85 200 Z"
                        fill={getColor(systems['Gut'])}
                        opacity={0.7}
                    />
                    <text x="100" y="200" textAnchor="middle" fill="#fff" fontSize="10" opacity="0.8">GUT</text>

                </svg>

                {/* Legend / Stats overlay */}
                <div className="system-stats">
                    {Object.keys(systems).map(sys => (
                        <div key={sys} className="stat-row">
                            <span className="stat-label">{sys}</span>
                            <div className="stat-bar-bg">
                                <motion.div
                                    className="stat-bar-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${systems[sys]}%` }}
                                    style={{ backgroundColor: getColor(systems[sys]) }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <p className="ai-note"><small>Visualizing estimated microbiome impact based on intake.</small></p>
        </div>
    );
};

export default BodyMap;
