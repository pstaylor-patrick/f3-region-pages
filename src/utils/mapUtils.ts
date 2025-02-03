import type { WorkoutLocation } from '@/types/workoutLocation';

export const MAP_CONSTANTS = {
    EARTH_RADIUS_KM: 6371,
    ZOOM_LEVELS: {
        NEIGHBORHOOD: { distance: 5, zoom: 13 as number },
        SMALL_CITY: { distance: 15, zoom: 12 as number },
        LARGE_CITY: { distance: 30, zoom: 11 as number },
        METROPOLITAN: { distance: 60, zoom: 10 as number },
        REGIONAL: { distance: 100, zoom: 9 as number },
        WIDE_REGIONAL: { zoom: 8 as number }
    },
    DEFAULT_PARAMS: {
        lat: 0,
        lon: 0,
        zoom: 12
    }
} as const;

/**
 * Calculates the haversine distance between two points on Earth
 * @param lat1 Latitude of first point in degrees
 * @param lon1 Longitude of first point in degrees
 * @param lat2 Latitude of second point in degrees
 * @param lon2 Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    return 2 * MAP_CONSTANTS.EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/**
 * Generates a URL for the F3 Nation map with the given parameters
 * @param params Object containing latitude, longitude, and zoom level
 * @returns URL string for the F3 Nation map
 */
export function getMapUrl(params: { lat: number; lon: number; zoom: number }): string {
    return `https://map.f3nation.com/?lat=${params.lat}&lon=${params.lon}&zoom=${params.zoom}`;
}

/**
 * Calculates map parameters (center point and zoom level) based on workout locations
 * @param workouts Array of workout locations
 * @returns Object containing latitude, longitude, and zoom level
 */
export function calculateMapParameters(workouts: WorkoutLocation[]): { lat: number; lon: number; zoom: number } {
    if (!workouts.length) {
        return MAP_CONSTANTS.DEFAULT_PARAMS;
    }

    const validCoordinates = workouts.filter(workout => 
        workout.Latitude && 
        workout.Longitude && 
        !isNaN(parseFloat(workout.Latitude)) && 
        !isNaN(parseFloat(workout.Longitude))
    );

    if (!validCoordinates.length) {
        return MAP_CONSTANTS.DEFAULT_PARAMS;
    }

    // Calculate center point
    const sumLat = validCoordinates.reduce((sum, workout) => 
        sum + parseFloat(workout.Latitude), 0
    );
    const sumLon = validCoordinates.reduce((sum, workout) => 
        sum + parseFloat(workout.Longitude), 0
    );
    
    const centerLat = sumLat / validCoordinates.length;
    const centerLon = sumLon / validCoordinates.length;

    // Find the maximum distance between any two points
    let maxDistance = 0;
    for (let i = 0; i < validCoordinates.length; i++) {
        for (let j = i + 1; j < validCoordinates.length; j++) {
            const distance = calculateHaversineDistance(
                parseFloat(validCoordinates[i].Latitude),
                parseFloat(validCoordinates[i].Longitude),
                parseFloat(validCoordinates[j].Latitude),
                parseFloat(validCoordinates[j].Longitude)
            );
            maxDistance = Math.max(maxDistance, distance);
        }
    }

    // Calculate zoom level based on maximum distance
    let zoom = MAP_CONSTANTS.ZOOM_LEVELS.WIDE_REGIONAL.zoom;
    if (maxDistance < MAP_CONSTANTS.ZOOM_LEVELS.NEIGHBORHOOD.distance) {
        zoom = MAP_CONSTANTS.ZOOM_LEVELS.NEIGHBORHOOD.zoom;
    } else if (maxDistance < MAP_CONSTANTS.ZOOM_LEVELS.SMALL_CITY.distance) {
        zoom = MAP_CONSTANTS.ZOOM_LEVELS.SMALL_CITY.zoom;
    } else if (maxDistance < MAP_CONSTANTS.ZOOM_LEVELS.LARGE_CITY.distance) {
        zoom = MAP_CONSTANTS.ZOOM_LEVELS.LARGE_CITY.zoom;
    } else if (maxDistance < MAP_CONSTANTS.ZOOM_LEVELS.METROPOLITAN.distance) {
        zoom = MAP_CONSTANTS.ZOOM_LEVELS.METROPOLITAN.zoom;
    } else if (maxDistance < MAP_CONSTANTS.ZOOM_LEVELS.REGIONAL.distance) {
        zoom = MAP_CONSTANTS.ZOOM_LEVELS.REGIONAL.zoom;
    }

    return {
        lat: centerLat,
        lon: centerLon,
        zoom
    };
} 