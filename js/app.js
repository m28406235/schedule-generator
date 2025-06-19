document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    
    const generateSchedulesBtn = document.getElementById('generateSchedulesBtn');
    if (generateSchedulesBtn) {
        generateSchedulesBtn.addEventListener('click', generateSchedules);
    }
    
    renderApp();
});
