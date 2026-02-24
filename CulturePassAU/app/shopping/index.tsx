import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { fetch } from 'expo/fetch';

const shoppingCategories = [
  { label: 'All', icon: 'bag-handle', color: '#1C1C1E' },
  { label: 'Groceries', icon: 'cart', color: '#E85D3A' },
  { label: 'Fashion', icon: 'shirt', color: '#9B59B6' },
  { label: 'Jewellery', icon: 'diamond', color: '#F2A93B' },
  { label: 'Electronics', icon: 'phone-portrait', color: '#3498DB' },
  { label: 'Health & Wellness', icon: 'leaf', color: '#2ECC71' },
  { label: 'Books & Gifts', icon: 'book', color: '#E74C3C' },
];

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedCat, setSelectedCat] = useState('All');
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

  const filtered = useMemo(() => {
    if (selectedCat === 'All') return stores;
    return stores.filter((s: any) => s.category === selectedCat);
  }, [selectedCat, stores]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}><Ionicons name="arrow-back" size={24} color={Colors.text} /></Pressable>
        <Text style={styles.title}>Shopping & Deals</Text>
        <Pressable hitSlop={8}><Ionicons name="search-outline" size={24} color={Colors.text} /></Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow} style={{ flexGrow: 0 }}>
        {shoppingCategories.map(c => {
          const isActive = selectedCat === c.label;
          return (
            <Pressable key={c.label} style={[styles.catChip, isActive ? { backgroundColor: c.color, borderColor: c.color } : { backgroundColor: Colors.surface, borderColor: Colors.borderLight }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedCat(c.label); }}>
              <Ionicons name={c.icon as any} size={15} color={isActive ? '#FFF' : c.color} />
              <Text style={[styles.catText, isActive && { color: '#FFF' }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.resultCount}>{filtered.length} stores found</Text>
        {filtered.map((store: any, index: number) => (
          <Animated.View key={store.id} entering={FadeInDown.delay(index * 60).duration(400)}>
            <Pressable style={styles.card} onPress={() => router.push({ pathname: '/shopping/[id]', params: { id: store.id } })}>
              <View style={styles.cardTop}>
                <Image source={{ uri: store.imageUrl }} style={styles.storeIcon} />
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <Text style={styles.storeCat}>{store.category}</Text>
                  <View style={styles.storeRating}>
                    <Ionicons name="star" size={13} color={Colors.accent} />
                    <Text style={styles.storeRatingText}>{store.rating} ({store.reviews})</Text>
                  </View>
                </View>
                <View style={styles.badges}>
                  {store.isOpen && <View style={styles.openDot} />}
                  {store.deliveryAvailable && <Ionicons name="bicycle-outline" size={16} color={Colors.primary} />}
                </View>
              </View>
              <Text style={styles.storeDesc} numberOfLines={2}>{store.description}</Text>
              {store.deals.length > 0 && (
                <View style={styles.dealsRow}>
                  {store.deals.slice(0, 2).map((deal: any, i: number) => (
                    <View key={i} style={styles.dealPill}>
                      <Ionicons name="pricetag" size={12} color={Colors.primary} />
                      <Text style={styles.dealText}>{deal.title}: <Text style={styles.dealDiscount}>{deal.discount}</Text></Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.cardFooter}>
                <View style={styles.locRow}><Ionicons name="location-outline" size={14} color={Colors.textSecondary} /><Text style={styles.locText}>{store.location}</Text></View>
              </View>
            </Pressable>
          </Animated.View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text },
  catRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 14, paddingTop: 4 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, borderWidth: 1 },
  catText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  resultCount: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginBottom: 10 },
  card: { backgroundColor: Colors.card, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.cardBorder, gap: 10 },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  storeIcon: { width: 56, height: 56, borderRadius: 16, overflow: 'hidden' },
  storeInfo: { flex: 1, gap: 2 },
  storeName: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text },
  storeCat: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  storeRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeRatingText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  openDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.success },
  storeDesc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  dealsRow: { gap: 6 },
  dealPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary + '08', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: Colors.primary + '20' },
  dealText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.text },
  dealDiscount: { fontFamily: 'Poppins_700Bold', color: Colors.primary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
});
