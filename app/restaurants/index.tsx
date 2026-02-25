import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';
import { fetch } from 'expo/fetch';
import { useMemo, useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const restaurantCuisines: CategoryFilter[] = [
  { label: 'All', icon: 'restaurant', color: '#1C1C1E' },
  { label: 'South Indian', icon: 'flame', color: '#E85D3A' },
  { label: 'North Indian', icon: 'star', color: '#F2A93B' },
  { label: 'Sri Lankan', icon: 'leaf', color: '#9B59B6' },
  { label: 'Street Food', icon: 'fast-food', color: '#2ECC71' },
  { label: 'Afghan', icon: 'bonfire', color: '#1A7A6D' },
  { label: 'Japanese-Fusion', icon: 'fish', color: '#E74C3C' },
  { label: 'Middle Eastern', icon: 'pizza', color: '#3498DB' },
  { label: 'Chinese', icon: 'nutrition', color: '#E67E22' },
];

interface RestaurantData {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  description: string;
  imageUrl: string;
  color?: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  isPromoted?: boolean;
  location: string;
  features?: string[];
  reservationAvailable?: boolean;
  deliveryAvailable?: boolean;
}

export default function RestaurantsScreen() {
  const { state } = useOnboarding();
  const [refreshing, setRefreshing] = useState(false);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (state.country) params.set('country', state.country);
    if (state.city) params.set('city', state.city);
    return params.toString();
  }, [state.country, state.city]);

  const {
    data: restaurants = [],
    isLoading,
    error,
    refetch,
  } = useQuery<RestaurantData[]>({
    queryKey: ['/api/restaurants', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const url = `${base}/api/restaurants${queryParams ? `?${queryParams}` : ''}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to fetch restaurants: ${res.status}`);
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const items: BrowseItem[] = useMemo(() => {
    return restaurants
      .filter((rest) => rest && rest.id && rest.name)
      .map((rest) => ({
        id: rest.id,
        title: rest.name,
        subtitle: `${rest.cuisine} | ${rest.priceRange}`,
        description: rest.description,
        imageUrl: rest.imageUrl,
        color: rest.color,
        rating: rest.rating,
        reviews: rest.reviews,
        badge: rest.isOpen ? 'Open' : undefined,
        isPromoted: rest.isPromoted || false,
        cuisine: rest.cuisine,
        location: rest.location,
        features: rest.features || [],
        reservationAvailable: rest.reservationAvailable || false,
        deliveryAvailable: rest.deliveryAvailable || false,
      }));
  }, [restaurants]);

  const promotedItems = useMemo(() => {
    return items.filter((item) => item.isPromoted);
  }, [items]);

  const handleItemPress = useCallback(
    (item: BrowseItem) => {
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      router.push({
        pathname: '/restaurants/[id]',
        params: { id: item.id },
      });
    },
    []
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItemExtra = useCallback((item: BrowseItem) => {
    const hasFeatures = item.features && Array.isArray(item.features) && item.features.length > 0;
    const hasActions = item.reservationAvailable || item.deliveryAvailable;

    if (!hasFeatures && !hasActions && !item.location) {
      return null;
    }

    return (
      <View style={styles.itemExtra}>
        {hasFeatures && (
          <View style={styles.featureRow}>
            {item.features!.slice(0, 3).map((f: string) => (
              <View key={f} style={styles.featurePill}>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        )}
        {(hasActions || item.location) && (
          <View style={styles.cardFooter}>
            {item.location && (
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.locText} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            )}
            <View style={styles.actionRow}>
              {item.reservationAvailable && (
                <View style={styles.actionPill}>
                  <Ionicons name="calendar-outline" size={12} color={Colors.secondary} />
                  <Text style={styles.actionText}>Reserve</Text>
                </View>
              )}
              {item.deliveryAvailable && (
                <View style={styles.actionPill}>
                  <Ionicons name="bicycle-outline" size={12} color={Colors.primary} />
                  <Text style={[styles.actionText, { color: Colors.primary }]}>Delivery</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  }, []);

  return (
    <BrowsePage
      title="Restaurants"
      accentColor="#E85D3A"
      accentIcon="restaurant"
      categories={restaurantCuisines}
      categoryKey="cuisine"
      items={items}
      isLoading={isLoading}
      error={error ? 'Failed to load restaurants' : undefined}
      promotedItems={promotedItems}
      promotedTitle="Popular Restaurants"
      onItemPress={handleItemPress}
      renderItemExtra={renderItemExtra}
      onRefresh={handleRefresh}
      emptyMessage={
        state.city
          ? `No restaurants found in ${state.city}`
          : 'No restaurants available in your area'
      }
      emptyIcon="restaurant-outline"
    />
  );
}

const styles = StyleSheet.create({
  itemExtra: {
    gap: 8,
    marginTop: 4,
  },

  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  featurePill: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  featureText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },

  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 0,
  },

  locText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    flex: 1,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    flexShrink: 0,
  },

  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  actionText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.secondary,
  },
});
