'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { WorkoutLocation } from '@/types/workoutLocation';

interface WorkoutTypeFilterProps {
    workouts: WorkoutLocation[];
    onFilteredWorkouts: (workouts: WorkoutLocation[]) => void;
}

export function WorkoutTypeFilter({ workouts, onFilteredWorkouts }: WorkoutTypeFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedType, setSelectedType] = useState<string | null>(
        searchParams.get('type')?.toLowerCase() || null
    );

    // Get unique workout types from the data
    const workoutTypes = useMemo(() => {
        const types = new Set<string>();
        workouts.forEach(workout => {
            if (workout.Type) {
                types.add(workout.Type);
            }
        });
        return Array.from(types).sort();
    }, [workouts]);

    // Apply filter based on URL param on mount and when URL changes
    useEffect(() => {
        const typeParam = searchParams.get('type')?.toLowerCase() || null;
        setSelectedType(typeParam);
        
        if (typeParam) {
            const filtered = workouts.filter(workout => 
                workout.Type?.toLowerCase() === typeParam
            );
            onFilteredWorkouts(filtered);
        } else {
            onFilteredWorkouts(workouts);
        }
    }, [searchParams, workouts, onFilteredWorkouts]);

    const handleTypeClick = (type: string) => {
        const newType = selectedType === type.toLowerCase() ? null : type.toLowerCase();
        
        // Update URL with lowercase type
        const params = new URLSearchParams(searchParams);
        if (newType) {
            params.set('type', newType);
        } else {
            params.delete('type');
        }
        router.push(`?${params.toString()}`);
    };

    if (workoutTypes.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Workout Type
            </h3>
            <div className="flex flex-wrap gap-2">
                {workoutTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => handleTypeClick(type)}
                        className={`px-3 py-1 rounded-full text-sm ${
                            selectedType === type.toLowerCase()
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                    >
                        {type}
                    </button>
                ))}
                {selectedType && (
                    <button
                        onClick={() => handleTypeClick(workoutTypes.find(t => t.toLowerCase() === selectedType) || workoutTypes[0])}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                        Clear Filter
                    </button>
                )}
            </div>
        </div>
    );
} 