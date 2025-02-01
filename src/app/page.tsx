import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'F3 Workout Locations',
  description: 'Find F3 workout locations and schedules in your region',
  openGraph: {
    title: 'F3 Workout Locations',
    description: 'Find F3 workout locations and schedules in your region',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'F3 Workout Locations',
    description: 'Find F3 workout locations and schedules in your region',
  },
};

export default function Home() {
  redirect('/regions');
}
