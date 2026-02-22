import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents } from '@/data/mockData';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const { isEventSaved, toggleSaveEvent } = useSaved();

  const event = sampleEvents.find(e => e.id === id);
  if (!event) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Event not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const saved = isEventSaved(event.id);
  const capacityPercent = Math.round((event.attending / event.capacity) * 100);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${event.title} on CulturePass! ${event.venue} - ${formatDate(event.date)}`,
      });
    } catch {}
  };

  return (
    <View style={[styles.container]}>
      <View style={[styles.heroSection, { backgroundColor: event.imageColor, paddingTop: topInset }]}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroNav}>
            <Pressable style={styles.navButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </Pressable>
            <View style={styles.heroActions}>
              <Pressable style={styles.navButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color="#FFF" />
              </Pressable>
              <Pressable
                style={styles.navButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleSaveEvent(event.id);
                }}
              >
                <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={22} color="#FFF" />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{event.communityTag}</Text>
              </View>
              {event.councilTag && (
                <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Ionicons name="shield-checkmark" size={12} color="#FFF" />
                  <Text style={styles.heroBadgeText}>{event.councilTag}</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroTitle}>{event.title}</Text>
            <Text style={styles.heroOrganizer}>by {event.organizer}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.infoCards}>
          <View style={styles.infoCard}>
            <View style={[styles.infoIconBg, { backgroundColor: Colors.primary + '12' }]}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
              <Text style={styles.infoSub}>{event.time}</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <View style={[styles.infoIconBg, { backgroundColor: Colors.secondary + '12' }]}>
              <Ionicons name="location" size={20} color={Colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>{event.venue}</Text>
              <Text style={styles.infoSub} numberOfLines={1}>{event.address}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <View style={styles.capacityRow}>
            <Text style={styles.sectionTitle}>Capacity</Text>
            <Text style={styles.capacityLabel}>{capacityPercent}% filled</Text>
          </View>
          <View style={styles.capacityBar}>
            <View style={[styles.capacityFill, { width: `${capacityPercent}%`, backgroundColor: capacityPercent > 80 ? Colors.warning : Colors.secondary }]} />
          </View>
          <View style={styles.capacityDetails}>
            <Text style={styles.capacityText}>{event.attending} attending</Text>
            <Text style={styles.capacityText}>{event.capacity - event.attending} spots left</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{event.description}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Tickets</Text>
          {event.tiers.map((tier, idx) => (
            <View key={idx} style={styles.tierCard}>
              <View style={styles.tierInfo}>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierAvail}>{tier.available} available</Text>
              </View>
              <Text style={styles.tierPrice}>
                {tier.price === 0 ? 'Free' : `$${tier.price}`}
              </Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Category: {event.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Community: {event.communityTag}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Refund policy applies. Contact organizer for details.</Text>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
        <View style={styles.priceSection}>
          <Text style={styles.priceFrom}>From</Text>
          <Text style={styles.priceBig}>{event.priceLabel}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [styles.buyButton, pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }]}
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
        >
          <Ionicons name="ticket" size={20} color="#FFF" />
          <Text style={styles.buyText}>Get Tickets</Text>
        </Pressable>
      </View>
    </View>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorText: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  backLink: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginTop: 12 },
  heroSection: {
    height: 280,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 16,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 8,
  },
  heroContent: {
    gap: 6,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    lineHeight: 30,
  },
  heroOrganizer: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.8)',
  },
  infoCards: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  infoIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  infoSub: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 10,
  },
  capacityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  capacityBar: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  capacityFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  capacityText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tierInfo: { gap: 2 },
  tierName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  tierAvail: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  tierPrice: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  priceSection: {},
  priceFrom: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  priceBig: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buyText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
});
