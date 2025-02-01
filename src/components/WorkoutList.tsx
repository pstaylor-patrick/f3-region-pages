'use client';

import { useState, useEffect } from 'react';
import { WorkoutLocation } from '@/types/workoutLocation';
import { WorkoutCard } from '@/components/WorkoutCard';
import { DayFilter } from '@/components/DayFilter';

interface WorkoutListProps {
    workouts: WorkoutLocation[];
}

export function WorkoutList({ workouts }: WorkoutListProps) {
    const [filteredWorkouts, setFilteredWorkouts] = useState(workouts);

    // Debug: Log complete workout data
    useEffect(() => {
        console.log('Complete workout data:');
        workouts.forEach(workout => {
            console.log('Workout details:', {
                ...workout,
                fieldNames: Object.keys(workout)
            });
        });
    }, [workouts]);

    return (
        <div>
            <DayFilter 
                workouts={workouts}
                onFilteredWorkouts={setFilteredWorkouts}
            />
            
            <div className="grid gap-4 md:grid-cols-2">
                {filteredWorkouts.map((workout: WorkoutLocation) => (
                    <WorkoutCard 
                        key={workout['Entry ID']}
                        workout={workout}
                    />
                ))}
            </div>

            {filteredWorkouts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No workouts found for the selected day
                </div>
            )}
        </div>
    );
} 