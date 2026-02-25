import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  imageUrl: string;
  priceLabel: string;
}

export default function AllEventsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { state } = useOnboarding();

  const { data: allEvents = [], isLoading, error, refetch } = useQuery<EventItem[]>({
    queryKey: ['/api/events', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const params = new URLSearchParams();
      if (state.country) params.set('country', state.country);
      if (state.city) params.set('city', state.city);
      const qs = params.toString();
      const res = await fetch(`${base}/api/events${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const CATEGORIES = useMemo(
    () => ['All', ...Array.from(new Set(allEvents.map((e) => e.category).filter(Boolean)))],
    [allEvents],
  );

  const filtered = useMemo(() =>
    selectedCategory === 'All'
      ? allEvents
      : allEvents.filter((e) => e.category === selectedCategory),
    [selectedCategory, allEvents]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={12}
          android_ripple={{ color: Colors.primary + '20' }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>All Events ({filtered.length})</Text>
        <Pressable onPress={() => refetch()} hitSlop={12}>
          <Ionicons name="refresh-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        style={styles.categoryScrollView}
      >
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat}
            onPress={() => { 
              Haptics.selectionAsync(); 
              setSelectedCategory(cat); 
            }}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
            android_ripple={{ color: Colors.primary + '20' }}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons name="wifi-off-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>Unable to load events</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </Pressable>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centerState}>
          <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No events in this category</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {filtered.map((event) => (
            <Pressable
              key={event.id}
              style={styles.eventCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: '/event/[id]', params: { id: event.id } });
              }}
              android_ripple={{ color: Colors.primary + '10' }}
            >
              <Image
                source={{ uri: event.imageUrl }}
                style={styles.eventImage}
                contentFit="cover"
                placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
                transition={200}
              />
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.eventMetaText}>{event.date}</Text>
                </View>
                <View style={styles.eventMeta}>
                  <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                  <Text style={styles.eventMetaText} numberOfLines={1}>{event.venue}</Text>
                </View>
                <View style={styles.eventBottom}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{event.category}</Text>
                  </View>
                  <Text style={styles.eventPrice}>{event.priceLabel}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: Colors.text,
  },
  categoryScrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  categoryList: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
  },
  chipTextActive: {
    color: '#FFF',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 14,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    ...Colors.shadow.small,
  },
  eventImage: {
    width: 110,
    height: 130,
  },
  eventInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: Colors.text,
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  eventMetaText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  categoryBadge: {
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 10,
    color: Colors.primary,
  },
  eventPrice: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
    color: Colors.primary,
  },
  centerState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: Colors.textSecondary,
  },
  errorTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: Colors.text,
  },
  errorText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: '#FFF',
  },
  emptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
