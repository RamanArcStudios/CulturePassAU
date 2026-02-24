import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  TextInput,
  RefreshControl,
  FlatList,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { useState, useMemo, useCallback, useRef } from 'react';
import type { Profile } from '@shared/schema';
import { LinearGradient } from 'expo-linear-gradient';

const isWeb = Platform.OS === 'web';

const TYPE_COLORS: Record<string, string> = {
  community: '#007AFF',
  organisation: '#5856D6',
  venue: '#34C759',
  council: '#FF9500',
  government: '#AF52DE',
  artist: '#FF2D55',
  business: '#5AC8FA',
};

const TYPE_ICONS: Record<string, string> = {
  community: 'people',
  organisation: 'business',
  venue: 'location',
  council: 'shield-checkmark',
  government: 'flag',
  artist: 'musical-notes',
  business: 'storefront',
};

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'community', label: 'Communities', icon: 'people-outline' },
  { id: 'organisation', label: 'Organisations', icon: 'business-outline' },
  { id: 'venue', label: 'Venues', icon: 'location-outline' },
  { id: 'council', label: 'Councils', icon: 'shield-checkmark-outline' },
  { id: 'artist', label: 'Artists', icon: 'musical-notes-outline' },
  { id: 'business', label: 'Businesses', icon: 'storefront-outline' },
];

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
  return num.toString();
}

function FeaturedCard({ profile }: { profile: Profile }) {
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(profile.id);
  const color = TYPE_COLORS[profile.entityType] ?? Colors.primary;
  const icon = TYPE_ICONS[profile.entityType] ?? 'people';

  return (
    <Pressable
      style={styles.featuredCard}
      onPress={() => router.push({ pathname: '/profile/[id]', params: { id: profile.id } })}
    >
      <LinearGradient
        colors={[color + '20', color + '08', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.featuredGradient}
      />
      <View style={styles.featuredTop}>
        <View style={[styles.featuredIcon, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        {profile.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
          </View>
        )}
      </View>
      <Text style={styles.featuredName} numberOfLines={2}>{profile.name}</Text>
      <Text style={styles.featuredDesc} numberOfLines={2}>
        {profile.description || `A ${profile.entityType} in ${profile.city || 'Australia'}`}
      </Text>
      <View style={styles.featuredBottom}>
        <View style={styles.featuredMeta}>
          <Ionicons name="people" size={12} color={Colors.textTertiary} />
          <Text style={styles.featuredCount}>{formatNumber(profile.membersCount ?? 0)}</Text>
        </View>
        <Pressable
          style={[styles.featuredJoinBtn, joined && styles.featuredJoinedBtn]}
          onPress={(e) => {
            e?.stopPropagation?.();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleJoinCommunity(profile.id);
          }}
          hitSlop={4}
        >
          <Ionicons
            name={joined ? 'checkmark' : 'add'}
            size={14}
            color={joined ? Colors.primary : '#FFF'}
          />
          <Text style={[styles.featuredJoinText, joined && styles.featuredJoinedText]}>
            {joined ? 'Joined' : 'Join'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function CommunityCard({ profile }: { profile: Profile }) {
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(profile.id);
  const color = TYPE_COLORS[profile.entityType] ?? Colors.primary;
  const icon = TYPE_ICONS[profile.entityType] ?? 'people';

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/profile/[id]', params: { id: profile.id } })}
    >
      <View style={styles.cardLeft}>
        <View style={[styles.cardIcon, { backgroundColor: color + '14' }]}>
          <Ionicons name={icon as any} size={20} color={color} />
        </View>
      </View>

      <View style={styles.cardCenter}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName} numberOfLines={1}>{profile.name}</Text>
          {profile.isVerified && (
            <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
          )}
        </View>
        <View style={styles.cardMetaRow}>
          <View style={[styles.typePill, { backgroundColor: color + '12' }]}>
            <Text style={[styles.typePillText, { color }]}>{profile.entityType}</Text>
          </View>
          {profile.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={11} color={Colors.textTertiary} />
              <Text style={styles.locationText} numberOfLines={1}>{profile.city}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.cardRight}>
        <View style={styles.membersBadge}>
          <Ionicons name="people-outline" size={11} color={Colors.textSecondary} />
          <Text style={styles.membersText}>{formatNumber(profile.membersCount ?? 0)}</Text>
        </View>
        <Pressable
          style={[styles.joinBtn, joined && styles.joinedBtn]}
          onPress={(e) => {
            e?.stopPropagation?.();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleJoinCommunity(profile.id);
          }}
          hitSlop={4}
        >
          {joined ? (
            <Ionicons name="checkmark" size={14} color={Colors.primary} />
          ) : (
            <Text style={styles.joinText}>Join</Text>
          )}
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [searchFocused, setSearchFocused] = useState(false);

  const { data: allProfilesData, isLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
  });

  const filteredProfiles = useMemo(() => {
    let profiles = allProfilesData ?? [];
    if (selectedType !== 'all') {
      profiles = profiles.filter(p => p.entityType === selectedType);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      profiles = profiles.filter(p => {
        const tags = Array.isArray(p.tags) ? (p.tags as string[]) : [];
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.category ?? '').toLowerCase().includes(q) ||
          (p.city ?? '').toLowerCase().includes(q) ||
          tags.some(t => t.toLowerCase().includes(q))
        );
      });
    }
    return profiles.sort((a, b) => a.name.localeCompare(b.name));
  }, [allProfilesData, search, selectedType]);

  const featuredProfiles = useMemo(() => {
    return (allProfilesData ?? [])
      .filter(p => p.isVerified || (p.membersCount ?? 0) > 500)
      .sort((a, b) => (b.membersCount ?? 0) - (a.membersCount ?? 0))
      .slice(0, 8);
  }, [allProfilesData]);

  const typeCounts = useMemo(() => {
    const profiles = allProfilesData ?? [];
    const counts: Record<string, number> = { all: profiles.length };
    for (const p of profiles) {
      counts[p.entityType] = (counts[p.entityType] ?? 0) + 1;
    }
    return counts;
  }, [allProfilesData]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderItem = useCallback(({ item }: { item: Profile }) => (
    <CommunityCard profile={item} />
  ), []);

  const keyExtractor = useCallback((item: Profile) => item.id, []);

  const ListHeaderComponent = useMemo(() => (
    <>
      {featuredProfiles.length > 0 && !search.trim() && selectedType === 'all' && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="star" size={16} color={Colors.accent} />
            <Text style={styles.sectionTitle}>Featured</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {featuredProfiles.map(p => (
              <FeaturedCard key={p.id} profile={p} />
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredProfiles.length} {filteredProfiles.length === 1 ? 'result' : 'results'}
        </Text>
      </View>
    </>
  ), [featuredProfiles, filteredProfiles.length, search, selectedType]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>
            Discover {typeCounts.all ?? 0} communities & organisations
          </Text>
        </View>
        <Pressable
          style={styles.headerBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/submit' as any);
          }}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
        <Ionicons name="search" size={18} color={searchFocused ? Colors.primary : Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities, venues, artists..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
        style={styles.categoryScrollContainer}
      >
        {CATEGORIES.map(cat => {
          const isActive = selectedType === cat.id;
          const color = cat.id === 'all' ? Colors.primary : (TYPE_COLORS[cat.id] ?? Colors.primary);
          const count = typeCounts[cat.id] ?? 0;
          return (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryChip,
                isActive && { backgroundColor: color, borderColor: color },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(cat.id);
              }}
            >
              <Ionicons
                name={(isActive ? cat.icon.replace('-outline', '') : cat.icon) as any}
                size={14}
                color={isActive ? '#FFF' : color}
              />
              <Text style={[styles.categoryText, isActive && { color: '#FFF' }]}>
                {cat.label}
              </Text>
              {count > 0 && (
                <View style={[styles.categoryCount, isActive && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Text style={[styles.categoryCountText, isActive && { color: '#FFF' }]}>
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredProfiles}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: bottomInset + 100, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search-outline" size={32} color={Colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
            {search.length > 0 && (
              <Pressable
                style={styles.clearBtn}
                onPress={() => {
                  setSearch('');
                  setSelectedType('all');
                }}
              >
                <Text style={styles.clearBtnText}>Clear filters</Text>
              </Pressable>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: -2,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '10',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary + '30',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 12,
    overflow: 'hidden',
  },
  searchBarFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    padding: 0,
    minWidth: 0,
  },

  categoryScrollContainer: {
    maxHeight: 44,
    marginBottom: 8,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  categoryCount: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  categoryCountText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },

  featuredSection: {
    marginBottom: 16,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  featuredScroll: {
    gap: 12,
    paddingRight: 4,
  },
  featuredCard: {
    width: 180,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  featuredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featuredIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  featuredDesc: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 12,
  },
  featuredBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredCount: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textTertiary,
  },
  featuredJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  featuredJoinedBtn: {
    backgroundColor: Colors.primary + '12',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  featuredJoinText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  featuredJoinedText: {
    color: Colors.primary,
  },

  resultsHeader: {
    paddingHorizontal: 4,
    paddingBottom: 8,
    paddingTop: 4,
  },
  resultsCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textTertiary,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
  },
  cardLeft: {},
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCenter: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    flexShrink: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typePillText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    flexShrink: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  membersText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
  },
  joinedBtn: {
    backgroundColor: Colors.primary + '10',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  joinText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  clearBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary + '10',
  },
  clearBtnText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.primary,
  },
});
