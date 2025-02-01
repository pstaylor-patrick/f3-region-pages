import { DAYS_ORDER } from '@/constants';

type DayOfWeek = typeof DAYS_ORDER[number];

export interface WorkoutLocation {
    'Entry ID': string;
    Region: string;
    Location: string;
    Group: string;
    'Workout Type': string;
    Time: string;
    Type: string;
    Name: string;
    Description: string;
    Notes: string;
    Website?: string;
    Latitude: string;
    Longitude: string;
    'Marker Icon'?: string;
    'Marker Color'?: string;
    'Icon Color'?: string;
    'Custom Size'?: string;
    Image?: string;
} 