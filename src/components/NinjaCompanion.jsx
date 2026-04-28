import React, { useEffect, useState } from 'react';
import { speak } from '../utils/DrNinjaAI';
import NinjaAvatar from './NinjaAvatar';
import './NinjaCompanion.css';

const NinjaCompanion = ({ riskLevel }) => {
    const [expression, setExpression] = useState('neutral');
    const [message, setMessage] = useState("I am ready to track!");

    useEffect(() => {
        if (riskLevel === 'High') {
            setExpression('worried');
            setMessage("Careful! High risk detected!");
        } else if (riskLevel === 'Moderate') {
            setExpression('neutral');
            setMessage("Stay vigilant, Ninja.");
        } else {
            setExpression('happy');
            setMessage("Great job! Keep it up.");
        }
    }, [riskLevel]);

    const handleSpeak = () => {
        speak(message);
    };

    return (
        <div className="ninja-companion" onClick={handleSpeak} style={{ cursor: 'pointer' }}>
            <div className="ninja-bubble">{message}</div>
            <div className="ninja-avatar-container">
                <NinjaAvatar expression={expression} />
            </div>
        </div>
    );
};

export default NinjaCompanion;
