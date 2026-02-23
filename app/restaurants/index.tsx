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

const restaurantCuisines = [
  { label: 'All', icon: 'restaurant', color: '#1C1C1E' },
  { label: 'South Indian', icon: 'flame', color: '#E85D3A' },
  { label: 'North Indian', icon: 'star', color: '#F2A93B' },
  { label: 'Sri Lankan', icon: 'leaf', color: '#9B59B6' },
  { label: 'Street Food', icon: 'fast-food', color: '#2ECC71' },
  { label: 'Afghan', icon: 'bonfire', color: '#1A7A6D' },
  { label: 'Japanese-Fusion', icon: 'fish', color: '#E74C3C' },
];

export default function RestaurantsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedCuisine, setSelectedCuisine] = useState('All');
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

  const filtered = useMemo(() => {
    if (selectedCuisine === 'All') return restaurants;
    return restaurants.filter((r: any) => r.cuisine === selectedCuisine);
  }, [selectedCuisine, restaurants]);

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
        <Text style={styles.title}>Restaurants</Text>
        <Pressable hitSlop={8}><Ionicons name="search-outline" size={24} color={Colors.text} /></Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cuisineRow} style={{ flexGrow: 0 }}>
        {restaurantCuisines.map(c => {
          const isActive = selectedCuisine === c.label;
          return (
            <Pressable key={c.label} style={[styles.cuisineChip, isActive ? { backgroundColor: c.color, borderColor: c.color } : { backgroundColor: Colors.surface, borderColor: Colors.borderLight }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedCuisine(c.label); }}>
              <Ionicons name={c.icon as any} size={15} color={isActive ? '#FFF' : c.color} />
              <Text style={[styles.cuisineText, isActive && { color: '#FFF' }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <Text style={styles.resultCount}>{filtered.length} restaurants found</Text>
        {filtered.map((rest: any, index: number) => (
          <Animated.View key={rest.id} entering={FadeInDown.delay(index * 60).duration(400)}>
            <Pressable style={styles.card} onPress={() => router.push({ pathname: '/restaurants/[id]', params: { id: rest.id } })}>
              <View style={[styles.cardBanner]}>
                <Image source={{ uri: rest.imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
                {rest.isOpen && <View style={styles.openBadge}><Text style={styles.openText}>Open</Text></View>}
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardName}>{rest.name}</Text>
                    <Text style={styles.cardCuisine}>{rest.cuisine} | {rest.priceRange}</Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={13} color={Colors.accent} />
                    <Text style={styles.ratingText}>{rest.rating}</Text>
                  </View>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2}>{rest.description}</Text>
                <View style={styles.featureRow}>
                  {rest.features.slice(0, 3).map((f: string) => (
                    <View key={f} style={styles.featurePill}><Text style={styles.featureText}>{f}</Text></View>
                  ))}
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.locRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.locText}>{rest.location}</Text>
                  </View>
                  <View style={styles.actionRow}>
                    {rest.reservationAvailable && (
                      <View style={styles.actionPill}><Ionicons name="calendar-outline" size={12} color={Colors.secondary} /><Text style={styles.actionText}>Reserve</Text></View>
                    )}
                    {rest.deliveryAvailable && (
                      <View style={styles.actionPill}><Ionicons name="bicycle-outline" size={12} color={Colors.primary} /><Text style={[styles.actionText, { color: Colors.primary }]}>Delivery</Text></View>
                    )}
                  </View>
                </View>
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
  cuisineRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 14, paddingTop: 4 },
  cuisineChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, borderWidth: 1 },
  cuisineText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  resultCount: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginBottom: 10 },
  card: { backgroundColor: Colors.card, borderRadius: 18, overflow: 'hidden', marginBottom: 14, borderWidth: 1, borderColor: Colors.cardBorder },
  cardBanner: { height: 100, position: 'relative', overflow: 'hidden' },
  openBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: Colors.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  openText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  cardBody: { padding: 14, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardName: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text },
  cardCuisine: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accent + '15', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  ratingText: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.accent },
  cardDesc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  featureRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  featurePill: { backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  featureText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.secondary },
});
