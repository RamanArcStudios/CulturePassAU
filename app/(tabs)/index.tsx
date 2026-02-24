import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { getQueryFn, getApiUrl } from '@/lib/query-client';
import { useMemo, useCallback, useState } from 'react';
import { LocationPicker } from '@/components/LocationPicker';
import { fetch } from 'expo/fetch';
import EventCard from '@/components/Discover/EventCard';
import CategoryCard from '@/components/Discover/CategoryCard';
import CommunityCard from '@/components/Discover/CommunityCard';
import CityCard from '@/components/Discover/CityCard';
import Colors from '@/constants/colors';

const isWeb = Platform.OS === 'web';

const superAppSections = [
  { id: 'movies', label: 'Movies', icon: 'film', color: '#FF3B30', route: '/movies' },
  { id: 'restaurants', label: 'Dining', icon: 'restaurant', color: '#FF9500', route: '/restaurants' },
  { id: 'activities', label: 'Activities', icon: 'compass', color: '#34C759', route: '/activities' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-handle', color: '#AF52DE', route: '/shopping' },
  { id: 'events', label: 'Events', icon: 'calendar', color: '#007AFF', route: '/explore' },
  { id: 'directory', label: 'Directory', icon: 'storefront', color: '#5856D6', route: '/directory' },
];

const SECTION_ROUTES: Record<string, string> = {
  movies: '/movies',
  restaurants: '/restaurants',
  activities: '/activities',
  shopping: '/shopping',
  events: '/(tabs)/explore',
  directory: '/(tabs)/directory',
};

const browseCategories = [
  { id: 'c1', label: 'Music', icon: 'musical-notes', color: '#FF6B6B' },
  { id: 'c2', label: 'Dance', icon: 'body', color: '#4ECDC4' },
  { id: 'c3', label: 'Food', icon: 'restaurant', color: '#FFD93D' },
  { id: 'c4', label: 'Art', icon: 'color-palette', color: '#A855F7' },
  { id: 'c5', label: 'Wellness', icon: 'heart', color: '#FF6B8A' },
  { id: 'c6', label: 'Film', icon: 'film', color: '#2196F3' },
  { id: 'c7', label: 'Workshop', icon: 'construct', color: '#FF9800' },
  { id: 'c8', label: 'Heritage', icon: 'library', color: '#8B4513' },
];

const FEATURED_CITIES = [
  { name: 'Sydney', country: 'Australia' },
  { name: 'Melbourne', country: 'Australia' },
  { name: 'Auckland', country: 'New Zealand' },
  { name: 'Dubai', country: 'UAE' },
  { name: 'London', country: 'United Kingdom' },
  { name: 'Toronto', country: 'Canada' },
  { name: 'Vancouver', country: 'Canada' },
  { name: 'Brisbane', country: 'Australia' },
];

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

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

function SectionHeader({ title, subtitle, onSeeAll }: { title: string; subtitle?: string; onSeeAll?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {onSeeAll && (
        <Pressable
          style={styles.seeAllButton}
          onPress={onSeeAll}
          hitSlop={12}
        >
          <Text style={styles.seeAll}>See all</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.tint} />
        </Pressable>
      )}
    </View>
  );
}

function SpotlightCard({ item, index = 0 }: { item: any; index?: number }) {
  return (
    <Animated.View entering={isWeb ? undefined : FadeInDown.delay((index || 0) * 80 + 100).duration(500)}>
      <Pressable
        style={({ pressed }) => [
          styles.spotlightCard,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          Platform.OS === 'web' && { cursor: 'pointer' as any },
          Colors.shadows.medium,
        ]}
        onPress={() => {
          if (item.type === 'event') router.push({ pathname: '/event/[id]', params: { id: item.id } });
        }}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(93, 64, 55, 0.95)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.spotlightBadge}>
          <Ionicons name="earth" size={10} color="#FFF" />
          <Text style={styles.spotlightBadgeText}>First Nations</Text>
        </View>
        <View style={styles.spotlightContent}>
          <Text style={styles.spotlightTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.spotlightDesc} numberOfLines={2}>{item.description}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
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

  const { data: traditionalLandsData = [] } = useQuery({
    queryKey: ['/api/indigenous/traditional-lands'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/indigenous/traditional-lands`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: allEvents = [] } = useQuery<any[]>({
    queryKey: ['/api/events', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const params = new URLSearchParams();
      if (state.country) params.append('country', state.country);
      if (state.city) params.append('city', state.city);
      const res = await fetch(`${base}api/events?${params.toString()}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: allCommunities = [] } = useQuery<any[]>({
    queryKey: ['/api/communities'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/communities`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: spotlights = [] } = useQuery<any[]>({
    queryKey: ['/api/indigenous/spotlights'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/indigenous/spotlights`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
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
  const popularEvents = nearYou?.items.filter((e: any) => !!e.venue).slice(0, 12) ?? [];
  const featuredEvent = allEvents.find((e: any) => e.isFeatured) || allEvents[0];
  const otherSections = sections.filter(s => s.title !== 'Near You');

  const cultureCards = useMemo(() => {
    const types: Record<string, { id: string; label: string; color: string; emoji?: string; icon: string }[]> = {};
    allCommunities.forEach((c: any) => {
      const key = c.type || 'other';
      if (!types[key]) types[key] = [];
      if (types[key].length < 8) {
        types[key].push({
          id: c.id,
          label: c.name?.split(' ')[0] || c.name,
          color: c.color || '#007AFF',
          emoji: c.iconEmoji,
          icon: 'people',
        });
      }
    });
    const all = Object.values(types).flat();
    return all.slice(0, 10);
  }, [allCommunities]);

  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const land = traditionalLandsData.find((l: any) => l.city === state.city);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={[styles.topBar, Platform.OS === 'web' && { maxWidth: 900, alignSelf: 'center', width: '100%' }]}>
        <LocationPicker />
        <View style={styles.topBarRight}>
          <Pressable style={styles.iconButton} onPress={() => router.push('/search')} testID="search-btn" accessibilityLabel="Search">
            <Ionicons name="search" size={24} color={Colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.push('/map' as any)} testID="map-btn" accessibilityLabel="Events Map">
            <Ionicons name="map-outline" size={24} color={Colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.push('/notifications')} testID="notifications-btn" accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          { paddingBottom: 120 },
          Platform.OS === 'web' && { maxWidth: 900, alignSelf: 'center', width: '100%' },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.tint}
          />
        }
      >
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(500)} style={styles.heroSection}>
          <Text style={styles.heroSubtitle}>{timeGreeting}, {firstName}</Text>
          <Text style={styles.heroTitle}>
            What's happening in{'\n'}your culture this week?
          </Text>
        </Animated.View>

        {land && (
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(120).duration(500)} style={styles.landBanner}>
            <LinearGradient
              colors={['rgba(139,69,19,0.15)', 'rgba(139,69,19,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.landBannerContent}>
              <Ionicons name="earth" size={14} color="#D4A574" />
              <Text style={styles.landBannerTitle}>You are on {land.landName}</Text>
            </View>
            <Text style={styles.landBannerSub}>Traditional Custodians: {land.traditionalCustodians}</Text>
          </Animated.View>
        )}

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(150).duration(500)} style={styles.quickGrid}>
          {superAppSections.map((sec) => (
            <Pressable
              key={sec.id}
              style={({ pressed }) => [
                styles.quickBtn,
                pressed && { transform: [{ scale: 0.95 }] },
                Platform.OS === 'web' && { cursor: 'pointer' as any },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(SECTION_ROUTES[sec.id] as any);
              }}
            >
              <View style={[styles.quickBtnIconWrapper, Colors.shadows.small]}>
                <View style={[styles.quickBtnIcon, { backgroundColor: sec.color + '15' }]}>
                  <Ionicons name={sec.icon as any} size={24} color={sec.color} />
                </View>
              </View>
              <Text style={styles.quickBtnLabel}>{sec.label}</Text>
            </Pressable>
          ))}
        </Animated.View>

        {discoverLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Colors.tint} />
            <Text style={styles.loadingText}>Personalising your feed...</Text>
          </View>
        )}

        {featuredEvent && (
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(180).duration(500)} style={{ paddingHorizontal: 20, marginBottom: 28 }}>
            <SectionHeader title="Cultural Highlight" subtitle="Don't miss this week" />
            <EventCard event={featuredEvent} highlight index={0} />
          </Animated.View>
        )}

        {popularEvents.length > 0 && (
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(220).duration(500)} style={{ marginBottom: 32 }}>
            <View style={{ paddingHorizontal: 20 }}>
              <SectionHeader
                title="Popular Near You"
                onSeeAll={() => router.push('/(tabs)/explore')}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
              decelerationRate="fast"
              snapToInterval={296}
              snapToAlignment="start"
            >
              {popularEvents.map((event: any, i: number) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {allCommunities.length > 0 && (
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(260).duration(500)} style={{ marginBottom: 32 }}>
            <View style={{ paddingHorizontal: 20 }}>
              <SectionHeader
                title="Cultural Communities"
                subtitle="Connect with your people"
                onSeeAll={() => router.push('/(tabs)/communities')}
              />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              decelerationRate="fast"
              snapToInterval={210}
              snapToAlignment="start"
            >
              {allCommunities.slice(0, 10).map((c: any, i: number) => (
                <CommunityCard key={c.id} community={c} index={i} />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {spotlights.length > 0 && (
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(300).duration(500)} style={{ marginBottom: 32 }}>
            <View style={{ paddingHorizontal: 20 }}>
              <SectionHeader title="First Nations Spotlight" subtitle="Celebrating Indigenous culture" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              decelerationRate="fast"
              snapToInterval={294}
              snapToAlignment="start"
            >
              {spotlights.map((item: any, i: number) => (
                <SpotlightCard key={item.id} item={item} index={i} />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {cultureCards.length > 0 && (
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(340).duration(500)} style={{ marginBottom: 32 }}>
            <View style={{ paddingHorizontal: 20 }}>
              <SectionHeader title="Explore Your Culture" />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
              decelerationRate="fast"
              snapToInterval={122}
              snapToAlignment="start"
            >
              {cultureCards.map((item: any) => (
                <CategoryCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push({ pathname: '/community/[id]', params: { id: item.id } })}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {otherSections.filter(s => s.type === 'events' || s.type === 'mixed').map((section) => (
          <Animated.View key={section.title} entering={isWeb ? undefined : FadeInDown.delay(380).duration(500)} style={{ marginBottom: 32 }}>
            <View style={{ paddingHorizontal: 20 }}>
              <SectionHeader title={section.title} subtitle={section.subtitle} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
              decelerationRate="fast"
              snapToInterval={296}
              snapToAlignment="start"
            >
              {section.items.filter((e: any) => !!e.venue).slice(0, 10).map((event: any, i: number) => (
                <EventCard key={event.id} event={event} index={i} />
              ))}
            </ScrollView>
          </Animated.View>
        ))}

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(400).duration(500)} style={{ marginBottom: 32 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <SectionHeader title="Browse Categories" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
            decelerationRate="fast"
            snapToInterval={122}
            snapToAlignment="start"
          >
            {browseCategories.map(cat => (
              <CategoryCard
                key={cat.id}
                item={cat}
                onPress={() => router.push('/(tabs)/explore')}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(420).duration(500)} style={{ marginBottom: 32 }}>
          <View style={{ paddingHorizontal: 20 }}>
            <SectionHeader title="Explore Cities" subtitle="Discover culture worldwide" />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            decelerationRate="fast"
            snapToInterval={190}
            snapToAlignment="start"
          >
            {FEATURED_CITIES.map((city, i) => (
              <CityCard
                key={city.name}
                city={city}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(420).duration(500)} style={styles.bannerWrap}>
          <Pressable
            style={({ pressed }) => [
              styles.plusBanner,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              Platform.OS === 'web' && { cursor: 'pointer' as any },
            ]}
            onPress={() => router.push('/membership/upgrade')}
          >
            <LinearGradient
              colors={['#111111', '#1A1A24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.bannerDecoration1} />
            <View style={styles.bannerDecoration2} />
            <View style={styles.plusBannerLeft}>
              <View style={styles.plusBannerIconWrap}>
                <Ionicons name="star" size={20} color="#FFD700" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.plusBannerTitle}>CulturePass <Text style={{ color: '#FFD700' }}>PRO</Text></Text>
                <Text style={styles.plusBannerSub}>2% cashback & exclusive VIP access</Text>
              </View>
            </View>
            <View style={styles.plusBannerCta}>
              <Text style={styles.plusBannerCtaText}>Explore</Text>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(440).duration(500)} style={styles.bannerWrap}>
          <Pressable
            style={({ pressed }) => [
              styles.perksBanner,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              Platform.OS === 'web' && { cursor: 'pointer' as any },
            ]}
            onPress={() => router.push('/perks')}
          >
            <LinearGradient
              colors={['#5856D6', '#3634A3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.plusBannerLeft}>
              <View style={styles.perksBannerIconWrap}>
                <Ionicons name="gift" size={22} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.plusBannerTitle}>Perks & Benefits</Text>
                <Text style={styles.plusBannerSub}>Exclusive discounts and rewards</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
          </Pressable>
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(460).duration(500)} style={styles.bannerWrap}>
          <Pressable
            style={({ pressed }) => [
              styles.exploreCta,
              pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              Platform.OS === 'web' && { cursor: 'pointer' as any },
            ]}
            onPress={() => router.push('/allevents')}
          >
            <View style={styles.exploreCtaIcon}>
              <Ionicons name="compass" size={24} color="#007AFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exploreCtaTitle}>Explore All Events</Text>
              <Text style={styles.exploreCtaSub}>Discover what's happening near you</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#636366" />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.surfaceSecondary,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
    marginTop: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.tint,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  landBanner: {
    borderRadius: 14,
    padding: 14,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#D4A574',
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  landBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  landBannerTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#D4A574',
  },
  landBannerSub: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#8B7355',
    marginTop: 3,
    marginLeft: 20,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 36,
    gap: 12,
  },
  quickBtn: {
    width: '30%' as any,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickBtnIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: Colors.surface,
  },
  quickBtnIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    textAlign: 'center',
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingBottom: 4,
  },
  seeAll: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.tint,
  },
  spotlightCard: {
    width: 280,
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  spotlightBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139,69,19,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  spotlightBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  spotlightContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  spotlightTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    marginBottom: 4,
  },
  spotlightDesc: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 16,
  },
  bannerWrap: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  plusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    overflow: 'hidden',
    ...Colors.shadows.large,
  },
  bannerDecoration1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
  },
  bannerDecoration2: {
    position: 'absolute',
    bottom: -30,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  plusBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  plusBannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,215,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  plusBannerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  plusBannerSub: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  plusBannerCta: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  plusBannerCtaText: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#000',
  },
  perksBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    overflow: 'hidden',
    ...Colors.shadows.large,
  },
  perksBannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    ...Colors.shadows.medium,
  },
  exploreCtaIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(0,122,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreCtaTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  exploreCtaSub: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
    marginTop: 2,
  },
});
