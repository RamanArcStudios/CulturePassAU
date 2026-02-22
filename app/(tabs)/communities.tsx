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
import Animated, { FadeInDown } from 'react-native-reanimated';

const TYPE_COLORS: Record<string, string> = {
  community: '#E85D3A',
  organisation: '#1A7A6D',
  venue: '#9B59B6',
  council: '#3498DB',
  government: '#2C3E50',
  artist: '#E91E8C',
  business: '#F2A93B',
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

// ─── CommunityCard ────────────────────────────────────────────────────────────

function CommunityCard({ profile, index }: { profile: Profile; index: number }) {
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(profile.id);
  const color = TYPE_COLORS[profile.entityType] ?? Colors.primary;
  const icon = TYPE_ICONS[profile.entityType] ?? 'people';

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out ${profile.name} on CulturePass! ${profile.description ?? ''}`,
      });
    } catch {
      // Silently ignore share cancellation / errors
    }
  }, [profile.name, profile.description]);

  const handleJoin = useCallback(
    (e: any) => {
      // stopPropagation only exists on web synthetic events
      e?.stopPropagation?.();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleJoinCommunity(profile.id);
    },
    [profile.id, toggleJoinCommunity],
  );

  const statItems = useMemo(
    () => [
      { icon: 'people' as const, text: `${formatNumber(profile.membersCount ?? 0)} members` },
      { icon: 'heart' as const, text: `${formatNumber(profile.followersCount ?? 0)} followers` },
      ...(profile.rating != null
        ? [{ icon: 'star' as const, text: profile.rating.toFixed(1) }]
        : []),
    ],
    [profile.membersCount, profile.followersCount, profile.rating],
  );

  // Cast tags safely
  const tags = Array.isArray(profile.tags) ? (profile.tags as string[]) : [];

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        style={styles.card}
        onPress={() =>
          router.push({ pathname: '/profile/[id]', params: { id: profile.id } })
        }
      >
        {/* Top row */}
        <View style={styles.cardTop}>
          <View style={[styles.communityIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon as any} size={28} color={color} />
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

            <View style={styles.typeBadgeRow}>
              <View style={[styles.typeBadge, { backgroundColor: color + '10' }]}>
                <Text style={[styles.typeBadgeText, { color }]}>{profile.entityType}</Text>
              </View>
              {profile.category ? (
                <Text style={styles.cardCategory}>{profile.category}</Text>
              ) : null}
            </View>

            {profile.culturePassId ? (
              <Text style={styles.cpidLabel}>{profile.culturePassId}</Text>
            ) : null}
          </View>

          {/* Share button — separate Pressable so it doesn't trigger card navigation */}
          <Pressable hitSlop={8} onPress={handleShare} style={styles.shareBtn}>
            <Ionicons name="share-outline" size={18} color={Colors.textTertiary} />
          </Pressable>
        </View>

        {/* Description */}
        {profile.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {profile.description}
          </Text>
        ) : null}

        {/* Stats */}
        <View style={styles.cardStats}>
          {statItems.map((s, i) => (
            <View key={`${s.icon}-${i}`} style={styles.statWithSeparator}>
              {i > 0 && <Text style={styles.statDot}>·</Text>}
              <View style={styles.stat}>
                <Ionicons
                  name={s.icon}
                  size={14}
                  color={s.icon === 'star' ? Colors.accent : Colors.textSecondary}
                />
                <Text style={styles.statText}>{s.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.avatarRow}>
          {['#E85D3A', '#1A7A6D', '#9B59B6', '#3498DB'].map((c, i) => (
            <View
              key={i}
              style={[
                styles.avatarCircle,
                { backgroundColor: c + '18', marginLeft: i === 0 ? 0 : -8 },
              ]}
            >
              <Ionicons name="person" size={13} color={c} />
            </View>
          ))}
          <Text style={styles.avatarLabel}>Recent members</Text>
        </View>

        {/* Location + tags */}
        <View style={styles.locationTagRow}>
          {profile.city ? (
            <View style={styles.locationPill}>
              <Ionicons name="location" size={12} color={Colors.textSecondary} />
              <Text style={styles.locationPillText}>
                {profile.city}
                {profile.country ? `, ${profile.country}` : ''}
              </Text>
            </View>
          ) : null}

          {tags.slice(0, 2).map(tag => (
            <View key={tag} style={[styles.tagPill, { backgroundColor: color + '10' }]}>
              <Text style={[styles.tagPillText, { color }]}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.joinRow}>
          <Pressable
            style={[
              styles.joinButton,
              joined ? styles.joinedButton : styles.joinButtonShadow,
            ]}
            onPress={handleJoin}
          >
            <Ionicons
              name={joined ? 'checkmark' : 'add'}
              size={18}
              color={joined ? Colors.secondary : '#FFF'}
            />
            <Text style={[styles.joinText, joined && styles.joinedText]}>
              {joined ? 'Joined' : 'Join'}
            </Text>
          </Pressable>

          <Pressable style={styles.shareActionBtn} onPress={handleShare} hitSlop={8}>
            <Ionicons name="share-outline" size={15} color={Colors.textSecondary} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── CommunitiesScreen ────────────────────────────────────────────────────────

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

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Communities</Text>
        <Text style={styles.subtitle}>Connect with cultural communities & organisations</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities, organisations..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="never" // We handle clear ourselves
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Type filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}
        style={{ flexGrow: 0 }}
      >
        {QUICK_MENU.map(item => {
          const isActive = selectedType === item.id;
          const color =
            item.id === 'all' ? Colors.primary : (TYPE_COLORS[item.id] ?? Colors.primary);
          return (
            <Pressable
              key={item.id}
              style={[
                styles.quickPill,
                isActive && [{ backgroundColor: color, borderColor: color }, styles.quickPillActive],
              ]}
              onPress={() => handleTypeSelect(item.id)}
            >
              <Ionicons name={item.icon as any} size={15} color={isActive ? '#FFF' : color} />
              <Text style={[styles.quickPillLabel, isActive && { color: '#FFF' }]}>
                {item.label}
              </Text>
              {(typeCounts[item.id] ?? 0) > 0 && (
                <View style={[styles.countBadge, isActive && { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Text style={[styles.countBadgeText, isActive && { color: '#FFF' }]}>
                    {typeCounts[item.id]}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.grid}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
        >
          <Text style={styles.resultCount}>{filteredProfiles.length} results</Text>

          {filteredProfiles.map((profile, index) => (
            <CommunityCard key={profile.id} profile={profile} index={index} />
          ))}

          {filteredProfiles.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={52} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14 },
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
    ...Colors.shadow.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    padding: 0,
  },
  quickRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 14 },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  quickPillLabel: { fontSize: 11.5, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  quickPillActive: { ...Colors.shadow.small },
  resultCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: { paddingHorizontal: 20, gap: 14 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    gap: 10,
    ...Colors.shadow.medium,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  communityIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardName: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    flexShrink: 1,
  },
  typeBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, opacity: 0.9 },
  typeBadgeText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', textTransform: 'capitalize' },
  cardCategory: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  cpidLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardStats: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statWithSeparator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  statDot: { fontSize: 14, color: Colors.textTertiary, marginHorizontal: 2 },
  locationTagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  locationPillText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  tagPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  tagPillText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
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
    borderWidth: 1.5,
    borderColor: Colors.card,
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
  },
  shareActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  joinButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 10,
  },
  joinButtonShadow: { ...Colors.shadow.small },
  joinedButton: {
    backgroundColor: Colors.secondary + '12',
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  joinText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  joinedText: { color: Colors.secondary },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  emptySubtext: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
});