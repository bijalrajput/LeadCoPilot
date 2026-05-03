document.addEventListener('DOMContentLoaded', () => {
    const rateInput = document.getElementById('heart-rate');
    
    rateInput.addEventListener('input', (e) => {
        appState.rate = e.target.value;
        // Update display in intervals step
        document.getElementById('hr-display-int').textContent = appState.rate || '--';
    });
});
