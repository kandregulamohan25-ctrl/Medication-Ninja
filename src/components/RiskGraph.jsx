import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { buildRiskHistory } from '../utils/riskLogic';
import './RiskGraph.css';

const RiskGraph = ({ medicines, history = [] }) => {
    // Generate real data based on history and active medicines
    const data = buildRiskHistory(medicines, history);

    if (!data || data.length === 0) {
        return (
            <motion.div
                className="card risk-graph-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="risk-header">
                    <h3>AMR Risk Trend 📈</h3>
                    <span className="risk-badge low">No Data</span>
                </div>
                <div className="empty-graph-state" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>Start tracking your medicines to see your risk trend over time.</p>
                </div>
            </motion.div>
        );
    }

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
                <span className={`risk-badge ${currentRisk >= 70 ? 'high' : currentRisk >= 40 ? 'medium' : 'low'}`}>
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
                        <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
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
            <p className="graph-note">Calculated based on your actual medication history.</p>
        </motion.div>
    );
};

export default RiskGraph;
