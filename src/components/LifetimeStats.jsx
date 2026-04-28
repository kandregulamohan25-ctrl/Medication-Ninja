import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './LifetimeStats.css';

const LifetimeStats = ({ history }) => {
    // Mock logic for "Compatibility Score"
    // Start at 100%. Deduct 2% for every antibiotic course in history.
    const calculateScore = () => {
        let penalty = 0;
        history.forEach(med => {
            const name = med.name.toLowerCase();
            if (['amoxicillin', 'ciprofloxacin', 'azithromycin', 'augmentin'].some(ab => name.includes(ab))) {
                penalty += 2; // 2% penalty per antibiotic
            } else {
                penalty += 0.5; // 0.5% penalty for general meds (liver load)
            }
        });

        let score = 100 - penalty;
        if (score < 0) score = 0;
        return parseFloat(score.toFixed(1));
    };

    const score = calculateScore();
    const antibioticsCount = history.filter(med =>
        ['amoxicillin', 'ciprofloxacin', 'azithromycin'].some(ab => med.name.toLowerCase().includes(ab))
    ).length;

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
                    <p className="danger-text"><strong>{antibioticsCount}</strong> Antibiotic Courses</p>
                    <small>Each course leaves a footprint. Keep your score high!</small>
                </div>
            </div>
        </motion.div>
    );
};

export default LifetimeStats;
