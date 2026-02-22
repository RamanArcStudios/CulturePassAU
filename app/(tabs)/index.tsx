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

// ─── Types ────────────────────────────────────────────────────────────────────

type SampleEvent = (typeof sampleEvents)[number];

// ─── Constants ────────────────────────────────────────────────────────────────

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

const SECTION_ROUTES: Record<string, string> = {
  movies: '/movies',
  restaurants: '/restaurants',
  activities: '/activities',
  shopping: '/shopping',
  events: '/(tabs)/explore',
  directory: '/(tabs)/directory',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  // Parse manually to avoid UTC/local timezone shifting the date
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

// ─── FeaturedEventCard ────────────────────────────────────────────────────────

function FeaturedEventCard({ event }: { event: SampleEvent }) {
  const { isEventSaved, toggleSaveEvent } = useSaved();
  const saved = isEventSaved(event.id);

  const handleShare = useCallback(async (e: any) => {
    e?.stopPropagation?.();
    try {
      await Share.share({
        message: `Check out ${event.title} on CulturePass! ${event.venue}`,
      });
    } catch {
      // Silently ignore share cancellation / errors
    }
  }, [event.title, event.venue]);

  const handleSave = useCallback((e: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSaveEvent(event.id);
  }, [event.id, toggleSaveEvent]);

  return (
    <View style={styles.featuredCardOuter}>
      <Pressable
        style={styles.featuredCard}
        onPress={() =>
          router.push({ pathname: '/event/[id]', params: { id: event.id } })
        }
      >
        <Image source={{ uri: event.imageUrl }} style={styles.featuredCardImage} />
        <View style={styles.featuredOverlay}>
          {/* Top row: badge + actions */}
          <View style={styles.featuredTop}>
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color={Colors.accent} />
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
            <Pressable onPress={handleShare} hitSlop={8}>
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </Pressable>
            <Pressable onPress={handleSave} hitSlop={8}>
              <Ionicons
                name={saved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color="#FFF"
              />
            </Pressable>
          </View>

          {/* Bottom row: title + meta */}
          <View style={styles.featuredBottom}>
            <View style={styles.communityPill}>
              <Text style={styles.communityPillText}>{event.communityTag}</Text>
            </View>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.featuredMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.metaText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.metaText} numberOfLines={1}>
                  {event.venue}
                </Text>
              </View>
            </View>
            <View style={styles.featuredFooter}>
              <Text style={styles.priceTag}>{event.priceLabel}</Text>
              <View style={styles.attendingBadge}>
                <Ionicons name="people" size={14} color="#FFF" />
                <Text style={styles.attendingText}>{event.attending}+ going</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state } = useOnboarding();

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
    () => sampleEvents.filter(e => e.isFeatured),
    [],
  );

  const thisWeekEvents = useMemo(() => {
    const now = new Date();
    const weekLater = new Date();
    weekLater.setDate(now.getDate() + 7);
    return sampleEvents.filter(e => {
      const [year, month, day] = e.date.split('-').map(Number);
      if (!year || !month || !day) return false;
      const eventDate = new Date(year, month - 1, day);
      return eventDate >= now && eventDate <= weekLater;
    });
  }, []);

  const trendingMovies = useMemo(
    () => sampleMovies.filter(m => m.isTrending).slice(0, 4),
    [],
  );
  const topRestaurants = useMemo(() => sampleRestaurants.slice(0, 3), []);
  const topActivities = useMemo(
    () => sampleActivities.filter(a => a.isPopular).slice(0, 3),
    [],
  );

  // Stable keyExtractor for FlatList
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
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable style={styles.locationButton}>
          <Ionicons name="location" size={18} color={Colors.primary} />
          <Text style={styles.locationText}>
            {state.city}
            {state.country ? `, ${state.country}` : ''}
          </Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
        </Pressable>
        <View style={styles.topBarRight}>
          <Pressable
            style={styles.iconButton}
            hitSlop={8}
            onPress={() => router.push('/(tabs)/explore')}
          >
            <Ionicons name="search-outline" size={22} color={Colors.text} />
          </Pressable>
          <Pressable
            style={styles.iconButton}
            hitSlop={8}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        {/* Greeting */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.greetSection}>
          <View style={styles.greetCard}>
            <Text style={styles.greeting}>{timeGreeting}, {firstName}</Text>
            <Text style={styles.heroTitle}>Your Lifestyle Hub</Text>
          </View>
        </Animated.View>

        {/* Quick nav pills */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
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

        {/* Featured Events */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Featured Events</Text>
          </View>
        </Animated.View>
        <FlatList
          data={featuredEvents}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          scrollEnabled={featuredEvents.length > 0}
          renderItem={renderFeaturedEvent}
          keyExtractor={keyExtractor}
          style={{ marginBottom: 28 }}
          // Prevents FlatList inside ScrollView from intercepting outer scroll
          nestedScrollEnabled
        />

        {thisWeekEvents.length > 0 && (
          <Animated.View entering={FadeInDown.delay(350).duration(600)}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>Happening This Week</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 4 }}
            >
              {thisWeekEvents.map(event => (
                <Pressable
                  key={event.id}
                  style={styles.weekPill}
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
            <View style={{ height: 20 }} />
          </Animated.View>
        )}

        {/* Now Showing */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitleInner}>Now Showing</Text>
            </View>
            <Pressable onPress={() => router.push('/movies')}>
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

        {/* Top Restaurants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitleInner}>Top Restaurants</Text>
            </View>
            <Pressable onPress={() => router.push('/restaurants')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {topRestaurants.map(rest => (
            <Pressable
              key={rest.id}
              style={styles.restRow}
              onPress={() =>
                router.push({ pathname: '/restaurants/[id]', params: { id: rest.id } })
              }
            >
              <Image source={{ uri: rest.imageUrl }} style={styles.restIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.restName}>{rest.name}</Text>
                <Text style={styles.restCuisine}>
                  {rest.cuisine} | {rest.priceRange}
                </Text>
              </View>
              <View style={styles.restRating}>
                <Ionicons name="star" size={13} color={Colors.accent} />
                <Text style={styles.restRatingText}>{rest.rating}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Activities Near You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitleInner}>Activities Near You</Text>
            </View>
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
                style={styles.actCard}
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

        {/* Hot Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitleInner}>Hot Deals</Text>
            </View>
            <Pressable onPress={() => router.push('/shopping')}>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {sampleShopping.slice(0, 3).map(store => {
            // Only render the row if there's at least one deal
            const firstDeal = store.deals?.[0];
            if (!firstDeal) return null;
            return (
              <Pressable
                key={store.id}
                style={styles.dealRow}
                onPress={() =>
                  router.push({ pathname: '/shopping/[id]', params: { id: store.id } })
                }
              >
                <View style={[styles.dealIcon, { backgroundColor: store.color + '15' }]}>
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

        {/* Perks banner */}
        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <Pressable style={styles.perksBanner} onPress={() => router.push('/perks')}>
            <View style={styles.perksBannerLeft}>
              <View style={styles.perksBannerIcon}>
                <Ionicons name="gift" size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perksBannerTitle}>Perks & Benefits</Text>
                <Text style={styles.perksBannerSub}>
                  Exclusive discounts and rewards for you
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700).duration(600)}>
          <Pressable
            style={styles.exploreCta}
            onPress={() => router.push('/allevents')}
          >
            <View style={styles.exploreCtaIcon}>
              <Ionicons name="compass" size={26} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exploreCtaTitle}>Explore All Events</Text>
              <Text style={styles.exploreCtaSub}>Discover what's happening near you</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  greetSection: { paddingHorizontal: 20, marginBottom: 20, marginTop: 4 },
  greetCard: {
    backgroundColor: Colors.primaryGlow,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  greeting: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  heroTitle: { fontSize: 26, fontFamily: 'Poppins_700Bold', color: Colors.text },
  quickRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 20 },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    ...Colors.shadow.small,
  },
  quickPillIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickPillLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitleInner: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  seeAll: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  featuredCardOuter: { ...Colors.shadow.large },
  featuredCard: { width: CARD_WIDTH, height: 228, borderRadius: 22, overflow: 'hidden' },
  featuredCardImage: { position: 'absolute', width: '100%', height: '100%' },
  featuredOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 18,
    justifyContent: 'space-between',
  },
  featuredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  featuredBadgeText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  featuredBottom: { gap: 6 },
  communityPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  communityPillText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  featuredTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.95)' },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceTag: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  attendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  attendingText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.95)' },
  movieMini: { width: 120, gap: 4 },
  moviePoster: {
    width: 120,
    height: 160,
    borderRadius: 16,
    ...Colors.shadow.medium,
  },
  movieTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginTop: 2 },
  movieLang: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    ...Colors.shadow.small,
  },
  restIcon: { width: 46, height: 46, borderRadius: 14 },
  restName: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  restCuisine: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  restRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  restRatingText: { fontSize: 13, fontFamily: 'Poppins_700Bold', color: Colors.accent },
  actCard: {
    width: 164,
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    ...Colors.shadow.medium,
  },
  actBanner: { height: 84 },
  actInfo: { padding: 12, gap: 3 },
  actName: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  actPrice: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    ...Colors.shadow.small,
  },
  dealIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dealStore: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  dealTitle: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  dealBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dealBadgeText: { fontSize: 11, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  perksBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 20,
    marginBottom: 28,
    ...Colors.shadow.medium,
  },
  perksBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  perksBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perksBannerTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  perksBannerSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.85)' },
  weekPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    maxWidth: 220,
    ...Colors.shadow.small,
  },
  weekPillDot: { width: 8, height: 8, borderRadius: 4 },
  weekPillTitle: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.text, flexShrink: 1 },
  weekPillDate: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  exploreCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.primaryGlow,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.primaryLight + '30',
    ...Colors.shadow.small,
  },
  exploreCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreCtaTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  exploreCtaSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
});