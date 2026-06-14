import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getClass } from '../utils/riskLogic';
import './LifetimeStats.css';

const LifetimeStats = ({ history }) => {
    // Better logic for "Compatibility Score"
    // Start at 100%. Deduct points based on type and duration of antibiotic courses.
    const calculateScore = () => {
        let penalty = 0;
        history.forEach(med => {
            const medClass = getClass(med.name);
            const duration = parseInt(med.duration || 0);

            if (medClass) {
                // Base penalty for antibiotic course
                let base = 2;
                // Higher penalty for heavy antibiotics
                if (['fluoroquinolone', 'nitroimidazole', 'lincosamide', 'glycopeptide'].includes(medClass)) {
                    base = 3.5;
                }
                
                // Penalty for incomplete courses (duration < 5 usually implies stopped early)
                if (duration > 0 && duration < 5) {
                    base += 2; // Extra penalty for short/incomplete course
                }

                penalty += base;
            } else {
                penalty += 0.5; // 0.5% penalty for general meds (liver load)
            }
        });

        let score = 100 - penalty;
        if (score < 0) score = 0;
        return parseFloat(score.toFixed(1));
    };

    const score = calculateScore();
    const antibioticsCount = history.filter(med => getClass(med.name) !== null).length;

    const data = [
        { name: 'Compatibility', value: score },
        { name: 'Load', value: 100 - score }
    ];

    const COLORS = ['#2ec4b6', '#ef233c']; // Green (Good), Red (Bad)

    return (
        <motion.div
            className="card lifetime-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
        >
            <div className="lifetime-header">
                <h3>🧬 Body Compatibility</h3>
                <span className="coming-soon-badge">Beta</span>
            </div>

            <div className="stats-row">
                <div className="chart-wrapper">
                    <ResponsiveContainer width={100} height={100}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx={50}
                                cy={50}
                                innerRadius={30}
                                outerRadius={45}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-center-text">
                        <strong>{score}%</strong>
                    </div>
                </div>

                <div className="stats-details">
                    <p><strong>{history.length}</strong> Total Treatments</p>
                    <p className={antibioticsCount > 0 ? "danger-text" : ""}><strong>{antibioticsCount}</strong> Antibiotic Courses</p>
                    <small>Each course leaves a footprint. Keep your score high!</small>
                </div>
            </div>
        </motion.div>
    );
};

export default LifetimeStats;
