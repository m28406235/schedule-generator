function generateSchedules() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    setIsLoadingState(true);
    setErrorState('');
    setGeneratedSchedulesState([]);
    
    setTimeout(() => {        const mustAttendEvents = courses
            .flatMap(course => course.events
                .filter(event => {
                    const eventKey = `${course.id}-${event.id}`;                    return event.attendance === 'must-attend' 
                        && event.appointments 
                        && event.appointments.length > 0                        && !(constraints.excludedEvents || []).includes(eventKey);
                })
                .map(event => ({ ...event, courseName: course.name || 'Unnamed Course', courseId: course.id }))
            );
        
        const onlineEvents = courses
            .flatMap(course => course.events
                .filter(event => {
                    const eventKey = `${course.id}-${event.id}`;                    return event.attendance === 'online' 
                        && event.appointments 
                        && event.appointments.length > 0
                        && !(constraints.excludedEvents || []).includes(eventKey);
                })
                .map(event => ({ ...event, courseName: course.name || 'Unnamed Course', courseId: course.id }))
            );

        const eventsToSchedule = mustAttendEvents;
        
        for (let i = eventsToSchedule.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [eventsToSchedule[i], eventsToSchedule[j]] = [eventsToSchedule[j], eventsToSchedule[i]];
        }
          if (courses.length === 0) {
            setErrorState(`<div class="flex flex-col items-center justify-center h-96 text-center text-gray-500">
                <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <p class="text-lg font-medium mb-2">No Courses Added</p>
                <p class="text-gray-400">Please add courses to generate schedules</p>
            </div>`);
            setIsLoadingState(false);
            return;
        }
        
        if (eventsToSchedule.length === 0) {
            setErrorState(`<div class="flex flex-col items-center justify-center h-96 text-center text-gray-500">
                <svg class="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-lg font-medium mb-2">No Required Events</p>
                <p class="text-gray-400">Please add 'required' events with time slots to your courses</p>
            </div>`);
            setIsLoadingState(false);
            return;
        }const solutions = [];
        const seenSchedules = new Set();

        function calculateGaps(schedule) {
            const daySchedules = {};
            schedule.forEach(item => {
                if (!daySchedules[item.day]) {
                    daySchedules[item.day] = [];
                }
                daySchedules[item.day].push(item.period);
            });
            
            let totalGaps = 0;
            Object.values(daySchedules).forEach(periods => {
                periods.sort((a, b) => a - b);
                for (let i = 0; i < periods.length - 1; i++) {
                    totalGaps += periods[i + 1] - periods[i] - 1;
                }
            });
            
            return totalGaps;
        }        function isScheduleValid(schedule) {
            const dayCounts = {};
            schedule.forEach(item => {
                dayCounts[item.day] = (dayCounts[item.day] || 0) + 1;
            });

            if (Object.keys(dayCounts).length === 0) {
                return constraints.minPerDay === 0;
            }

            const validDayCounts = Object.values(dayCounts).every(count =>
                count >= constraints.minPerDay && count <= constraints.maxPerDay
            );
            
            if (!validDayCounts) {
                return false;
            }
              if (constraints.noGaps !== false && schedule.length > 0) {
                const gaps = calculateGaps(schedule);
                return gaps === 0;
            }
            
            return true;
        }

        function tryAddOnlineEvents(baseSchedule, onlineEvents) {
            const schedule = [...baseSchedule];
            
            const daySchedules = {};
            schedule.forEach(item => {
                if (!daySchedules[item.day]) {
                    daySchedules[item.day] = [];
                }
                daySchedules[item.day].push(item);
            });
            
            Object.keys(daySchedules).forEach(day => {
                daySchedules[day].sort((a, b) => a.period - b.period);
            });
              for (const onlineEvent of onlineEvents) {
                const shuffledAppointments = [...onlineEvent.appointments];
                for (let i = shuffledAppointments.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledAppointments[i], shuffledAppointments[j]] = [shuffledAppointments[j], shuffledAppointments[i]];
                }
                
                let added = false;
                
                for (const appointment of shuffledAppointments) {
                    const isDayExcluded = constraints.excludedDays.includes(appointment.day);
                    const isPeriodExcluded = constraints.excludedPeriods.includes(appointment.period);
                    
                    if (isDayExcluded || isPeriodExcluded) {
                        continue;
                    }
                    
                    const isSlotTaken = schedule.some(item => 
                        item.day === appointment.day && item.period === appointment.period
                    );                      if (!isSlotTaken) {
                        if (daySchedules[appointment.day]) {
                            const dayEvents = daySchedules[appointment.day];
                              if (dayEvents.length >= constraints.maxPerDay) {
                                continue;
                            }
                            
                            const earliestPeriod = dayEvents[0].period;
                            const latestPeriod = dayEvents[dayEvents.length - 1].period;
                            
                            const gapsBefore = [];
                            const gapsAfter = [];
                            
                            for (let i = 0; i < dayEvents.length - 1; i++) {
                                const gap = dayEvents[i + 1].period - dayEvents[i].period - 1;
                                if (gap > 0) {
                                    for (let p = dayEvents[i].period + 1; p < dayEvents[i + 1].period; p++) {
                                        gapsBefore.push(p);
                                    }
                                }
                            }
                            
                            if (gapsBefore.includes(appointment.period)) {
                                schedule.push({
                                    courseName: onlineEvent.courseName,
                                    courseId: onlineEvent.courseId,
                                    eventId: onlineEvent.id,
                                    room: appointment.room,
                                    day: appointment.day,
                                    period: appointment.period,
                                    type: onlineEvent.type,
                                    isOnline: true
                                });
                                
                                daySchedules[appointment.day].push(schedule[schedule.length - 1]);
                                daySchedules[appointment.day].sort((a, b) => a.period - b.period);
                                added = true;
                                break;
                            } else if (appointment.period === earliestPeriod - 1 || appointment.period === latestPeriod + 1) {
                                schedule.push({
                                    courseName: onlineEvent.courseName,
                                    courseId: onlineEvent.courseId,
                                    eventId: onlineEvent.id,
                                    room: appointment.room,
                                    day: appointment.day,
                                    period: appointment.period,
                                    type: onlineEvent.type,
                                    isOnline: true
                                });
                                
                                daySchedules[appointment.day].push(schedule[schedule.length - 1]);
                                daySchedules[appointment.day].sort((a, b) => a.period - b.period);
                                added = true;
                                break;
                            }                        } else {
                            if (constraints.minPerDay > 1) {
                                continue;
                            }
                            
                            schedule.push({
                                courseName: onlineEvent.courseName,
                                courseId: onlineEvent.courseId,
                                eventId: onlineEvent.id,
                                room: appointment.room,
                                day: appointment.day,
                                period: appointment.period,
                                type: onlineEvent.type,
                                isOnline: true
                            });
                            
                            daySchedules[appointment.day] = [schedule[schedule.length - 1]];
                            added = true;
                            break;
                        }
                    }
                }
                
                if (!added) {
                    continue;
                }
            }
            
            return schedule;
        }        function solve(eventIndex, currentSchedule) {
            if (eventIndex === eventsToSchedule.length) {
                if (isScheduleValid(currentSchedule)) {
                    const scheduleWithOnline = tryAddOnlineEvents([...currentSchedule], onlineEvents);
                    const gaps = calculateGaps(scheduleWithOnline);
                    const canonicalString = getCanonicalScheduleString(scheduleWithOnline);
                    if (!seenSchedules.has(canonicalString)) {
                        seenSchedules.add(canonicalString);
                        solutions.push({ schedule: scheduleWithOnline, gaps: gaps });
                    }
                }
                return;
            }const event = eventsToSchedule[eventIndex];

            const validAppointments = event.appointments.filter(appointment => {
                const isDayExcluded = constraints.excludedDays.includes(appointment.day);
                const isPeriodExcluded = constraints.excludedPeriods.includes(appointment.period);
                const isSlotTaken = currentSchedule.some(item => item.day === appointment.day && item.period === appointment.period);
                return !isDayExcluded && !isPeriodExcluded && !isSlotTaken;
            });            for (let i = validAppointments.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [validAppointments[i], validAppointments[j]] = [validAppointments[j], validAppointments[i]];
            }for (const appointment of validAppointments) {
                const newScheduleItem = {
                    courseName: event.courseName,
                    courseId: event.courseId,
                    eventId: event.id,
                    room: appointment.room,
                    day: appointment.day,
                    period: appointment.period,
                    type: event.type,
                };
                
                currentSchedule.push(newScheduleItem);
                
                if (constraints.noGaps !== false && eventIndex < eventsToSchedule.length - 1) {
                    const currentGaps = calculateGaps(currentSchedule);
                    if (currentGaps > 0) {
                        const dayEvents = currentSchedule.filter(item => item.day === appointment.day);
                        if (dayEvents.length > 1) {
                            const periods = dayEvents.map(item => item.period).sort((a, b) => a - b);
                            let hasGap = false;
                            for (let i = 0; i < periods.length - 1; i++) {
                                if (periods[i + 1] - periods[i] > 1) {
                                    hasGap = true;
                                    break;
                                }
                            }
                            if (hasGap) {
                                currentSchedule.pop();
                                continue;
                            }
                        }
                    }
                }

                solve(eventIndex + 1, currentSchedule);

                currentSchedule.pop();
            }
        }        solve(0, []);        if (solutions.length === 0) {
            const suggestions = generateConstraintSuggestions();
            setErrorState(`<div class="text-center mb-4">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-red-800 mb-2">No Valid Schedules Found</h3>
                <p class="text-red-700 mb-6">The current constraints are too restrictive to generate any valid schedule combinations.</p>
            </div>
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                        <h4 class="font-medium text-blue-800 mb-2">Recommended Solutions:</h4>
                        <div class="text-sm text-blue-700 space-y-1">
                            ${suggestions}
                        </div>
                    </div>
                </div>
            </div>`);        } else {
            solutions.sort((a, b) => {
                if (a.gaps !== b.gaps) {
                    return a.gaps - b.gaps;
                }
                const daysA = new Set(a.schedule.map(item => item.day)).size;
                const daysB = new Set(b.schedule.map(item => item.day)).size;
                if (daysA !== daysB) {
                    return daysA - daysB;
                }
                return Math.random() - 0.5;
            });
            
            for (let i = Math.min(solutions.length - 1, 20); i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [solutions[i], solutions[j]] = [solutions[j], solutions[i]];
            }
            
            const scheduleList = solutions.map(s => s.schedule);            setGeneratedSchedulesState(scheduleList);
        }
        setIsLoadingState(false);
    }, 50);
}

function generateConstraintSuggestions() {
    const suggestions = [];
    
    const requiredEvents = courses.flatMap(course => 
        course.events.filter(event => 
            event.attendance === 'must-attend' && 
            event.appointments && 
            event.appointments.length > 0 &&
            !(constraints.excludedEvents || []).includes(`${course.id}-${event.id}`)
        )
    );
    
    const allAvailableSlots = new Set();
    const availableDays = new Set();
    const availablePeriods = new Set();
    
    requiredEvents.forEach(event => {
        event.appointments.forEach(appointment => {
            allAvailableSlots.add(`${appointment.day}-${appointment.period}`);
            availableDays.add(appointment.day);
            availablePeriods.add(appointment.period);
        });
    });
    
    if (constraints.excludedDays.length > 0) {
        const blockedDaysWithSessions = constraints.excludedDays.filter(day => 
            availableDays.has(day)
        );
        if (blockedDaysWithSessions.length > 0) {
            const dayNames = blockedDaysWithSessions.join(', ');
            suggestions.push(`<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>Allow scheduling on <strong>${dayNames}</strong> - you have course sessions available on ${blockedDaysWithSessions.length === 1 ? 'this day' : 'these days'}</div>
            </div>`);
        }
    }
    
    if (constraints.excludedPeriods.length > 0) {
        const blockedPeriodsWithSessions = constraints.excludedPeriods.filter(period => 
            availablePeriods.has(period)
        );
        if (blockedPeriodsWithSessions.length > 0) {
            const periodList = blockedPeriodsWithSessions.map(p => `Period ${p}`).join(', ');
            suggestions.push(`<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>Allow scheduling in <strong>${periodList}</strong> - you have course sessions available in ${blockedPeriodsWithSessions.length === 1 ? 'this time slot' : 'these time slots'}</div>
            </div>`);
        }
    }
    
    if (constraints.noGaps !== false && requiredEvents.length > 2) {
        const dayEventCounts = {};
        requiredEvents.forEach(event => {
            event.appointments.forEach(appointment => {
                if (!constraints.excludedDays.includes(appointment.day) && 
                    !constraints.excludedPeriods.includes(appointment.period)) {
                    dayEventCounts[appointment.day] = (dayEventCounts[appointment.day] || 0) + 1;
                }
            });
        });
        
        const hasSpreadOutEvents = Object.keys(dayEventCounts).length > 2 || 
            Object.values(dayEventCounts).some(count => count === 1);
        
        if (hasSpreadOutEvents) {
            suggestions.push(`<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>Disable the <strong>'No Empty Periods'</strong> option - your courses are spread across multiple days/times making gap-free scheduling difficult</div>
            </div>`);
        }
    }
    
    if ((constraints.excludedEvents || []).length > 0) {
        suggestions.push(`<div class="flex items-start space-x-2 mb-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
            <div>Include some of the <strong>${constraints.excludedEvents.length} excluded lecture/section(s)</strong> to provide more scheduling options</div>
        </div>`);
    }
    
    const totalRequiredEvents = requiredEvents.length;
    const availableWorkingDays = DAYS.filter(day => !constraints.excludedDays.includes(day)).length;
    
    if (constraints.minPerDay > 1 && totalRequiredEvents > 0) {
        const minRequiredDays = Math.ceil(totalRequiredEvents / constraints.maxPerDay);
        const maxPossibleWithMinConstraint = availableWorkingDays * constraints.minPerDay;
        
        if (totalRequiredEvents < constraints.minPerDay * minRequiredDays || 
            constraints.minPerDay > Math.floor(totalRequiredEvents / availableWorkingDays)) {
            suggestions.push(`<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>Reduce the minimum lectures per day from <strong>${constraints.minPerDay}</strong> - you have ${totalRequiredEvents} required events across ${availableWorkingDays} available days</div>
            </div>`);
        }
    }
    
    if (constraints.maxPerDay < 6 && totalRequiredEvents > 0) {
        const maxPossibleEvents = availableWorkingDays * constraints.maxPerDay;
        if (totalRequiredEvents > maxPossibleEvents) {
            suggestions.push(`<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>Increase the maximum lectures per day from <strong>${constraints.maxPerDay}</strong> - you need to fit ${totalRequiredEvents} events in ${availableWorkingDays} days</div>
            </div>`);
        }
    }
    
    const totalAvailableSlots = DAYS.filter(day => !constraints.excludedDays.includes(day)).length * 
                               (PERIOD_COUNT - constraints.excludedPeriods.length);
    
    if (totalRequiredEvents > totalAvailableSlots) {
        suggestions.push(`<div class="flex items-start space-x-2 mb-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
            <div>Add more time slot options to your course events - you have ${totalRequiredEvents} required events but only ${totalAvailableSlots} available time slots</div>
        </div>`);
    }
    
    if (suggestions.length === 0) {
        if (totalRequiredEvents === 0) {
            return `<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>Add required events with time slots to your courses, or check that events are marked as 'Required' instead of 'Optional'</div>
            </div>`;
        } else if (allAvailableSlots.size < 2) {
            return `<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>Add more time slot alternatives to your course events - each event needs multiple scheduling options</div>
            </div>`;
        } else {
            return `<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></div>
                <div>Try adjusting your constraints or adding more flexible time slot options to your events</div>
            </div>`;
        }
    }
    
    return suggestions.slice(0, 4).join("");
}
