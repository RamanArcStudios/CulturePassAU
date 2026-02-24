import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  TextInput,
  RefreshControl,
  FlatList,
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

function DirectoryRow({ profile }: { profile: Profile }) {
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(profile.id);
  const color = TYPE_COLORS[profile.entityType] ?? Colors.primary;
  const icon = TYPE_ICONS[profile.entityType] ?? 'people';

  return (
    <Pressable
      style={styles.row}
      onPress={() => router.push({ pathname: '/profile/[id]', params: { id: profile.id } })}
    >
      <View style={[styles.rowIcon, { backgroundColor: color + '14' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>

      <View style={styles.rowInfo}>
        <View style={styles.rowNameLine}>
          <Text style={styles.rowName} numberOfLines={1}>{profile.name}</Text>
          {profile.isVerified && (
            <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
          )}
        </View>
        <View style={styles.rowMeta}>
          <View style={[styles.rowTypeBadge, { backgroundColor: color + '14' }]}>
            <Text style={[styles.rowTypeText, { color }]}>{profile.entityType}</Text>
          </View>
          {profile.city && (
            <View style={styles.rowLocation}>
              <Ionicons name="location" size={10} color={Colors.textTertiary} />
              <Text style={styles.rowLocationText} numberOfLines={1}>{profile.city}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rowRight}>
        <View style={styles.rowMembers}>
          <Ionicons name="people" size={12} color={Colors.textTertiary} />
          <Text style={styles.rowMemberCount}>{formatNumber(profile.membersCount ?? 0)}</Text>
        </View>
        <Pressable
          style={[styles.rowJoinBtn, joined && styles.rowJoinedBtn]}
          onPress={(e) => {
            e?.stopPropagation?.();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleJoinCommunity(profile.id);
          }}
          hitSlop={4}
        >
          <Text style={[styles.rowJoinText, joined && styles.rowJoinedText]}>
            {joined ? 'Joined' : 'Join'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
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

  const grouped = useMemo(() => {
    const map = new Map<string, Profile[]>();
    for (const p of filteredProfiles) {
      const letter = p.name.charAt(0).toUpperCase();
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(p);
    }
    const sections: { type: 'header' | 'item'; letter?: string; profile?: Profile }[] = [];
    const sortedKeys = [...map.keys()].sort();
    for (const letter of sortedKeys) {
      sections.push({ type: 'header', letter });
      for (const p of map.get(letter)!) {
        sections.push({ type: 'item', profile: p });
      }
    }
    return sections;
  }, [filteredProfiles]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Directory</Text>
          <Text style={styles.subtitle}>{typeCounts.all ?? 0} listings</Text>
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
        <Ionicons name="search" size={16} color={searchFocused ? Colors.primary : Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search directory..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <View style={styles.filterRow}>
        {QUICK_MENU.map(item => {
          const isActive = selectedType === item.id;
          const color = item.id === 'all' ? Colors.primary : (TYPE_COLORS[item.id] ?? Colors.primary);
          return (
            <Pressable
              key={item.id}
              style={[styles.filterChip, isActive && { backgroundColor: color, borderColor: color }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(item.id);
              }}
            >
              <Ionicons name={item.icon as any} size={13} color={isActive ? '#FFF' : color} />
              <Text style={[styles.filterText, isActive && { color: '#FFF' }]}>
                {item.label}
              </Text>
              <View style={[styles.filterCount, isActive && { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Text style={[styles.filterCountText, isActive && { color: '#FFF' }]}>
                  {typeCounts[item.id] ?? 0}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item, i) => item.type === 'header' ? `h-${item.letter}` : `i-${item.profile?.id}-${i}`}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLetter}>{item.letter}</Text>
                <View style={styles.sectionLine} />
              </View>
            );
          }
          return item.profile ? <DirectoryRow profile={item.profile} /> : null;
        }}
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
            <Ionicons name="search" size={36} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: -2,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '12',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
    marginBottom: 12,
  },
  searchBarFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    padding: 0,
    minWidth: 0,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 6,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  filterText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  filterCount: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionLetter: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
    width: 20,
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  rowNameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    flexShrink: 1,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rowTypeText: {
    fontSize: 9,
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  rowLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexShrink: 1,
  },
  rowLocationText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    flexShrink: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rowMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rowMemberCount: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textTertiary,
  },
  rowJoinBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  rowJoinedBtn: {
    backgroundColor: Colors.primary + '14',
  },
  rowJoinText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  rowJoinedText: {
    color: Colors.primary,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
});
