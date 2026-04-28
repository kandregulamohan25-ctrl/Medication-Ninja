import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import './RiskGraph.css';

const RiskGraph = ({ medicines }) => {
    // Mock logic: Calculate "Risk Score" based on antibiotic count
    // In a real app, this would be historical data. 
    // Here we simulate a timeline based on the current number of meds.

    const generateData = () => {
        const data = [];
        const baseRisk = 10;
        const currentMeds = medicines.length;

        // Simulate 6 months of history
        for (let i = 0; i < 6; i++) {
            let month = `Month ${i + 1}`;
            // Trend: starts low, increases if current meds are high
            let risk = baseRisk + (Math.random() * 10) + (i * currentMeds * 5);
            if (risk > 100) risk = 100;
            data.push({ name: month, risk: Math.round(risk) });
        }
        return data;
    };

    const data = generateData();
    const currentRisk = data[data.length - 1].risk;

    return (
        <motion.div
            className="card risk-graph-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
        >
            <div className="risk-header">
                <h3>AMR Risk Trend 📈</h3>
                <span className={`risk-badge ${currentRisk > 50 ? 'high' : 'low'}`}>
                    Current: {currentRisk}%
                </span>
            </div>

            <div className="graph-container">
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF233C" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#EF233C" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="risk"
                            stroke="#EF233C"
                            fillOpacity={1}
                            fill="url(#colorRisk)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <p className="graph-note">Projected risk based on antibiotic usage frequency.</p>
        </motion.div>
    );
};

export default RiskGraph;
