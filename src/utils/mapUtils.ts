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

export interface MapParameters {
    center: {
        lat: number;
        lng: number;
    };
    zoom: number;
    markers: Array<{
        lat: number;
        lng: number;
        title: string;
    }>;
}

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
export function getMapUrl(params: MapParameters): string {
    const { center, zoom, markers } = params;
    const baseUrl = 'https://www.google.com/maps/embed/v1/view';
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!key) {
        console.error('Google Maps API key not found');
        return '';
    }

    const markerParams = markers.map(marker => 
        `&markers=color:red|${marker.lat},${marker.lng}`
    ).join('');

    return `${baseUrl}?key=${key}&center=${center.lat},${center.lng}&zoom=${zoom}${markerParams}`;
}

/**
 * Calculates map parameters (center point and zoom level) based on workout locations
 * @param workouts Array of workout locations
 * @returns Object containing latitude, longitude, and zoom level
 */
export function calculateMapParameters(workouts: Array<{ Latitude: string; Longitude: string; Name: string }>): MapParameters {
    // Default to a central US location if no workouts
    if (!workouts.length) {
        return {
            center: { lat: 39.8283, lng: -98.5795 },
            zoom: 4,
            markers: []
        };
    }

    const markers = workouts.map(workout => ({
        lat: parseFloat(workout.Latitude),
        lng: parseFloat(workout.Longitude),
        title: workout.Name
    }));

    // Calculate bounds
    const lats = markers.map(m => m.lat);
    const lngs = markers.map(m => m.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate center
    const center = {
        lat: (minLat + maxLat) / 2,
        lng: (minLng + maxLng) / 2
    };

    // Calculate appropriate zoom level
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    const zoom = Math.floor(14 - Math.log2(maxDiff));

    return {
        center,
        zoom: Math.min(Math.max(zoom, 4), 15), // Clamp between 4 and 15
        markers
    };
} 