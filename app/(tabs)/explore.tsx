import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
  Share,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents, exploreCategories } from '@/data/mockData';
import Colors from '@/constants/colors';
import { useState, useMemo, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

// ─── Types ────────────────────────────────────────────────────────────────────

type SampleEvent = (typeof sampleEvents)[number];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  // Parse manually to avoid UTC/local timezone shifting the date
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function fuzzyMatch(text: string, query: string): number {
  if (!text) return 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 100;
  if (t.startsWith(q)) return 90;
  if (t.includes(q)) return 70;
  const words = t.split(/\s+/);
  for (const w of words) {
    if (w.startsWith(q)) return 80;
  }
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 40;
  return 0;
}

function scoreEvent(event: SampleEvent, query: string): number {
  if (!query) return event.isFeatured ? 100 : 50;
  const titleScore = fuzzyMatch(event.title, query) * 3;
  const venueScore = fuzzyMatch(event.venue, query) * 2;
  const communityScore = fuzzyMatch(event.communityTag, query) * 2;
  const categoryScore = fuzzyMatch(event.category, query);
  const descScore = fuzzyMatch(event.description, query) * 0.5;
  const base = Math.max(titleScore, venueScore, communityScore, categoryScore, descScore);
  const featuredBonus = event.isFeatured ? 10 : 0;
  const popularityBonus = Math.min(event.attending / 50, 10);
  return base + featuredBonus + popularityBonus;
}

// ─── ExploreScreen ────────────────────────────────────────────────────────────

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortMode, setSortMode] = useState<'relevance' | 'date'>('relevance');
  const { isEventSaved, toggleSaveEvent } = useSaved();

  const categoryCounts = useMemo(() => {
    const all = sampleEvents as SampleEvent[];
    const counts: Record<string, number> = {};
    for (const cat of exploreCategories) {
      if (cat.label === 'All') counts[cat.label] = all.length;
      else if (cat.label === 'Free') counts[cat.label] = all.filter(e => e.price === 0).length;
      else if (cat.label === 'Council') counts[cat.label] = all.filter(e => e.isCouncil).length;
      else if (cat.label === 'Events') counts[cat.label] = all.length;
      else counts[cat.label] = all.filter(e => e.category === cat.label).length;
    }
    return counts;
  }, []);

  const filteredEvents = useMemo(() => {
    let events = sampleEvents as SampleEvent[];

    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Free') {
        events = events.filter(e => e.price === 0);
      } else if (selectedCategory === 'Council') {
        events = events.filter(e => e.isCouncil);
      } else if (selectedCategory !== 'Events') {
        events = events.filter(e => e.category === selectedCategory);
      }
    }

    if (search.trim()) {
      const scored = events
        .map(e => ({ event: e, score: scoreEvent(e, search) }))
        .filter(s => s.score > 0);
      scored.sort((a, b) => b.score - a.score);
      const result = scored.map(s => s.event);
      if (sortMode === 'date') {
        result.sort((a, b) => a.date.localeCompare(b.date));
      }
      return result;
    }

    if (sortMode === 'date') {
      return [...events].sort((a, b) => a.date.localeCompare(b.date));
    }

    return [...events].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.attending - a.attending;
    });
  }, [search, selectedCategory, sortMode]);

  const handleShareEvent = useCallback(async (event: SampleEvent) => {
    try {
      await Share.share({
        message: `Check out ${event.title} on CulturePass! ${event.venue} - ${formatDate(event.date)}`,
      });
    } catch {
      // Silently ignore share cancellation / errors
    }
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleCategorySelect = useCallback((label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(label);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover cultural events near you</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events, venues, communities..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        style={{ flexGrow: 0 }}
      >
        {exploreCategories.map(cat => {
          const isActive = selectedCategory === cat.label;
          return (
            <Pressable
              key={cat.label}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => handleCategorySelect(cat.label)}
            >
              <View
                style={[
                  styles.catIconWrap,
                  isActive && { backgroundColor: 'rgba(255,255,255,0.25)' },
                ]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={18}
                  color={isActive ? '#FFF' : Colors.primary}
                />
              </View>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
              <View style={[styles.categoryBadge, isActive && styles.categoryBadgeActive]}>
                <Text style={[styles.categoryBadgeText, isActive && styles.categoryBadgeTextActive]}>
                  {categoryCounts[cat.label] ?? 0}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sortRow}>
        <Pressable
          style={[styles.sortPill, sortMode === 'relevance' && styles.sortPillActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSortMode('relevance');
          }}
        >
          <Ionicons
            name="sparkles"
            size={14}
            color={sortMode === 'relevance' ? '#FFF' : Colors.textSecondary}
          />
          <Text style={[styles.sortPillText, sortMode === 'relevance' && styles.sortPillTextActive]}>
            Relevance
          </Text>
        </Pressable>
        <Pressable
          style={[styles.sortPill, sortMode === 'date' && styles.sortPillActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSortMode('date');
          }}
        >
          <Ionicons
            name="calendar-outline"
            size={14}
            color={sortMode === 'date' ? '#FFF' : Colors.textSecondary}
          />
          <Text style={[styles.sortPillText, sortMode === 'date' && styles.sortPillTextActive]}>
            Date
          </Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.results}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        <Text style={styles.resultCount}>
          {filteredEvents.length}
          {selectedCategory !== 'All' ? ` ${selectedCategory}` : ''} event{filteredEvents.length !== 1 ? 's' : ''} found
          {search.trim() ? ` for "${search.trim()}"` : ''}
        </Text>

        {filteredEvents.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            index={index}
            isSaved={isEventSaved(event.id)}
            onToggleSave={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleSaveEvent(event.id);
            }}
            onShare={() => handleShareEvent(event)}
          />
        ))}

        {filteredEvents.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search" size={56} color={Colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            <Text style={styles.emptyHint}>Quick search:</Text>
            <View style={styles.quickSearchRow}>
              {['music', 'food', 'festival'].map(term => (
                <Pressable
                  key={term}
                  style={styles.quickSearchPill}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSearch(term);
                    setSelectedCategory('All');
                  }}
                >
                  <Text style={styles.quickSearchText}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── EventCard ────────────────────────────────────────────────────────────────
// Extracted to its own component so the save/share callbacks don't capture a
// stale closure over the full events array on every render.

interface EventCardProps {
  event: SampleEvent;
  index: number;
  isSaved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
}

function EventCard({ event, index, isSaved, onToggleSave, onShare }: EventCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).duration(300)}>
      <Pressable
        style={styles.resultCard}
        onPress={() =>
          router.push({ pathname: '/event/[id]', params: { id: event.id } })
        }
      >
        {/* Colour swatch / image */}
        <View style={[styles.resultImage, { backgroundColor: event.imageColor }]}>
          <Ionicons name="calendar" size={28} color="rgba(255,255,255,0.9)" />
          {event.isCouncil && (
            <View style={styles.councilBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FFF" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.resultContent}>
          <View style={styles.resultTags}>
            <View style={[styles.tag, { backgroundColor: event.imageColor + '15' }]}>
              <Text style={[styles.tagText, { color: event.imageColor }]}>
                {event.communityTag}
              </Text>
            </View>
            <Text style={styles.resultCategory}>{event.category}</Text>
          </View>

          <Text style={styles.resultTitle} numberOfLines={2}>
            {event.title}
          </Text>

          <View style={styles.resultMeta}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.resultMetaText}>{formatDate(event.date)}</Text>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.resultMetaText} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>

          <View style={styles.resultBottom}>
            <Text
              style={[styles.resultPrice, event.price === 0 && { color: Colors.success }]}
            >
              {event.priceLabel}
            </Text>
            <Text style={styles.resultAttending}>{event.attending} going</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.cardActions}>
          <Pressable
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onShare();
            }}
            hitSlop={8}
          >
            <Ionicons name="share-outline" size={18} color={Colors.textTertiary} />
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onToggleSave();
            }}
            hitSlop={8}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? Colors.primary : Colors.textTertiary}
            />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: Colors.text },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    marginBottom: 12,
    marginTop: 8,
    ...Colors.shadow.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    padding: 0,
  },
  categoryRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 14 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Colors.shadow.small,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  catIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  categoryLabelActive: { color: '#FFF' },
  results: { paddingHorizontal: 20, paddingTop: 4 },
  resultCount: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    ...Colors.shadow.small,
  },
  resultImage: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  councilBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultContent: { flex: 1, padding: 12, gap: 4 },
  resultTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
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
  resultPrice: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.text },
  resultAttending: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  cardActions: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  emptySubtext: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  emptyHint: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textTertiary,
    marginTop: 16,
  },
  quickSearchRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  quickSearchPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  quickSearchText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  categoryBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 5,
  },
  categoryBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  categoryBadgeTextActive: {
    color: '#FFF',
  },
  sortRow: {
    flexDirection: 'row' as const,
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 10,
  },
  sortPill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sortPillActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  sortPillText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  sortPillTextActive: {
    color: '#FFF',
  },
});