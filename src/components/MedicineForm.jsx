import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './MedicineForm.css';

import OCRScanner from './OCRScanner';

const MedicineForm = ({ onAdd }) => {
    const [medicine, setMedicine] = useState({
        name: '',
        dosage: '',
        frequency: 'Daily',
        duration: '7'
    });

    const handleChange = (e) => {
        setMedicine({ ...medicine, [e.target.name]: e.target.value });
    };

    const handleScan = (scannedName) => {
        setMedicine(prev => ({ ...prev, name: scannedName }));
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent page reload
        if (!medicine.name) return;

        onAdd(medicine);
        setMedicine({
            name: '',
            dosage: '',
            frequency: 'Daily',
            duration: '7'
        });
    };

    return (
        <motion.form
            className="medicine-form card glass-panel"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="form-header">
                <h3>💊 New Mission</h3>
                <p>Assign a new target for tracking.</p>
            </div>

            <div className="scan-row">
                <div className="input-group">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        placeholder=" "
                        value={medicine.name}
                        onChange={handleChange}
                        required
                        className="ninja-input"
                        list="medicine-suggestions"
                    />
                    <datalist id="medicine-suggestions">
                        {['Amoxicillin', 'Azithromycin', 'Augmentin', 'Cefixime', 'Ciprofloxacin', 'Clavulanic Acid', 'Clindamycin', 'Dolo 650', 'Doxycycline', 'Ibuprofen', 'Metronidazole', 'Nitrofurantoin', 'Norfloxacin', 'Paracetamol', 'Tinidazole', 'Cetirizine', 'Pantoprazole', 'Omeprazole'].map(med => (
                            <option key={med} value={med} />
                        ))}
                    </datalist>
                    <label htmlFor="name" className="floating-label">Medicine Name</label>
                    <span className="input-icon">🏷️</span>
                </div>
                <OCRScanner onScanComplete={handleScan} />
            </div>

            <div className="form-row">
                <div className="input-group">
                    <input
                        type="text"
                        name="dosage"
                        id="dosage"
                        placeholder=" "
                        value={medicine.dosage}
                        onChange={handleChange}
                        required
                        className="ninja-input"
                    />
                    <label htmlFor="dosage" className="floating-label">Dosage (mg)</label>
                    <span className="input-icon">⚖️</span>
                </div>

                <div className="select-group">
                    <label className="select-label">Frequency</label>
                    <select name="frequency" value={medicine.frequency} onChange={handleChange} className="ninja-select">
                        <option value="Daily">Daily</option>
                        <option value="2x Daily">2x Daily</option>
                        <option value="3x Daily">3x Daily</option>
                        <option value="Weekly">Weekly</option>
                    </select>
                </div>
            </div>

            <div className="input-group">
                <input
                    type="number"
                    name="duration"
                    id="duration"
                    placeholder=" "
                    value={medicine.duration}
                    onChange={handleChange}
                    min="1"
                    className="ninja-input"
                />
                <label htmlFor="duration" className="floating-label">Duration (Days)</label>
                <span className="input-icon">📅</span>
            </div>

            <motion.button
                type="submit"
                className="btn-shuriken"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <span className="shuriken-icon">💠</span>
                <span>Initiate Track</span>
            </motion.button>
        </motion.form >
    );
};

export default MedicineForm;
