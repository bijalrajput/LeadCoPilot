document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('skip-autofill-btn').addEventListener('click', () => {
        navigate(1);
    });

    document.getElementById('do-autofill-btn').addEventListener('click', async () => {
        const fileInput = document.getElementById('ecg-upload');
        const contextInput = document.getElementById('ecg-context');
        const apiKey = document.getElementById('gemini-api-key').value.trim();
        const errorEl = document.getElementById('autofill-error');
        const loadingEl = document.getElementById('autofill-loading');
        const btn = document.getElementById('do-autofill-btn');

        if (!apiKey) {
            errorEl.textContent = "Please enter your Gemini API key in the header first.";
            errorEl.classList.remove('hidden');
            return;
        }

        if (fileInput.files.length === 0) {
            errorEl.textContent = "Please upload an ECG image first.";
            errorEl.classList.remove('hidden');
            return;
        }

        const file = fileInput.files[0];
        
        errorEl.classList.add('hidden');
        loadingEl.classList.remove('hidden');
        btn.disabled = true;

        try {
            // Convert file to base64
            const base64Image = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Set baseline context
            const contextText = contextInput.value.trim();
            if (contextText) {
                appState.baseline = contextText;
            }

            const prompt = `You are an expert cardiologist. Analyze this ECG image and the following clinical context (if any): "${contextText}".
Extract the ECG findings and return ONLY a valid raw JSON object matching exactly the following structure (do not use markdown blocks, just the raw JSON text):

{
  "rate": <number or null>,
  "rhythm": { "type": "<'Normal Sinus Rhythm' | 'Atrial Fibrillation' | 'Junctional' | 'Unsure'>" },
  "axis": { "type": "<'Normal' | 'Left Axis Deviation' | 'Right Axis Deviation' | 'Extreme Axis Deviation' | 'Unsure'>" },
  "intervals": { "pr": <number or null>, "qrs": <number or null>, "qt": <number or null> },
  "morphology": {
    "voltage": { "status": "<'Normal' | 'Abnormal' | 'Unsure'>", "findings": ["Low Voltage", "High Voltage (LVH)"] },
    "pwave": { "status": "<'Normal' | 'Abnormal' | 'Unsure'>", "findings": ["Biphasic (V1)", "Peaked/Tall (II)", "Wide/Notched"] },
    "qwave": { "status": "<'Normal' | 'Abnormal' | 'Unsure'>", "findings": ["Inferior (II, III, aVF)", "Anterior (V1-V4)", "Lateral (I, aVL, V5, V6)"] },
    "st": { "status": "<'Normal' | 'Abnormal' | 'Unsure'>", "findings": ["Elevation (Concave)", "Elevation (Convex)", "Depression"] },
    "twave": { "status": "<'Normal' | 'Abnormal' | 'Unsure'>", "findings": ["Inverted", "Peaked/Hyperacute", "Flattened", "Biphasic"] }
  }
}

Important Rules:
- Return ONLY JSON. No backticks, no markdown, no conversational text.
- If a finding array doesn't apply (e.g. status is Normal), return an empty array [].
- Only use the EXACT string values listed in the schema for status and findings.
`;

            const requestBody = {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: file.type,
                                data: base64Image
                            }
                        }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: "application/json"
                }
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates.length > 0) {
                let text = data.candidates[0].content.parts[0].text;
                
                // Parse the JSON directly
                const parsedState = JSON.parse(text);

                // Safely merge parsedState into appState
                if (parsedState.rate) appState.rate = parsedState.rate;
                if (parsedState.rhythm) appState.rhythm.type = parsedState.rhythm.type;
                if (parsedState.axis) appState.axis.type = parsedState.axis.type;
                
                if (parsedState.intervals) {
                    appState.intervals.pr = parsedState.intervals.pr;
                    appState.intervals.qrs = parsedState.intervals.qrs;
                    appState.intervals.qt = parsedState.intervals.qt;
                }

                if (parsedState.morphology) {
                    ['voltage', 'pwave', 'qwave', 'st', 'twave'].forEach(cat => {
                        if (parsedState.morphology[cat]) {
                            appState.morphology[cat].status = parsedState.morphology[cat].status;
                            appState.morphology[cat].findings = parsedState.morphology[cat].findings || [];
                        }
                    });
                }

                // Sync the UI and move to the next step
                syncUIWithState();
                navigate(1);
            } else {
                throw new Error("No response generated from the API.");
            }
            
        } catch (error) {
            console.error(error);
            errorEl.textContent = `Error during auto-fill: ${error.message}`;
            errorEl.classList.remove('hidden');
        } finally {
            loadingEl.classList.add('hidden');
            btn.disabled = false;
        }
    });
});
