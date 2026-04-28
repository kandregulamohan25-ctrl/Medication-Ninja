import React, { useMemo, useState } from 'react';
import { calculateRisk } from '../utils/riskLogic';
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
                        {assessment.messages.map((msg, idx) => (
                            <li key={idx}>{msg}</li>
                        ))}
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
                    <p>Keep tracking your medicines to maintain a healthy ninja status!</p>
                </div>
            )}
        </div>
    );
};

export default RiskAssessment;
