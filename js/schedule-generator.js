function isReadyToGenerate() {
    if (!courses || courses.length === 0) {
        return false;
    }
    
    const coursesWithEvents = courses.filter(course => course.events && course.events.length > 0);
    if (coursesWithEvents.length === 0) {
        return false;
    }
    
    const eventsWithAppointments = courses.flatMap(course => 
        course.events.filter(event => event.appointments && event.appointments.length > 0)
    );
    if (eventsWithAppointments.length === 0) {
        return false;
    }
    
    const requiredEvents = courses.flatMap(course => 
        course.events.filter(event => 
            event.attendance === 'must-attend' && 
            event.appointments && 
            event.appointments.length > 0 &&
            !(constraints.excludedEvents || []).includes(`${course.id}-${event.id}`)
        )
    );
    
    if (requiredEvents.length === 0) {
        return false;
    }
    
    return true;
}

function generateSchedules() {
    if (!isReadyToGenerate()) {
        return;
    }
    
    const resultsArea = document.getElementById('schedule-container');
    if (resultsArea) {
        const rect = resultsArea.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) {
            const yOffset = -60;
            const y = resultsArea.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }
    
    setIsLoadingState(true);
    setErrorState('');
    setGeneratedSchedulesState([]);
    
    setTimeout(() => {const mustAttendEvents = courses
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
        }        setErrorState('');

        const solutions = [];
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
            const hasBasicRequirements = checkBasicRequirements();
            
            if (hasBasicRequirements) {
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
                </div>`);
            } else {
                setErrorState(suggestions);
            }} else {
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
    if (courses.length === 0) {
        return `<div class="mb-4">${BookOpenIconSVG()}</div>
        <h3 class="text-lg font-medium mb-2">No Courses Added</h3>
        <p class="text-gray-400">Please add courses to generate schedules</p>`;
    }
    const coursesWithEvents = courses.filter(course => course.events && course.events.length > 0);
    if (coursesWithEvents.length === 0) {
        return `<div class="mb-4">${ClipboardListIconSVG()}</div>
        <h3 class="text-lg font-medium mb-2">No Events Added</h3>
        <p class="text-gray-400">Add events to your courses</p>`;
    }
    const eventsWithAppointments = courses.flatMap(course =>
        course.events.filter(event => event.appointments && event.appointments.length > 0)
    );
    if (eventsWithAppointments.length === 0) {
        return `<div class="mb-4">${CalendarDotsIconSVG()}</div>
        <h3 class="text-lg font-medium mb-2">No Time Slots Added</h3>
        <p class="text-gray-400">Add time slots to your events</p>`;
    }
    
    const requiredEvents = courses.flatMap(course =>
        course.events.filter(event => 
            event.attendance === 'must-attend' && 
            event.appointments && 
            event.appointments.length > 0 &&
            !(constraints.excludedEvents || []).includes(`${course.id}-${event.id}`)
        )
    );
    
    if (requiredEvents.length === 0) {
        const optionalEvents = courses.flatMap(course =>
            course.events.filter(event => 
                event.attendance === 'online' && 
                event.appointments && 
                event.appointments.length > 0
            )
        );        if (optionalEvents.length > 0) {
            return `<div class="mb-4">${TargetIconSVG()}</div>
            <h3 class="text-lg font-medium mb-2">No Required Events</h3>
            <p class="text-gray-400">Change some events from 'Optional' to 'Required'</p>`;
        } else {
            return `<div class="mb-4">${TargetIconSVG()}</div>
            <h3 class="text-lg font-medium mb-2">No Required Events</h3>
            <p class="text-gray-400">Mark some events as 'Required'</p>`;
        }
    }
    
    const availableSlots = new Set();
    const eventsBySlot = new Map();
    
    requiredEvents.forEach(event => {
        event.appointments.forEach(appointment => {
            if (!constraints.excludedDays.includes(appointment.day) && 
                !constraints.excludedPeriods.includes(appointment.period)) {
                const slotKey = `${appointment.day}-${appointment.period}`;
                availableSlots.add(slotKey);
                if (!eventsBySlot.has(slotKey)) {
                    eventsBySlot.set(slotKey, []);
                }
                eventsBySlot.get(slotKey).push(event);
            }
        });    });
      const totalAvailableSlots = availableSlots.size;
    
    if (totalAvailableSlots < requiredEvents.length) {
        const blockedDaysWithEvents = constraints.excludedDays.filter(day => {
            return requiredEvents.some(event => 
                event.appointments.some(app => app.day === day)
            );
        });
        
        const blockedPeriodsWithEvents = constraints.excludedPeriods.filter(period => {
            return requiredEvents.some(event => 
                event.appointments.some(app => app.period === period)
            );
        });
        
        const conflictingSlots = Array.from(eventsBySlot.entries()).filter(([slot, events]) => events.length > 1);
        
        if (conflictingSlots.length > 0) {
            const conflictCount = conflictingSlots.length;
            const slotWord = conflictCount === 1 ? 'slot' : 'slots';
            suggestions.push(`<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div><strong>Schedule conflicts detected</strong> - ${conflictCount} time ${slotWord} ${conflictCount === 1 ? 'has' : 'have'} multiple required events. Add alternative time options to conflicting courses</div>
            </div>`);
        }
        
        if (blockedDaysWithEvents.length > 0) {
            const dayWord = blockedDaysWithEvents.length === 1 ? 'day' : 'days';
            suggestions.push(`<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div><strong>Enable ${blockedDaysWithEvents.join(', ')}</strong> - You've excluded ${blockedDaysWithEvents.length === 1 ? 'this' : 'these'} ${dayWord}, but your required courses need to be scheduled on ${blockedDaysWithEvents.length === 1 ? 'it' : 'them'}</div>
            </div>`);
        }
        
        if (blockedPeriodsWithEvents.length > 0) {
            const periodNames = blockedPeriodsWithEvents.map(p => getPeriodTimes(constraints.ramadanMode)[p]).join(', ');
            const timeWord = blockedPeriodsWithEvents.length === 1 ? 'time' : 'times';
            suggestions.push(`<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <div><strong>Enable ${periodNames}</strong> - You've excluded ${blockedPeriodsWithEvents.length === 1 ? 'this' : 'these'} ${timeWord}, but your required courses are only available at ${blockedPeriodsWithEvents.length === 1 ? 'this time' : 'these times'}</div>
            </div>`);
        }
    }
      const availableWorkingDays = DAYS.filter(day => !constraints.excludedDays.includes(day)).length;
    const maxPossibleEvents = availableWorkingDays * constraints.maxPerDay;
    const minRequiredEvents = availableWorkingDays * constraints.minPerDay;
      if (availableWorkingDays === 0) {
        suggestions.push(`<div class="flex items-start space-x-2 mb-2">
            <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div><strong>Enable at least one day</strong> - All weekdays (${DAYS.join(', ')}) are currently excluded. You must allow at least one day for scheduling</div>
        </div>`);
        return suggestions.slice(0, 3).join("");
    }
      if (requiredEvents.length > maxPossibleEvents) {
        const suggestedMax = Math.min(6, Math.max(2, Math.ceil(requiredEvents.length / availableWorkingDays)));
        const currentMax = constraints.maxPerDay;
        const eventWord = requiredEvents.length === 1 ? 'event' : 'events';
        suggestions.push(`<div class="flex items-start space-x-2 mb-2">
            <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div><strong>Increase max sessions to ${suggestedMax}/day</strong> - You have ${requiredEvents.length} required ${eventWord} but your current limit of ${currentMax}/day only allows ${maxPossibleEvents} total slots</div>
        </div>`);
    }
      if (requiredEvents.length < minRequiredEvents) {
        const suggestedMin = Math.max(1, Math.min(5, Math.floor(requiredEvents.length / availableWorkingDays)));
        const currentMin = constraints.minPerDay;
        const eventWord = requiredEvents.length === 1 ? 'event' : 'events';
        suggestions.push(`<div class="flex items-start space-x-2 mb-2">
            <div class="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
            <div><strong>Reduce min sessions to ${suggestedMin}/day</strong> - You only have ${requiredEvents.length} required ${eventWord} but your current minimum of ${currentMin}/day requires ${minRequiredEvents} total slots</div>
        </div>`);
    }
      if (constraints.noGaps !== false && requiredEvents.length > 2) {
        const daySlots = new Map();
        availableSlots.forEach(slot => {
            const [day, period] = slot.split('-');
            if (!daySlots.has(day)) {
                daySlots.set(day, []);
            }
            daySlots.get(day).push(parseInt(period));
        });
        
        let hasGapIssues = false;
        const problematicDays = [];
        for (const [day, periods] of daySlots.entries()) {
            periods.sort((a, b) => a - b);
            for (let i = 1; i < periods.length; i++) {
                if (periods[i] - periods[i-1] > 1) {
                    hasGapIssues = true;
                    if (!problematicDays.includes(day)) {
                        problematicDays.push(day);
                    }
                }
            }
        }
          if (hasGapIssues && totalAvailableSlots >= requiredEvents.length) {
            const dayList = problematicDays.length > 0 ? ` (gaps detected on ${problematicDays.join(', ')})` : '';
            suggestions.push(`<div class="flex items-start space-x-2 mb-2">
                <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <div><strong>Disable "No Empty Periods"</strong> - Your course time slots have unavoidable gaps between them${dayList}. Allow gaps to enable scheduling, or add consecutive time options to fill the gaps</div>
            </div>`);
        }    }      if ((constraints.excludedEvents || []).length > 0 && totalAvailableSlots < requiredEvents.length) {
        const excludedCount = constraints.excludedEvents.length;
        const eventWord = excludedCount === 1 ? 'event' : 'events';
        suggestions.push(`<div class="flex items-start space-x-2 mb-2">
            <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div><strong>Include some excluded ${eventWord}</strong> - You've manually excluded ${excludedCount} ${eventWord}. Try re-enabling some to create more scheduling flexibility</div>
        </div>`);
    }
    
    if (totalAvailableSlots > 0 && totalAvailableSlots < requiredEvents.length && suggestions.length === 0) {
        const shortage = requiredEvents.length - totalAvailableSlots;
        const slotWord = shortage === 1 ? 'slot' : 'slots';
        suggestions.push(`<div class="flex items-start space-x-2 mb-2">
            <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div><strong>Add more time options</strong> - You need ${shortage} more time ${slotWord}. Add alternative appointment times to your events or reduce constraints to create more scheduling options</div>
        </div>`);
    }
      if (suggestions.length === 0) {
        return `<div class="flex items-start space-x-2 mb-2">
            <div class="w-2 h-2 bg-gray-500 rounded-full mt-2 flex-shrink-0"></div>
            <div><strong>Complex scheduling conflict detected</strong> - Try adding more time slot alternatives to your events, reducing constraints, or adjusting min/max sessions per day limits</div>
        </div>`;
    }
    
    return suggestions.slice(0, 3).join("");
}

function checkBasicRequirements() {
    if (courses.length === 0) {
        return false;
    }
    
    const coursesWithEvents = courses.filter(course => course.events && course.events.length > 0);
    if (coursesWithEvents.length === 0) {
        return false;
    }
    
    const eventsWithAppointments = courses.flatMap(course => 
        course.events.filter(event => event.appointments && event.appointments.length > 0)
    );
    if (eventsWithAppointments.length === 0) {
        return false;
    }
    
    const requiredEvents = courses.flatMap(course => 
        course.events.filter(event => 
            event.attendance === 'must-attend' && 
            event.appointments && 
            event.appointments.length > 0 &&
            !(constraints.excludedEvents || []).includes(`${course.id}-${event.id}`)
        )
    );
    
    if (requiredEvents.length === 0) {
        return false;
    }
    
    return true;
}
