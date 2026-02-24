import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';

const shoppingCategories: CategoryFilter[] = [
  { label: 'All', icon: 'bag-handle', color: '#1C1C1E' },
  { label: 'Groceries', icon: 'cart', color: '#E85D3A' },
  { label: 'Fashion', icon: 'shirt', color: '#9B59B6' },
  { label: 'Jewellery', icon: 'diamond', color: '#F2A93B' },
  { label: 'Electronics', icon: 'phone-portrait', color: '#3498DB' },
  { label: 'Health & Wellness', icon: 'leaf', color: '#2ECC71' },
  { label: 'Books & Gifts', icon: 'book', color: '#E74C3C' },
];

export default function ShoppingScreen() {
  const { state } = useOnboarding();

  const queryParams = new URLSearchParams();
  if (state.country) queryParams.set('country', state.country);
  if (state.city) queryParams.set('city', state.city);
  const qs = queryParams.toString();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['/api/shopping', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const url = `${base}api/shopping${qs ? `?${qs}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  // Map API data to BrowseItem format
  const items: BrowseItem[] = stores.map((store: any) => ({
    id: store.id,
    title: store.name,
    subtitle: store.category,
    description: store.description,
    imageUrl: store.imageUrl,
    rating: store.rating,
    reviews: store.reviews,
    badge: store.isOpen ? 'Open' : undefined,
    isPromoted: store.isPromoted,
    meta: store.location,
    category: store.category,
    deals: store.deals,
    deliveryAvailable: store.deliveryAvailable,
  }));

  // Filter promoted items
  const promotedItems = items.filter((item) => item.isPromoted);

  const handleItemPress = (item: BrowseItem) => {
    router.push({ pathname: '/shopping/[id]', params: { id: item.id } });
  };

  const renderItemExtra = (item: BrowseItem) => {
    const deals = item.deals as any[] | undefined;
    if (!deals || deals.length === 0) return null;

    return (
      <View style={{ gap: 6 }}>
        {deals.slice(0, 2).map((deal: any, i: number) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: Colors.primary + '08',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: Colors.primary + '20',
            }}
          >
            <Ionicons name="pricetag" size={12} color={Colors.primary} />
            <Text
              style={{
                fontSize: 12,
                fontFamily: 'Poppins_500Medium',
                color: Colors.text,
              }}
            >
              {deal.title}: <Text style={{ fontFamily: 'Poppins_700Bold', color: Colors.primary }}>{deal.discount}</Text>
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <BrowsePage
      title="Shopping & Deals"
      accentColor="#3498DB"
      accentIcon="bag-handle"
      categories={shoppingCategories}
      categoryKey="category"
      items={items}
      isLoading={isLoading}
      promotedItems={promotedItems}
      promotedTitle="Featured Stores"
      onItemPress={handleItemPress}
      renderItemExtra={renderItemExtra}
      emptyMessage="No stores found"
      emptyIcon="bag-handle"
    />
  );
}
