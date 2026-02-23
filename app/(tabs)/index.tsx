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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSaved } from '@/contexts/SavedContext';
import {
  sampleEvents,
  sampleMovies,
  sampleRestaurants,
  sampleActivities,
  sampleShopping,
  superAppSections,
} from '@/data/mockData';
import Colors from '@/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { getQueryFn } from '@/lib/query-client';
import { useMemo, useCallback, useState } from 'react';
import { LocationPicker } from '@/components/LocationPicker';
import { useLocationFilter } from '@/hooks/useLocationFilter';

type SampleEvent = (typeof sampleEvents)[number];

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

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

function FeaturedEventCard({ event }: { event: SampleEvent }) {
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

  return (
    <View style={styles.featuredCardOuter}>
      <Pressable
        style={[styles.featuredCard, Platform.OS === 'web' && { cursor: 'pointer' }]}
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state } = useOnboarding();
  const { filterByLocation } = useLocationFilter();

  const { data: users } = useQuery<User[]>({
    queryKey: ['/api/users'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
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

  const featuredEvents = useMemo(
    () => filterByLocation(sampleEvents).filter(e => e.isFeatured),
    [filterByLocation],
  );

  const thisWeekEvents = useMemo(() => {
    const now = new Date();
    const weekLater = new Date();
    weekLater.setDate(now.getDate() + 7);
    return filterByLocation(sampleEvents).filter(e => {
      const [year, month, day] = e.date.split('-').map(Number);
      if (!year || !month || !day) return false;
      const eventDate = new Date(year, month - 1, day);
      return eventDate >= now && eventDate <= weekLater;
    });
  }, [filterByLocation]);

  const trendingMovies = useMemo(
    () => filterByLocation(sampleMovies).filter(m => m.isTrending).slice(0, 4),
    [filterByLocation],
  );
  const topRestaurants = useMemo(() => filterByLocation(sampleRestaurants).slice(0, 3), [filterByLocation]);
  const topActivities = useMemo(
    () => filterByLocation(sampleActivities).filter(a => a.isPopular).slice(0, 3),
    [filterByLocation],
  );

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const keyExtractor = useCallback((item: SampleEvent) => item.id, []);
  const renderFeaturedEvent = useCallback(
    ({ item }: { item: SampleEvent }) => <FeaturedEventCard event={item} />,
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

        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
          </View>
        </Animated.View>
        <FlatList
          data={featuredEvents}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          scrollEnabled={featuredEvents.length > 0}
          renderItem={renderFeaturedEvent}
          keyExtractor={keyExtractor}
          style={{ marginBottom: 32 }}
          nestedScrollEnabled
        />

        {thisWeekEvents.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250).duration(500)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>This Week</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }}
            >
              {thisWeekEvents.map(event => (
                <Pressable
                  key={event.id}
                  style={[styles.weekPill, Platform.OS === 'web' && { cursor: 'pointer' }]}
                  onPress={() =>
                    router.push({ pathname: '/event/[id]', params: { id: event.id } })
                  }
                >
                  <View style={[styles.weekPillDot, { backgroundColor: event.imageColor }]} />
                  <Text style={styles.weekPillTitle} numberOfLines={1}>{event.title}</Text>
                  <Text style={styles.weekPillDate}>{formatDate(event.date)}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <View style={{ height: 24 }} />
          </Animated.View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Now Showing</Text>
            <Pressable onPress={() => router.push('/movies')} style={Platform.OS === 'web' ? { cursor: 'pointer' } : undefined}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {trendingMovies.map(movie => (
              <Pressable
                key={movie.id}
                style={styles.movieMini}
                onPress={() =>
                  router.push({ pathname: '/movies/[id]', params: { id: movie.id } })
                }
              >
                <Image source={{ uri: movie.posterUrl }} style={styles.moviePoster} />
                <Text style={styles.movieTitle} numberOfLines={1}>
                  {movie.title}
                </Text>
                <Text style={styles.movieLang}>{movie.language}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Top Restaurants</Text>
            <Pressable onPress={() => router.push('/restaurants')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {topRestaurants.map(rest => (
            <Pressable
              key={rest.id}
              style={[styles.restRow, Platform.OS === 'web' && { cursor: 'pointer' }]}
              onPress={() =>
                router.push({ pathname: '/restaurants/[id]', params: { id: rest.id } })
              }
            >
              <Image source={{ uri: rest.imageUrl }} style={styles.restIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.restName}>{rest.name}</Text>
                <Text style={styles.restCuisine}>
                  {rest.cuisine} · {rest.priceRange}
                </Text>
              </View>
              <View style={styles.restRating}>
                <Ionicons name="star" size={12} color="#FF9F0A" />
                <Text style={styles.restRatingText}>{rest.rating}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Activities</Text>
            <Pressable onPress={() => router.push('/activities')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {topActivities.map(act => (
              <Pressable
                key={act.id}
                style={[styles.actCard, Platform.OS === 'web' && { cursor: 'pointer' }]}
                onPress={() =>
                  router.push({ pathname: '/activities/[id]', params: { id: act.id } })
                }
              >
                <Image source={{ uri: act.imageUrl }} style={styles.actBanner} />
                <View style={styles.actInfo}>
                  <Text style={styles.actName} numberOfLines={1}>
                    {act.name}
                  </Text>
                  <Text style={styles.actPrice}>{act.priceLabel}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Hot Deals</Text>
            <Pressable onPress={() => router.push('/shopping')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {filterByLocation(sampleShopping).slice(0, 3).map(store => {
            const firstDeal = store.deals?.[0];
            if (!firstDeal) return null;
            return (
              <Pressable
                key={store.id}
                style={[styles.dealRow, Platform.OS === 'web' && { cursor: 'pointer' }]}
                onPress={() =>
                  router.push({ pathname: '/shopping/[id]', params: { id: store.id } })
                }
              >
                <View style={[styles.dealIcon, { backgroundColor: store.color + '12' }]}>
                  <Ionicons name="pricetag" size={18} color={store.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dealStore}>{store.name}</Text>
                  <Text style={styles.dealTitle}>{firstDeal.title}</Text>
                </View>
                <View style={styles.dealBadge}>
                  <Text style={styles.dealBadgeText}>{firstDeal.discount}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <Pressable style={[styles.perksBanner, Platform.OS === 'web' && { cursor: 'pointer' }]} onPress={() => router.push('/perks')}>
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
            style={[styles.exploreCta, Platform.OS === 'web' && { cursor: 'pointer' }]}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text, letterSpacing: 0.35 },
  seeAll: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  section: { marginBottom: 32 },
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
  movieMini: { width: 130, gap: 4 },
  moviePoster: {
    width: 130,
    height: 180,
    borderRadius: 12,
  },
  movieTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginTop: 4 },
  movieLang: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    ...Colors.shadow.small,
  },
  restIcon: { width: 48, height: 48, borderRadius: 12 },
  restName: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  restCuisine: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 2 },
  restRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FF9F0A' + '12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  restRatingText: { fontSize: 13, fontFamily: 'Poppins_700Bold', color: '#FF9F0A' },
  actCard: {
    width: 180,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...Colors.shadow.small,
  },
  actBanner: { height: 110 },
  actInfo: { padding: 12, gap: 3 },
  actName: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  actPrice: { fontSize: 13, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    ...Colors.shadow.small,
  },
  dealIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dealStore: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  dealTitle: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  dealBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dealBadgeText: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: '#FFF' },
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
  weekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 220,
    ...Colors.shadow.small,
  },
  weekPillDot: { width: 8, height: 8, borderRadius: 4 },
  weekPillTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text, flexShrink: 1 },
  weekPillDate: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
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
