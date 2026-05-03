document.addEventListener('DOMContentLoaded', () => {
    const calcFlow = document.getElementById('axis-calculator');
    const resultDiv = document.getElementById('axis-calc-result');
    
    handleOptionSelection('#axis-primary-options', '.axis-opt', (value) => {
        appState.axis.type = value;
        
        if (value === 'Unsure') { // Meaning "Calculate it for me"
            calcFlow.classList.remove('hidden');
        } else {
            calcFlow.classList.add('hidden');
            resultDiv.textContent = '';
            appState.axis.lead1 = null;
            appState.axis.avf = null;
        }
    });

    document.getElementById('do-calc-axis').addEventListener('click', () => {
        const lead1 = parseFloat(document.getElementById('axis-lead1').value);
        const avf = parseFloat(document.getElementById('axis-avf').value);

        if (isNaN(lead1) || isNaN(avf)) {
            resultDiv.textContent = "Please enter valid numbers for both leads.";
            resultDiv.style.color = "var(--danger)";
            return;
        }

        appState.axis.lead1 = lead1;
        appState.axis.avf = avf;

        // Basic Quadrant Method for Axis
        let calculatedAxis = "";
        if (lead1 >= 0 && avf >= 0) {
            calculatedAxis = "Normal Axis (0° to +90°)";
        } else if (lead1 >= 0 && avf < 0) {
            calculatedAxis = "Left Axis Deviation (0° to -90°)";
        } else if (lead1 < 0 && avf >= 0) {
            calculatedAxis = "Right Axis Deviation (+90° to +180°)";
        } else if (lead1 < 0 && avf < 0) {
            calculatedAxis = "Extreme Axis Deviation (-90° to -180°)";
        }

        resultDiv.textContent = `Result: ${calculatedAxis}`;
        resultDiv.style.color = "var(--primary)";
        appState.axis.type = calculatedAxis; // Update state with calculated value
    });
});
