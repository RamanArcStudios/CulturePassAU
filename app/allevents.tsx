import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { sampleEvents } from '@/data/mockData';
import { useLocationFilter } from '@/hooks/useLocationFilter';

export default function AllEventsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { filterByLocation } = useLocationFilter();

  const CATEGORIES = useMemo(
    () => ['All', ...new Set(filterByLocation(sampleEvents).map(e => e.category))],
    [filterByLocation],
  );

  const filtered = useMemo(() =>
    selectedCategory === 'All'
      ? filterByLocation(sampleEvents)
      : filterByLocation(sampleEvents).filter(e => e.category === selectedCategory),
    [selectedCategory, filterByLocation]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 0) }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>All Events</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {CATEGORIES.map(cat => (
          <Pressable
            key={cat}
            onPress={() => { Haptics.selectionAsync(); setSelectedCategory(cat); }}
            style={[styles.chip, selectedCategory === cat && styles.chipActive]}
          >
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered.map(event => (
          <Pressable
            key={event.id}
            style={styles.eventCard}
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
          >
            <Image
              source={{ uri: event.imageUrl }}
              style={styles.eventImage}
              contentFit="cover"
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

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No events in this category</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
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
  categoryList: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 14,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: Colors.text,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: Colors.textTertiary,
  },
});
