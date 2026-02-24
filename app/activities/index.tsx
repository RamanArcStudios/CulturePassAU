import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';

const activityCategories: CategoryFilter[] = [
  { label: 'All', icon: 'compass', color: '#1C1C1E' },
  { label: 'Theme Parks', icon: 'happy', color: '#E85D3A' },
  { label: 'Gaming', icon: 'game-controller', color: '#9B59B6' },
  { label: 'Workshops', icon: 'construct', color: '#F2A93B' },
  { label: 'Nature', icon: 'leaf', color: '#2ECC71' },
  { label: 'Fitness', icon: 'fitness', color: '#E74C3C' },
];

export default function ActivitiesScreen() {
  const { state } = useOnboarding();

  const queryParams = new URLSearchParams();
  if (state.country) queryParams.set('country', state.country);
  if (state.city) queryParams.set('city', state.city);
  const qs = queryParams.toString();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['/api/activities', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const url = `${base}api/activities${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  // Map API data to BrowseItem format
  const browseItems: BrowseItem[] = activities.map((activity: any) => ({
    id: activity.id,
    title: activity.name,
    subtitle: `${activity.category} | ${activity.duration}`,
    description: activity.description,
    imageUrl: activity.imageUrl,
    rating: activity.rating,
    reviews: activity.reviews,
    priceLabel: activity.priceLabel,
    isPromoted: activity.isPromoted,
  }));

  // Filter promoted items
  const promotedItems = browseItems.filter((item) => item.isPromoted);

  const handleItemPress = (item: BrowseItem) => {
    router.push({ pathname: '/activities/[id]', params: { id: item.id } });
  };

  return (
    <BrowsePage
      title="Activities"
      accentColor="#E85D3A"
      accentIcon="fitness"
      categories={activityCategories}
      categoryKey="category"
      items={browseItems}
      isLoading={isLoading}
      promotedItems={promotedItems}
      promotedTitle="Popular Activities"
      onItemPress={handleItemPress}
    />
  );
}
