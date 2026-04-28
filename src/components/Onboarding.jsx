import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Onboarding.css';

const QUESTIONS = [
    {
        id: 1,
        text: "Did you take antibiotics in the last 3 months?",
        options: [
            { label: "Yes", score: 5 },
            { label: "No", score: 0 }
        ]
    },
    {
        id: 2,
        text: "Do you usually complete the full antibiotic course?",
        options: [
            { label: "Yes", score: 0 },
            { label: "No", score: 10 }
        ]
    },
    {
        id: 3,
        text: "Do you stop taking antibiotics when you feel better?",
        options: [
            { label: "Yes", score: 10 },
            { label: "No", score: 0 }
        ]
    },
    {
        id: 4,
        text: "Do you ever reuse old prescriptions?",
        options: [
            { label: "Yes", score: 15 },
            { label: "No", score: 0 }
        ]
    }
];

const Onboarding = ({ onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [totalScore, setTotalScore] = useState(0);

    const handleAnswer = (score) => {
        const newScore = totalScore + score;
        
        if (currentIndex < QUESTIONS.length - 1) {
            setTotalScore(newScore);
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete(newScore);
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-overlay"></div>
            <motion.div 
                className="onboarding-card card"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
            >
                <div className="onboarding-header">
                    <h2>Ninja Training</h2>
                    <span className="progress">Question {currentIndex + 1} of {QUESTIONS.length}</span>
                </div>
                
                <div className="question-wrapper">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="question-content"
                        >
                            <h3>{QUESTIONS[currentIndex].text}</h3>
                            <div className="options-grid">
                                {QUESTIONS[currentIndex].options.map((opt, i) => (
                                    <button 
                                        key={i} 
                                        className="btn btn-option"
                                        onClick={() => handleAnswer(opt.score)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
