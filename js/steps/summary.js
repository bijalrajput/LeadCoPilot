document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generate-diff-btn').addEventListener('click', generateDifferentialDiagnosis);
});

function generateSummaryUI() {
    const list = document.getElementById('summary-list');
    list.innerHTML = ''; // clear

    // 1. Rate
    if (appState.rate) addSummaryItem(list, 'Rate', `${appState.rate} bpm`);

    // 2. Rhythm
    let rhythmStr = appState.rhythm.type || 'Not specified';
    if (appState.rhythm.type === 'Unsure') {
        const parts = [];
        if(appState.rhythm.regularity) parts.push(appState.rhythm.regularity);
        if(appState.rhythm.pwaves) parts.push(`P-waves: ${appState.rhythm.pwaves}`);
        if(appState.rhythm.description) parts.push(`Note: ${appState.rhythm.description}`);
        rhythmStr += parts.length > 0 ? ` (${parts.join(', ')})` : '';
    }
    addSummaryItem(list, 'Rhythm', rhythmStr);

    // 3. Axis
    addSummaryItem(list, 'Axis', appState.axis.type || 'Not specified');

    // 4. Intervals
    const intParts = [];
    if(appState.intervals.pr) intParts.push(`PR: ${appState.intervals.pr}ms`);
    if(appState.intervals.qrs) intParts.push(`QRS: ${appState.intervals.qrs}ms`);
    if(appState.intervals.qtc) intParts.push(`QTc: ${appState.intervals.qtc}ms`);
    addSummaryItem(list, 'Intervals', intParts.length > 0 ? intParts.join(' | ') : 'Not specified');

    // 5. Morphology
    const cats = {
        'voltage': 'Voltages',
        'pwave': 'P Waves',
        'qwave': 'Q Waves',
        'st': 'ST Segment',
        'twave': 'T Waves'
    };

    for(const key in cats) {
        const morph = appState.morphology[key];
        let str = morph.status || 'Not evaluated';
        
        if (morph.status === 'Abnormal') {
            const parts = [];
            if(morph.findings && morph.findings.length > 0) parts.push(morph.findings.join(', '));
            if(morph.leads) parts.push(`Leads: ${morph.leads}`);
            if(parts.length > 0) str += ` (${parts.join('; ')})`;
        } else if (morph.status === 'Unsure' && morph.description) {
            str += ` (${morph.description})`;
        }
        
        addSummaryItem(list, cats[key], str);
    }
}

function addSummaryItem(list, label, value) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${label}:</strong> ${value}`;
    list.appendChild(li);
}

async function generateDifferentialDiagnosis() {
    const apiKey = document.getElementById('gemini-api-key').value.trim();
    const errorEl = document.getElementById('ai-error');
    const resultEl = document.getElementById('ai-result');
    const loadingEl = document.getElementById('ai-loading');
    const btn = document.getElementById('generate-diff-btn');

    if (!apiKey) {
        errorEl.textContent = "Please enter your Gemini API key in the header first.";
        errorEl.classList.remove('hidden');
        return;
    }

    errorEl.classList.add('hidden');
    resultEl.classList.add('hidden');
    loadingEl.classList.remove('hidden');
    btn.disabled = true;

    // Get baseline
    appState.baseline = document.getElementById('baseline-ecg').value.trim();

    // Prepare prompt based on state
    let prompt = `You are an expert cardiologist assisting a medical resident. Review the following EKG findings and provide a concise, structured differential diagnosis. List the most likely diagnosis first, followed by other possibilities. Do NOT provide a full interpretation, only the differential diagnosis based on these specific findings.

Findings:
- Rate: ${appState.rate || 'Unsure'} bpm
- Rhythm: ${appState.rhythm.type || 'Unsure'}
- Axis: ${appState.axis.type || 'Unsure'}
- Intervals: PR ${appState.intervals.pr || 'Unsure'}ms, QRS ${appState.intervals.qrs || 'Unsure'}ms, QTc ${appState.intervals.qtc || 'Unsure'}ms
- Voltages: Status ${appState.morphology.voltage.status || 'Unsure'}, Findings: ${appState.morphology.voltage.findings.join(', ')} ${appState.morphology.voltage.description || ''}
- P Waves: Status ${appState.morphology.pwave.status || 'Unsure'}, Findings: ${appState.morphology.pwave.findings.join(', ')} ${appState.morphology.pwave.description || ''}
- Q Waves: Status ${appState.morphology.qwave.status || 'Unsure'}, Findings: ${appState.morphology.qwave.findings.join(', ')} ${appState.morphology.qwave.description || ''}
- ST Segment: Status ${appState.morphology.st.status || 'Unsure'}, Findings: ${appState.morphology.st.findings.join(', ')}, Leads: ${appState.morphology.st.leads || ''} ${appState.morphology.st.description || ''}
- T Waves: Status ${appState.morphology.twave.status || 'Unsure'}, Findings: ${appState.morphology.twave.findings.join(', ')}, Leads: ${appState.morphology.twave.leads || ''} ${appState.morphology.twave.description || ''}`;

    if (appState.baseline) {
        prompt += `\n\nClinical Context / Baseline ECG Comparison:\n${appState.baseline}`;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.2
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            let text = data.candidates[0].content.parts[0].text;
            // Convert simple markdown to HTML (basic implementation)
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
            text = text.replace(/\n/g, '<br>');
            
            resultEl.innerHTML = text;
        } else {
            resultEl.innerHTML = "No differential could be generated from these findings.";
        }
        
    } catch (error) {
        console.error(error);
        errorEl.textContent = `Error generating diagnosis: ${error.message}`;
        errorEl.classList.remove('hidden');
    } finally {
        loadingEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
        btn.disabled = false;
    }
}
