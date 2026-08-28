export const ANTIBIOTIC_KNOWLEDGE_BASE = [
    { class: 'Penicillin', aliases: ['amoxicillin', 'penicillin', 'augmentin', 'ampicillin', 'amoxil', 'clavulanic acid'] },
    { class: 'Macrolide', aliases: ['azithromycin', 'clarithromycin', 'erythromycin', 'zithromax'] },
    { class: 'Fluoroquinolone', aliases: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'cipro', 'norfloxacin'] },
    { class: 'Tetracycline', aliases: ['doxycycline', 'tetracycline', 'minocycline', 'vibramycin'] },
    { class: 'Cephalosporin', aliases: ['cephalexin', 'ceftriaxone', 'cefdinir', 'keflex', 'cefixime'] },
    { class: 'Nitroimidazole', aliases: ['metronidazole', 'flagyl', 'tinidazole'] },
    { class: 'Lincosamide', aliases: ['clindamycin', 'cleocin'] },
    { class: 'Sulfonamide', aliases: ['sulfamethoxazole', 'trimethoprim', 'bactrim'] },
    { class: 'Glycopeptide', aliases: ['vancomycin'] },
    { class: 'Nitrofuran', aliases: ['nitrofurantoin', 'macrobid', 'macrodantin'] }
];

const NON_ANTIBIOTICS = [
    'paracetamol', 'ibuprofen', 'cetirizine', 'omeprazole', 'pantoprazole', 'dolo 650', 'dolo'
];

export const getClass = (name) => {
    if (!name || typeof name !== 'string') return null;
    const normalized = name.toLowerCase().trim();
    
    // Explicit known non-antibiotics
    if (NON_ANTIBIOTICS.some(na => {
        const regex = new RegExp('(\\b|^)' + na + '(\\b|$)', 'i');
        return regex.test(normalized);
    })) {
        return null;
    }

    for (const kb of ANTIBIOTIC_KNOWLEDGE_BASE) {
        if (kb.aliases.some(alias => {
            const regex = new RegExp('(\\b|^)' + alias + '(\\b|$)', 'i');
            return regex.test(normalized);
        })) {
            return kb.class;
        }
    }
    return null;
};

export const calculateRisk = (medicines = [], history = [], baseRiskScore = 0) => {
    let score = baseRiskScore || 0;
    let messages = [];
    let factors = [];

    if (score > 0) {
        factors.push({
            label: "Baseline Risk",
            contribution: `+${score}`,
            explanation: "User's baseline exposure profile."
        });
    }

    const activeAntibiotics = medicines.map(m => ({ ...m, class: getClass(m.name) })).filter(m => m.class);
    const historyAntibiotics = history.map(m => ({ ...m, class: getClass(m.name) })).filter(m => m.class);

    if (activeAntibiotics.length === 0 && historyAntibiotics.length === 0 && score === 0) {
        return {
            score: 0,
            level: 'Low',
            color: 'var(--success-color)',
            messages: ['No antibiotic exposure detected.'],
            factors: []
        };
    }

    if (activeAntibiotics.length > 1) {
        const increment = (activeAntibiotics.length - 1) * 20;
        score += increment;
        messages.push('Multiple concurrent antibiotics detected.');
        factors.push({
            label: "Concurrent Exposure",
            contribution: `+${increment}`,
            explanation: "Multiple antibiotics are currently being tracked, indicating increased antibiotic exposure burden."
        });
    }

    if (historyAntibiotics.length > 0) {
        const increment = Math.min(historyAntibiotics.length * 5, 25);
        score += increment;
        messages.push('Historical antibiotic exposure detected.');
        factors.push({
            label: "Cumulative Exposure",
            contribution: `+${increment}`,
            explanation: `Previous exposure to ${historyAntibiotics.length} antibiotic courses detected in medication history.`
        });
    }

    activeAntibiotics.forEach(med => {
        // Record exposure duration fact without making unsupported clinical claims
        const durationStr = med.duration ? `${med.duration} days` : 'unspecified duration';
        
        // Check history for repeated use
        const sameMeds = historyAntibiotics.filter(h => h.name.toLowerCase() === med.name.toLowerCase());
        const sameClassMeds = historyAntibiotics.filter(h => h.class === med.class && h.name.toLowerCase() !== med.name.toLowerCase());

        if (sameMeds.length > 0) {
            score += 15;
            messages.push(`Repeated exposure to ${med.name} detected.`);
            factors.push({
                label: "Repeated Exposure",
                contribution: "+15",
                explanation: `Repeated exposure to ${med.name} was detected in medication history.`
            });
        } else if (sameClassMeds.length > 0) {
            score += 10;
            messages.push(`Previous exposure to the ${med.class} class detected.`);
            factors.push({
                label: "Class Re-exposure",
                contribution: "+10",
                explanation: `Previous exposure to the ${med.class} class was detected.`
            });
        }
    });

    score = Math.min(Math.round(score), 100);
    score = Math.max(0, score); // clamp between 0 and 100

    messages = [...new Set(messages)];
    if (messages.length === 0) {
        messages.push('No significant risk factors detected based on current exposure.');
    }

    let level = 'Low';
    let color = 'var(--success-color)';
    if (score >= 70) {
        level = 'High';
        color = 'var(--danger-color)';
    } else if (score >= 40) {
        level = 'Moderate';
        color = 'var(--warning-color)';
    }

    return { score, level, color, messages, factors };
};

export const buildRiskHistory = (medicines = [], history = [], baseRiskScore = 0) => {
    const data = [];
    
    // Sort history by chronological order if possible
    // Supabase often returns created_at or id. Let's try to parse date safely.
    const getSortValue = (item) => {
        if (item.created_at) return new Date(item.created_at).getTime();
        if (item.completed_at) return new Date(item.completed_at).getTime();
        if (!isNaN(item.id)) return parseInt(item.id, 10);
        return 0;
    };

    const sortedHistory = [...history].sort((a, b) => getSortValue(a) - getSortValue(b));
    
    if (sortedHistory.length === 0 && medicines.length === 0) {
        return [];
    }

    // Build timeline cumulatively
    let accumulatedHistory = [];

    sortedHistory.forEach((med, index) => {
        accumulatedHistory.push(med);
        
        // Calculate risk as if this was the state at that point in time
        // Note: For simplicity in the graph, we treat the accumulated history as past exposure
        // We will assume no active meds during this snapshot to isolate historical progression
        const stepRisk = calculateRisk([], accumulatedHistory, baseRiskScore);
        
        // Try to get a readable date
        let dateStr = null;
        const potentialDates = [med.completed_at, med.created_at, typeof med.id === 'number' ? med.id : null];
        for (let d of potentialDates) {
            if (d) {
                const parsed = new Date(d);
                if (!isNaN(parsed.getTime())) {
                    dateStr = parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    break;
                }
            }
        }
        
        if (!dateStr || dateStr === "Invalid Date") {
            dateStr = `Entry ${index + 1}`;
        }
        
        data.push({
            name: dateStr,
            risk: stepRisk.score
        });
    });

    // Final state based on actual active meds + full history
    const activeRisk = calculateRisk(medicines, history, baseRiskScore);
    if (medicines.length > 0 || data.length === 0) {
        data.push({
            name: 'Now',
            risk: activeRisk.score
        });
    }

    return data;
};
