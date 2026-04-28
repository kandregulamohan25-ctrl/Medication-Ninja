import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { analyzeCondition, speak } from '../utils/DrNinjaAI';
import './Remedies.css';

const Remedies = ({ medicines }) => {
    const { condition, tips, match } = useMemo(() => analyzeCondition(medicines), [medicines]);

    return (
        <div className="card remedies-card">
            <div className="remedies-header">
                <h3>🏠 Dr. Ninja's Advice</h3>
                {match && <span className="ai-badge">Detected: <strong>{condition}</strong></span>}
            </div>

            {!match && <p className="ai-subtitle">General tips for a healthy Ninja.</p>}

            <div className="remedies-grid">
                {tips.map((remedy, index) => (
                    <motion.div
                        className="remedy-item"
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <span className="remedy-icon">{remedy.icon}</span>
                        <div className="remedy-info">
                            <h4>{remedy.title}</h4>
                            <p>{remedy.desc}</p>
                        </div>
                        <button
                            className="btn-speak"
                            onClick={() => speak(`${remedy.title}. ${remedy.desc}`)}
                            title="Listen"
                        >
                            🔊
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Remedies;
