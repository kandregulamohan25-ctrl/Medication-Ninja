import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getClass } from '../utils/riskLogic';
import './Analytics.css';

const Analytics = ({ medicines, history = [] }) => {
    const activeCount = medicines.length;

    const totalXP = useMemo(() => {
        let xp = 0;
        
        // Avoiding unnecessary antibiotics
        const activeAntibiotics = medicines.filter(m => getClass(m.name));
        if (activeAntibiotics.length === 0) {
            xp += 50; 
        }

        // Process history
        const historyAntibiotics = history.filter(m => getClass(m.name));
        
        historyAntibiotics.forEach((med, index) => {
            const duration = parseInt(med.duration) || 0;
            // Completing full antibiotic course -> +XP
            if (duration >= 5) {
                xp += 40;
            } 
            // Stopping early -> -XP
            else {
                xp -= 30;
            }

            // Repeating same antibiotic frequently -> -XP
            const previousMeds = historyAntibiotics.slice(index + 1);
            if (previousMeds.some(p => p.name.toLowerCase() === med.name.toLowerCase())) {
                xp -= 25;
            } else if (previousMeds.some(p => getClass(p.name) === getClass(med.name))) {
                xp -= 15;
            }
        });

        // Baseline XP for app usage (non-antibiotic history)
        const nonAntibioticHistory = history.filter(m => !getClass(m.name));
        xp += nonAntibioticHistory.length * 10;

        return Math.max(0, xp);
    }, [medicines, history]);

    const ninjaLevel = Math.floor(totalXP / 100) + 1;
    const xpProgress = totalXP % 100;

    const data = [
        { name: 'Active', value: activeCount },
        { name: 'Slots', value: Math.max(0, 10 - activeCount) }, // 10 slots max for visualization
    ];

    const COLORS = ['#EF233C', '#E0E0E0'];

    return (
        <motion.div
            className="card analytics-card"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
        >
            <div className="analytics-header">
                <h3>Ninja Stats 📊</h3>
                <div className="level-badge">Lv. {ninjaLevel}</div>
            </div>

            <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-label">Mission Load</span>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={120}>
                            <PieChart>
                                <Pie
                                    data={data}
                                    innerRadius={35}
                                    outerRadius={50}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="circle-text">
                            <strong>{activeCount}</strong>
                            <small>Items</small>
                        </div>
                    </div>
                </div>

                <div className="stat-item xp-section">
                    <span className="stat-label">XP Progress</span>
                    <div className="xp-bar-container">
                        <motion.div
                            className="xp-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                    <p className="xp-text">{xpProgress} / 100 XP to Next Level</p>
                </div>
            </div>
        </motion.div>
    );
};

export default Analytics;
