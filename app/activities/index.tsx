import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';
import { useCallback, useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const ACTIVITY_CATEGORIES: CategoryFilter[] = [
  { label: 'All', icon: 'compass', color: '#1C1C1E' },
  { label: 'Theme Parks', icon: 'happy', color: '#E85D3A' },
  { label: 'Gaming', icon: 'game-controller', color: '#9B59B6' },
  { label: 'Workshops', icon: 'construct', color: '#F2A93B' },
  { label: 'Nature', icon: 'leaf', color: '#2ECC71' },
  { label: 'Fitness', icon: 'fitness', color: '#E74C3C' },
];

export default function ActivitiesScreen() {
  const { state } = useOnboarding();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (state.country) params.set('country', state.country);
    if (state.city) params.set('city', state.city);
    return params.toString();
  }, [state.country, state.city]);

  // Fetch activities
  const { data: activities = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/activities', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const url = `${base}/api/activities${queryString ? `?${queryString}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch activities: ${res.status}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Map API data to BrowseItem format
  const browseItems: BrowseItem[] = useMemo(
    () =>
      activities.map((activity: any) => ({
        id: activity.id,
        title: activity.name,
        subtitle: `${activity.category} | ${activity.duration}`,
        description: activity.description,
        imageUrl: activity.imageUrl,
        rating: activity.rating,
        reviews: activity.reviews,
        priceLabel: activity.priceLabel,
        isPromoted: activity.isPromoted || activity.isPopular,
        category: activity.category,
      })),
    [activities]
  );

  // Filter by search query
  const searchFilteredItems = useMemo(() => {
    if (!searchQuery.trim()) return browseItems;
    
    const query = searchQuery.toLowerCase().trim();
    return browseItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
  }, [browseItems, searchQuery]);

  // Filter promoted items (from original list, not search filtered)
  const promotedItems = useMemo(
    () => browseItems.filter((item) => item.isPromoted),
    [browseItems]
  );

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes
    
    setRefreshing(true);
    
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      await refetch();
      
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refreshing]);

  // Handle search change
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    
    // Optional: Add haptic feedback when search is cleared
    if (!isWeb && query === '' && searchQuery !== '') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [searchQuery]);

  // Handle item press
  const handleItemPress = useCallback((item: BrowseItem) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.push({
      pathname: '/activities/[id]',
      params: { id: item.id },
    });
  }, []);

  // Determine empty state message
  const getEmptyStateMessage = useCallback(() => {
    if (searchQuery.trim()) {
      return {
        title: 'No Results Found',
        subtitle: `No activities match "${searchQuery}". Try a different search term.`,
      };
    }
    
    if (state.city) {
      return {
        title: 'No Activities Found',
        subtitle: `We couldn't find any activities in ${state.city}. Try selecting a different location.`,
      };
    }
    
    return {
      title: 'No Activities Found',
      subtitle: "We couldn't find any activities. Try selecting a location in settings.",
    };
  }, [searchQuery, state.city]);

  const emptyState = getEmptyStateMessage();

  return (
    <BrowsePage
      title="Activities"
      accentColor="#E85D3A"
      accentIcon="fitness"
      categories={ACTIVITY_CATEGORIES}
      categoryKey="category"
      items={searchFilteredItems}
      isLoading={isLoading}
      error={error}
      promotedItems={searchQuery.trim() ? [] : promotedItems} // Hide promoted when searching
      promotedTitle="Popular Activities"
      onItemPress={handleItemPress}
      // Pull-to-refresh
      refreshing={refreshing}
      onRefresh={handleRefresh}
      // Search
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search activities..."
      // Empty state
      emptyStateTitle={emptyState.title}
      emptyStateSubtitle={emptyState.subtitle}
    />
  );
}
