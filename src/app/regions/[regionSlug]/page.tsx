// Step 3: Implement ISR with Dynamic Routes
// Edit app/regions/[regionSlug]/page.tsx

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { fetchWorkoutLocationsByRegion, fetchRegionSlugs } from '@/utils/fetchWorkoutLocations';
import { RegionHeader } from '@/components/RegionHeader';
import { WorkoutList } from '@/components/WorkoutList';
import { sortWorkoutsByDayAndTime } from '@/utils/workoutSorting';
import { calculateMapParameters, getMapUrl } from '@/utils/mapUtils';
import { extractCityAndState } from '@/utils/locationUtils';

interface RegionProps {
    params: Promise<{
        regionSlug: string;
    }>;
}

export const revalidate = 3600; // Revalidate every hour

// Generate static paths for all regions
export async function generateStaticParams() {
    const slugs = await fetchRegionSlugs();
    return slugs.map((slug) => ({
        regionSlug: slug,
    }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ regionSlug: string }> }
): Promise<Metadata> {
    const { regionSlug } = await params;
    const regionData = await fetchWorkoutLocationsByRegion(regionSlug);

    if (!regionData?.length) {
        return {
            title: 'Region Not Found',
            description: 'The requested F3 region could not be found.',
        };
    }

    const regionName = regionData[0].Region;
    const locations = regionData.map(workout => extractCityAndState(workout.Location));
    const uniqueLocations = [...new Set(locations)];
    const locationString = uniqueLocations.slice(0, 3).join(', ') + 
        (uniqueLocations.length > 3 ? ', and more' : '');

    return {
        title: `F3 ${regionName} Workouts`,
        description: `Find F3 workouts in ${regionName}, serving ${locationString}. Join us for free, peer-led workouts in your area.`,
    };
}

export default async function RegionPage({ params }: Pick<RegionProps, 'params'>) {
    const { regionSlug } = await params;
    const regionData = await fetchWorkoutLocationsByRegion(regionSlug);

    if (!regionData?.length) {
        notFound();
    }

    const regionName = regionData[0].Region;
    const website = regionData[0].Website;
    const sortedWorkouts = sortWorkoutsByDayAndTime(regionData);
    const mapParams = calculateMapParameters(regionData);

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-6">
                <Link
                    href="/regions"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Regions
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">F3 {regionName}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Free, peer-led workouts for men. Open to all men, held outdoors, 
                    rain or shine, hot or cold.
                </p>
            </div>

            <RegionHeader
                regionName={regionName}
                website={website}
            />
            
            <div className="mb-8">
                <iframe
                    src={getMapUrl(mapParams)}
                    className="w-full h-[400px] rounded-lg border border-gray-200 dark:border-gray-700"
                    title={`F3 ${regionName} Workout Locations Map`}
                    loading="lazy"
                />
            </div>
            
            <h2 className="text-2xl font-semibold mb-4">Workouts</h2>
            <Suspense fallback={<div>Loading workouts...</div>}>
                <WorkoutList workouts={sortedWorkouts} />
            </Suspense>
        </div>
    );
}