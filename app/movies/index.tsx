import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';
import { fetch } from 'expo/fetch';
import { useCallback, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const movieGenres: CategoryFilter[] = [
  { label: 'All', icon: 'film', color: '#1C1C1E' },
  { label: 'Action', icon: 'flash', color: '#E85D3A' },
  { label: 'Drama', icon: 'heart', color: '#9B59B6' },
  { label: 'Comedy', icon: 'happy', color: '#F2A93B' },
  { label: 'Horror', icon: 'skull', color: '#2C3E50' },
  { label: 'Thriller', icon: 'eye', color: '#E74C3C' },
  { label: 'Romance', icon: 'heart-circle', color: '#E91E63' },
  { label: 'Sci-Fi', icon: 'planet', color: '#3498DB' },
  { label: 'Adventure', icon: 'compass', color: '#27AE60' },
];

interface MovieData {
  id: string;
  title: string;
  language: string;
  duration: string;
  rating: string;
  posterUrl: string;
  posterColor?: string;
  imdbScore: number;
  showtimes: Array<{ price: number; cinema?: string }>;
  genre: string[];
  isPromoted?: boolean;
  releaseDate?: string;
}

export default function MoviesScreen() {
  const { state } = useOnboarding();

  // ✅ SINGLE queryParams - Fixed duplicate declaration
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (state.country) params.set('country', state.country);
    if (state.city) params.set('city', state.city);
    params.set('includePromoted', 'true');
    params.set('sortBy', 'imdbScore');
    params.set('sortOrder', 'desc');
    return params.toString();
  }, [state.country, state.city]);

  const {
    data: moviesData = [],
    isLoading,
    error,
    refetch,
  } = useQuery<MovieData[]>({
    queryKey: ['movies', queryParams], // ✅ Use queryParams in key
    queryFn: async () => {
      const base = getApiUrl();
      const url = `${base}/api/movies?${queryParams}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch movies: ${res.status}`);
      }
      
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Map API data to BrowseItem format
  const items: BrowseItem[] = useMemo(() => {
    return moviesData
      .filter((movie) => movie && movie.id && movie.title)
      .map((movie) => {
        const lowestPrice = movie.showtimes?.length
          ? Math.min(...movie.showtimes.map((st) => st.price))
          : null;

        return {
          id: movie.id,
          title: movie.title,
          subtitle: `${movie.language} • ${movie.duration} • ${movie.rating}`,
          imageUrl: movie.posterUrl,
          rating: movie.imdbScore,
          priceLabel: lowestPrice ? `From $${lowestPrice.toFixed(0)}` : 'Price TBA',
          badge: movie.genre?.[0] || 'Movie', // Primary genre only
          isPromoted: movie.isPromoted || false,
          genre: movie.genre || [],
          color: movie.posterColor,
        };
      });
  }, [moviesData]);

  // Filter promoted items
  const promotedItems = useMemo(() => {
    return items.filter((item) => item.isPromoted).slice(0, 3); // Limit to 3
  }, [items]);

  const handleItemPress = useCallback((item: BrowseItem) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/movies/${item.id}`);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await refetch();
  }, [refetch]);

  return (
    <BrowsePage
      title="Movies"
      accentColor="#9B59B6"
      accentIcon="film"
      categories={movieGenres}
      categoryKey="genre"
      items={items}
      isLoading={isLoading}
      error={error ? 'Failed to load movies' : undefined}
      promotedItems={promotedItems}
      promotedTitle="🎬 Now Trending"
      onItemPress={handleItemPress}
      onRefresh={handleRefresh}
      emptyMessage={`No movies in ${state.city || state.country || 'your area'}`}
      emptyIcon="videocam-off-outline"
    />
  );
}
