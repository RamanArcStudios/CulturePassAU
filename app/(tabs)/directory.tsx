import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState, useMemo, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import type { Profile } from '@shared/schema';
import { FilterChipRow, FilterItem } from '@/components/FilterChip';

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  business: '#F2A93B',
  venue: '#9B59B6',
  council: '#3498DB',
  government: '#2C3E50',
  organisation: '#1A7A6D',
};

const TYPE_ICONS: Record<string, string> = {
  business: 'storefront',
  venue: 'location',
  council: 'shield-checkmark',
  government: 'flag',
  organisation: 'business',
};

const ENTITY_FILTERS = [
  { label: 'All', icon: 'grid', color: Colors.primary, display: 'All' },
  { label: 'business', icon: 'storefront', color: '#F2A93B', display: 'Businesses' },
  { label: 'venue', icon: 'location', color: '#9B59B6', display: 'Venues' },
  { label: 'organisation', icon: 'business', color: '#1A7A6D', display: 'Organisations' },
  { label: 'council', icon: 'shield-checkmark', color: '#3498DB', display: 'Councils' },
  { label: 'government', icon: 'flag', color: '#2C3E50', display: 'Government' },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
  return num.toString();
}

function getTags(profile: Profile): string[] {
  return Array.isArray(profile.tags) ? (profile.tags as string[]) : [];
}

// ─── DirectoryCard ────────────────────────────────────────────────────────────

function DirectoryCard({ profile, index }: { profile: Profile; index: number }) {
  const color = TYPE_COLORS[profile.entityType] ?? Colors.primary;
  const icon = TYPE_ICONS[profile.entityType] ?? 'business';
  const tags = getTags(profile);

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({ pathname: '/profile/[id]', params: { id: profile.id } })
        }
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.businessIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon as any} size={26} color={color} />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.cardName} numberOfLines={1}>
                {profile.name}
              </Text>
              {profile.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
              )}
            </View>
            <Text style={styles.cardCategory}>
              {profile.category ?? profile.entityType}
            </Text>
            {profile.culturePassId ? (
              <Text style={styles.cpidLabel}>{profile.culturePassId}</Text>
            ) : null}
          </View>

          {profile.rating != null ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={Colors.accent} />
              <Text style={styles.ratingText}>{profile.rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>

        {/* Description */}
        {profile.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {profile.description}
          </Text>
        ) : null}

        {tags.length > 0 && (
          <View style={styles.serviceRow}>
            {tags.slice(0, 3).map(tag => (
              <View key={tag} style={styles.servicePill}>
                <Text style={styles.serviceText}>{tag}</Text>
              </View>
            ))}
            {tags.length > 3 && (
              <Text style={styles.moreServices}>+{tags.length - 3}</Text>
            )}
          </View>
        )}

        {((profile as any).phone || (profile as any).address) && (
          <View style={styles.quickActions}>
            {(profile as any).phone ? (
              <View style={[styles.quickActionCircle, { backgroundColor: Colors.secondary + '15' }]}>
                <Ionicons name="call" size={18} color={Colors.secondary} />
              </View>
            ) : null}
            {(profile as any).address ? (
              <View style={[styles.quickActionCircle, { backgroundColor: '#3498DB15' }]}>
                <Ionicons name="location" size={18} color="#3498DB" />
              </View>
            ) : null}
          </View>
        )}
        <View style={styles.cardFooter}>
          {profile.city ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.locationText}>
                {profile.city}
                {profile.country ? `, ${profile.country}` : ''}
              </Text>
            </View>
          ) : (
            // Keeps the stats row right-aligned when there's no city
            <View />
          )}
          <View style={styles.statsRow}>
            <Text style={styles.followersText}>
              {formatNumber(profile.followersCount ?? 0)} followers
            </Text>
            {(profile.reviewsCount ?? 0) > 0 && (
              <Text style={styles.reviewCount}>{profile.reviewsCount} reviews</Text>
            )}
          </View>
        </View>

        {/* CTA — navigates to the same route as the card press */}
        <Pressable
          style={styles.cardAction}
          onPress={() =>
            router.push({ pathname: '/profile/[id]', params: { id: profile.id } })
          }
        >
          <Text style={styles.cardActionText}>View Details</Text>
          <Ionicons name="arrow-forward-circle" size={20} color={Colors.primary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

// ─── DirectoryScreen ──────────────────────────────────────────────────────────

export default function DirectoryScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');

  const { data: allProfiles, isLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
  });

  // Exclude community profiles — this screen is for directory listings only
  const nonCommunityProfiles = useMemo(
    () => (allProfiles ?? []).filter(p => p.entityType !== 'community'),
    [allProfiles],
  );

  const filtered = useMemo(() => {
    let results = nonCommunityProfiles;

    if (selectedType !== 'All') {
      results = results.filter(p => p.entityType === selectedType);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(p => {
        const tags = getTags(p);
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.category ?? '').toLowerCase().includes(q) ||
          tags.some(t => t.toLowerCase().includes(q))
        );
      });
    }

    return results;
  }, [selectedType, search, nonCommunityProfiles]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { All: nonCommunityProfiles.length };
    for (const p of nonCommunityProfiles) {
      counts[p.entityType] = (counts[p.entityType] ?? 0) + 1;
    }
    return counts;
  }, [nonCommunityProfiles]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleFilterSelect = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(id);
  }, []);

  const filterItems = useMemo<FilterItem[]>(() => {
    return ENTITY_FILTERS.map(filter => ({
      id: filter.label,
      label: filter.display,
      icon: filter.icon,
      color: filter.color,
      count: typeCounts[filter.label],
    }));
  }, [typeCounts]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Directory</Text>
        <Text style={styles.subtitle}>Businesses, venues, organisations & more</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={22} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search directory..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={22} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Category filter chips */}
      <View style={styles.categorySection}>
        <FilterChipRow items={filterItems} selectedId={selectedType} onSelect={handleFilterSelect} />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
        >
          <Text style={styles.resultCount}>
            {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} found
          </Text>

          {filtered.map((profile, index) => (
            <DirectoryCard key={profile.id} profile={profile} index={index} />
          ))}

          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={52} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtext}>
                Try a different filter or search term
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
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
    marginBottom: 4,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
    overflow: 'hidden',
    ...Colors.shadow.medium,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    padding: 0,
    minWidth: 0,
  },
  categorySection: { paddingTop: 8, paddingBottom: 4 },
  resultCount: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  list: { paddingHorizontal: 20, paddingTop: 6 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    gap: 12,
    marginBottom: 14,
    ...Colors.shadow.medium,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  businessIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardName: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    flexShrink: 1,
  },
  cardCategory: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  cpidLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent + '18',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  ratingText: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.accent },
  cardDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  serviceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  servicePill: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  serviceText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  moreServices: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickActionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  followersText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.secondary },
  reviewCount: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary },
  cardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  cardActionText: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  emptyState: { alignItems: 'center', paddingVertical: 80, gap: 14 },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginTop: 4,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});