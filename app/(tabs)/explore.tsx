import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';
import { fetch } from 'expo/fetch';

const eventCategories: CategoryFilter[] = [
  { label: 'All', icon: 'calendar', color: '#1C1C1E' },
  { label: 'Music', icon: 'musical-notes', color: '#FF6B6B' },
  { label: 'Dance', icon: 'body', color: '#4ECDC4' },
  { label: 'Food', icon: 'restaurant', color: '#FFD93D' },
  { label: 'Art', icon: 'color-palette', color: '#A855F7' },
  { label: 'Wellness', icon: 'heart', color: '#FF6B8A' },
  { label: 'Film', icon: 'film', color: '#2196F3' },
  { label: 'Workshop', icon: 'construct', color: '#FF9800' },
  { label: 'Heritage', icon: 'library', color: '#8B4513' },
];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export default function ExploreScreen() {
  const { state } = useOnboarding();

  const queryParams = new URLSearchParams();
  if (state.country) queryParams.set('country', state.country);
  if (state.city) queryParams.set('city', state.city);
  const qs = queryParams.toString();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const url = `${base}api/events${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const browseItems: BrowseItem[] = events.map((event: any) => ({
    id: event.id,
    title: event.title,
    subtitle: `${formatDate(event.date)} | ${event.venue}`,
    description: event.description,
    imageUrl: event.imageUrl,
    rating: event.attending ? undefined : undefined,
    priceLabel: event.priceCents === 0 ? 'Free' : event.priceLabel,
    isPromoted: event.isFeatured,
    badge: event.communityTag,
    category: event.category,
    meta: `${event.attending} attending`,
  }));

  const promotedItems = browseItems.filter((item) => item.isPromoted);

  const handleItemPress = (item: BrowseItem) => {
    router.push({ pathname: '/event/[id]', params: { id: item.id } });
  };

  return (
    <BrowsePage
      title="Events"
      accentColor="#1A7A6D"
      accentIcon="calendar"
      categories={eventCategories}
      categoryKey="category"
      items={browseItems}
      isLoading={isLoading}
      promotedItems={promotedItems}
      promotedTitle="Featured Events"
      onItemPress={handleItemPress}
      emptyMessage="No events found"
      emptyIcon="calendar-outline"
    />
  );
}
