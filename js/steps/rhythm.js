document.addEventListener('DOMContentLoaded', () => {
    const unknownFlow = document.getElementById('rhythm-unknown-flow');
    
    handleOptionSelection('#rhythm-primary-options', '.rhythm-opt', (value) => {
        appState.rhythm.type = value;
        
        if (value === 'Unsure') {
            unknownFlow.classList.remove('hidden');
        } else {
            unknownFlow.classList.add('hidden');
            // Reset unknown fields
            document.getElementById('rhythm-regularity').value = "";
            document.getElementById('rhythm-pwaves').value = "";
            document.getElementById('rhythm-freetext').value = "";
            appState.rhythm.regularity = null;
            appState.rhythm.pwaves = null;
            appState.rhythm.description = null;
        }
    });

    document.getElementById('rhythm-regularity').addEventListener('change', (e) => {
        appState.rhythm.regularity = e.target.value;
    });

    document.getElementById('rhythm-pwaves').addEventListener('change', (e) => {
        appState.rhythm.pwaves = e.target.value;
    });

    document.getElementById('rhythm-freetext').addEventListener('input', (e) => {
        appState.rhythm.description = e.target.value;
    });
});
