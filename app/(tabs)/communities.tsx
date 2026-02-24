import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  TextInput,
  Share,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { useState, useMemo, useCallback } from 'react';
import type { Profile } from '@shared/schema';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { FilterChipRow, FilterItem } from '@/components/FilterChip';

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

const QUICK_MENU = [
  { id: 'all', label: 'All', icon: 'apps' },
  { id: 'community', label: 'Communities', icon: 'people' },
  { id: 'organisation', label: 'Organisations', icon: 'business' },
  { id: 'venue', label: 'Venues', icon: 'location' },
  { id: 'council', label: 'Councils', icon: 'shield-checkmark' },
  { id: 'artist', label: 'Artists', icon: 'musical-notes' },
  { id: 'business', label: 'Businesses', icon: 'storefront' },
];

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'k';
  return num.toString();
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FeaturedBanner({ profile, onPress }: { profile: Profile; onPress: () => void }) {
  const color = TYPE_COLORS[profile.entityType] ?? Colors.primary;
  return (
    <Animated.View entering={FadeInRight.delay(100).duration(500)}>
      <Pressable onPress={onPress} style={styles.featuredCard}>
        <View style={styles.featuredInner}>
          <View style={styles.featuredContent}>
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={10} color={Colors.accent} />
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
            <Text style={styles.featuredName} numberOfLines={1}>{profile.name}</Text>
            <Text style={styles.featuredDesc} numberOfLines={2}>{profile.description}</Text>
            <View style={styles.featuredStats}>
              <View style={styles.featuredStatItem}>
                <Ionicons name="people" size={12} color={Colors.primary} />
                <Text style={styles.featuredStatText}>{formatNumber(profile.membersCount ?? 0)}</Text>
              </View>
              <View style={[styles.featuredDot, { backgroundColor: Colors.textTertiary }]} />
              <View style={styles.featuredStatItem}>
                <Ionicons name="heart" size={12} color={Colors.error} />
                <Text style={styles.featuredStatText}>{formatNumber(profile.followersCount ?? 0)}</Text>
              </View>
              {profile.rating != null && (
                <>
                  <View style={[styles.featuredDot, { backgroundColor: Colors.textTertiary }]} />
                  <View style={styles.featuredStatItem}>
                    <Ionicons name="star" size={12} color={Colors.accent} />
                    <Text style={styles.featuredStatText}>{profile.rating.toFixed(1)}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
          <View style={[styles.featuredIcon, { backgroundColor: color + '14' }]}>
            <Ionicons name={(TYPE_ICONS[profile.entityType] ?? 'people') as any} size={32} color={color} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function CommunityCard({ profile, index }: { profile: Profile; index: number }) {
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(profile.id);
  const color = TYPE_COLORS[profile.entityType] ?? Colors.primary;
  const icon = TYPE_ICONS[profile.entityType] ?? 'people';

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: `${profile.name} on CulturePass`,
        message: `Check out ${profile.name} on CulturePass! ${profile.description ?? ''} Join this ${profile.entityType} community today!`,
      });
    } catch {}
  }, [profile.name, profile.description, profile.entityType]);

  const handleJoin = useCallback(
    (e: any) => {
      e?.stopPropagation?.();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleJoinCommunity(profile.id);
    },
    [profile.id, toggleJoinCommunity],
  );

  const statItems = useMemo(
    () => [
      { icon: 'people' as const, text: formatNumber(profile.membersCount ?? 0), label: 'members' },
      { icon: 'heart' as const, text: formatNumber(profile.followersCount ?? 0), label: 'followers' },
      ...(profile.rating != null
        ? [{ icon: 'star' as const, text: profile.rating.toFixed(1), label: 'rating' }]
        : []),
    ],
    [profile.membersCount, profile.followersCount, profile.rating],
  );

  const tags = Array.isArray(profile.tags) ? (profile.tags as string[]) : [];

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <AnimatedPressable
        style={[styles.card, animStyle]}
        onPress={() => router.push({ pathname: '/profile/[id]', params: { id: profile.id } })}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      >
        <View style={styles.cardTop}>
          <View style={[styles.communityIcon, { backgroundColor: color + '12' }]}>
            <Ionicons name={icon as any} size={24} color={color} />
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.cardName} numberOfLines={1}>{profile.name}</Text>
              {profile.isVerified && (
                <View style={styles.verifiedWrap}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                </View>
              )}
            </View>

            <View style={styles.typeBadgeRow}>
              <View style={[styles.typeBadge, { backgroundColor: color + '14' }]}>
                <Text style={[styles.typeBadgeText, { color }]}>{profile.entityType}</Text>
              </View>
              {profile.category ? (
                <Text style={styles.cardCategory} numberOfLines={1}>{profile.category}</Text>
              ) : null}
            </View>
          </View>

          <Pressable hitSlop={8} onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={17} color={Colors.textTertiary} />
          </Pressable>
        </View>

        {profile.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{profile.description}</Text>
        ) : null}

        <View style={styles.cardStats}>
          {statItems.map((s, i) => (
            <View key={`${s.icon}-${i}`} style={styles.statChip}>
              <Ionicons
                name={s.icon}
                size={13}
                color={s.icon === 'star' ? Colors.accent : s.icon === 'heart' ? Colors.error : color}
              />
              <Text style={styles.statChipText}>{s.text}</Text>
              <Text style={styles.statChipLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.avatarRow}>
          {[Colors.primary, Colors.secondary, Colors.accent, Colors.info].map((c, i) => (
            <View
              key={i}
              style={[
                styles.avatarCircle,
                { backgroundColor: c + '14', borderColor: Colors.surface, marginLeft: i === 0 ? 0 : -8 },
              ]}
            >
              <Ionicons name="person" size={11} color={c} />
            </View>
          ))}
          <Text style={styles.avatarLabel}>Active members</Text>
        </View>

        {(profile.city || tags.length > 0) && (
          <View style={styles.locationTagRow}>
            {profile.city ? (
              <View style={styles.locationPill}>
                <Ionicons name="location" size={11} color={Colors.textSecondary} />
                <Text style={styles.locationPillText}>
                  {profile.city}{profile.country ? `, ${profile.country}` : ''}
                </Text>
              </View>
            ) : null}
            {tags.slice(0, 2).map(tag => (
              <View key={tag} style={[styles.tagPill, { backgroundColor: color + '0D' }]}>
                <Text style={[styles.tagPillText, { color }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.joinRow}>
          <Pressable
            style={[
              styles.joinButton,
              joined ? styles.joinedButton : styles.joinButtonActive,
            ]}
            onPress={handleJoin}
          >
            <Ionicons
              name={joined ? 'checkmark' : 'add'}
              size={18}
              color={joined ? Colors.primary : '#FFF'}
            />
            <Text style={[styles.joinText, joined && styles.joinedText]}>
              {joined ? 'Joined' : 'Join Community'}
            </Text>
          </Pressable>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');

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

    return profiles;
  }, [allProfilesData, search, selectedType]);

  const typeCounts = useMemo(() => {
    const profiles = allProfilesData ?? [];
    const counts: Record<string, number> = { all: profiles.length };
    for (const p of profiles) {
      counts[p.entityType] = (counts[p.entityType] ?? 0) + 1;
    }
    return counts;
  }, [allProfilesData]);

  const featuredProfile = useMemo(() => {
    const profiles = allProfilesData ?? [];
    return profiles.find(p => p.isVerified && (p.membersCount ?? 0) > 0) ?? profiles[0];
  }, [allProfilesData]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleTypeSelect = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedType(id);
  }, []);

  const filterItems = useMemo(() => {
    return QUICK_MENU.map(item => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      color: item.id === 'all' ? Colors.primary : (TYPE_COLORS[item.id] ?? Colors.primary),
      count: typeCounts[item.id] ?? 0,
    })) as FilterItem[];
  }, [typeCounts]);

  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <Pressable
          style={styles.headerBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/submit' as any);
          }}
        >
          <View style={styles.headerBtnInner}>
            <Ionicons name="add" size={22} color={Colors.primary} />
          </View>
        </Pressable>
      </View>

      <View style={[
        styles.searchContainer,
        searchFocused && styles.searchContainerFocused,
      ]}>
        <Ionicons name="search" size={18} color={searchFocused ? Colors.primary : Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities, artists, venues..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
          clearButtonMode="never"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <FilterChipRow items={filterItems} selectedId={selectedType} onSelect={handleTypeSelect} />

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading communities...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {featuredProfile && selectedType === 'all' && !search.trim() && (
            <FeaturedBanner
              profile={featuredProfile}
              onPress={() => router.push({ pathname: '/profile/[id]', params: { id: featuredProfile.id } })}
            />
          )}

          <View style={styles.resultRow}>
            <Text style={styles.resultCount}>
              {filteredProfiles.length} {selectedType === 'all' ? 'total' : selectedType + 's'}
            </Text>
            {search.trim() ? (
              <Pressable onPress={() => setSearch('')} style={styles.clearSearchBtn}>
                <Text style={styles.clearSearchText}>Clear search</Text>
              </Pressable>
            ) : null}
          </View>

          {filteredProfiles.map((profile, index) => (
            <CommunityCard key={profile.id} profile={profile} index={index} />
          ))}

          {filteredProfiles.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="search" size={36} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
              {search.trim() && (
                <Pressable
                  style={styles.emptyResetBtn}
                  onPress={() => { setSearch(''); setSelectedType('all'); }}
                >
                  <Text style={styles.emptyResetText}>Reset filters</Text>
                </Pressable>
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    letterSpacing: 0.37,
  },
  headerBtn: {},
  headerBtnInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '12',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
    marginBottom: 14,
  },
  searchContainerFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    padding: 0,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
  grid: { paddingHorizontal: 20, gap: 16 },

  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 4,
    backgroundColor: Colors.surface,
    ...Colors.shadows.medium,
  },
  featuredInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    minHeight: 140,
    backgroundColor: Colors.primary + '08',
  },
  featuredContent: { flex: 1, marginRight: 16 },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent + '18',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredName: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredStatText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  featuredDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  featuredIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  resultCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  clearSearchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.primary + '10',
  },
  clearSearchText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
    gap: 12,
    ...Colors.shadows.small,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  communityIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  verifiedWrap: {},
  cardName: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    flexShrink: 1,
    letterSpacing: -0.2,
  },
  typeBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardCategory: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  shareBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  statChipText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  statChipLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
  locationTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  locationPillText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagPillText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  avatarCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    marginLeft: 8,
  },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  joinButtonActive: {
    backgroundColor: Colors.primary,
  },
  joinedButton: {
    backgroundColor: Colors.primary + '0C',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.primary + '40',
  },
  joinText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  joinedText: {
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyResetBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  emptyResetText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
});
