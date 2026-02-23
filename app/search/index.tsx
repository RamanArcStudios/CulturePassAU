import { View, Text, Pressable, StyleSheet, TextInput, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { useOnboarding } from '@/contexts/OnboardingContext';

type ResultType = 'event' | 'movie' | 'restaurant' | 'activity' | 'shopping' | 'community';

interface SearchResult {
  id: string;
  type: ResultType;
  title: string;
  subtitle: string;
  imageUrl?: string;
  icon: string;
  color: string;
}

const TYPE_CONFIG: Record<ResultType, { label: string; icon: string; color: string }> = {
  event: { label: 'Events', icon: 'calendar', color: '#E85D3A' },
  movie: { label: 'Movies', icon: 'film', color: '#9B59B6' },
  restaurant: { label: 'Restaurants', icon: 'restaurant', color: '#2ECC71' },
  activity: { label: 'Activities', icon: 'football', color: '#3498DB' },
  shopping: { label: 'Shopping', icon: 'bag', color: '#F2A93B' },
  community: { label: 'Communities', icon: 'people', color: '#16656E' },
};

const POPULAR_SEARCHES = ['Diwali', 'Comedy Night', 'Bollywood', 'Food Festival', 'Art Exhibition', 'Cricket'];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ResultType | 'all'>('all');
  const { state } = useOnboarding();

  const buildQs = () => {
    const params = new URLSearchParams();
    if (state.country) params.set('country', state.country);
    if (state.city) params.set('city', state.city);
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  const { data: events = [] } = useQuery({
    queryKey: ['/api/events', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/events${buildQs()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: movies = [] } = useQuery({
    queryKey: ['/api/movies', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/movies${buildQs()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: ['/api/restaurants', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/restaurants${buildQs()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['/api/activities', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/activities${buildQs()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: shopping = [] } = useQuery({
    queryKey: ['/api/shopping', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/shopping${buildQs()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: communities = [] } = useQuery({
    queryKey: ['/api/communities'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/communities`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const allResults = useMemo((): SearchResult[] => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: SearchResult[] = [];

    events.forEach((e: any) => {
      if (e.title?.toLowerCase().includes(q) || e.communityTag?.toLowerCase().includes(q) || e.venue?.toLowerCase().includes(q)) {
        results.push({ id: e.id, type: 'event', title: e.title, subtitle: `${e.communityTag || ''} · ${e.venue || ''}`, imageUrl: e.imageUrl, icon: 'calendar', color: '#E85D3A' });
      }
    });

    movies.forEach((m: any) => {
      if (m.title?.toLowerCase().includes(q) || m.language?.toLowerCase().includes(q) || (m.genre || []).some((g: string) => g.toLowerCase().includes(q))) {
        results.push({ id: m.id, type: 'movie', title: m.title, subtitle: `${m.language || ''} · ${(m.genre || []).join(', ')}`, imageUrl: m.posterUrl, icon: 'film', color: '#9B59B6' });
      }
    });

    restaurants.forEach((r: any) => {
      if (r.name?.toLowerCase().includes(q) || r.cuisine?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)) {
        results.push({ id: r.id, type: 'restaurant', title: r.name, subtitle: `${r.cuisine || ''} · ${r.priceRange || ''}`, imageUrl: r.imageUrl, icon: 'restaurant', color: '#2ECC71' });
      }
    });

    activities.forEach((a: any) => {
      if (a.name?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)) {
        results.push({ id: a.id, type: 'activity', title: a.name, subtitle: `${a.category || ''} · ${a.priceLabel || ''}`, imageUrl: a.imageUrl, icon: 'football', color: '#3498DB' });
      }
    });

    shopping.forEach((s: any) => {
      if (s.name?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q)) {
        results.push({ id: s.id, type: 'shopping', title: s.name, subtitle: `${s.category || ''} · ${s.location || ''}`, imageUrl: s.imageUrl, icon: 'bag', color: '#F2A93B' });
      }
    });

    communities.forEach((c: any) => {
      if (c.name?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q)) {
        results.push({ id: c.id, type: 'community', title: c.name, subtitle: `${c.category || ''} · ${c.members || 0} members`, icon: 'people', color: '#16656E' });
      }
    });

    return results;
  }, [query, events, movies, restaurants, activities, shopping, communities]);

  const filteredResults = useMemo(() => {
    if (selectedType === 'all') return allResults;
    return allResults.filter(r => r.type === selectedType);
  }, [allResults, selectedType]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allResults.length };
    allResults.forEach(r => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return counts;
  }, [allResults]);

  const handleResultPress = (result: SearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const routes: Record<ResultType, string> = {
      event: '/event/[id]',
      movie: '/movies/[id]',
      restaurant: '/restaurants/[id]',
      activity: '/activities/[id]',
      shopping: '/shopping/[id]',
      community: '/community/[id]',
    };
    router.push({ pathname: routes[result.type] as any, params: { id: result.id } });
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events, restaurants, movies..."
            placeholderTextColor={Colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {query.length > 0 && allResults.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeRow} style={{ flexGrow: 0 }}>
          <Pressable
            style={[styles.typeChip, selectedType === 'all' && styles.typeChipActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedType('all'); }}
          >
            <Text style={[styles.typeChipText, selectedType === 'all' && styles.typeChipTextActive]}>All ({typeCounts.all})</Text>
          </Pressable>
          {(Object.keys(TYPE_CONFIG) as ResultType[]).filter(t => typeCounts[t]).map(type => (
            <Pressable
              key={type}
              style={[styles.typeChip, selectedType === type && { backgroundColor: TYPE_CONFIG[type].color, borderColor: TYPE_CONFIG[type].color }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedType(type); }}
            >
              <Ionicons name={TYPE_CONFIG[type].icon as any} size={14} color={selectedType === type ? '#FFF' : TYPE_CONFIG[type].color} />
              <Text style={[styles.typeChipText, selectedType === type && { color: '#FFF' }]}>{TYPE_CONFIG[type].label} ({typeCounts[type]})</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 20 }}>
        {query.length === 0 ? (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Popular Searches</Text>
            <View style={styles.suggestionsGrid}>
              {POPULAR_SEARCHES.map(s => (
                <Pressable key={s} style={styles.suggestionPill} onPress={() => setQuery(s)}>
                  <Ionicons name="trending-up" size={14} color={Colors.primary} />
                  <Text style={styles.suggestionText}>{s}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.suggestionsTitle, { marginTop: 28 }]}>Browse Categories</Text>
            <View style={styles.categoriesGrid}>
              {(Object.entries(TYPE_CONFIG) as [ResultType, typeof TYPE_CONFIG[ResultType]][]).map(([key, config]) => (
                <Pressable
                  key={key}
                  style={styles.categoryCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const routes: Record<ResultType, string> = {
                      event: '/(tabs)/explore',
                      movie: '/movies',
                      restaurant: '/restaurants',
                      activity: '/activities',
                      shopping: '/shopping',
                      community: '/(tabs)/communities',
                    };
                    router.push(routes[key] as any);
                  }}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: config.color + '15' }]}>
                    <Ionicons name={config.icon as any} size={24} color={config.color} />
                  </View>
                  <Text style={styles.categoryLabel}>{config.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : filteredResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={56} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyDesc}>Try different keywords or browse categories</Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            <Text style={styles.resultsCount}>{filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found</Text>
            {filteredResults.map((result, index) => (
              <Animated.View key={`${result.type}-${result.id}`} entering={FadeInDown.delay(index * 40).duration(300)}>
                <Pressable style={styles.resultCard} onPress={() => handleResultPress(result)}>
                  {result.imageUrl ? (
                    <Image source={{ uri: result.imageUrl }} style={styles.resultImage} />
                  ) : (
                    <View style={[styles.resultIconBox, { backgroundColor: result.color + '15' }]}>
                      <Ionicons name={result.icon as any} size={22} color={result.color} />
                    </View>
                  )}
                  <View style={styles.resultInfo}>
                    <View style={styles.resultTypeBadge}>
                      <View style={[styles.resultTypeDot, { backgroundColor: result.color }]} />
                      <Text style={styles.resultTypeText}>{TYPE_CONFIG[result.type].label}</Text>
                    </View>
                    <Text style={styles.resultTitle} numberOfLines={1}>{result.title}</Text>
                    <Text style={styles.resultSubtitle} numberOfLines={1}>{result.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text, paddingVertical: 0 },
  typeRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 12, paddingTop: 4 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  typeChipTextActive: { color: '#FFF' },
  suggestionsContainer: { paddingHorizontal: 20, paddingTop: 24 },
  suggestionsTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 14 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: Colors.primary + '08',
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  suggestionText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.primary },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    width: '31%' as any,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  categoryIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text, marginTop: 8 },
  emptyDesc: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center' },
  resultsList: { paddingHorizontal: 20, paddingTop: 8 },
  resultsCount: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginBottom: 12 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  resultImage: { width: 52, height: 52, borderRadius: 12 },
  resultIconBox: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1, gap: 2 },
  resultTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resultTypeDot: { width: 6, height: 6, borderRadius: 3 },
  resultTypeText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  resultTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  resultSubtitle: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
});
