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
        // Get day indices (default to -1 if not found)
        const dayIndexA = DAYS_ORDER.indexOf(a.Group);
        const dayIndexB = DAYS_ORDER.indexOf(b.Group);

        // If either day is not found, put it at the end
        if (dayIndexA === -1) return 1;
        if (dayIndexB === -1) return -1;

        // First sort by day
        if (dayIndexA !== dayIndexB) {
            return dayIndexA - dayIndexB;
        }
        
        // Then sort by time
        return parseTime(a.Time) - parseTime(b.Time);
    });
}; 