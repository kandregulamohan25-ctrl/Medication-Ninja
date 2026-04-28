import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './History.css';

const History = ({ history, onRestore, onDeleteForever }) => {
    return (
        <div className="card history-card">
            <div className="history-header">
                <h3>📜 Medication Archives</h3>
                <span className="history-count">{history.length} Records</span>
            </div>

            {history.length === 0 ? (
                <div className="empty-history">
                    <p>No past medications found.</p>
                    <small>Completed treatments will appear here.</small>
                </div>
            ) : (
                <ul className="history-list">
                    <AnimatePresence>
                        {history.map((med) => (
                            <motion.li
                                key={med.id}
                                className="history-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <div className="history-info">
                                    <strong>{med.name}</strong>
                                    <span className="history-date">Completed: {new Date(med.id).toLocaleDateString()}</span>
                                </div>
                                <div className="history-actions">
                                    <button
                                        className="btn-icon restore"
                                        onClick={() => onRestore(med)}
                                        title="Restore to Active"
                                    >
                                        ♻️
                                    </button>
                                    <button
                                        className="btn-icon delete"
                                        onClick={() => onDeleteForever(med.id)}
                                        title="Delete Forever"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            )}
        </div>
    );
};

export default History;
