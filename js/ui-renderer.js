const coursesPanel = document.getElementById('courses-panel');
const constraintsPanelWrapper = document.getElementById('constraints-panel-wrapper');

function renderApp() {
    renderInputPanel();
    renderConstraintsPanel();
    renderScheduleDisplay();
}

function renderInputPanel() {
    const coursesHtml = courses.length === 0 ? `
        <p class="text-center text-gray-500 py-4 px-2">Click the '+' button to add your first course. Add all lectures and sections for each course.</p>
    ` : courses.map(course => renderCourseItem(course)).join('');

    coursesPanel.innerHTML = `
        <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800 whitespace-nowrap">Your Courses</h2>
                <div class="flex items-center gap-2 flex-shrink-0">
                    <button id="addCourseBtn" class="p-2 rounded-full text-indigo-600 hover:bg-indigo-100 transition-colors flex-shrink-0">${PlusIconSVG()}</button>
                    <button id="loadCourses" class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap">Load</button>
                    <button id="saveCourses" class="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors whitespace-nowrap">Save</button>
                </div>
            </div>
            <div class="space-y-4" id="courses-list">
                ${coursesHtml}
            </div>
        </div>    `;    
    const addCourseBtn = document.getElementById('addCourseBtn');
    if (addCourseBtn) addCourseBtn.addEventListener('click', addCourse);
    const saveBtn = document.getElementById('saveCourses');
    const loadBtn = document.getElementById('loadCourses');
    if (saveBtn) saveBtn.addEventListener('click', saveCourses);
    if (loadBtn) loadBtn.addEventListener('click', loadCourses);    courses.forEach(course => {
        const courseElement = document.getElementById(`course-item-${course.id}`);
        if (courseElement) {
            const courseNameInput = courseElement.querySelector(`#course-name-${course.id}`);
            if (courseNameInput) courseNameInput.addEventListener('change', (e) => updateCourse(course.id, e.target.value));
            const toggleBtn = courseElement.querySelector(`#toggle-course-${course.id}`);
            if (toggleBtn) toggleBtn.addEventListener('click', () => toggleCourseOpen(course.id));
            const deleteCourseBtn = courseElement.querySelector(`#delete-course-${course.id}`);
            if (deleteCourseBtn) deleteCourseBtn.addEventListener('click', () => deleteCourse(course.id));

            course.events.forEach(event => {
                const eventElement = document.getElementById(`event-item-${course.id}-${event.id}`);
                if (eventElement) {
                    const eventTypeSelect = eventElement.querySelector(`#event-type-${course.id}-${event.id}`);
                    if (eventTypeSelect) eventTypeSelect.addEventListener('change', (e) => updateEvent(course.id, event.id, 'type', e.target.value));
                    const eventAttendanceSelect = eventElement.querySelector(`#event-attendance-${course.id}-${event.id}`);                    if (eventAttendanceSelect) eventAttendanceSelect.addEventListener('change', (e) => updateEvent(course.id, event.id, 'attendance', e.target.value));
                    const deleteEventBtn = eventElement.querySelector(`#delete-event-${course.id}-${event.id}`);
                    if (deleteEventBtn) deleteEventBtn.addEventListener('click', () => deleteEvent(course.id, event.id));
                    
                    if (event.appointments) {
                        event.appointments.forEach((app, index) => {
                            const appElementDay = eventElement.querySelector(`#appointment-day-${course.id}-${event.id}-${index}`);
                            const appElementPeriod = eventElement.querySelector(`#appointment-period-${course.id}-${event.id}-${index}`);
                            const appElementRoom = eventElement.querySelector(`#appointment-room-${course.id}-${event.id}-${index}`);
                            const appElementDelete = eventElement.querySelector(`#delete-appointment-${course.id}-${event.id}-${index}`);

                            if (appElementDay) appElementDay.addEventListener('change', (e) => updateAppointment(course.id, event.id, index, 'day', e.target.value));
                            if (appElementPeriod) appElementPeriod.addEventListener('change', (e) => updateAppointment(course.id, event.id, index, 'period', Number(e.target.value)));
                            if (appElementRoom) appElementRoom.addEventListener('change', (e) => updateAppointment(course.id, event.id, index, 'room', e.target.value));
                            if (appElementDelete) appElementDelete.addEventListener('click', () => deleteAppointment(course.id, event.id, index));
                        });
                    }
                    
                    const addAppointmentBtn = eventElement.querySelector(`#add-appointment-${course.id}-${event.id}`);
                    if (addAppointmentBtn) addAppointmentBtn.addEventListener('click', () => addAppointment(course.id, event.id));
                }
            });
            const addEventBtn = courseElement.querySelector(`#add-event-${course.id}`);
            if (addEventBtn) addEventBtn.addEventListener('click', () => addEvent(course.id));
        }
    });
}

function renderCourseItem(course) {
    const isOpen = courseOpenStates[course.id] !== undefined ? courseOpenStates[course.id] : true;
    return `
        <div class="border border-gray-200 rounded-lg p-3" id="course-item-${course.id}">
            <div class="flex justify-between items-center">
                <input type="text" value="${course.name}" placeholder="New Course ${course.id}" id="course-name-${course.id}" class="font-semibold text-lg border-b-2 border-transparent focus:border-indigo-500 outline-none w-full bg-transparent"/>
                <div>
                    <button id="toggle-course-${course.id}" class="p-1.5 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100"><svg class="w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button>
                    <button id="delete-course-${course.id}" class="p-1.5 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100">${Trash2IconSVG()}</button>
                </div>
            </div>
            ${isOpen ? `
                <div class="mt-3 pl-2 space-y-3">
                    ${course.events.map(event => renderEventItem(course.id, event)).join('')}
                    <button id="add-event-${course.id}" class="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-2">${PlusIconSVG()} Add Lecture/Section</button>
                </div>
            ` : ''}
        </div>
    `;
}

function renderEventItem(courseId, event) {
    const periodTimesForEvent = getPeriodTimes(constraints.ramadanMode);
    return `
        <div class="bg-gray-50 p-3 rounded-md border border-gray-200" id="event-item-${courseId}-${event.id}">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                    <select id="event-type-${courseId}-${event.id}" class="text-xs rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500">
                        <option value="lecture" ${event.type === 'lecture' ? 'selected' : ''}>Lecture</option>
                        <option value="section" ${event.type === 'section' ? 'selected' : ''}>Section</option>
                    </select>
                    <select id="event-attendance-${courseId}-${event.id}" class="text-xs rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500">                        <option value="must-attend" ${event.attendance === 'must-attend' ? 'selected' : ''}>Required</option>
                        <option value="online" ${event.attendance === 'online' ? 'selected' : ''}>Optional</option>
                    </select>
                    ${InfoIconSVG("Events marked 'Must Attend' are included in the schedule. 'Online' events are placed at the beginning or end of days when possible.")}
                </div>
                <button id="delete-event-${courseId}-${event.id}" class="p-1 text-red-500 hover:bg-red-100 rounded-full ml-1">${Trash2IconSVG()}</button>
            </div>            <div class="space-y-2">
                <p class="text-xs text-gray-500">Define all possible time slots for this event. The generator will pick one.</p>
                ${(event.appointments || []).map((app, index) => `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <select id="appointment-day-${courseId}-${event.id}-${index}" class="w-full rounded border-gray-300">
                            ${DAYS.map(d => `<option value="${d}" ${app.day === d ? 'selected' : ''}>${d}</option>`).join('')}
                        </select>
                        <select id="appointment-period-${courseId}-${event.id}-${index}" class="w-full rounded border-gray-300">
                            ${periodTimesForEvent.map((time, i) => `<option value="${i}" ${app.period === i ? 'selected' : ''}>${time}</option>`).join('')}
                        </select>
                        <input type="text" placeholder="Room" value="${app.room}" id="appointment-room-${courseId}-${event.id}-${index}" class="md:col-span-2 w-full rounded border-gray-300" />
                        <button id="delete-appointment-${courseId}-${event.id}-${index}" class="text-red-500 text-xs md:col-span-2 justify-self-end hover:underline">Remove</button>
                    </div>
                `).join('')}
                <button id="add-appointment-${courseId}-${event.id}" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">+ Add Appointment</button>
            </div>
        </div>
    `;
}

function renderConstraintsPanel() {
    const periodTimesForConstraints = getPeriodTimes(constraints.ramadanMode);
    constraintsPanelWrapper.innerHTML = `
        <div class="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">${SettingsIconSVG()} Constraints</h2>
              <div class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                <label for="ramadanMode" class="font-medium text-gray-700 flex items-center gap-2">Ramadan Mode ${InfoIconSVG("Adjusts schedule for Ramadan: periods become 75 mins, starting at 9:00 AM.")}</label>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="ramadanMode" ${constraints.ramadanMode ? 'checked' : ''} class="sr-only peer"/>
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>
            
            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100">
                <label for="noGaps" class="font-medium text-gray-700 flex items-center gap-2">No Empty Periods ${InfoIconSVG("Only generate schedules without gaps between sessions on the same day.")}</label>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="noGaps" ${constraints.noGaps !== false ? 'checked' : ''} class="sr-only peer"/>
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>
              <div class="p-2 mt-2">
                <label class="font-medium text-gray-700 block mb-1 flex items-center gap-2">Sessions / Day ${InfoIconSVG("Define min/max 'required' events per day in the generated schedule.")}</label>
                <div class="flex items-center gap-4">
                    <div class="flex-1">
                        <label for="minPerDay" class="text-sm text-gray-500">Min</label>
                        <input id="minPerDay" type="number" min="1" max="5" value="${constraints.minPerDay}" class="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                    </div>
                    <div class="flex-1">
                        <label for="maxPerDay" class="text-sm text-gray-500">Max</label>
                        <input id="maxPerDay" type="number" min="2" max="6" value="${constraints.maxPerDay}" class="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"/>
                    </div>
                </div>            </div>

            <div class="mt-2">
                <button id="toggleDaysOpen" class="flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-100 text-left">
                    <span class="font-medium text-gray-700 flex items-center gap-2">Exclude Days ${InfoIconSVG("No events will be scheduled on any excluded day.")}</span>
                    <svg class="w-5 h-5 transition-transform ${constraintOpenStates['excludeDays'] ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="excluded-days-list" class="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 ${constraintOpenStates['excludeDays'] ? '' : 'hidden'}">
                    ${DAYS.map(day => `
                        <button class="p-2 text-sm rounded-md transition-colors ${constraints.excludedDays.includes(day) ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}" data-day="${day}">
                            ${day}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="mt-2">
                <button id="togglePeriodsOpen" class="flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-100 text-left">
                    <span class="font-medium text-gray-700 flex items-center gap-2">Exclude Periods ${InfoIconSVG("Exclude specific time periods across all days. Events will not be scheduled during these slots.")}</span>
                    <svg class="w-5 h-5 transition-transform ${constraintOpenStates['excludePeriods'] ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="excluded-periods-list" class="p-2 grid grid-cols-3 gap-2 ${constraintOpenStates['excludePeriods'] ? '' : 'hidden'}">
                    ${Array.from({ length: PERIOD_COUNT }).map((_, period) => {
        const isExcluded = constraints.excludedPeriods.includes(period);
        return `
                            <button class="p-2 text-sm rounded transition-colors ${isExcluded ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}" data-period="${period}">
                                ${periodTimesForConstraints[period]}
                            </button>
                        `;    }).join('')}
                </div>
            </div>
            
            <div class="mt-2">
                <button id="toggleEventsOpen" class="flex justify-between items-center w-full p-2 rounded-lg hover:bg-gray-100 text-left">
                    <span class="font-medium text-gray-700 flex items-center gap-2">Exclude Specific Events ${InfoIconSVG("Exclude specific lectures or sections from being scheduled.")}</span>
                    <svg class="w-5 h-5 transition-transform ${constraintOpenStates['excludeEvents'] ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                <div id="excluded-events-list" class="p-2 space-y-2 ${constraintOpenStates['excludeEvents'] ? '' : 'hidden'}">
                    ${courses.length === 0 ? 
                        '<p class="text-sm text-gray-500 italic">Add courses first to exclude specific events</p>' :
                        courses.map(course => {
                            if (course.events.length === 0) return '';
                            return `
                                <div class="border rounded-lg p-2 bg-gray-50">
                                    <h4 class="font-medium text-sm text-gray-700 mb-2">${course.name || 'Unnamed Course'}</h4>
                                    <div class="space-y-1">
                                        ${course.events.map(event => {
                                            const eventKey = `${course.id}-${event.id}`;
                                            const isExcluded = (constraints.excludedEvents || []).includes(eventKey);
                                            const eventTypeLabel = event.type === 'lecture' ? 'Lecture' : 'Section';
                                            const attendanceLabel = event.attendance === 'must-attend' ? 'Required' : 'Optional';
                                            return `
                                                <button class="w-full text-left p-2 text-xs rounded transition-colors ${isExcluded ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'}" 
                                                        data-course-id="${course.id}" data-event-id="${event.id}">
                                                    ${eventTypeLabel} (${attendanceLabel})
                                                </button>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')
                    }                </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-gray-200">
                <button id="resetConstraintsBtn"
                    class="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Reset Constraints
                </button>
            </div>
        </div>    `;
    
    const ramadanModeEl = document.getElementById('ramadanMode');
    const noGapsEl = document.getElementById('noGaps');
    const minPerDayEl = document.getElementById('minPerDay');
    const maxPerDayEl = document.getElementById('maxPerDay');
    const toggleDaysOpenEl = document.getElementById('toggleDaysOpen');
    const togglePeriodsOpenEl = document.getElementById('togglePeriodsOpen');
    const toggleEventsOpenEl = document.getElementById('toggleEventsOpen');
      if (ramadanModeEl) ramadanModeEl.addEventListener('change', (e) => handleConstraintChange('ramadanMode', e.target.checked));
    if (noGapsEl) noGapsEl.addEventListener('change', (e) => handleConstraintChange('noGaps', e.target.checked));
    if (minPerDayEl) minPerDayEl.addEventListener('change', (e) => handleConstraintChange('minPerDay', Number(e.target.value)));
    if (maxPerDayEl) maxPerDayEl.addEventListener('change', (e) => handleConstraintChange('maxPerDay', Number(e.target.value)));
    if (toggleDaysOpenEl) toggleDaysOpenEl.addEventListener('click', () => toggleConstraintSection('excludeDays'));
    if (togglePeriodsOpenEl) togglePeriodsOpenEl.addEventListener('click', () => toggleConstraintSection('excludePeriods'));
    if (toggleEventsOpenEl) toggleEventsOpenEl.addEventListener('click', () => toggleConstraintSection('excludeEvents'));
      const resetConstraintsBtn = document.getElementById('resetConstraintsBtn');
    if (resetConstraintsBtn) {
        resetConstraintsBtn.addEventListener('click', () => {
            resetConstraints();
        });
    }

    document.querySelectorAll('#excluded-days-list button').forEach(button => {
        button.addEventListener('click', (e) => toggleExcludedDay(e.target.dataset.day));
    });
    document.querySelectorAll('#excluded-periods-list button').forEach(button => {
        button.addEventListener('click', (e) => toggleExcludedPeriod(Number(e.target.dataset.period)));
    });
    
    document.querySelectorAll('#excluded-events-list button[data-course-id]').forEach(button => {
        button.addEventListener('click', (e) => {
            const courseId = Number(e.target.dataset.courseId);
            const eventId = Number(e.target.dataset.eventId);
            toggleExcludedEvent(courseId, eventId);
        });
    });
}

function renderScheduleDisplay() {
    const loadingStateDiv = document.getElementById('loading-state');
    const errorStateDiv = document.getElementById('error-state');
    const emptyStateDiv = document.getElementById('empty-state');
    const scheduleDisplayArea = document.getElementById('schedule-display-area');
    const errorMessageDiv = document.getElementById('error-message');
    
    loadingStateDiv.classList.add('hidden');
    errorStateDiv.classList.add('hidden');
    emptyStateDiv.classList.add('hidden');
    scheduleDisplayArea.classList.add('hidden');

    if (isLoading) {
        loadingStateDiv.classList.remove('hidden');    } else if (error) {
        errorStateDiv.classList.remove('hidden');
        if (errorMessageDiv) {
            errorMessageDiv.innerHTML = error;
        }
    } else if (generatedSchedules.length === 0) {
        emptyStateDiv.classList.remove('hidden');
    } else {
        scheduleDisplayArea.classList.remove('hidden');
        scheduleDisplayArea.innerHTML = renderScheduleNavigator() + renderScheduleGrid();

        const prevBtn = document.getElementById('prevScheduleBtn');
        const nextBtn = document.getElementById('nextScheduleBtn');
        if (prevBtn) prevBtn.addEventListener('click', () => setSelectedScheduleIndexState(Math.max(0, selectedScheduleIndex - 1)));
        if (nextBtn) nextBtn.addEventListener('click', () => setSelectedScheduleIndexState(Math.min(generatedSchedules.length - 1, selectedScheduleIndex + 1)));
    }
}

function renderScheduleNavigator() {
    if (generatedSchedules.length <= 1) return '';
    return `
        <div class="flex items-center justify-center mb-4 gap-4">
            <button id="prevScheduleBtn" class="p-2 rounded-full ${selectedScheduleIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}" ${selectedScheduleIndex === 0 ? 'disabled' : ''}>${ChevronLeftSVG()}</button>
            <span class="font-medium text-gray-700">Schedule ${selectedScheduleIndex + 1} of ${generatedSchedules.length}</span>
            <button id="nextScheduleBtn" class="p-2 rounded-full ${selectedScheduleIndex === generatedSchedules.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}" ${selectedScheduleIndex === generatedSchedules.length - 1 ? 'disabled' : ''}>${ChevronRightSVG()}</button>
        </div>
        ${generatedSchedules.length > 1 ? `<p class="text-center text-sm text-gray-600 mt-2 mb-4">Use the arrows above to browse through ${generatedSchedules.length} unique schedules.</p>` : ''}
    `;
}

function renderScheduleGrid() {
    const currentSchedule = generatedSchedules[selectedScheduleIndex];
    if (!currentSchedule) return '';

    const periodTimesForGrid = getPeriodTimes(constraints.ramadanMode);

    let gridHtml = `
        <div class="grid gap-px bg-gray-200 overflow-x-auto" style="grid-template-columns: auto repeat(${PERIOD_COUNT}, 1fr); grid-template-rows: auto repeat(${DAYS.length}, 1fr);">
            <div class="bg-white p-2"></div>
            ${periodTimesForGrid.map(time => `<div class="bg-white p-2 text-center font-bold text-gray-600 text-sm sm:text-base">${time}</div>`).join('')}
    `;

    DAYS.forEach(day => {
        gridHtml += `
            <div class="bg-white p-2 text-center font-semibold text-gray-600 text-xs sm:text-sm flex items-center justify-center">
                <span>${day}</span>
            </div>
            ${periodTimesForGrid.map((time, periodIndex) => {
                const event = currentSchedule.find(item => item.day === day && item.period === periodIndex);
                let eventTypeClass = '';
                if (event) {
                    if (event.isOnline) {
                        eventTypeClass = 'online-event';
                    } else if (event.type === 'lecture') {
                        eventTypeClass = 'lecture-event';
                    } else {
                        eventTypeClass = 'section-event';
                    }
                }
                return `
                    <div class="bg-gray-50 p-1.5 schedule-grid-cell flex items-center justify-center">
                        ${event ? `
                            <div class="w-full h-full p-2 rounded-lg shadow-sm flex flex-col justify-center items-center text-center text-xs border ${eventTypeClass}">
                                <span class="font-semibold">${event.courseName}${event.isOnline ? ' (Online)' : ''}</span>
                                ${event.room ? `<span class="text-gray-600 text-opacity-80">(${event.room})</span>` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        `;
    });

    gridHtml += `</div>`;
    return gridHtml;
}
