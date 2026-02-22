import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions, Platform, FlatList, Share } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents, sampleMovies, sampleRestaurants, sampleActivities, sampleShopping, superAppSections } from '@/data/mockData';
import Colors from '@/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

function FeaturedEventCard({ event }: { event: typeof sampleEvents[0] }) {
  const { isEventSaved, toggleSaveEvent } = useSaved();
  const saved = isEventSaved(event.id);

  return (
    <View style={styles.featuredCardOuter}>
      <Pressable style={[styles.featuredCard, { backgroundColor: event.imageColor }]}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}>
        <View style={styles.featuredOverlay}>
          <View style={styles.featuredTop}>
            <View style={styles.featuredBadge}><Ionicons name="star" size={12} color={Colors.accent} /><Text style={styles.featuredBadgeText}>Featured</Text></View>
            <Pressable onPress={async (e) => { e.stopPropagation?.(); try { await Share.share({ message: `Check out ${event.title} on CulturePass! ${event.venue}` }); } catch {} }} hitSlop={8}>
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </Pressable>
            <Pressable onPress={(e) => { e.stopPropagation?.(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleSaveEvent(event.id); }} hitSlop={8}>
              <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} color="#FFF" />
            </Pressable>
          </View>
          <View style={styles.featuredBottom}>
            <View style={styles.communityPill}><Text style={styles.communityPillText}>{event.communityTag}</Text></View>
            <Text style={styles.featuredTitle} numberOfLines={2}>{event.title}</Text>
            <View style={styles.featuredMeta}>
              <View style={styles.metaItem}><Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.9)" /><Text style={styles.metaText}>{formatDate(event.date)}</Text></View>
              <View style={styles.metaItem}><Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.9)" /><Text style={styles.metaText} numberOfLines={1}>{event.venue}</Text></View>
            </View>
            <View style={styles.featuredFooter}>
              <Text style={styles.priceTag}>{event.priceLabel}</Text>
              <View style={styles.attendingBadge}><Ionicons name="people" size={14} color="#FFF" /><Text style={styles.attendingText}>{event.attending}+ going</Text></View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state } = useOnboarding();

  const featuredEvents = sampleEvents.filter(e => e.isFeatured);
  const trendingMovies = sampleMovies.filter(m => m.isTrending).slice(0, 4);
  const topRestaurants = sampleRestaurants.slice(0, 3);
  const topActivities = sampleActivities.filter(a => a.isPopular).slice(0, 3);

  const sectionRoutes: Record<string, string> = {
    movies: '/movies',
    restaurants: '/restaurants',
    activities: '/activities',
    shopping: '/shopping',
    events: '/(tabs)/explore',
    directory: '/(tabs)/directory',
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.locationButton}>
          <Ionicons name="location" size={18} color={Colors.primary} />
          <Text style={styles.locationText}>{state.city}, {state.country}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
        </Pressable>
        <View style={styles.topBarRight}>
          <Pressable style={styles.iconButton} hitSlop={8} onPress={() => router.push('/(tabs)/explore')}><Ionicons name="search-outline" size={22} color={Colors.text} /></Pressable>
          <Pressable style={styles.iconButton} hitSlop={8} onPress={() => router.push('/notifications')}><Ionicons name="notifications-outline" size={22} color={Colors.text} /><View style={styles.notifDot} /></Pressable>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.greetSection}>
          <View style={styles.greetCard}>
            <Text style={styles.greeting}>Welcome back CulturePass</Text>
            <Text style={styles.heroTitle}>Your Lifestyle Hub</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {superAppSections.map(sec => (
              <Pressable key={sec.id} style={styles.quickPill}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push(sectionRoutes[sec.id] as any); }}>
                <View style={[styles.quickPillIcon, { backgroundColor: sec.color + '15' }]}>
                  <Ionicons name={sec.icon as any} size={18} color={sec.color} />
                </View>
                <Text style={styles.quickPillLabel}>{sec.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(600)}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Featured Events</Text>
          </View>
        </Animated.View>
        <FlatList data={featuredEvents} horizontal showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 16} decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          scrollEnabled={!!featuredEvents.length}
          renderItem={({ item }) => <FeaturedEventCard event={item} />}
          keyExtractor={item => item.id} style={{ marginBottom: 28 }} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitleInner}>Now Showing</Text>
            </View>
            <Pressable onPress={() => router.push('/movies')}><Text style={styles.seeAll}>See All</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {trendingMovies.map(movie => (
              <Pressable key={movie.id} style={styles.movieMini}
                onPress={() => router.push({ pathname: '/movies/[id]', params: { id: movie.id } })}>
                <View style={[styles.moviePoster, { backgroundColor: movie.posterColor }]}>
                  <Ionicons name="film" size={28} color="rgba(255,255,255,0.9)" />
                </View>
                <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                <Text style={styles.movieLang}>{movie.language}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitleInner}>Top Restaurants</Text>
            </View>
            <Pressable onPress={() => router.push('/restaurants')}><Text style={styles.seeAll}>See All</Text></Pressable>
          </View>
          {topRestaurants.map(rest => (
            <Pressable key={rest.id} style={styles.restRow}
              onPress={() => router.push({ pathname: '/restaurants/[id]', params: { id: rest.id } })}>
              <View style={[styles.restIcon, { backgroundColor: rest.color }]}>
                <Ionicons name={rest.icon as any} size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.restName}>{rest.name}</Text>
                <Text style={styles.restCuisine}>{rest.cuisine} | {rest.priceRange}</Text>
              </View>
              <View style={styles.restRating}>
                <Ionicons name="star" size={13} color={Colors.accent} />
                <Text style={styles.restRatingText}>{rest.rating}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitleInner}>Activities Near You</Text>
            </View>
            <Pressable onPress={() => router.push('/activities')}><Text style={styles.seeAll}>See All</Text></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {topActivities.map(act => (
              <Pressable key={act.id} style={styles.actCard}
                onPress={() => router.push({ pathname: '/activities/[id]', params: { id: act.id } })}>
                <View style={[styles.actBanner, { backgroundColor: act.color }]}>
                  <Ionicons name={act.icon as any} size={24} color="rgba(255,255,255,0.9)" />
                </View>
                <View style={styles.actInfo}>
                  <Text style={styles.actName} numberOfLines={1}>{act.name}</Text>
                  <Text style={styles.actPrice}>{act.priceLabel}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitleInner}>Hot Deals</Text>
            </View>
            <Pressable onPress={() => router.push('/shopping')}><Text style={styles.seeAll}>See All</Text></Pressable>
          </View>
          {sampleShopping.slice(0, 3).map(store => (
            store.deals[0] && (
              <Pressable key={store.id} style={styles.dealRow}
                onPress={() => router.push({ pathname: '/shopping/[id]', params: { id: store.id } })}>
                <View style={[styles.dealIcon, { backgroundColor: store.color + '15' }]}>
                  <Ionicons name="pricetag" size={18} color={store.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dealStore}>{store.name}</Text>
                  <Text style={styles.dealTitle}>{store.deals[0].title}</Text>
                </View>
                <View style={styles.dealBadge}><Text style={styles.dealBadgeText}>{store.deals[0].discount}</Text></View>
              </Pressable>
            )
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)}>
          <Pressable style={styles.perksBanner} onPress={() => router.push('/perks')}>
            <View style={styles.perksBannerLeft}>
              <View style={styles.perksBannerIcon}>
                <Ionicons name="gift" size={24} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.perksBannerTitle}>Perks & Benefits</Text>
                <Text style={styles.perksBannerSub}>Exclusive discounts and rewards for you</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: Colors.border, backgroundColor: Colors.background },
  locationButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  locationText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  greetSection: { paddingHorizontal: 20, marginBottom: 20, marginTop: 4 },
  greetCard: { backgroundColor: Colors.primaryGlow, borderRadius: 18, paddingHorizontal: 20, paddingVertical: 18 },
  greeting: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  heroTitle: { fontSize: 26, fontFamily: 'Poppins_700Bold', color: Colors.text },
  quickRow: { paddingHorizontal: 20, gap: 10, paddingBottom: 20 },
  quickPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.card, borderRadius: 28, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 0.5, borderColor: Colors.cardBorder, ...Colors.shadow.small },
  quickPillIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickPillLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14, gap: 8 },
  sectionDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  section: { marginBottom: 28 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitleInner: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  seeAll: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  featuredCardOuter: { ...Colors.shadow.large },
  featuredCard: { width: CARD_WIDTH, height: 228, borderRadius: 22, overflow: 'hidden' },
  featuredOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 18, justifyContent: 'space-between' },
  featuredTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  featuredBadgeText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  featuredBottom: { gap: 6 },
  communityPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  communityPillText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  featuredTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#FFF', lineHeight: 26, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  featuredMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.95)' },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  priceTag: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  attendingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  attendingText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.95)' },
  movieMini: { width: 120, gap: 4 },
  moviePoster: { width: 120, height: 160, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...Colors.shadow.medium },
  movieTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginTop: 2 },
  movieLang: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginHorizontal: 20, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.cardBorder, ...Colors.shadow.small },
  restIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  restName: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  restCuisine: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  restRating: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.accent + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  restRatingText: { fontSize: 13, fontFamily: 'Poppins_700Bold', color: Colors.accent },
  actCard: { width: 164, backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: Colors.cardBorder, ...Colors.shadow.medium },
  actBanner: { height: 84, alignItems: 'center', justifyContent: 'center' },
  actInfo: { padding: 12, gap: 3 },
  actName: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  actPrice: { fontSize: 12, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  dealRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginHorizontal: 20, marginBottom: 10, borderWidth: 0.5, borderColor: Colors.cardBorder, ...Colors.shadow.small },
  dealIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dealStore: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  dealTitle: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  dealBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  dealBadgeText: { fontSize: 11, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  perksBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.secondary, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 20, marginHorizontal: 20, marginBottom: 28, ...Colors.shadow.medium },
  perksBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  perksBannerIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  perksBannerTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  perksBannerSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.85)' },
});
