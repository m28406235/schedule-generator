function handleConstraintChange(key, value) {
    if (key === 'minPerDay' || key === 'maxPerDay') {
        let numValue;
        if (key === 'minPerDay') {
            numValue = Math.max(1, Math.min(5, Number(value) || 1));
        } else {
            numValue = Math.max(2, Math.min(6, Number(value) || 2));
        }
        
        if (key === 'minPerDay' && numValue > constraints.maxPerDay) {
            setConstraintsState({ ...constraints, minPerDay: numValue, maxPerDay: Math.max(numValue, 2) });
        } else if (key === 'maxPerDay' && numValue < constraints.minPerDay) {
            setConstraintsState({ ...constraints, minPerDay: Math.min(numValue, 5), maxPerDay: numValue });
        } else {
            setConstraintsState({ ...constraints, [key]: numValue });
        }
    } else {
        setConstraintsState({ ...constraints, [key]: value });
    }
    
    setGeneratedSchedulesState([]);
    
    if (key === 'ramadanMode') {
        renderInputPanel();
    }
}

function toggleExcludedDay(day) {
    const newExcludedDays = constraints.excludedDays.includes(day)
        ? constraints.excludedDays.filter(d => d !== day)
        : [...constraints.excludedDays, day];
    setConstraintsState({ ...constraints, excludedDays: newExcludedDays });
    setGeneratedSchedulesState([]);
}

function toggleExcludedPeriod(period) {
    const newExcludedPeriods = constraints.excludedPeriods.includes(period)
        ? constraints.excludedPeriods.filter(p => p !== period)
        : [...constraints.excludedPeriods, period];
    setConstraintsState({ ...constraints, excludedPeriods: newExcludedPeriods });
    setGeneratedSchedulesState([]);
}

function toggleConstraintSection(key) {
    constraintOpenStates[key] = !constraintOpenStates[key];
    renderConstraintsPanel();
}

function toggleExcludedEvent(courseId, eventId) {
    const eventKey = `${courseId}-${eventId}`;
    const excludedEvents = constraints.excludedEvents || [];
    const newExcludedEvents = excludedEvents.includes(eventKey)
        ? excludedEvents.filter(e => e !== eventKey)
        : [...excludedEvents, eventKey];
    setConstraintsState({ ...constraints, excludedEvents: newExcludedEvents });
    setGeneratedSchedulesState([]);
}

function isEventExcluded(courseId, eventId) {
    const eventKey = `${courseId}-${eventId}`;
    return (constraints.excludedEvents || []).includes(eventKey);
}
