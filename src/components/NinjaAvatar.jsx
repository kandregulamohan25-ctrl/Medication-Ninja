import React from 'react';
import { motion } from 'framer-motion';

const NinjaAvatar = ({ expression = 'neutral' }) => {
    // Colors
    const skinColor = "#FFDFC4";
    const suitColor = "#2B2D42";
    const highlightColor = "#3E4059";
    const headbandColor = "#EF233C";

    // Expression variants
    const getEyeShape = () => {
        switch (expression) {
            case 'happy': return (
                <g>
                    <path d="M35 55 Q40 50 45 55" stroke="black" strokeWidth="3" fill="none" />
                    <path d="M55 55 Q60 50 65 55" stroke="black" strokeWidth="3" fill="none" />
                </g>
            );
            case 'worried': return (
                <g>
                    <circle cx="40" cy="55" r="4" fill="black" />
                    <circle cx="60" cy="55" r="4" fill="black" />
                    <path d="M35 48 Q40 52 45 48" stroke="black" strokeWidth="2" fill="none" />
                    <path d="M55 48 Q60 52 65 48" stroke="black" strokeWidth="2" fill="none" />
                </g>
            );
            default: return (
                <g>
                    <circle cx="40" cy="55" r="5" fill="black" />
                    <circle cx="60" cy="55" r="5" fill="black" />
                </g>
            );
        }
    };

    const getMouth = () => {
        switch (expression) {
            case 'happy': return <path d="M42 65 Q50 72 58 65" stroke="black" strokeWidth="2" fill="none" />;
            case 'worried': return <circle cx="50" cy="68" r="3" fill="black" opacity="0.5" />;
            default: return null; // Mask usually covers mouth
        }
    };

    return (
        <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Drop Shadow */}
            <ellipse cx="50" cy="95" rx="30" ry="5" fill="black" opacity="0.2" />

            {/* Body */}
            <motion.g
                initial={{ y: 0 }}
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
                {/* Torso */}
                <path d="M30 70 Q50 85 70 70 L70 90 L30 90 Z" fill={suitColor} />

                {/* Head Base */}
                <circle cx="50" cy="50" r="30" fill={suitColor} />

                {/* Face Area (Skin) */}
                <path d="M32 45 Q50 35 68 45 L68 60 Q50 75 32 60 Z" fill={skinColor} />

                {/* Headband */}
                <path d="M20 40 Q50 20 80 40 L80 30 Q50 10 20 30 Z" fill={headbandColor} />
                <circle cx="50" cy="35" r="6" fill="#D90429" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />

                {/* Headband Tails (Animated) */}
                <motion.path
                    d="M80 35 Q95 35 100 20"
                    stroke={headbandColor}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    animate={{ d: ["M80 35 Q95 35 100 20", "M80 35 Q95 40 100 25", "M80 35 Q95 35 100 20"] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                />

                {/* Eyes & Expression */}
                {getEyeShape()}
                {getMouth()}

                {/* Hands */}
                {expression === 'worried' ? (
                    <g>
                        <circle cx="25" cy="60" r="6" fill={skinColor} />
                        <circle cx="75" cy="60" r="6" fill={skinColor} />
                    </g>
                ) : (
                    <g>
                        <circle cx="25" cy="75" r="6" fill={skinColor} />
                        <circle cx="75" cy="75" r="6" fill={skinColor} />
                        {expression === 'happy' && <path d="M75 75 L80 70" stroke="black" strokeWidth="2" />}
                    </g>
                )}

            </motion.g>
        </svg>
    );
};

export default NinjaAvatar;
