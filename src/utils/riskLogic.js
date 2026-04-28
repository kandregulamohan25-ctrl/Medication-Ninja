export const ANTIBIOTIC_CLASSES = {
    penicillin: ['amoxicillin', 'penicillin', 'augmentin', 'ampicillin'],
    macrolide: ['azithromycin', 'clarithromycin', 'erythromycin'],
    fluoroquinolone: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin'],
    tetracycline: ['doxycycline', 'tetracycline', 'minocycline'],
    cephalosporin: ['cephalexin', 'ceftriaxone', 'cefdinir'],
    nitroimidazole: ['metronidazole'],
    lincosamide: ['clindamycin']
};

export const getClass = (name) => {
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
        return { score: score, level: score > 40 ? 'Medium' : 'Low', color: score > 40 ? 'var(--warning-color)' : 'var(--success-color)', messages: ['No antibiotics detected.'] };
    }

    if (activeAntibiotics.length > 1) {
        score += (activeAntibiotics.length - 1) * 20;
        messages.push('Multiple active antibiotics detected. High risk of disruption to gut microbiome.');
    }

    activeAntibiotics.forEach(med => {
        if (parseInt(med.duration) < 5) {
            score += 30;
            messages.push(`Incomplete antibiotic course increases resistance risk`);
        }

        // Check history for repeated use
        const sameMeds = historyAntibiotics.filter(h => h.name.toLowerCase() === med.name.toLowerCase());
        const sameClassMeds = historyAntibiotics.filter(h => h.class === med.class && h.name.toLowerCase() !== med.name.toLowerCase());

        if (sameMeds.length > 0) {
            score += 25;
            messages.push(`Frequent antibiotic usage in short duration`);
        } else if (sameClassMeds.length > 0) {
            score += 20;
            messages.push(`Repeated use of ${med.class}-class antibiotics detected`);
        }
    });

    score = Math.min(score, 100);

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
