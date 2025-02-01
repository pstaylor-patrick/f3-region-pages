import { DAYS_ORDER } from '@/constants';

type DayOfWeek = typeof DAYS_ORDER[number];

export interface WorkoutLocation {
    'Entry ID': string;
    Region: string;
    Location: string;
    Day: string;
    'Workout Type': string;
    Time: string;
    Coordinates: string;
    Website?: string;
    'Additional Details'?: string;
} 