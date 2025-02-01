// Step 3: Implement ISR with Dynamic Routes
// Edit app/regions/[regionSlug]/page.tsx

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { fetchWorkoutLocationsByRegion, fetchRegionSlugs } from '@/utils/fetchWorkoutLocations';
import { RegionHeader } from '@/components/RegionHeader';
import { WorkoutList } from '@/components/WorkoutList';
import { WorkoutLocation } from '@/types/workoutLocation';
import { sortWorkoutsByDayAndTime } from '@/utils/workoutSorting';

interface RegionProps {
    params: Promise<{
        regionSlug: string;
    }>;
}

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
    const regions = await fetchRegionSlugs();
    return regions.map((regionSlug: string) => ({
        regionSlug,
    }));
}

export async function generateMetadata(
    { params }: { params: Promise<{ regionSlug: string }> },
    parent: Promise<Metadata>
): Promise<Metadata> {
    const resolvedParams = await params;
    const regionSlug = resolvedParams.regionSlug;
    const workouts = await fetchWorkoutLocationsByRegion(regionSlug);
    
    if (!workouts || workouts.length === 0) {
        return notFound();
    }
    
    const regionName = workouts[0].Region;
    const title = `F3 Workouts in ${regionName}`;
    const description = `Find F3 workout locations, schedules, and details for the ${regionName} region`;
    
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
        twitter: {
            card: 'summary',
            title,
            description,
        },
    };
}

export default async function RegionPage({ params }: RegionProps) {
    // Wait for params to resolve
    const resolvedParams = await params;

    // Validate that the region exists
    const regions = await fetchRegionSlugs();
    if (!regions.includes(resolvedParams.regionSlug)) {
        notFound();
    }

    const regionData = await fetchWorkoutLocationsByRegion(resolvedParams.regionSlug);
    if (!regionData || regionData.length === 0) {
        notFound();
    }

    const regionName = regionData[0].Region;
    const website = regionData[0].Website;
    const sortedWorkouts = sortWorkoutsByDayAndTime(regionData);

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

            <RegionHeader 
                regionName={regionName}
                website={website}
            />
            
            <h2 className="text-2xl font-semibold mb-4">Workouts</h2>
            <WorkoutList workouts={sortedWorkouts} />
        </div>
    );
}