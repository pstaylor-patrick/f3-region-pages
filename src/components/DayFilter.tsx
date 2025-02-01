'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WorkoutLocation } from '@/types/workoutLocation';

const DAYS_OF_WEEK = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
];

interface DayFilterProps {
    workouts: WorkoutLocation[];
    onFilteredWorkouts: (workouts: WorkoutLocation[]) => void;
}

export function DayFilter({ workouts, onFilteredWorkouts }: DayFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedDay, setSelectedDay] = useState<string | null>(
        searchParams.get('day')?.toLowerCase() || null
    );

    // Apply filter based on URL param on mount and when URL changes
    useEffect(() => {
        const dayParam = searchParams.get('day')?.toLowerCase() || null;
        setSelectedDay(dayParam);
        
        if (dayParam) {
            const filtered = workouts.filter(workout => 
                workout.Group?.toLowerCase() === dayParam
            );
            onFilteredWorkouts(filtered);
        } else {
            onFilteredWorkouts(workouts);
        }
    }, [searchParams, workouts, onFilteredWorkouts]);

    const handleDayClick = (day: string) => {
        const newDay = selectedDay === day.toLowerCase() ? null : day.toLowerCase();
        
        // Update URL with lowercase day
        const params = new URLSearchParams(searchParams);
        if (newDay) {
            params.set('day', newDay);
        } else {
            params.delete('day');
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Day
            </h3>
            <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                    <button
                        key={day}
                        onClick={() => handleDayClick(day)}
                        className={`px-3 py-1 rounded-full text-sm ${
                            selectedDay === day.toLowerCase()
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        {day}
                    </button>
                ))}
                {selectedDay && (
                    <button
                        onClick={() => handleDayClick(DAYS_OF_WEEK.find(d => d.toLowerCase() === selectedDay) || DAYS_OF_WEEK[0])}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                        Clear Filter
                    </button>
                )}
            </div>
        </div>
    );
} 