import { WorkoutLocation } from '@/types/workoutLocation';

const DAYS_ORDER = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

const parseTime = (timeStr: string): number => {
    // Expected format: "05:00 AM - 05:45 AM"
    const startTime = timeStr.split('-')[0].trim();
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    
    // Convert to 24-hour format for comparison
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
        hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
    }
    
    return hour24 * 60 + minutes;
};

export const sortWorkoutsByDayAndTime = (workouts: WorkoutLocation[]): WorkoutLocation[] => {
    return [...workouts].sort((a, b) => {
        // First sort by day
        const dayDiff = DAYS_ORDER.indexOf(a.Day) - DAYS_ORDER.indexOf(b.Day);
        if (dayDiff !== 0) return dayDiff;
        
        // Then sort by time
        return parseTime(a.Time) - parseTime(b.Time);
    });
}; 