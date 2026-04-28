import React from 'react';
import './Stories.css';

const Stories = () => {
    return (
        <section className="stories-section">
            <h2>The Path of the Ninja</h2>
            <div className="story-container">
                <div className="story-card wise">
                    <div className="story-header">
                        <span className="story-role">The Wise Ninja 🥷</span>
                    </div>
                    <div className="story-content">
                        <p>"I finished my full course of antibiotics, even when I felt better."</p>
                        <div className="outcome success">
                            <strong>Outcome:</strong> Fully cured. Bacteria defeated. No resistance developed.
                        </div>
                    </div>
                </div>

                <div className="story-vs">Vs</div>

                <div className="story-card foolish">
                    <div className="story-header">
                        <span className="story-role">The Unprepared 🤕</span>
                    </div>
                    <div className="story-content">
                        <p>"I stopped taking my meds because I felt fine after 2 days."</p>
                        <div className="outcome failure">
                            <strong>Outcome:</strong> Infection returned stronger. Medicine no longer works. Spreads resistant bacteria to family.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Stories;
