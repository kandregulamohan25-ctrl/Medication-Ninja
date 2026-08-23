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
                <h3>AMR Risk Indicator</h3>
                <span className="risk-badge" style={{ backgroundColor: assessment.color }}>
                    {assessment.level} {isDoctorMode ? `(${assessment.score}/100)` : ''}
                </span>
            </div>

            {isDoctorMode ? (
                <div className="risk-content doctor-mode-content">
                    <p><strong>Risk Factors:</strong></p>
                    {assessment.factors && assessment.factors.length > 0 ? (
                        <ul className="factors-list">
                            {assessment.factors.map((factor, idx) => (
                                <li key={idx} style={{ marginBottom: '0.5rem' }}>
                                    <strong>{factor.label} ({factor.contribution}):</strong> {factor.explanation}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No elevated risk factors detected based on current exposure data.</p>
                    )}

                    <div className="scientific-disclaimer" style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem' }}>
                        <em>This is a medication-exposure-based screening indicator. It does not confirm antimicrobial resistance and should not replace microbiological susceptibility testing or clinical assessment.</em>
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
                    
                    <p style={{ color: assessment.score > 40 ? assessment.color : 'inherit', fontWeight: assessment.score > 40 ? '500' : 'normal' }}>
                        Your current medication history indicates a {assessment.level.toLowerCase()} estimated antibiotic-exposure risk.
                    </p>
                </div>
            )}
        </div>
    );
};

export default RiskAssessment;
