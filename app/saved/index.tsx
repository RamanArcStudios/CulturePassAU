import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { goBackOrReplace } from '@/lib/navigation';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import Colors from '@/constants/colors';
import { useMemo, useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { Image } from 'expo-image';

const isWeb = Platform.OS === 'web';

type TabKey = 'events' | 'communities';

interface Event {
  id: string;
  title: string;
  imageUrl: string;
  communityTag: string;
  date: string;
  venue: string;
  priceLabel: string;
}

interface Community {
  id: string;
  name: string;
  category: string;
  color?: string;
  members: number;
  events: number;
}

function formatDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (!year || !month || !day) return dateStr;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
}

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  const [activeTab, setActiveTab] = useState<TabKey>('events');
  const [refreshing, setRefreshing] = useState(false);
  const { savedEvents, joinedCommunities, toggleSaveEvent, toggleJoinCommunity } = useSaved();

  const {
    data: allEvents = [],
    refetch: refetchEvents,
  } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/events`);
      if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const {
    data: allCommunities = [],
    refetch: refetchCommunities,
  } = useQuery<Community[]>({
    queryKey: ['/api/communities'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/communities`);
      if (!res.ok) throw new Error(`Failed to fetch communities: ${res.status}`);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const savedEventItems = useMemo(
    () => allEvents.filter((e) => savedEvents.includes(e.id)),
    [savedEvents, allEvents]
  );

  const joinedCommunityItems = useMemo(
    () => allCommunities.filter((c) => joinedCommunities.includes(c.id)),
    [joinedCommunities, allCommunities]
  );

  const tabs: { key: TabKey; label: string; icon: string; count: number }[] = useMemo(
    () => [
      { key: 'events', label: 'Saved Events', icon: 'bookmark', count: savedEventItems.length },
      {
        key: 'communities',
        label: 'Communities',
        icon: 'people',
        count: joinedCommunityItems.length,
      },
    ],
    [savedEventItems.length, joinedCommunityItems.length]
  );

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    goBackOrReplace('/(tabs)');
  }, []);

  const handleTabChange = useCallback((tab: TabKey) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await Promise.all([refetchEvents(), refetchCommunities()]);
    setRefreshing(false);
  }, [refetchEvents, refetchCommunities]);

  const handleEventPress = useCallback((eventId: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/event/[id]', params: { id: eventId } });
  }, []);

  const handleCommunityPress = useCallback((communityId: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/community/[id]', params: { id: communityId } });
  }, []);

  const handleToggleSaveEvent = useCallback(
    (eventId: string, e: any) => {
      e?.stopPropagation?.();
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      toggleSaveEvent(eventId);
    },
    [toggleSaveEvent]
  );

  const handleToggleJoinCommunity = useCallback(
    (communityId: string, e: any) => {
      e?.stopPropagation?.();
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      toggleJoinCommunity(communityId);
    },
    [toggleJoinCommunity]
  );

  const handleBrowseEvents = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/(tabs)');
  }, []);

  const handleBrowseCommunities = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push('/(tabs)/communities');
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={8}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>My Saved</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleTabChange(tab.key)}
              android_ripple={{ color: Colors.primary + '15' }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label}, ${tab.count} items`}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={isActive ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              {tab.count > 0 && (
                <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isActive && styles.countTextActive]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset + 20 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {activeTab === 'events' && (
          <>
            {savedEventItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="bookmark-outline" size={56} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No saved events</Text>
                <Text style={styles.emptyDesc}>
                  Tap the bookmark icon on any event to save it here for later
                </Text>
                <Pressable
                  style={styles.emptyBtn}
                  onPress={handleBrowseEvents}
                  android_ripple={{ color: '#FFF3' }}
                  accessibilityRole="button"
                  accessibilityLabel="Browse events"
                >
                  <Text style={styles.emptyBtnText}>Browse Events</Text>
                </Pressable>
              </View>
            ) : (
              savedEventItems.map((event, index) => (
                <Animated.View
                  key={event.id}
                  entering={isWeb ? undefined : FadeInDown.delay(index * 60).duration(400)}
                >
                  <Pressable
                    style={styles.eventCard}
                    onPress={() => handleEventPress(event.id)}
                    android_ripple={{ color: Colors.primary + '10' }}
                    accessibilityRole="button"
                    accessibilityLabel={`${event.title} event on ${formatDate(event.date)}`}
                  >
                    <Image
                      source={{ uri: event.imageUrl }}
                      style={styles.eventImage}
                      contentFit="cover"
                      transition={200}
                    />
                    <View style={styles.eventInfo}>
                      <View style={styles.eventCommunityRow}>
                        <Text style={styles.eventCommunity}>{event.communityTag}</Text>
                      </View>
                      <Text style={styles.eventTitle} numberOfLines={2}>
                        {event.title}
                      </Text>
                      <View style={styles.eventMeta}>
                        <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
                        <Text style={styles.eventMetaText}>{formatDate(event.date)}</Text>
                      </View>
                      <View style={styles.eventMeta}>
                        <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                        <Text style={styles.eventMetaText} numberOfLines={1}>
                          {event.venue}
                        </Text>
                      </View>
                      <View style={styles.eventBottom}>
                        <Text style={styles.eventPrice}>{event.priceLabel}</Text>
                        <Pressable
                          hitSlop={8}
                          onPress={(e) => handleToggleSaveEvent(event.id, e)}
                          android_ripple={{ color: Colors.primary + '20', radius: 16 }}
                          accessibilityRole="button"
                          accessibilityLabel="Remove from saved events"
                        >
                          <Ionicons name="bookmark" size={20} color={Colors.primary} />
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))
            )}
          </>
        )}

        {activeTab === 'communities' && (
          <>
            {joinedCommunityItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={56} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No communities joined</Text>
                <Text style={styles.emptyDesc}>Join cultural communities to see them here</Text>
                <Pressable
                  style={styles.emptyBtn}
                  onPress={handleBrowseCommunities}
                  android_ripple={{ color: '#FFF3' }}
                  accessibilityRole="button"
                  accessibilityLabel="Browse communities"
                >
                  <Text style={styles.emptyBtnText}>Browse Communities</Text>
                </Pressable>
              </View>
            ) : (
              joinedCommunityItems.map((community, index) => (
                <Animated.View
                  key={community.id}
                  entering={isWeb ? undefined : FadeInDown.delay(index * 60).duration(400)}
                >
                  <Pressable
                    style={styles.communityCard}
                    onPress={() => handleCommunityPress(community.id)}
                    android_ripple={{ color: Colors.primary + '10' }}
                    accessibilityRole="button"
                    accessibilityLabel={`${community.name} community, ${community.members} members`}
                  >
                    <View
                      style={[
                        styles.communityAvatar,
                        { backgroundColor: community.color || Colors.primary + '15' },
                      ]}
                    >
                      <Ionicons name="people" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.communityInfo}>
                      <Text style={styles.communityName}>{community.name}</Text>
                      <Text style={styles.communityType}>{community.category}</Text>
                      <View style={styles.communityStats}>
                        <Ionicons
                          name="people-outline"
                          size={13}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.communityStatText}>{community.members} members</Text>
                        {community.events > 0 && (
                          <>
                            <View style={styles.statDot} />
                            <Ionicons
                              name="calendar-outline"
                              size={13}
                              color={Colors.textSecondary}
                            />
                            <Text style={styles.communityStatText}>{community.events} events</Text>
                          </>
                        )}
                      </View>
                    </View>
                    <Pressable
                      hitSlop={8}
                      onPress={(e) => handleToggleJoinCommunity(community.id, e)}
                      style={styles.leaveBtn}
                      android_ripple={{ color: Colors.primary + '20' }}
                      accessibilityRole="button"
                      accessibilityLabel="Leave community"
                    >
                      <Text style={styles.leaveBtnText}>Joined</Text>
                    </Pressable>
                  </Pressable>
                </Animated.View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  headerTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },

  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 4 },

  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  tabActive: { backgroundColor: Colors.primary + '10', borderColor: Colors.primary + '30' },

  tabText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },

  tabTextActive: { color: Colors.primary },

  countBadge: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 8,
  },

  countBadgeActive: { backgroundColor: Colors.primary + '20' },

  countText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },

  countTextActive: { color: Colors.primary },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8, paddingHorizontal: 40 },

  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginTop: 8,
  },

  emptyDesc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  emptyBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 50,
  },

  emptyBtnText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },

  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  eventImage: { width: 110, height: 130 },

  eventInfo: { flex: 1, padding: 14, gap: 4, justifyContent: 'center' },

  eventCommunityRow: { flexDirection: 'row' },

  eventCommunity: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  eventTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginTop: 2,
  },

  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  eventMetaText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },

  eventBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  eventPrice: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.primary },

  communityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },

  communityAvatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  communityInfo: { flex: 1, gap: 2 },

  communityName: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.text },

  communityType: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },

  communityStats: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },

  communityStatText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },

  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
    marginHorizontal: 4,
  },

  leaveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    backgroundColor: Colors.primary + '12',
    borderWidth: 1,
    borderColor: Colors.primary + '25',
  },

  leaveBtnText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
});
