/**
 * Calculates the Corrected QT interval (QTc) using Bazett's Formula.
 * 
 * @param {number} qtMs - The QT interval in milliseconds
 * @param {number} hrBpm - The heart rate in beats per minute
 * @returns {{ qtcMs: number, interpretation: string }}
 */
function calculateQTc(qtMs, hrBpm) {
    if (hrBpm <= 0) {
        throw new Error("Heart rate must be greater than zero.");
    }
    
    // 1. Calculate RR interval in seconds
    const rrSeconds = 60 / hrBpm;
    
    // 2. Apply Bazett's formula: QTc = QT / sqrt(RR)
    const qtc = Math.round(qtMs / Math.sqrt(rrSeconds));
    
    // 3. Basic interpretation
    let interpretation = "";
    if (qtc > 450) {
        interpretation = "Prolonged";
    } else {
        interpretation = "Normal";
    }
    
    return { qtcMs: qtc, interpretation };
}

document.addEventListener('DOMContentLoaded', () => {
    const prInput = document.getElementById('int-pr');
    const qrsInput = document.getElementById('int-qrs');
    const qtInput = document.getElementById('int-qt');
    const resultDiv = document.getElementById('qtc-calc-result');

    [prInput, qrsInput, qtInput].forEach(input => {
        input.addEventListener('input', () => {
            appState.intervals[input.id.replace('int-', '')] = input.value;
        });
    });

    document.getElementById('do-calc-qtc').addEventListener('click', () => {
        const qt = parseFloat(appState.intervals.qt);
        const hr = parseFloat(appState.rate);

        if (isNaN(qt) || isNaN(hr) || hr <= 0) {
            resultDiv.textContent = "Please ensure both Heart Rate (Step 1) and QT interval are valid numbers.";
            resultDiv.style.color = "var(--danger)";
            return;
        }

        try {
            const result = calculateQTc(qt, hr);
            appState.intervals.qtc = result.qtcMs;
            
            if (result.interpretation === "Prolonged") {
                resultDiv.style.color = "var(--danger)";
            } else {
                resultDiv.style.color = "var(--success)";
            }
            
            resultDiv.textContent = `Calculated QTc: ${result.qtcMs} ms (${result.interpretation})`;
        } catch (error) {
            resultDiv.textContent = error.message;
            resultDiv.style.color = "var(--danger)";
        }
    });
});
