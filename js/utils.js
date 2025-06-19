const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${formattedHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
};

const getPeriodTimes = (isRamadan) => {
    const periods = [];
    let startTime = isRamadan ? 9 * 60 : 8 * 60 + 30;
    const duration = isRamadan ? 75 : 120;

    for (let i = 0; i < PERIOD_COUNT; i++) {
        periods.push(formatTime(startTime));
        startTime += duration;
    }
    return periods;
};

const getCanonicalScheduleString = (schedule) => {
    const sortedSchedule = [...schedule].sort((a, b) => {
        if (a.day !== b.day) return DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
        if (a.period !== b.period) return a.period - b.period;
        if (a.courseId !== b.courseId) return a.courseId - b.courseId;
        if (a.eventId !== b.eventId) return a.eventId - b.eventId;
        return 0;
    });

    return JSON.stringify(sortedSchedule.map(item => ({
        day: item.day,
        period: item.period,
        courseId: item.courseId,
        eventId: item.eventId,
        type: item.type,
    })));
};

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-600 text-white' :
        type === 'error' ? 'bg-red-600 text-white' :
        'bg-blue-600 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
