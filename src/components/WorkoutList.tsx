'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkoutLocation } from '@/types/workoutLocation';
import { WorkoutCard } from '@/components/WorkoutCard';
import { DayFilter } from '@/components/DayFilter';
import { WorkoutTypeFilter } from '@/components/WorkoutTypeFilter';

interface WorkoutListProps {
    workouts: WorkoutLocation[];
}

export function WorkoutList({ workouts }: WorkoutListProps) {
    const searchParams = useSearchParams();
    const [filteredWorkouts, setFilteredWorkouts] = useState(workouts);
    const [dayFiltered, setDayFiltered] = useState(workouts);
    const [typeFiltered, setTypeFiltered] = useState(workouts);

    // Apply both filters whenever either changes
    useEffect(() => {
        const dayParam = searchParams.get('day')?.toLowerCase();
        const typeParam = searchParams.get('type')?.toLowerCase();

        let filtered = workouts;

        // Apply day filter
        if (dayParam) {
            filtered = filtered.filter(workout => 
                workout.Group?.toLowerCase() === dayParam
            );
        }

        // Apply type filter
        if (typeParam) {
            filtered = filtered.filter(workout => 
                workout.Type?.toLowerCase() === typeParam
            );
        }

        setFilteredWorkouts(filtered);
    }, [workouts, searchParams]);

    return (
        <div>
            <div className="space-y-4 mb-8">
                <DayFilter 
                    workouts={workouts}
                    onFilteredWorkouts={setDayFiltered}
                />
                <WorkoutTypeFilter 
                    workouts={workouts}
                    onFilteredWorkouts={setTypeFiltered}
                />
            </div>
            
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
                    No workouts match the selected filters
                </div>
            )}
        </div>
    );
} 