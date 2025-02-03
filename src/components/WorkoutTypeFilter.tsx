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
        updateTypeFilter(newType);
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = event.target.value || null;
        updateTypeFilter(newType);
    };

    const updateTypeFilter = (newType: string | null) => {
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
        <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Workout Type
            </h3>
            
            {/* Mobile: Select Dropdown */}
            <div className="sm:hidden">
                <select
                    value={selectedType || ''}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border-gray-200 
                        dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600
                        focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                >
                    <option value="">All Types</option>
                    {workoutTypes.map((type) => (
                        <option key={type} value={type.toLowerCase()}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            {/* Desktop: Button Grid */}
            <div className="hidden sm:flex sm:flex-wrap gap-2">
                {workoutTypes.map((type) => {
                    const isSelected = selectedType === type.toLowerCase();
                    return (
                        <button
                            key={type}
                            onClick={() => handleTypeClick(type)}
                            className={`
                                px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${isSelected 
                                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-800' 
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                                }
                            `}
                        >
                            {type}
                        </button>
                    );
                })}
                {selectedType && (
                    <button
                        onClick={() => handleTypeClick(workoutTypes.find(t => t.toLowerCase() === selectedType) || workoutTypes[0])}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 transition-colors"
                    >
                        Clear Filter
                    </button>
                )}
            </div>
        </div>
    );
} 