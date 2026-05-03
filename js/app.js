const appState = {
    rate: null,
    rhythm: {
        type: null, // Sinus, A-Fib, Junctional, Unsure
        regularity: null,
        pwaves: null,
        description: null
    },
    axis: {
        type: null, // Normal, Left, Right, Extreme
        lead1: null,
        avf: null
    },
    intervals: {
        pr: null,
        qrs: null,
        qt: null,
        qtc: null
    },
    morphology: {
        voltage: { status: null, findings: [], description: null },
        pwave: { status: null, findings: [], description: null },
        qwave: { status: null, findings: [], description: null },
        st: { status: null, findings: [], leads: null, description: null },
        twave: { status: null, findings: [], leads: null, description: null }
    },
    baseline: null
};

let currentStep = 1;
const totalSteps = 7;

document.addEventListener('DOMContentLoaded', () => {
    // Navigation handlers
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => navigate(1));
    });
    
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', () => navigate(-1));
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        if(confirm("Are you sure you want to start over? All data will be lost.")) {
            location.reload();
        }
    });

    updateUI();
});

function navigate(direction) {
    if (direction === 1 && !validateCurrentStep()) {
        return; // Prevent moving forward if invalid, can add UI error messages later
    }

    currentStep += direction;
    if (currentStep < 0) currentStep = 0;
    if (currentStep >= totalSteps) currentStep = totalSteps - 1;

    updateUI();
    
    if(currentStep === 6) { // Summary Step
        generateSummaryUI();
    }
}

function updateUI() {
    // Update Progress Bar
    const progress = ((currentStep) / (totalSteps - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;

    // Show/Hide steps
    document.querySelectorAll('.step-card').forEach((card, index) => {
        if (index === currentStep) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
}

function validateCurrentStep() {
    // Basic validation logic can be added here
    // For now, allow proceeding
    return true;
}

// Option button selection logic
function handleOptionSelection(containerSelector, btnClass, callback) {
    const container = document.querySelector(containerSelector);
    if(!container) return;
    
    const buttons = container.querySelectorAll(btnClass);
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            buttons.forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            if(callback) callback(e.target.dataset.value, e.target);
        });
    });
}

// Sync UI with state after auto-fill
function syncUIWithState() {
    // Rate
    if (appState.rate) document.getElementById('heart-rate').value = appState.rate;
    
    // Rhythm
    if (appState.rhythm.type) {
        const btn = document.querySelector(`.rhythm-opt[data-value="${appState.rhythm.type}"]`);
        if (btn) btn.click();
    }

    // Axis
    if (appState.axis.type) {
        const btn = document.querySelector(`.axis-opt[data-value="${appState.axis.type}"]`);
        if (btn) btn.click();
    }

    // Intervals
    if (appState.intervals.pr) document.getElementById('int-pr').value = appState.intervals.pr;
    if (appState.intervals.qrs) document.getElementById('int-qrs').value = appState.intervals.qrs;
    if (appState.intervals.qt) document.getElementById('int-qt').value = appState.intervals.qt;
    
    // Calculate QTc if both qt and rate exist
    if (appState.intervals.qt && appState.rate) {
        const btn = document.getElementById('do-calc-qtc');
        if (btn) btn.click();
    }

    // Morphology
    const cats = ['voltage', 'pwave', 'qwave', 'st', 'twave'];
    cats.forEach(cat => {
        const status = appState.morphology[cat].status;
        if (status) {
            const btn = document.querySelector(`.morph-opt[data-category="${cat}"][data-value="${status}"]`);
            if (btn) btn.click();
            
            // If abnormal, check the corresponding boxes
            if (status === 'Abnormal' && appState.morphology[cat].findings.length > 0) {
                const abnormalFlow = document.getElementById(`morph-${cat}-abnormal`);
                if (abnormalFlow) {
                    appState.morphology[cat].findings.forEach(finding => {
                        const cb = abnormalFlow.querySelector(`input[type="checkbox"][value="${finding}"]`);
                        if (cb) cb.checked = true;
                    });
                }
            }
        }
    });

    // Baseline
    if (appState.baseline) {
        document.getElementById('baseline-ecg').value = appState.baseline;
    }
}
