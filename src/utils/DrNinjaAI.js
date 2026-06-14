/**
 * DrNinjaAI - The Brain of Medication Ninja
 * 
 * Analyzes the user's current medication list to deduce potential conditions
 * and suggest targeted home remedies.
 */

const conditionMap = [
    {
        keywords: ['amoxicillin', 'azithromycin', 'augmentin', 'cefixime', 'clavulanic', 'amoxil'],
        condition: 'Bacterial Infection (Likely Throat/Chest)',
        targetSystem: 'Lungs',
        remedies: [
            { icon: '🍯', title: 'Honey & Ginger', desc: 'Soothes throat inflammation naturally.' },
            { icon: '♨️', title: 'Steam Inhalation', desc: 'Clears congestion and aids breathing.' },
            { icon: '🍲', title: 'Warm Soup', desc: 'Hydration and comfort for the immune system.' }
        ]
    },
    {
        keywords: ['ciprofloxacin', 'nitrofurantoin', 'norfloxacin', 'levofloxacin', 'cipro'],
        condition: 'Urinary Tract Infection (UTI)',
        targetSystem: 'Kidneys',
        remedies: [
            { icon: '🥤', title: 'Cranberry Juice', desc: 'Helps prevent bacteria from sticking.' },
            { icon: '💧', title: 'Hydration Boost', desc: 'Drink 3-4L water to flush toxins.' },
            { icon: '☕', title: 'Avoid Caffeine', desc: 'Irritates the bladder, skip coffee.' }
        ]
    },
    {
        keywords: ['metronidazole', 'tinidazole', 'flagyl'],
        condition: 'Stomach/Gut Infection',
        targetSystem: 'Gut',
        remedies: [
            { icon: '🍌', title: 'BRAT Diet', desc: 'Bananas, Rice, Applesauce, Toast.' },
            { icon: '🥣', title: 'Probiotics', desc: 'Restore good gut bacteria (Yogurt).' },
            { icon: '🥥', title: 'Coconut Water', desc: 'Replenish electrolytes lost.' }
        ]
    },
    {
        keywords: ['paracetamol', 'ibuprofen', 'aspirin', 'dolo', 'tylenol', 'advil'],
        condition: 'Fever or Pain Management',
        targetSystem: 'Liver',
        remedies: [
            { icon: '🧊', title: 'Cold Compress', desc: 'Apply to forehead to reduce fever.' },
            { icon: '🛏️', title: 'Rest & Sleep', desc: 'Critical for body repair.' },
            { icon: '🥛', title: 'Turmeric Milk', desc: 'Natural anti-inflammatory.' }
        ]
    },
    {
        keywords: ['clindamycin', 'doxycycline', 'minocycline'],
        condition: 'Skin/Soft Tissue Infection',
        targetSystem: 'Skin',
        remedies: [
            { icon: '🧼', title: 'Gentle Cleansing', desc: 'Keep area clean with mild soap.' },
            { icon: '🌿', title: 'Aloe Vera', desc: 'Soothes skin irritation.' },
            { icon: '💧', title: 'Stay Hydrated', desc: 'Helps skin heal from within.' }
        ]
    }
];

const generalTips = [
    { icon: '🥗', title: 'Eat the Rainbow', desc: 'Colorful fruits/veggies boost immunity.' },
    { icon: '💤', title: 'Sleep 8 Hours', desc: 'Your body heals while you sleep.' },
    { icon: '🚶‍♂️', title: 'Light Activity', desc: 'Keep blood flowing, but don\'t overexert.' }
];

export const analyzeCondition = (medicines) => {
    if (!medicines || medicines.length === 0) {
        return {
            condition: 'General Wellness',
            tips: generalTips,
            isGuest: true
        };
    }

    // Simple keyword matching (The "Brain")
    for (let med of medicines) {
        const name = med.name.toLowerCase();
        for (let map of conditionMap) {
            if (map.keywords.some(k => name.includes(k))) {
                return {
                    condition: map.condition,
                    tips: map.remedies,
                    match: med.name
                };
            }
        }
    }

    // Default if no specific match found
    return {
        condition: 'Unknown Infection/Condition',
        tips: [
            { icon: '💊', title: 'Follow Prescription', desc: 'Complete the full course as directed.' },
            ...generalTips.slice(0, 2)
        ],
        isDefault: true
    };
};

export const calculateBodyLoad = (medicines) => {
    // Initial health status (0 = stressed, 100 = healthy)
    let systems = {
        'Brain': 100,
        'Lungs': 100,
        'Gut': 100,
        'Skin': 100,
        'Liver': 100,
        'Kidneys': 100,
        'Immunity': 100
    };

    if (!medicines || medicines.length === 0) return systems;

    medicines.forEach(med => {
        const name = med.name.toLowerCase();
        const duration = parseInt(med.duration || 7);
        // Base impact depends on duration: longer course = more impact
        const baseImpact = Math.min(40, duration * 3); 

        for (let map of conditionMap) {
            if (map.keywords.some(k => name.includes(k))) {
                if (map.targetSystem && systems[map.targetSystem]) {
                    // Reduce health of that system dynamically
                    systems[map.targetSystem] = Math.max(20, systems[map.targetSystem] - baseImpact);
                }
            }
        }

        // All meds hit immunity/gut/liver slightly
        systems['Gut'] = Math.max(10, systems['Gut'] - (duration * 1.5));
        systems['Liver'] = Math.max(20, systems['Liver'] - (duration * 1.2));
        systems['Immunity'] = Math.max(30, systems['Immunity'] - (duration * 1.0));
    });

    // Ensure all scores are rounded
    Object.keys(systems).forEach(k => {
        systems[k] = Math.round(systems[k]);
    });

    return systems;
};

export const speak = (text) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop overlap
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.1; // Slightly higher/friendly
        utterance.rate = 1;
        // Try to select a decent voice
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Female'));
        if (preferred) utterance.voice = preferred;

        window.speechSynthesis.speak(utterance);
    }
};
