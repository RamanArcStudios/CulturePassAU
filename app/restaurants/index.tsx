import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';
import { fetch } from 'expo/fetch';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

const restaurantCuisines: CategoryFilter[] = [
  { label: 'All', icon: 'restaurant', color: '#1C1C1E' },
  { label: 'South Indian', icon: 'flame', color: '#E85D3A' },
  { label: 'North Indian', icon: 'star', color: '#F2A93B' },
  { label: 'Sri Lankan', icon: 'leaf', color: '#9B59B6' },
  { label: 'Street Food', icon: 'fast-food', color: '#2ECC71' },
  { label: 'Afghan', icon: 'bonfire', color: '#1A7A6D' },
  { label: 'Japanese-Fusion', icon: 'fish', color: '#E74C3C' },
];

interface RestaurantData {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  isPromoted: boolean;
  location: string;
  features?: string[];
  reservationAvailable?: boolean;
  deliveryAvailable?: boolean;
}

export default function RestaurantsScreen() {
  const { state } = useOnboarding();

  const queryParams = new URLSearchParams();
  if (state.country) queryParams.set('country', state.country);
  if (state.city) queryParams.set('city', state.city);
  const qs = queryParams.toString();

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: ['/api/restaurants', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const url = `${base}api/restaurants${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const items: BrowseItem[] = useMemo(() => {
    return restaurants.map((rest: RestaurantData) => ({
      id: rest.id,
      title: rest.name,
      subtitle: `${rest.cuisine} | ${rest.priceRange}`,
      description: rest.description,
      imageUrl: rest.imageUrl,
      rating: rest.rating,
      reviews: rest.reviews,
      badge: rest.isOpen ? 'Open' : undefined,
      isPromoted: rest.isPromoted,
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

  const handleItemPress = (item: BrowseItem) => {
    router.push({ pathname: '/restaurants/[id]', params: { id: item.id } });
  };

  const renderItemExtra = (item: BrowseItem) => {
    return (
      <View style={styles.itemExtra}>
        {item.features && item.features.length > 0 && (
          <View style={styles.featureRow}>
            {item.features.slice(0, 3).map((f: string) => (
              <View key={f} style={styles.featurePill}>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.cardFooter}>
          <View style={styles.locRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.locText}>{item.location}</Text>
          </View>
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
      </View>
    );
  };

  return (
    <BrowsePage
      title="Restaurants"
      accentColor="#E85D3A"
      accentIcon="restaurant"
      categories={restaurantCuisines}
      categoryKey="cuisine"
      items={items}
      isLoading={isLoading}
      promotedItems={promotedItems}
      promotedTitle="Popular Restaurants"
      onItemPress={handleItemPress}
      renderItemExtra={renderItemExtra}
      emptyMessage="No restaurants found"
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
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
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
