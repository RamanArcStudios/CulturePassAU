import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';
import { useMemo, useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const shoppingCategories: CategoryFilter[] = [
  { label: 'All', icon: 'bag-handle', color: '#1C1C1E' },
  { label: 'Groceries', icon: 'cart', color: '#E85D3A' },
  { label: 'Fashion', icon: 'shirt', color: '#9B59B6' },
  { label: 'Jewellery', icon: 'diamond', color: '#F2A93B' },
  { label: 'Electronics', icon: 'phone-portrait', color: '#3498DB' },
  { label: 'Health & Wellness', icon: 'leaf', color: '#2ECC71' },
  { label: 'Books & Gifts', icon: 'book', color: '#E74C3C' },
  { label: 'Home Decor', icon: 'home', color: '#16A085' },
];

interface Deal {
  title: string;
  discount: string;
  validTill: string;
}

interface StoreData {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  color?: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  isPromoted?: boolean;
  location: string;
  deals?: Deal[];
  deliveryAvailable?: boolean;
}

export default function ShoppingScreen() {
  const { state } = useOnboarding();
  const [refreshing, setRefreshing] = useState(false);

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (state.country) params.set('country', state.country);
    if (state.city) params.set('city', state.city);
    return params.toString();
  }, [state.country, state.city]);

  const {
    data: stores = [],
    isLoading,
    error,
    refetch,
  } = useQuery<StoreData[]>({
    queryKey: ['/api/shopping', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const url = `${base}/api/shopping${queryParams ? `?${queryParams}` : ''}`;
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to fetch stores: ${res.status}`);
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const items: BrowseItem[] = useMemo(() => {
    return stores
      .filter((store) => store && store.id && store.name)
      .map((store) => ({
        id: store.id,
        title: store.name,
        subtitle: store.category,
        description: store.description,
        imageUrl: store.imageUrl,
        color: store.color,
        rating: store.rating,
        reviews: store.reviews,
        badge: store.isOpen ? 'Open' : undefined,
        isPromoted: store.isPromoted || false,
        meta: store.location,
        category: store.category,
        deals: store.deals || [],
        deliveryAvailable: store.deliveryAvailable || false,
      }));
  }, [stores]);

  const promotedItems = useMemo(() => {
    return items.filter((item) => item.isPromoted);
  }, [items]);

  const handleItemPress = useCallback(
    (item: BrowseItem) => {
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      router.push({
        pathname: '/shopping/[id]',
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
    const deals = item.deals as Deal[] | undefined;
    
    if (!deals || !Array.isArray(deals) || deals.length === 0) {
      return null;
    }

    return (
      <View style={styles.dealsContainer}>
        {deals.slice(0, 2).map((deal, i) => (
          <View key={i} style={styles.dealBadge}>
            <Ionicons name="pricetag" size={12} color={Colors.primary} />
            <Text style={styles.dealText} numberOfLines={1}>
              {deal.title}:{' '}
              <Text style={styles.dealDiscount}>{deal.discount}</Text>
            </Text>
          </View>
        ))}
        {deals.length > 2 && (
          <Text style={styles.moreDealsText}>
            +{deals.length - 2} more deal{deals.length - 2 !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    );
  }, []);

  return (
    <BrowsePage
      title="Shopping & Deals"
      accentColor="#3498DB"
      accentIcon="bag-handle"
      categories={shoppingCategories}
      categoryKey="category"
      items={items}
      isLoading={isLoading}
      error={error ? 'Failed to load stores' : undefined}
      promotedItems={promotedItems}
      promotedTitle="Featured Stores"
      onItemPress={handleItemPress}
      renderItemExtra={renderItemExtra}
      onRefresh={handleRefresh}
      emptyMessage={
        state.city
          ? `No stores found in ${state.city}`
          : 'No stores available in your area'
      }
      emptyIcon="bag-handle-outline"
    />
  );
}

const styles = StyleSheet.create({
  dealsContainer: {
    gap: 6,
    marginTop: 4,
  },

  dealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '08',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },

  dealText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    flex: 1,
  },

  dealDiscount: {
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
  },

  moreDealsText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    marginTop: 2,
  },
});
