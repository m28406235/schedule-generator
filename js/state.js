let courses = [];
let constraints = {
    ramadanMode: false,
    excludedDays: [],
    excludedPeriods: [],
    excludedEvents: [],
    noGaps: true,
    minPerDay: 2,
    maxPerDay: 3
};
let generatedSchedules = [];
let selectedScheduleIndex = 0;
let isLoading = false;
let error = '';

let courseOpenStates = {};
let constraintOpenStates = {
    excludeDays: false,
    excludePeriods: false,
    excludeEvents: false
};
function setCoursesState(newCourses) {
    courses = newCourses;
    cleanupExcludedEvents();
    saveToLocalStorage();
    renderInputPanel();
    renderConstraintsPanel();
    renderScheduleDisplay();
}

function setConstraintsState(newConstraints) {
    constraints = newConstraints;
    saveToLocalStorage();
    renderConstraintsPanel();
    renderScheduleDisplay();
}

function setGeneratedSchedulesState(schedules) {
    generatedSchedules = schedules;
    selectedScheduleIndex = 0;
    renderScheduleDisplay();
}

function setSelectedScheduleIndexState(index) {
    selectedScheduleIndex = index;
    renderScheduleDisplay();
}

function setIsLoadingState(loading) {
    isLoading = loading;
    const generateSchedulesBtn = document.getElementById('generateSchedulesBtn');
    if (generateSchedulesBtn) {
        generateSchedulesBtn.disabled = loading;        generateSchedulesBtn.innerHTML = loading
            ? `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...`
            : 'Generate';
    }
    renderScheduleDisplay();
}

function setErrorState(err) {
    error = err;
    renderScheduleDisplay();
}

function cleanupExcludedEvents() {
    const excludedEvents = constraints.excludedEvents || [];
    const validEventKeys = courses.flatMap(course => 
        course.events.map(event => `${course.id}-${event.id}`)
    );
    
    const cleanedExcludedEvents = excludedEvents.filter(eventKey => 
        validEventKeys.includes(eventKey)
    );
    
    if (cleanedExcludedEvents.length !== excludedEvents.length) {
        constraints = { ...constraints, excludedEvents: cleanedExcludedEvents };
        saveToLocalStorage();
        renderConstraintsPanel();
    }
}

function resetConstraints() {
    constraints = {
        ramadanMode: false,
        excludedDays: [],
        excludedPeriods: [],
        excludedEvents: [],
        noGaps: true,
        minPerDay: 2,
        maxPerDay: 3
    };
    constraintOpenStates = {
        excludeDays: false,
        excludePeriods: false,
        excludeEvents: false
    };
    
    setGeneratedSchedulesState([]);
    saveToLocalStorage();
    renderConstraintsPanel();
    
    showNotification('Constraints have been reset to default values', 'success');
}

function resetAll() {
    courses = [];
    constraints = {
        ramadanMode: false,
        excludedDays: [],
        excludedPeriods: [],
        excludedEvents: [],
        noGaps: true,
        minPerDay: 2,
        maxPerDay: 3
    };
    generatedSchedules = [];
    selectedScheduleIndex = 0;
    isLoading = false;
    error = '';
    courseOpenStates = {};
    constraintOpenStates = {
        excludeDays: false,
        excludePeriods: false,
        excludeEvents: false
    };
    
    localStorage.removeItem('scheduleGeneratorData');
    
    renderInputPanel();
    renderConstraintsPanel();
    renderScheduleDisplay();
    
    showNotification('All data has been reset successfully', 'success');
}
