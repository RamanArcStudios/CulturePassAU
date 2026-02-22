import { View, Text, Pressable, StyleSheet, ScrollView, Dimensions, Platform, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents } from '@/data/mockData';
import Colors from '@/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRef } from 'react';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

function FeaturedEventCard({ event, index }: { event: typeof sampleEvents[0]; index: number }) {
  const { isEventSaved, toggleSaveEvent } = useSaved();
  const saved = isEventSaved(event.id);

  return (
    <Pressable
      style={[styles.featuredCard, { backgroundColor: event.imageColor }]}
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
    >
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredTop}>
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color={Colors.accent} />
            <Text style={styles.featuredBadgeText}>Featured</Text>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleSaveEvent(event.id);
            }}
            hitSlop={8}
          >
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} color="#FFF" />
          </Pressable>
        </View>
        <View style={styles.featuredBottom}>
          <View style={styles.communityPill}>
            <Text style={styles.communityPillText}>{event.communityTag}</Text>
          </View>
          {event.councilTag && (
            <View style={[styles.communityPill, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
              <Ionicons name="shield-checkmark" size={12} color="#FFF" />
              <Text style={styles.communityPillText}>{event.councilTag}</Text>
            </View>
          )}
          <Text style={styles.featuredTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.featuredMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.metaText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.metaText} numberOfLines={1}>{event.venue}</Text>
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
  );
}

function EventRow({ event }: { event: typeof sampleEvents[0] }) {
  const { isEventSaved, toggleSaveEvent } = useSaved();

  return (
    <Pressable
      style={styles.eventRow}
      onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
    >
      <View style={[styles.eventColorBar, { backgroundColor: event.imageColor }]}>
        <Ionicons name="calendar" size={20} color="#FFF" />
      </View>
      <View style={styles.eventRowContent}>
        <Text style={styles.eventRowTitle} numberOfLines={1}>{event.title}</Text>
        <View style={styles.eventRowMeta}>
          <Text style={styles.eventRowDate}>{formatDate(event.date)} {event.time}</Text>
        </View>
        <View style={styles.eventRowMeta}>
          <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.eventRowVenue} numberOfLines={1}>{event.venue}</Text>
        </View>
      </View>
      <View style={styles.eventRowRight}>
        <Text style={[styles.eventRowPrice, event.price === 0 && { color: Colors.success }]}>
          {event.priceLabel}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleSaveEvent(event.id);
          }}
          hitSlop={8}
        >
          <Ionicons
            name={isEventSaved(event.id) ? "bookmark" : "bookmark-outline"}
            size={20}
            color={isEventSaved(event.id) ? Colors.primary : Colors.textTertiary}
          />
        </Pressable>
      </View>
    </Pressable>
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
  const upcomingEvents = sampleEvents.filter(e => !e.isFeatured).slice(0, 4);
  const councilEvents = sampleEvents.filter(e => e.isCouncil);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.locationButton}>
          <Ionicons name="location" size={18} color={Colors.primary} />
          <Text style={styles.locationText}>{state.city}, {state.country}</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
        </Pressable>
        <View style={styles.topBarRight}>
          <Pressable style={styles.iconButton} hitSlop={8}>
            <Ionicons name="search-outline" size={22} color={Colors.text} />
          </Pressable>
          <Pressable style={styles.iconButton} hitSlop={8}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.sectionTitle}>Featured Events</Text>
        </Animated.View>

        <FlatList
          data={featuredEvents}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
          scrollEnabled={!!featuredEvents.length}
          renderItem={({ item, index }) => <FeaturedEventCard event={item} index={index} />}
          keyExtractor={item => item.id}
          style={{ marginBottom: 28 }}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming This Week</Text>
            <Pressable>
              <Text style={styles.seeAll}>See All</Text>
            </Pressable>
          </View>
          {upcomingEvents.map(event => (
            <EventRow key={event.id} event={event} />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.councilHeader}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.secondary} />
              <Text style={styles.sectionTitle}>Council Events Near You</Text>
            </View>
          </View>
          {councilEvents.map(event => (
            <EventRow key={event.id} event={event} />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Tickets</Text>
          </View>
          <View style={styles.emptyTickets}>
            <Ionicons name="ticket-outline" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No tickets yet</Text>
            <Text style={styles.emptySubtext}>Browse events and grab your first ticket!</Text>
          </View>
        </View>
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
    paddingVertical: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
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
  greeting: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  councilHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 20,
    overflow: 'hidden',
  },
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
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  featuredBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  featuredBottom: { gap: 6 },
  communityPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  communityPillText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  featuredTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    lineHeight: 26,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.9)',
  },
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
  },
  attendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attendingText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.9)',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  eventColorBar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventRowContent: {
    flex: 1,
    gap: 2,
  },
  eventRowTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  eventRowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventRowDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  eventRowVenue: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    flex: 1,
  },
  eventRowRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  eventRowPrice: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  emptyTickets: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
