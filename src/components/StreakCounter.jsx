import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from './UserContext';
import './StreakCounter.css';

const StreakCounter = () => {
    const { user } = useUser();
    const streak = user?.streak || 0;

    if (streak === 0) return null;

    return (
        <motion.div
            className="streak-container"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            title={`You are on a ${streak} day streak!`}
        >
            <span className="streak-icon">🔥</span>
            <span className="streak-count">{streak}</span>
        </motion.div>
    );
};

export default StreakCounter;
