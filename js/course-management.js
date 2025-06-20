function addCourse() {
    const newId = (courses.length > 0 ? Math.max(...courses.map(c => c.id)) : 0) + 1;
    setCoursesState([{ id: newId, name: '', events: [] }, ...courses]);
    courseOpenStates[newId] = true;
    setGeneratedSchedulesState([]);
}

function updateCourse(courseId, newName) {
    setCoursesState(courses.map(c => c.id === courseId ? { ...c, name: newName } : c));
    setGeneratedSchedulesState([]);
}

function deleteCourse(courseId) {
    setCoursesState(courses.filter(c => c.id !== courseId));
    delete courseOpenStates[courseId];
    setGeneratedSchedulesState([]);
}

function addEvent(courseId) {
    setCoursesState(courses.map(c => {
        if (c.id === courseId) {
            const maxEventId = c.events.length > 0 ? Math.max(...c.events.map(e => e.id)) : 0;
            const newEventId = maxEventId + 1;
            return { ...c, events: [...c.events, { id: newEventId, attendance: 'must-attend', type: 'lecture', appointments: [] }] };
        }
        return c;
    }));
    setGeneratedSchedulesState([]);
}

function updateEvent(courseId, eventId, field, value) {
    setCoursesState(courses.map(c => {
        if (c.id === courseId) {
            return {
                ...c, events: c.events.map(e => {
                    if (e.id === eventId) {
                        return { ...e, [field]: value };
                    }
                    return e;
                })
            };
        }
        return c;
    }));
    setGeneratedSchedulesState([]);
}

function deleteEvent(courseId, eventId) {
    setCoursesState(courses.map(c => {
        if (c.id === courseId) {
            return { ...c, events: c.events.filter(e => e.id !== eventId) };
        }
        return c;
    }));
    setGeneratedSchedulesState([]);
}

function addAppointment(courseId, eventId) {
    setCoursesState(courses.map(c => {
        if (c.id === courseId) {
            return {
                ...c, events: c.events.map(e => {
                    if (e.id === eventId) {
                        return { ...e, appointments: [...e.appointments, { day: 'Saturday', period: 0, room: '' }] };
                    }
                    return e;
                })
            };
        }
        return c;
    }));
    setGeneratedSchedulesState([]);
}

function updateAppointment(courseId, eventId, appIndex, field, value) {
    setCoursesState(courses.map(c => {
        if (c.id === courseId) {
            return {
                ...c, events: c.events.map(e => {
                    if (e.id === eventId) {
                        const newAppointments = [...e.appointments];
                        newAppointments[appIndex] = { ...newAppointments[appIndex], [field]: value };
                        return { ...e, appointments: newAppointments };
                    }
                    return e;
                })
            };
        }
        return c;
    }));
    setGeneratedSchedulesState([]);
}

function deleteAppointment(courseId, eventId, appIndex) {
    setCoursesState(courses.map(c => {
        if (c.id === courseId) {
            return {
                ...c, events: c.events.map(e => {
                    if (e.id === eventId) {
                        return { ...e, appointments: e.appointments.filter((_, i) => i !== appIndex) };
                    }
                    return e;
                })
            };
        }
        return c;
    }));
    setGeneratedSchedulesState([]);
}

function toggleCourseOpen(courseId) {
    courseOpenStates[courseId] = !courseOpenStates[courseId];
    renderInputPanel();
}
