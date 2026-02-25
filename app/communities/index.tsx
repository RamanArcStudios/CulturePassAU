import { useMemo, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { useOnboarding } from '@/contexts/OnboardingContext';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';
import Colors from '@/constants/colors';

const isWeb = Platform.OS === 'web';
const SORT_STORAGE_KEY = 'communities_sort_preference';

const COMMUNITY_CATEGORIES: CategoryFilter[] = [
  { label: 'All', icon: 'apps', color: Colors.primary },
  { label: 'Diaspora', icon: 'globe-outline', color: '#3498DB' },
  { label: 'Indigenous', icon: 'leaf-outline', color: '#2ECC71' },
  { label: 'Language', icon: 'language-outline', color: '#9B59B6' },
  { label: 'Religion', icon: 'sunny-outline', color: '#E85D3A' },
];

type SortOption = 'name' | 'members' | 'featured';

// Format member count with K/M suffix
const formatMemberCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toLocaleString();
};

export default function CommunitiesScreen() {
  const { state } = useOnboarding();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [sortLoaded, setSortLoaded] = useState(false);

  // Load saved sort preference on mount
  useEffect(() => {
    const loadSortPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem(SORT_STORAGE_KEY);
        if (saved && ['name', 'members', 'featured'].includes(saved)) {
          setSortBy(saved as SortOption);
        }
      } catch (error) {
        console.error('Failed to load sort preference:', error);
      } finally {
        setSortLoaded(true);
      }
    };
    loadSortPreference();
  }, []);

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (state.country) params.set('country', state.country);
    if (state.city) params.set('city', state.city);
    return params.toString();
  }, [state.country, state.city]);

  // Fetch communities
  const { data: communities = [], isLoading, error, refetch } = useQuery({
    queryKey: ['/api/communities', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const url = `${base}/api/communities${queryString ? `?${queryString}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch communities: ${res.status}`);
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: sortLoaded, // Wait for sort preference to load
  });

  // Map to BrowseItem format
  const items: BrowseItem[] = useMemo(
    () =>
      communities.map((c: any) => ({
        id: c.id,
        title: c.name,
        subtitle: c.communityType?.toUpperCase() || 'COMMUNITY',
        description: c.description,
        imageUrl: c.coverImage,
        isPromoted: c.isPromoted || c.isFeatured,
        meta: `${formatMemberCount(c.memberCount || 0)} members`,
        communityType: c.communityType,
        memberCount: c.memberCount || 0,
      })),
    [communities]
  );

  // Filter by search query
  const searchFilteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query) ||
        item.communityType?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Sort items
  const sortedItems = useMemo(() => {
    const filtered = [...searchFilteredItems];

    switch (sortBy) {
      case 'name':
        return filtered.sort((a, b) => a.title.localeCompare(b.title));

      case 'members':
        return filtered.sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0));

      case 'featured':
        return filtered.sort((a, b) => {
          // Featured first
          if (a.isPromoted && !b.isPromoted) return -1;
          if (!a.isPromoted && b.isPromoted) return 1;
          // Then by member count
          return (b.memberCount || 0) - (a.memberCount || 0);
        });

      default:
        return filtered;
    }
  }, [searchFilteredItems, sortBy]);

  // Filter promoted items
  const promoted = useMemo(() => items.filter((i) => i.isPromoted), [items]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await refetch();

      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Refresh error:', error);

      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setRefreshing(false);
    }
  }, [refetch, refreshing]);

  // Handle search change
  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!isWeb && query === '' && searchQuery !== '') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [searchQuery]
  );

  // Handle sort change with persistence
  const handleSortChange = useCallback(async (newSort: SortOption) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setSortBy(newSort);

    // Save preference to AsyncStorage
    try {
      await AsyncStorage.setItem(SORT_STORAGE_KEY, newSort);
    } catch (error) {
      console.error('Failed to save sort preference:', error);
    }
  }, []);

  // Handle item press
  const handleItemPress = useCallback((item: BrowseItem) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.push({
      pathname: '/community/[id]',
      params: { id: item.id },
    });
  }, []);

  // Determine empty state message
  const getEmptyStateMessage = useCallback(() => {
    if (searchQuery.trim()) {
      return {
        title: 'No Results Found',
        subtitle: `No communities match "${searchQuery}". Try a different search term.`,
      };
    }

    if (state.city) {
      return {
        title: 'No Communities Found',
        subtitle: `We couldn't find any communities in ${state.city}. Try selecting a different location.`,
      };
    }

    return {
      title: 'No Communities Found',
      subtitle: "We couldn't find any communities. Try selecting a location in settings.",
    };
  }, [searchQuery, state.city]);

  const emptyState = getEmptyStateMessage();

  // Sort options component
  const renderSortOptions = useCallback(() => {
    const totalCount = sortedItems.length;
    const featuredCount = sortedItems.filter((item) => item.isPromoted).length;
    const totalMembers = sortedItems.reduce((sum, item) => sum + (item.memberCount || 0), 0);

    return (
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <Pressable
            style={[styles.sortButton, sortBy === 'featured' && styles.sortButtonActive]}
            onPress={() => handleSortChange('featured')}
            android_ripple={{ color: '#9B59B6' + '20' }}
            accessibilityRole="button"
            accessibilityLabel={`Sort by featured. ${featuredCount} featured communities`}
            accessibilityState={{ selected: sortBy === 'featured' }}
          >
            <Ionicons name="star" size={14} color={sortBy === 'featured' ? '#FFF' : '#9B59B6'} />
            <Text style={[styles.sortButtonText, sortBy === 'featured' && styles.sortButtonTextActive]}>
              Featured
            </Text>
            {sortBy === 'featured' && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{featuredCount}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.sortButton, sortBy === 'members' && styles.sortButtonActive]}
            onPress={() => handleSortChange('members')}
            android_ripple={{ color: '#9B59B6' + '20' }}
            accessibilityRole="button"
            accessibilityLabel={`Sort by members. ${formatMemberCount(totalMembers)} total members`}
            accessibilityState={{ selected: sortBy === 'members' }}
          >
            <Ionicons name="people" size={14} color={sortBy === 'members' ? '#FFF' : '#9B59B6'} />
            <Text style={[styles.sortButtonText, sortBy === 'members' && styles.sortButtonTextActive]}>
              Members
            </Text>
            {sortBy === 'members' && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{formatMemberCount(totalMembers)}</Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
            onPress={() => handleSortChange('name')}
            android_ripple={{ color: '#9B59B6' + '20' }}
            accessibilityRole="button"
            accessibilityLabel={`Sort alphabetically. ${totalCount} communities`}
            accessibilityState={{ selected: sortBy === 'name' }}
          >
            <Ionicons name="text" size={14} color={sortBy === 'name' ? '#FFF' : '#9B59B6'} />
            <Text style={[styles.sortButtonText, sortBy === 'name' && styles.sortButtonTextActive]}>A-Z</Text>
            {sortBy === 'name' && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{totalCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    );
  }, [sortBy, sortedItems, handleSortChange]);

  return (
    <BrowsePage
      title="Communities"
      accentColor="#9B59B6"
      accentIcon="people"
      categories={COMMUNITY_CATEGORIES}
      categoryKey="communityType"
      items={sortedItems}
      isLoading={isLoading || !sortLoaded}
      error={error}
      promotedItems={searchQuery.trim() ? [] : promoted}
      promotedTitle="Featured Communities"
      onItemPress={handleItemPress}
      // Pull-to-refresh
      refreshing={refreshing}
      onRefresh={handleRefresh}
      // Search
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search communities..."
      // Empty state
      emptyStateTitle={emptyState.title}
      emptyStateSubtitle={emptyState.subtitle}
      // Sort options (rendered above the list)
      renderHeaderExtra={renderSortOptions}
      // Custom badge rendering
      renderItemExtra={(item) => (
        <View style={styles.badgeContainer}>
          <View style={styles.memberRow}>
            <Ionicons name="people" size={12} color={Colors.primary} />
            <Text style={styles.memberText}>{item.meta}</Text>
          </View>
          {item.isPromoted && (
            <View style={styles.promotedBadge}>
              <Ionicons name="star" size={10} color="#9B59B6" />
              <Text style={styles.promotedText}>FEATURED</Text>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '08',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '15',
  },

  memberText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    letterSpacing: 0.2,
  },

  promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1E6F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9B59B6' + '30',
  },

  promotedText: {
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    color: '#9B59B6',
    letterSpacing: 0.5,
  },

  // Sort options styles
  sortContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },

  sortLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sortButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#9B59B6' + '12',
    borderWidth: 1.5,
    borderColor: '#9B59B6' + '30',
  },

  sortButtonActive: {
    backgroundColor: '#9B59B6',
    borderColor: '#9B59B6',
    ...Platform.select({
      ios: {
        shadowColor: '#9B59B6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  sortButtonText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#9B59B6',
  },

  sortButtonTextActive: {
    color: '#FFF',
  },

  // Count badge styles
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    letterSpacing: 0.2,
  },
});
