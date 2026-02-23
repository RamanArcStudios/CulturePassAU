import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  FlatList,
  Share,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSaved } from '@/contexts/SavedContext';
import {
  superAppSections,
  traditionalLands,
} from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { getQueryFn, getApiUrl } from '@/lib/query-client';
import { useMemo, useCallback, useState } from 'react';
import { LocationPicker } from '@/components/LocationPicker';
import { fetch } from 'expo/fetch';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

const SECTION_ROUTES: Record<string, string> = {
  movies: '/movies',
  restaurants: '/restaurants',
  activities: '/activities',
  shopping: '/shopping',
  events: '/(tabs)/explore',
  directory: '/(tabs)/directory',
};

interface DiscoverSection {
  title: string;
  subtitle?: string;
  type: 'events' | 'communities' | 'businesses' | 'activities' | 'spotlight' | 'mixed';
  items: any[];
  priority: number;
}

interface DiscoverFeed {
  sections: DiscoverSection[];
  meta: {
    userId: string;
    city: string;
    country: string;
    generatedAt: string;
    totalItems: number;
  };
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

function EventCard({ event, compact }: { event: any; compact?: boolean }) {
  const { isEventSaved, toggleSaveEvent } = useSaved();
  const saved = isEventSaved(event.id);

  const handleShare = useCallback(async (e: any) => {
    e?.stopPropagation?.();
    try {
      await Share.share({
        message: `Check out ${event.title} on CulturePass! ${event.venue}`,
      });
    } catch {}
  }, [event.title, event.venue]);

  const handleSave = useCallback((e: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSaveEvent(event.id);
  }, [event.id, toggleSaveEvent]);

  if (compact) {
    return (
      <Pressable
        style={[styles.compactCard, Platform.OS === 'web' && { cursor: 'pointer' as any }]}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      >
        <Image source={{ uri: event.imageUrl }} style={styles.compactImage} />
        <View style={styles.compactInfo}>
          <View style={styles.compactCommunityRow}>
            <Text style={styles.compactCommunityTag}>{event.communityTag}</Text>
          </View>
          <Text style={styles.compactTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.compactMeta}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.compactMetaText}>{formatDate(event.date)}</Text>
          </View>
          <Text style={styles.compactPrice}>{event.priceLabel}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.featuredCardOuter}>
      <Pressable
        style={[styles.featuredCard, Platform.OS === 'web' && { cursor: 'pointer' as any }]}
        onPress={() =>
          router.push({ pathname: '/event/[id]', params: { id: event.id } })
        }
      >
        <Image source={{ uri: event.imageUrl }} style={styles.featuredCardImage} />
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredTop}>
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={11} color="#FF9F0A" />
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
            <View style={styles.featuredActions}>
              <Pressable onPress={handleShare} hitSlop={8} style={styles.featuredActionBtn}>
                <Ionicons name="share-outline" size={18} color="#FFF" />
              </Pressable>
              <Pressable onPress={handleSave} hitSlop={8} style={styles.featuredActionBtn}>
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color="#FFF"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.featuredBottom}>
            <View style={styles.communityPill}>
              <Text style={styles.communityPillText}>{event.communityTag}</Text>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.featuredMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.metaText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="location" size={13} color="rgba(255,255,255,0.85)" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {event.venue}
                </Text>
              </View>
            </View>
            <View style={styles.featuredFooter}>
              <Text style={styles.priceTag}>{event.priceLabel}</Text>
              <View style={styles.attendingBadge}>
                <Ionicons name="people" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.attendingText}>{event.attending}+ going</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function CommunityCard({ community }: { community: any }) {
  const name = community.name;
  const desc = community.description;
  const members = community.memberCount || community.members || 0;
  const emoji = community.iconEmoji || '';
  const color = community.color || Colors.primary;

  return (
    <Pressable
      style={[styles.communityCard, Platform.OS === 'web' && { cursor: 'pointer' as any }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push({ pathname: '/community/[id]', params: { id: community.id } });
      }}
    >
      <View style={[styles.communityIconWrap, { backgroundColor: color + '15' }]}>
        {emoji ? (
          <Text style={{ fontSize: 22 }}>{emoji}</Text>
        ) : (
          <Ionicons name={(community.icon || 'people') as any} size={22} color={color} />
        )}
      </View>
      <Text style={styles.communityName} numberOfLines={1}>{name}</Text>
      <Text style={styles.communityMembers}>{members} members</Text>
      {desc ? <Text style={styles.communityDesc} numberOfLines={2}>{desc}</Text> : null}
    </Pressable>
  );
}

function SpotlightCard({ item }: { item: any }) {
  const hasIndigenousTags = item.indigenousTags && item.indigenousTags.length > 0;

  return (
    <Pressable
      style={[styles.spotlightCard, Platform.OS === 'web' && { cursor: 'pointer' as any }]}
      onPress={() => {
        if (item.venue) {
          router.push({ pathname: '/event/[id]', params: { id: item.id } });
        } else if (item.services) {
          router.push({ pathname: '/business/[id]', params: { id: item.id } });
        } else if (item.priceLabel) {
          router.push({ pathname: '/activities/[id]', params: { id: item.id } });
        }
      }}
    >
      <LinearGradient
        colors={['#5D4037', '#8B4513']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.spotlightBanner}
      >
        <View style={styles.spotlightBadge}>
          <Text style={styles.spotlightBadgeText}>First Nations</Text>
        </View>
      </LinearGradient>
      <View style={styles.spotlightBody}>
        <Text style={styles.spotlightTitle} numberOfLines={2}>{item.title || item.name}</Text>
        {hasIndigenousTags && (
          <View style={styles.spotlightNation}>
            <Text style={styles.spotlightNationText}>{item.indigenousTags[0]}</Text>
          </View>
        )}
        <Text style={styles.spotlightDesc} numberOfLines={2}>
          {item.description || item.venue || ''}
        </Text>
        {item.date && (
          <View style={styles.spotlightDateRow}>
            <Ionicons name="calendar-outline" size={11} color={Colors.textSecondary} />
            <Text style={styles.spotlightDateText}>{formatDate(item.date)}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function DiscoverSectionRenderer({ section }: { section: DiscoverSection }) {
  if (section.type === 'events' || section.type === 'mixed') {
    const events = section.items.filter((i: any) => !!i.venue);
    const communities = section.items.filter((i: any) => !i.venue && (i.color || i.iconEmoji));
    const useCompact = events.length > 6;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.subtitle && <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>}
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {events.slice(0, 15).map((event: any) => (
            <EventCard key={event.id} event={event} compact={useCompact} />
          ))}
          {communities.map((c: any) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (section.type === 'spotlight') {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.subtitle && <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>}
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {section.items.slice(0, 10).map((item: any) => (
            <SpotlightCard key={item.id} item={item} />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (section.type === 'communities') {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.subtitle && <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>}
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
        >
          {section.items.slice(0, 10).map((c: any) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return null;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state } = useOnboarding();
  const userId = useDemoUserId();

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const { data: discoverFeed, isLoading: discoverLoading, refetch } = useQuery<DiscoverFeed>({
    queryKey: ['/api/discover', userId],
    queryFn: async () => {
      if (!userId) return { sections: [], meta: { userId: '', city: '', country: '', generatedAt: '', totalItems: 0 } };
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}api/discover/${userId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch discover feed');
      return res.json();
    },
    enabled: !!userId,
  });

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const firstName = useMemo(() => {
    const user = users?.[0];
    if (!user?.displayName) return 'Explorer';
    return user.displayName.split(' ')[0];
  }, [users]);

  const sections = discoverFeed?.sections ?? [];
  const nearYou = sections.find(s => s.title === 'Near You');
  const featuredFromNearYou = nearYou?.items.filter((e: any) => e.isFeatured).slice(0, 5) ?? [];
  const otherSections = sections.filter(s => s.title !== 'Near You');

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const keyExtractor = useCallback((item: any) => item.id, []);
  const renderFeaturedEvent = useCallback(
    ({ item }: { item: any }) => <EventCard event={item} />,
    [],
  );

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={[styles.topBar, Platform.OS === 'web' && { maxWidth: 900, alignSelf: 'center', width: '100%' }]}>
        <LocationPicker />
        <View style={styles.topBarRight}>
          <Pressable
            style={styles.iconButton}
            hitSlop={8}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={22} color={Colors.text} />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            hitSlop={8}
            onPress={() => router.push('/saved')}
          >
            <Ionicons name="bookmark" size={22} color={Colors.text} />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            hitSlop={8}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications" size={22} color={Colors.text} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { paddingBottom: 100 },
          Platform.OS === 'web' && { maxWidth: 900, alignSelf: 'center', width: '100%' }
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.greetSection}>
          <Text style={styles.greeting}>{timeGreeting},</Text>
          <Text style={styles.heroTitle}>{firstName}</Text>
        </Animated.View>

        {(() => {
          const land = traditionalLands.find(l => l.city === state.city);
          if (!land) return null;
          return (
            <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.landBanner}>
              <View style={styles.landBannerContent}>
                <Ionicons name="earth" size={14} color="#8B4513" />
                <Text style={styles.landBannerTitle}>You are on {land.landName}</Text>
              </View>
              <Text style={styles.landBannerSub}>Traditional Custodians: {land.traditionalCustodians}</Text>
            </Animated.View>
          );
        })()}

        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRow}
          >
            {superAppSections.map(sec => (
              <Pressable
                key={sec.id}
                style={styles.quickPill}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(SECTION_ROUTES[sec.id] as any);
                }}
              >
                <View style={[styles.quickPillIcon, { backgroundColor: sec.color + '15' }]}>
                  <Ionicons name={sec.icon as any} size={18} color={sec.color} />
                </View>
                <Text style={styles.quickPillLabel}>{sec.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {discoverLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Personalising your feed...</Text>
          </View>
        )}

        {featuredFromNearYou.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Near You</Text>
            </View>
          </Animated.View>
        )}
        {featuredFromNearYou.length > 0 && (
          <FlatList
            data={featuredFromNearYou}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            scrollEnabled={featuredFromNearYou.length > 0}
            renderItem={renderFeaturedEvent}
            keyExtractor={keyExtractor}
            style={{ marginBottom: 32 }}
            nestedScrollEnabled
          />
        )}

        {nearYou && nearYou.items.length > 0 && (
          <DiscoverSectionRenderer section={{
            ...nearYou,
            title: 'Near You',
            items: nearYou.items.filter((e: any) => !e.isFeatured).slice(0, 10),
          }} />
        )}

        {otherSections.map((section) => (
          <DiscoverSectionRenderer key={section.title} section={section} />
        ))}

        <Animated.View entering={FadeInDown.delay(380).duration(500)}>
          <Pressable
            style={[styles.plusBanner, Platform.OS === 'web' && { cursor: 'pointer' as any }]}
            onPress={() => router.push('/membership/upgrade')}
          >
            <View style={styles.plusBannerLeft}>
              <View style={styles.plusBannerIcon}>
                <Ionicons name="star" size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.plusBannerTitle}>CulturePass+</Text>
                <Text style={styles.plusBannerSub}>
                  2% cashback, early access & exclusive perks
                </Text>
              </View>
            </View>
            <View style={styles.plusBannerCta}>
              <Text style={styles.plusBannerCtaText}>$7.99/mo</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Pressable style={[styles.perksBanner, Platform.OS === 'web' && { cursor: 'pointer' as any }]} onPress={() => router.push('/perks')}>
            <View style={styles.perksBannerLeft}>
              <View style={styles.perksBannerIcon}>
                <Ionicons name="gift" size={22} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perksBannerTitle}>Perks & Benefits</Text>
                <Text style={styles.perksBannerSub}>
                  Exclusive discounts and rewards
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).duration(500)}>
          <Pressable
            style={[styles.exploreCta, Platform.OS === 'web' && { cursor: 'pointer' as any }]}
            onPress={() => router.push('/allevents')}
          >
            <View style={styles.exploreCtaIcon}>
              <Ionicons name="compass" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exploreCtaTitle}>Explore All Events</Text>
              <Text style={styles.exploreCtaSub}>Discover what's happening near you</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.background,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.error,
  },
  greetSection: { paddingHorizontal: 20, marginBottom: 20, marginTop: 4 },
  greeting: { fontSize: 16, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  heroTitle: { fontSize: 34, fontFamily: 'Poppins_700Bold', color: Colors.text, letterSpacing: 0.37 },
  quickRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 24 },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...Colors.shadow.small,
  },
  quickPillIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  quickPillLabel: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text, letterSpacing: 0.35 },
  sectionSubtitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 2 },
  seeAll: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  section: { marginBottom: 32 },
  loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  featuredCardOuter: { ...Colors.shadow.medium },
  featuredCard: { width: CARD_WIDTH, height: 260, borderRadius: 16, overflow: 'hidden' },
  featuredCardImage: { position: 'absolute', width: '100%', height: '100%' },
  featuredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 16,
    justifyContent: 'space-between',
  },
  featuredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredActions: { flexDirection: 'row', gap: 4 },
  featuredActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  featuredBadgeText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  featuredBottom: { gap: 6 },
  communityPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  communityPillText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  featuredTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    lineHeight: 26,
  },
  featuredMeta: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.9)' },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  priceTag: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  attendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  attendingText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.9)' },
  compactCard: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
    ...Colors.shadow.small,
  },
  compactImage: { width: '100%', height: 110 },
  compactInfo: { padding: 10, gap: 4 },
  compactCommunityRow: { flexDirection: 'row' },
  compactCommunityTag: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    backgroundColor: Colors.primaryGlow,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  compactTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text, lineHeight: 18 },
  compactMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compactMetaText: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  compactPrice: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  communityCard: {
    width: 160,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    ...Colors.shadow.small,
  },
  communityIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  communityName: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text, textAlign: 'center' },
  communityMembers: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  communityDesc: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, textAlign: 'center', lineHeight: 15 },
  spotlightCard: {
    width: 260,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    ...Colors.shadow.small,
  },
  spotlightBanner: {
    height: 40,
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  spotlightBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  spotlightBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  spotlightBody: {
    padding: 12,
  },
  spotlightTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  spotlightNation: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5EDE3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  spotlightNationText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8B4513',
  },
  spotlightDesc: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 17,
  },
  spotlightDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  spotlightDateText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  plusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A5276',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    ...Colors.shadow.medium,
  },
  plusBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  plusBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E86C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBannerTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  plusBannerSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  plusBannerCta: {
    backgroundColor: '#2E86C1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  plusBannerCtaText: { fontSize: 13, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  perksBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 12,
    ...Colors.shadow.medium,
  },
  perksBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  perksBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perksBannerTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  perksBannerSub: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.8)' },
  landBanner: {
    backgroundColor: '#F5EDE3',
    borderRadius: 12,
    padding: 12,
    paddingLeft: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#8B4513',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  landBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  landBannerTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: '#3E2723',
  },
  landBannerSub: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#6D4C41',
    marginTop: 2,
    marginLeft: 20,
  },
  exploreCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 28,
    ...Colors.shadow.small,
  },
  exploreCtaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreCtaTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.text },
  exploreCtaSub: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
});
