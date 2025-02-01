import { WorkoutLocation } from '@/types/workoutLocation';

// Time constants
const MINUTES_IN_HOUR = 60;
const HOURS_IN_DAY = 24;
const DAYS_IN_WEEK = 7;
const MINUTES_IN_DAY = HOURS_IN_DAY * MINUTES_IN_HOUR;

// Calendar constants
const DAYS_ORDER = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
] as const;

type DayOfWeek = typeof DAYS_ORDER[number];

interface ParsedTime {
    hour24: number;
    minutes: number;
    totalMinutes: number;
}

/**
 * Parse a time string into hours, minutes, and total minutes since midnight
 * Handles both "AM/PM" and "am/pm" formats
 * @param timeStr Format: "HH:MM AM/PM - HH:MM AM/PM"
 */
const parseTime = (timeStr: string): ParsedTime => {
    try {
        // Extract start time from range (e.g., "05:00 AM - 05:45 AM" → "05:00 AM")
        const startTime = timeStr.split('-')[0]?.trim();
        if (!startTime) throw new Error('Invalid time format: missing time component');

        // Split into time and period (e.g., "05:00 AM" → ["05:00", "AM"])
        const [time, periodRaw] = startTime.split(' ');
        if (!time || !periodRaw) throw new Error('Invalid time format: missing time or period');

        // Split hours and minutes (e.g., "05:00" → ["05", "00"])
        const [hours, minutes] = time.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) throw new Error('Invalid time format: hours or minutes not numeric');

        const period = periodRaw.toUpperCase();
        if (period !== 'AM' && period !== 'PM') throw new Error('Invalid time format: period must be AM or PM');

        // Convert to 24-hour format
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) hour24 += 12;
        else if (period === 'AM' && hours === 12) hour24 = 0;

        const totalMinutes = (hour24 * MINUTES_IN_HOUR) + minutes;

        if (process.env.NODE_ENV !== 'production') {
            console.log(`Parsing time: ${timeStr} => ${hour24}:${minutes} (${totalMinutes} minutes)`);
        }

        return { hour24, minutes, totalMinutes };
    } catch (error) {
        console.error(`Error parsing time "${timeStr}":`, error);
        // Return midnight as fallback
        return { hour24: 0, minutes: 0, totalMinutes: 0 };
    }
};

/**
 * Get current time in minutes since midnight and day of week index
 */
const getCurrentTime = () => {
    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentTimeInMinutes = (now.getHours() * MINUTES_IN_HOUR) + now.getMinutes();

    if (process.env.NODE_ENV !== 'production') {
        console.log(`Current time: ${now.getHours()}:${now.getMinutes()} (${currentTimeInMinutes} minutes)`);
        console.log('Current day:', DAYS_ORDER[currentDayIndex], `(index: ${currentDayIndex})`);
    }

    return { currentDayIndex, currentTimeInMinutes };
};

/**
 * Calculate how many minutes until a workout occurs
 * Handles wrapping to next week for past workouts
 */
const calculateMinutesUntilWorkout = (
    workoutDayIndex: number,
    workoutTimeInMinutes: number,
    currentDayIndex: number,
    currentTimeInMinutes: number
): number => {
    // Calculate days until workout (0-6)
    let daysUntil = workoutDayIndex - currentDayIndex;
    if (daysUntil < 0) {
        daysUntil += DAYS_IN_WEEK; // Move to next week
    }

    // Calculate minutes until workout
    let minutesUntil = workoutTimeInMinutes - currentTimeInMinutes;

    // If workout is today but has passed, move to next week
    if (daysUntil === 0 && minutesUntil < 0) {
        daysUntil = DAYS_IN_WEEK;
        minutesUntil = workoutTimeInMinutes;
    }

    // If workout is today and hasn't passed, use actual minutes until
    if (daysUntil === 0 && minutesUntil >= 0) {
        minutesUntil = workoutTimeInMinutes - currentTimeInMinutes;
    }

    // If workout is on a future day, use full minutes from start of that day
    if (daysUntil > 0) {
        minutesUntil = workoutTimeInMinutes;
    }

    // Calculate final position (minutes until workout)
    const totalMinutesUntil = (daysUntil * MINUTES_IN_DAY) + minutesUntil;

    if (process.env.NODE_ENV !== 'production') {
        console.log(
            `Position calc for ${DAYS_ORDER[workoutDayIndex]} at ${workoutTimeInMinutes} mins:`,
            `${daysUntil} days until,`,
            `${minutesUntil} mins until =`,
            `position ${totalMinutesUntil}`
        );
    }

    return totalMinutesUntil;
};

/**
 * Sort workouts by next occurrence, taking into account current time
 * Workouts that have already occurred today are moved to next week
 */
export const sortWorkoutsByDayAndTime = (workouts: WorkoutLocation[]): WorkoutLocation[] => {
    const { currentDayIndex, currentTimeInMinutes } = getCurrentTime();

    const sorted = [...workouts].sort((a, b) => {
        // Get day indices, defaulting to end of week if day is invalid
        const dayIndexA = DAYS_ORDER.indexOf(a.Group as DayOfWeek);
        const dayIndexB = DAYS_ORDER.indexOf(b.Group as DayOfWeek);
        
        // Parse times, defaulting to end of day if time is invalid
        const timeA = parseTime(a.Time).totalMinutes;
        const timeB = parseTime(b.Time).totalMinutes;

        const minutesUntilA = calculateMinutesUntilWorkout(
            dayIndexA, 
            timeA, 
            currentDayIndex, 
            currentTimeInMinutes
        );
        const minutesUntilB = calculateMinutesUntilWorkout(
            dayIndexB, 
            timeB, 
            currentDayIndex, 
            currentTimeInMinutes
        );

        return minutesUntilA - minutesUntilB;
    });

    if (process.env.NODE_ENV !== 'production') {
        console.log('Sorted workouts:', sorted.map(w => ({
            day: w.Group,
            time: w.Time,
            minutesUntil: calculateMinutesUntilWorkout(
                DAYS_ORDER.indexOf(w.Group as DayOfWeek),
                parseTime(w.Time).totalMinutes,
                currentDayIndex,
                currentTimeInMinutes
            )
        })));
    }

    return sorted;
}; 