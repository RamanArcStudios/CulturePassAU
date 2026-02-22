import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents, sampleBusinesses, exploreCategories } from '@/data/mockData';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { isEventSaved, toggleSaveEvent } = useSaved();

  const filteredEvents = useMemo(() => {
    let events = sampleEvents;
    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.communityTag.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Free') {
        events = events.filter(e => e.price === 0);
      } else if (selectedCategory === 'Council') {
        events = events.filter(e => e.isCouncil);
      } else if (selectedCategory === 'Events') {
        return events;
      } else {
        events = events.filter(e => e.category === selectedCategory);
      }
    }
    return events;
  }, [search, selectedCategory]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events, venues, communities..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        style={{ flexGrow: 0 }}
      >
        {exploreCategories.map(cat => (
          <Pressable
            key={cat.label}
            style={[
              styles.categoryChip,
              selectedCategory === cat.label && styles.categoryChipActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(cat.label);
            }}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.label ? '#FFF' : Colors.textSecondary}
            />
            <Text style={[
              styles.categoryLabel,
              selectedCategory === cat.label && styles.categoryLabelActive,
            ]}>{cat.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.results}
      >
        <Text style={styles.resultCount}>{filteredEvents.length} events found</Text>

        {filteredEvents.map(event => (
          <Pressable
            key={event.id}
            style={styles.resultCard}
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
          >
            <View style={[styles.resultImage, { backgroundColor: event.imageColor }]}>
              <Ionicons name="calendar" size={28} color="rgba(255,255,255,0.9)" />
              {event.isCouncil && (
                <View style={styles.councilBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#FFF" />
                </View>
              )}
            </View>
            <View style={styles.resultContent}>
              <View style={styles.resultTags}>
                <View style={[styles.tag, { backgroundColor: event.imageColor + '15' }]}>
                  <Text style={[styles.tagText, { color: event.imageColor }]}>{event.communityTag}</Text>
                </View>
                <Text style={styles.resultCategory}>{event.category}</Text>
              </View>
              <Text style={styles.resultTitle} numberOfLines={2}>{event.title}</Text>
              <View style={styles.resultMeta}>
                <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.resultMetaText}>{formatDate(event.date)}</Text>
                <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.resultMetaText} numberOfLines={1}>{event.venue}</Text>
              </View>
              <View style={styles.resultBottom}>
                <Text style={[styles.resultPrice, event.price === 0 && { color: Colors.success }]}>
                  {event.priceLabel}
                </Text>
                <Text style={styles.resultAttending}>{event.attending} going</Text>
              </View>
            </View>
            <Pressable
              style={styles.saveButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleSaveEvent(event.id);
              }}
              hitSlop={8}
            >
              <Ionicons
                name={isEventSaved(event.id) ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isEventSaved(event.id) ? Colors.primary : Colors.textTertiary}
              />
            </Pressable>
          </Pressable>
        ))}

        {filteredEvents.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    padding: 0,
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  categoryLabelActive: { color: '#FFF' },
  results: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  resultCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  resultImage: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  councilBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  resultTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  resultCategory: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
  resultTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    lineHeight: 20,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  resultMetaText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginRight: 6,
  },
  resultBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  resultPrice: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  resultAttending: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
});
