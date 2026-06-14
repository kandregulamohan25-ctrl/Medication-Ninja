export const ANTIBIOTIC_CLASSES = {
    penicillin: ['amoxicillin', 'penicillin', 'augmentin', 'ampicillin', 'amoxil'],
    macrolide: ['azithromycin', 'clarithromycin', 'erythromycin', 'zithromax'],
    fluoroquinolone: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'cipro'],
    tetracycline: ['doxycycline', 'tetracycline', 'minocycline', 'vibramycin'],
    cephalosporin: ['cephalexin', 'ceftriaxone', 'cefdinir', 'keflex'],
    nitroimidazole: ['metronidazole', 'flagyl'],
    lincosamide: ['clindamycin', 'cleocin'],
    sulfonamide: ['sulfamethoxazole', 'trimethoprim', 'bactrim'],
    glycopeptide: ['vancomycin']
};

export const getClass = (name) => {
    if (!name) return null;
    const lowerName = name.toLowerCase();
    for (const [cls, drugs] of Object.entries(ANTIBIOTIC_CLASSES)) {
        if (drugs.some(d => lowerName.includes(d))) return cls;
    }
    return null;
};

export const calculateRisk = (medicines, history = [], baseRiskScore = 0) => {
    let score = baseRiskScore;
    let messages = [];

    const activeAntibiotics = medicines.map(m => ({ ...m, class: getClass(m.name) })).filter(m => m.class);
    const historyAntibiotics = history.map(m => ({ ...m, class: getClass(m.name) })).filter(m => m.class);

    if (activeAntibiotics.length === 0) {
        return { score: score, level: score >= 40 ? (score >= 70 ? 'High' : 'Medium') : 'Low', color: score >= 40 ? (score >= 70 ? 'var(--danger-color)' : 'var(--warning-color)') : 'var(--success-color)', messages: ['No active antibiotics detected.'] };
    }

    if (activeAntibiotics.length > 1) {
        score += (activeAntibiotics.length - 1) * 20;
        messages.push('Multiple active antibiotics detected. High risk of disruption to gut microbiome.');
    }

    activeAntibiotics.forEach(med => {
        if (parseInt(med.duration || 0) < 5) {
            score += 30;
            messages.push(`Incomplete antibiotic course increases resistance risk.`);
        }

        // Check history for repeated use
        const sameMeds = historyAntibiotics.filter(h => h.name.toLowerCase() === med.name.toLowerCase());
        const sameClassMeds = historyAntibiotics.filter(h => h.class === med.class && h.name.toLowerCase() !== med.name.toLowerCase());

        if (sameMeds.length > 0) {
            score += 25;
            messages.push(`Frequent use of ${med.name} detected.`);
        } else if (sameClassMeds.length > 0) {
            score += 20;
            messages.push(`Repeated use of ${med.class}-class antibiotics detected.`);
        }
    });

    score = Math.min(Math.round(score), 100);

    // Deduplicate messages
    messages = [...new Set(messages)];

    let level = 'Low';
    let color = 'var(--success-color)';
    if (score >= 70) {
        level = 'High';
        color = 'var(--danger-color)';
    } else if (score >= 40) {
        level = 'Medium';
        color = 'var(--warning-color)';
    }

    return { score, level, color, messages };
};

export const buildRiskHistory = (medicines = [], history = []) => {
    const data = [];
    let runningRisk = 10; // base risk
    
    // Sort history by id (assuming id is timestamp, so ascending)
    const sortedHistory = [...history].sort((a, b) => a.id - b.id);
    
    // If no history and no active meds, return empty
    if (sortedHistory.length === 0 && medicines.length === 0) {
        return [];
    }

    // Process history incrementally
    sortedHistory.forEach((med, index) => {
        const isAntibiotic = getClass(med.name) !== null;
        if (isAntibiotic) {
            let increment = 15;
            if (parseInt(med.duration || 0) < 5) increment += 10; // penalty for short course
            runningRisk += increment;
        } else {
            // General meds slightly increase risk, or naturally decay
            runningRisk = Math.max(10, runningRisk - 2); 
        }
        
        runningRisk = Math.min(runningRisk, 100);
        
        // Use a readable date or just relative entry number
        const dateStr = new Date(med.id).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        
        data.push({
            name: dateStr !== "Invalid Date" ? dateStr : `Entry ${index + 1}`,
            risk: Math.round(runningRisk)
        });
    });

    // Add current state based on active meds
    const activeRisk = calculateRisk(medicines, history, runningRisk).score;
    if (medicines.length > 0 || data.length === 0) {
        data.push({
            name: 'Now',
            risk: Math.round(activeRisk)
        });
    }

    return data;
};
