document.addEventListener('DOMContentLoaded', () => {
    
    const categories = ['voltage', 'pwave', 'qwave', 'st', 'twave'];

    categories.forEach(category => {
        const abnormalFlow = document.getElementById(`morph-${category}-abnormal`);
        const unsureFlow = document.getElementById(`morph-${category}-unsure`);
        
        // Handle Normal/Abnormal/Unsure buttons
        handleOptionSelection(`.morphology-group:has(.morph-opt[data-category="${category}"])`, '.morph-opt', (value) => {
            appState.morphology[category].status = value;
            
            // Hide flows initially
            if(abnormalFlow) abnormalFlow.classList.add('hidden');
            if(unsureFlow) unsureFlow.classList.add('hidden');

            if (value === 'Abnormal' && abnormalFlow) {
                abnormalFlow.classList.remove('hidden');
            } else if (value === 'Unsure' && unsureFlow) {
                unsureFlow.classList.remove('hidden');
            } else {
                // Clear state if going back to normal
                appState.morphology[category].findings = [];
                appState.morphology[category].description = null;
                appState.morphology[category].leads = null;
                
                // Uncheck boxes
                if(abnormalFlow) {
                    abnormalFlow.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                    const leadInput = abnormalFlow.querySelector('input[type="text"]');
                    if(leadInput) leadInput.value = '';
                }
                if(unsureFlow) {
                    const textInput = unsureFlow.querySelector('input[type="text"]');
                    if(textInput) textInput.value = '';
                }
            }
        });

        // Handle Checkboxes for Abnormalities
        if(abnormalFlow) {
            const checkboxes = abnormalFlow.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    const findings = Array.from(checkboxes).filter(c => c.checked).map(c => c.value);
                    appState.morphology[category].findings = findings;
                });
            });

            // Handle Lead inputs for ST/T waves
            const leadsInput = abnormalFlow.querySelector('input[type="text"]');
            if(leadsInput) {
                leadsInput.addEventListener('input', (e) => {
                    appState.morphology[category].leads = e.target.value;
                });
            }
        }

        // Handle Free text for Unsure
        if(unsureFlow) {
            const freeTextInput = unsureFlow.querySelector('input[type="text"]');
            if(freeTextInput) {
                freeTextInput.addEventListener('input', (e) => {
                    appState.morphology[category].description = e.target.value;
                });
            }
        }
    });

});
