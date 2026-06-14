import React, { useMemo, useState } from 'react';
import { calculateRisk } from '../utils/riskLogic';
import { motion } from 'framer-motion';
import './RiskAssessment.css';

const RiskAssessment = ({ medicines, history = [], baseRiskScore = 0 }) => {
    const [isDoctorMode, setIsDoctorMode] = useState(false);

    const assessment = useMemo(() => {
        return calculateRisk(medicines, history, baseRiskScore);
    }, [medicines, history, baseRiskScore]);

    return (
        <div className="card risk-card">
            <div className="mode-toggle-wrapper">
                <button 
                    className={`toggle-btn ${!isDoctorMode ? 'active' : ''}`}
                    onClick={() => setIsDoctorMode(false)}
                >
                    User Mode
                </button>
                <button 
                    className={`toggle-btn ${isDoctorMode ? 'active' : ''}`}
                    onClick={() => setIsDoctorMode(true)}
                >
                    Doctor Mode
                </button>
            </div>

            <div className="risk-header" style={{ borderLeft: `6px solid ${assessment.color}` }}>
                <h3>AMR Risk Level</h3>
                <span className="risk-badge" style={{ backgroundColor: assessment.color }}>
                    {assessment.level} {isDoctorMode && assessment.score > 0 ? `(${assessment.score}/100)` : ''}
                </span>
            </div>

            {isDoctorMode ? (
                <div className="risk-content doctor-mode-content">
                    <p><strong>Explanation:</strong></p>
                    <ul>
                        {assessment.messages.length > 0 ? assessment.messages.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                        )) : <li>No active risk factors detected.</li>}
                    </ul>

                    {assessment.level === 'High' && (
                        <div className="alert-box">
                            <strong>Warning: High Risk Detected.</strong> Elevated risk of developing antimicrobial resistance or disrupting the microbiome.
                        </div>
                    )}

                    <div className="suggestion-box">
                        <strong>Safer Behavior Suggestion:</strong> Ensure full course completion, strictly follow dosage intervals, and avoid prescribing the same antibiotic class repeatedly unless clinically necessary.
                    </div>
                </div>
            ) : (
                <div className="risk-content user-mode-content">
                    <div className="risk-meter-container" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        <div className="risk-meter-bg" style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                            <motion.div 
                                className="risk-meter-fill" 
                                initial={{ width: 0 }}
                                animate={{ width: `${assessment.score}%` }}
                                style={{ height: '100%', backgroundColor: assessment.color }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            <span>Low Risk</span>
                            <span>High Risk</span>
                        </div>
                    </div>
                    
                    {assessment.score > 40 ? (
                        <p style={{ color: assessment.color, fontWeight: '500' }}>
                            Your current active courses have increased your resistance risk. Be sure to complete the full course as prescribed!
                        </p>
                    ) : (
                        <p>Keep tracking your medicines to maintain a healthy ninja status!</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default RiskAssessment;
