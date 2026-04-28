import React from 'react';
import './EducationSection.css';

const EducationSection = () => {
    return (
        <section id="learn" className="education-section card">
            <h2>Understanding Antibiotic Resistance</h2>
            <div className="edu-grid">
                <div className="edu-item">
                    <h3>🦠 What is AMR?</h3>
                    <p>
                        Antimicrobial Resistance (AMR) occurs when bacteria, viruses, fungi, and parasites change over time and no longer respond to medicines making infections harder to treat.
                    </p>
                </div>

                <div className="edu-item">
                    <h3>🚫 Common Causes</h3>
                    <ul>
                        <li>Over-prescribing of antibiotics</li>
                        <li>Patients not finishing their treatment</li>
                        <li>Over-use of antibiotics in livestock and fish farming</li>
                        <li>Poor infection control in hospitals and clinics</li>
                    </ul>
                </div>

                <div className="edu-item">
                    <h3>✅ Prevention Tips</h3>
                    <ul>
                        <li>Only use antibiotics when prescribed by a certified health professional.</li>
                        <li>Always complete the full prescription, even if you feel better.</li>
                        <li>Never use leftover antibiotics.</li>
                        <li>Never share antibiotics with others.</li>
                        <li>Prevent infections by regularly washing hands.</li>
                    </ul>
                </div>

                <div className="edu-item highlight">
                    <h3>📉 The Global Impact</h3>
                    <p>
                        Antibiotic resistance is rising to dangerously high levels in all parts of the world. New resistance mechanisms are emerging and spreading globally, threatening our ability to treat common infectious diseases.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default EducationSection;
