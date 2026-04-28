import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { motion } from 'framer-motion';
import './OCRScanner.css';

const OCRScanner = ({ onScanComplete }) => {
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);
        setProgress(0);

        try {
            const result = await Tesseract.recognize(
                file,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(parseInt(m.progress * 100));
                        }
                    }
                }
            );

            const text = result.data.text;
            const lines = text.split('\n');

            // Heuristic: specific keywords often found in prescriptions
            const keywords = ['tablet', 'cap', 'syrup', 'mg', 'ml', 'injection', 'tab'];

            // Find the first line that contains a keyword
            let probableName = lines.find(line =>
                keywords.some(keyword => line.toLowerCase().includes(keyword))
            );

            // Fallback: Use the first significant line if no keyword found
            if (!probableName) {
                probableName = lines.filter(line => line.length > 3)[0];
            }

            if (probableName) {
                // Clean up: remove the keyword/dosage sometimes to get just the name? 
                // For now, keep full line as it provides context.
                onScanComplete(probableName.trim());
            } else {
                alert("Could not detect any clear text. Please try again.");
            }

        } catch (err) {
            console.error(err);
            alert("Failed to scan image. Please type manually.");
        } finally {
            setScanning(false);
        }
    };

    return (
        <div className="ocr-scanner-wrapper">
            <input
                type="file"
                accept="image/*"
                capture="environment"
                id="cameraInput"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                disabled={scanning}
            />

            <motion.label
                htmlFor="cameraInput"
                className={`btn-scan ${scanning ? 'scanning' : ''}`}
                whileTap={{ scale: 0.95 }}
                title="Scan Medicine Label"
            >
                {scanning ? (
                    <span className="scan-loader">👁️ {progress}%</span>
                ) : (
                    <span>📸 Scan Label</span>
                )}
            </motion.label>
        </div>
    );
};

export default OCRScanner;
