function saveToLocalStorage() {
    try {
        const dataToSave = {
            courses: courses,
            constraints: constraints
        };
        localStorage.setItem('scheduleGeneratorData', JSON.stringify(dataToSave));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const savedData = localStorage.getItem('scheduleGeneratorData');
        if (savedData) {
            const data = JSON.parse(savedData);
            if (data.courses && Array.isArray(data.courses)) {
                courses = data.courses;            }
            
            if (data.constraints) {
                constraints = { 
                    ramadanMode: false,
                    excludedDays: [],
                    excludedPeriods: [],
                    excludedEvents: [],
                    noGaps: true,
                    minPerDay: 2,
                    maxPerDay: 3,
                    ...data.constraints 
                };
            }
        }
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
    }
}

function saveCourses() {
    try {
        const dataToSave = {
            courses: courses
        };
        
        const dataStr = JSON.stringify(dataToSave, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `courses-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showNotification('Courses saved successfully!', 'success');
    } catch (error) {
        showNotification('Error saving courses', 'error');
    }
}

function loadCourses() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.courses || !Array.isArray(data.courses)) {
                    throw new Error('Invalid file');
                }
                  const normalizedCourses = data.courses.map(course => ({
                    id: course.id || Date.now(),
                    name: course.name || '',
                    events: (course.events || []).map(event => ({
                        id: event.id || Date.now(),
                        attendance: event.attendance || 'must-attend', 
                        type: event.type || 'lecture',
                        appointments: (event.appointments || []).map(app => ({
                            day: app.day || 'Saturday',
                            period: app.period || 0,
                            room: app.room || ''
                        }))
                    }))
                }));
                
                setCoursesState(normalizedCourses);
                setGeneratedSchedulesState([]);
                showNotification('Courses loaded successfully!', 'success');
            } catch (error) {
                showNotification('Error loading file', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}
