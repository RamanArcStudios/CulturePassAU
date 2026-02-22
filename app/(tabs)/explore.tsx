import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Platform, Share } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents, sampleBusinesses, exploreCategories } from '@/data/mockData';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

function fuzzyMatch(text: string, query: string): number {
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

function scoreEvent(event: typeof sampleEvents[0], query: string): number {
  if (!query) return event.isFeatured ? 100 : 50;
  const titleScore = fuzzyMatch(event.title, query) * 3;
  const venueScore = fuzzyMatch(event.venue, query) * 2;
  const communityScore = fuzzyMatch(event.communityTag, query) * 2;
  const categoryScore = fuzzyMatch(event.category, query);
  const descScore = fuzzyMatch(event.description, query) * 0.5;
  const base = Math.max(titleScore, venueScore, communityScore, categoryScore, descScore);
  const recencyBonus = event.isFeatured ? 10 : 0;
  const popularityBonus = Math.min(event.attending / 50, 10);
  return base + recencyBonus + popularityBonus;
}

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { isEventSaved, toggleSaveEvent } = useSaved();

  const filteredEvents = useMemo(() => {
    let events = sampleEvents;
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Free') {
        events = events.filter(e => e.price === 0);
      } else if (selectedCategory === 'Council') {
        events = events.filter(e => e.isCouncil);
      } else if (selectedCategory !== 'Events') {
        events = events.filter(e => e.category === selectedCategory);
      }
    }
    if (search) {
      const scored = events.map(e => ({ event: e, score: scoreEvent(e, search) })).filter(s => s.score > 0);
      scored.sort((a, b) => b.score - a.score);
      return scored.map(s => s.event);
    }
    return events.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return b.attending - a.attending;
    });
  }, [search, selectedCategory]);

  const handleShareEvent = async (event: typeof sampleEvents[0]) => {
    try {
      await Share.share({ message: `Check out ${event.title} on CulturePass! ${event.venue} - ${formatDate(event.date)}` });
    } catch {}
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>Discover cultural events near you</Text>
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
        {exploreCategories.map(cat => {
          const isActive = selectedCategory === cat.label;
          return (
            <Pressable
              key={cat.label}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(cat.label);
              }}
            >
              <View style={[styles.catIconWrap, isActive && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Ionicons name={cat.icon as any} size={18} color={isActive ? '#FFF' : Colors.primary} />
              </View>
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>{cat.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.results}>
        <Text style={styles.resultCount}>
          {filteredEvents.length} events found{search ? ` for "${search}"` : ''}
        </Text>

        {filteredEvents.map((event, index) => (
          <Animated.View key={event.id} entering={FadeInDown.delay(index * 40).duration(300)}>
            <Pressable
              style={styles.resultCard}
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
            >
              <View style={[styles.resultImage, { backgroundColor: event.imageColor }]}>
                <Ionicons name="calendar" size={28} color="rgba(255,255,255,0.9)" />
                {event.isCouncil && (
                  <View style={styles.councilBadge}>
                    <Ionicons name="shield-checkmark" size={14} color="#FFF" />
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
              <View style={styles.cardActions}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={(e) => { e.stopPropagation?.(); handleShareEvent(event); }}
                  hitSlop={8}
                >
                  <Ionicons name="share-outline" size={18} color={Colors.textTertiary} />
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleSaveEvent(event.id);
                  }}
                  hitSlop={8}
                >
                  <Ionicons
                    name={isEventSaved(event.id) ? "bookmark" : "bookmark-outline"}
                    size={18}
                    color={isEventSaved(event.id) ? Colors.primary : Colors.textTertiary}
                  />
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {filteredEvents.length === 0 && (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search" size={56} color={Colors.textTertiary} />
            </View>
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 0.5, borderColor: Colors.cardBorder, marginBottom: 12, marginTop: 8, ...Colors.shadow.small },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text, padding: 0 },
  categoryRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 14 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, ...Colors.shadow.small },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  catIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  categoryLabelActive: { color: '#FFF' },
  results: { paddingHorizontal: 20, paddingTop: 4 },
  resultCount: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, marginBottom: 12 },
  resultCard: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 0.5, borderColor: Colors.cardBorder, ...Colors.shadow.small },
  resultImage: { width: 100, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  councilBadge: { position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  resultContent: { flex: 1, padding: 12, gap: 4 },
  resultTags: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  tagText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
  resultCategory: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary },
  resultTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text, lineHeight: 20 },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  resultMetaText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginRight: 6 },
  resultBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  resultPrice: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.text },
  resultAttending: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  cardActions: { paddingHorizontal: 8, paddingVertical: 8, justifyContent: 'space-between' },
  actionBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.backgroundSecondary },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  emptySubtext: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
});
