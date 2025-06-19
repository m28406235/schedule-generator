function handleConstraintChange(key, value) {
    setConstraintsState({ ...constraints, [key]: value });
    if (key === 'ramadanMode') {
        renderInputPanel();
    }
}

function toggleExcludedDay(day) {
    const newExcludedDays = constraints.excludedDays.includes(day)
        ? constraints.excludedDays.filter(d => d !== day)
        : [...constraints.excludedDays, day];
    setConstraintsState({ ...constraints, excludedDays: newExcludedDays });
}

function toggleExcludedPeriod(period) {
    const newExcludedPeriods = constraints.excludedPeriods.includes(period)
        ? constraints.excludedPeriods.filter(p => p !== period)
        : [...constraints.excludedPeriods, period];
    setConstraintsState({ ...constraints, excludedPeriods: newExcludedPeriods });
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
}

function isEventExcluded(courseId, eventId) {
    const eventKey = `${courseId}-${eventId}`;
    return (constraints.excludedEvents || []).includes(eventKey);
}
