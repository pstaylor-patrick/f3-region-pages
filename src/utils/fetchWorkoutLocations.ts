import { WorkoutLocation } from '@/types/workoutLocation';
import { unstable_cache } from 'next/cache';

type SheetResponse = {
    values: (string[])[];
}

if (!process.env.GOOGLE_SHEETS_API_KEY) {
    throw new Error('GOOGLE_SHEETS_API_KEY environment variable is not set');
}

if (!process.env.GOOGLE_SHEETS_ID) {
    throw new Error('GOOGLE_SHEETS_ID environment variable is not set');
}

if (!process.env.GOOGLE_SHEETS_TAB_NAME) {
    throw new Error('GOOGLE_SHEETS_TAB_NAME environment variable is not set');
}

const SHEETS_BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEETS_ID}/values/${process.env.GOOGLE_SHEETS_TAB_NAME}?key=${process.env.GOOGLE_SHEETS_API_KEY}`;

const toKebabCase = (str: string) => 
    str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// Get today's date in YYYYMMDD format for cache key
const getTodayKey = () => {
    const today = new Date();
    return today.getFullYear().toString() +
           (today.getMonth() + 1).toString().padStart(2, '0') +
           today.getDate().toString().padStart(2, '0');
};

// Fetch and process the sheet data
async function fetchSheetData() {
    try {
        const res = await fetch(SHEETS_BASE_URL);

        if (!res.ok) {
            console.error('Failed to fetch sheet data:', res.statusText);
            return null;
        }

        const data: SheetResponse = await res.json();
        
        const rows = data.values;
        if (!rows || rows.length < 2) {
            console.error('Invalid sheet data: no rows found or missing headers');
            return null;
        }

        const headers = rows[0];
        const regionColumnIndex = headers.indexOf('Region');
        
        if (regionColumnIndex === -1) {
            console.error('Region column not found in sheet');
            return null;
        }

        // Create a map of region slugs to row indices for efficient lookup
        const regionMap = new Map<string, number[]>();
        
        rows.slice(1).forEach((row, index) => {
            const regionSlug = toKebabCase(row[regionColumnIndex]);
            if (!regionMap.has(regionSlug)) {
                regionMap.set(regionSlug, []);
            }
            regionMap.get(regionSlug)?.push(index);
        });

        return {
            headers,
            rows: rows.slice(1),
            regionMap
        };
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return null;
    }
}

// Cache just the region slugs
const getCachedRegionSlugs = unstable_cache(
    async () => {
        const sheetData = await fetchSheetData();
        if (!sheetData) {
            console.error('No sheet data returned');
            return [];
        }
        const regions = Array.from(sheetData.regionMap.keys()).sort();
        return regions;
    },
    [`region-slugs-${getTodayKey()}`],
    {
        revalidate: 86400, // Cache for 24 hours
        tags: ['region-slugs']
    }
);

// Cache workout locations for a specific region
const getCachedWorkoutLocations = unstable_cache(
    async (regionSlug: string) => {
        const sheetData = await fetchSheetData();
        if (!sheetData || !sheetData.regionMap.has(regionSlug)) return null;

        const { headers, rows, regionMap } = sheetData;
        const indices = regionMap.get(regionSlug) || [];

        try {
            return indices.map(index => {
                const row = rows[index];
                const rowData = {} as WorkoutLocation;
                headers.forEach((header: string, i: number) => {
                    (rowData as any)[header] = row[i] || '';
                });
                return rowData;
            });
        } catch (error) {
            console.error('Error processing workout locations:', error);
            return null;
        }
    },
    [`workout-locations-${getTodayKey()}`],
    {
        revalidate: 86400, // Cache for 24 hours
        tags: ['workout-locations']
    }
);

export const fetchRegionSlugs = async (): Promise<string[]> => {
    return getCachedRegionSlugs();
}

export const fetchWorkoutLocationsByRegion = async (regionSlug: string): Promise<WorkoutLocation[] | null> => {
    return getCachedWorkoutLocations(regionSlug);
} 