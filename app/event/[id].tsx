import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Share,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import Colors, { shadows } from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import * as WebBrowser from 'expo-web-browser';

type SampleEvent = any;

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const { isEventSaved, toggleSaveEvent } = useSaved();

  const { data: event, isLoading } = useQuery({
    queryKey: ['/api/events', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/events/${id}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={styles.errorText}>Event not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return <EventDetail event={event} topInset={topInset} bottomInset={bottomInset} />;
}

interface EventDetailProps {
  event: SampleEvent;
  topInset: number;
  bottomInset: number;
}

function EventDetail({ event, topInset, bottomInset }: EventDetailProps) {
  const { isEventSaved, toggleSaveEvent } = useSaved();
  const saved = isEventSaved(event.id);

  const [now, setNow] = useState(() => new Date());
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [buyMode, setBuyMode] = useState<'single' | 'family' | 'group'>('single');

  const usersQuery = useQuery<any[]>({ queryKey: ['/api/users'] });
  const demoUserId = usersQuery.data?.[0]?.id;

  const { data: membership } = useQuery<{ tier: string; cashbackMultiplier?: number }>({
    queryKey: [`/api/membership/${demoUserId}`],
    enabled: !!demoUserId,
  });
  const isPlus = membership?.tier === 'plus';

  const [paymentLoading, setPaymentLoading] = useState(false);

  const purchaseMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await apiRequest('POST', '/api/stripe/create-checkout-session', { ticketData: body });
      return await res.json();
    },
    onSuccess: async (data: any) => {
      if (data.checkoutUrl) {
        setPaymentLoading(true);
        setTicketModalVisible(false);

        try {
          const result = await WebBrowser.openBrowserAsync(data.checkoutUrl, {
            dismissButtonStyle: 'cancel',
            presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          });

          queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });

          if (result.type === 'cancel' || result.type === 'dismiss') {
            const ticketRes = await apiRequest('GET', `/api/ticket/${data.ticketId}`, undefined);
            const ticket = await ticketRes.json();

            if (ticket.paymentStatus === 'paid' || ticket.status === 'confirmed') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Ticket Purchased!', 'Your payment was successful.', [
                {
                  text: 'View Ticket',
                  onPress: () => router.push(`/tickets/${data.ticketId}` as any),
                },
                { text: 'OK' },
              ]);
            }
          }
        } catch (e: any) {
          Alert.alert('Payment Error', 'Could not open payment page. Please try again.');
        } finally {
          setPaymentLoading(false);
        }
      }
    },
    onError: (error: Error) => {
      Alert.alert('Purchase Failed', error.message);
    },
  });

  const selectedTier = event.tiers[selectedTierIndex];
  const maxQty = buyMode === 'family' ? 1 : Math.min(20, selectedTier?.available ?? 1);
  const familySize = 4;
  const familyDiscount = 0.10;
  const groupDiscount = quantity >= 10 ? 0.15 : quantity >= 5 ? 0.10 : 0;
  const basePrice = selectedTier?.priceCents ?? 0;

  const rawTotal = buyMode === 'family'
    ? basePrice * familySize
    : basePrice * quantity;
  const discountRate = buyMode === 'family'
    ? familyDiscount
    : buyMode === 'group' ? groupDiscount : 0;
  const discountAmount = rawTotal * discountRate;
  const totalPrice = rawTotal - discountAmount;
  const effectiveQty = buyMode === 'family' ? familySize : quantity;
  const cashbackAmount = isPlus ? (totalPrice / 100) * 0.02 : 0;

  const handlePurchase = useCallback(() => {
    const users = usersQuery.data;
    if (!users || users.length === 0) {
      Alert.alert('Error', 'Unable to load user data. Please try again.');
      return;
    }
    const userId = users[0].id;

    const ticketLabel = buyMode === 'family' ? `${selectedTier.name} (Family Pack)` : buyMode === 'group' ? `${selectedTier.name} (Group)` : selectedTier.name;

    if (totalPrice <= 0) {
      purchaseFreeTicket({
        userId,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        eventVenue: event.venue,
        tierName: ticketLabel,
        quantity: effectiveQty,
        totalPriceCents: 0,
        currency: 'AUD',
        imageColor: (event as any).imageColor ?? Colors.primary,
      });
      return;
    }

    purchaseMutation.mutate({
      userId,
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      eventVenue: event.venue,
      tierName: ticketLabel,
      quantity: effectiveQty,
      totalPriceCents: totalPrice,
      currency: 'AUD',
      imageColor: (event as any).imageColor ?? Colors.primary,
    });
  }, [usersQuery.data, event, selectedTier, quantity, totalPrice, effectiveQty, buyMode, purchaseMutation]);

  const purchaseFreeTicket = useCallback(async (body: Record<string, unknown>) => {
    try {
      const res = await apiRequest('POST', '/api/tickets', body);
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      setTicketModalVisible(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Ticket Confirmed!', 'Your free ticket has been reserved.', [
        {
          text: 'View Ticket',
          onPress: () => router.push(`/tickets/${data.id}` as any),
        },
        { text: 'OK' },
      ]);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to reserve ticket. Please try again.');
    }
  }, []);

  const openTicketModal = useCallback((tierIdx?: number) => {
    setSelectedTierIndex(tierIdx ?? 0);
    setQuantity(1);
    setBuyMode('single');
    setTicketModalVisible(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const countdown = useMemo(() => {
    const [year, month, day] = event.date.split('-').map(Number);
    if (!year || !month || !day) return null;
    const eventDate = new Date(year, month - 1, day);
    const timeParts = event.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1], 10);
      const mins = parseInt(timeParts[2], 10);
      const ampm = timeParts[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      eventDate.setHours(hours, mins, 0, 0);
    }
    const diff = eventDate.getTime() - now.getTime();
    if (diff <= 0) return { ended: true as const, days: 0, hours: 0, minutes: 0 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { ended: false as const, days, hours, minutes };
  }, [event.date, event.time, now]);

  const capacityPercent = useMemo(
    () =>
      event.capacity > 0
        ? Math.min(100, Math.round((event.attending / event.capacity) * 100))
        : 0,
    [event.attending, event.capacity],
  );

  const { data: allEventsForRelated = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/events`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const relatedEvents = useMemo(
    () =>
      allEventsForRelated
        .filter(
          (e: any) =>
            e.id !== event.id &&
            (e.category === event.category || e.communityTag === event.communityTag),
        )
        .slice(0, 3),
    [event.id, event.category, event.communityTag, allEventsForRelated],
  );

  const avatarCount = 5;
  const remainingCount = Math.max(0, event.attending - avatarCount);

  const handleShare = useCallback(async () => {
    try {
      const shareUrl = `https://culturepass.app/event/${event.id}`;
      await Share.share({
        title: `${event.title} on CulturePass`,
        message: `Check out ${event.title} on CulturePass! ${event.venue} - ${formatDate(event.date)}\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {
    }
  }, [event.id, event.title, event.venue, event.date]);

  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSaveEvent(event.id);
  }, [event.id, toggleSaveEvent]);

  const handleGetTickets = useCallback(() => {
    openTicketModal();
  }, [openTicketModal]);

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.heroSection,
          { height: 320 + topInset },
        ]}
      >
        <Image source={{ uri: event.imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.4, 1]}
          style={[styles.heroOverlay, { paddingTop: topInset }]}
        >
          <View style={styles.heroNav}>
            <Pressable style={styles.navButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </Pressable>
            <View style={styles.heroActions}>
              <Pressable style={styles.navButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color="#FFF" />
              </Pressable>
              <Pressable style={styles.navButton} onPress={handleSave}>
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color="#FFF"
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{event.communityTag}</Text>
              </View>
              {event.councilTag ? (
                <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                  <Ionicons name="shield-checkmark" size={12} color="#FFF" />
                  <Text style={styles.heroBadgeText}>{event.councilTag}</Text>
                </View>
              ) : null}
              {event.indigenousTags?.map((tag: string) => (
                <View key={tag} style={[styles.heroBadge, { backgroundColor: 'rgba(139,69,19,0.7)' }]}>
                  <Ionicons name="earth" size={11} color="#FFF" />
                  <Text style={styles.heroBadgeText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.heroTitle}>{event.title}</Text>
            <Text style={styles.heroOrganizer}>by {event.organizer}</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}
      >
        {countdown && (
          <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.countdownContainer}>
            {countdown.ended ? (
              <View style={styles.countdownEndedBox}>
                <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.countdownEndedText}>Event has ended</Text>
              </View>
            ) : (
              <View style={styles.countdownRow}>
                <View style={styles.countdownBox}>
                  <Text style={styles.countdownNumber}>{countdown.days}</Text>
                  <Text style={styles.countdownLabel}>days</Text>
                </View>
                <Text style={styles.countdownSeparator}>:</Text>
                <View style={styles.countdownBox}>
                  <Text style={styles.countdownNumber}>{countdown.hours}</Text>
                  <Text style={styles.countdownLabel}>hrs</Text>
                </View>
                <Text style={styles.countdownSeparator}>:</Text>
                <View style={styles.countdownBox}>
                  <Text style={styles.countdownNumber}>{countdown.minutes}</Text>
                  <Text style={styles.countdownLabel}>mins</Text>
                </View>
              </View>
            )}
          </Animated.View>
        )}

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
          <Pressable
            style={styles.infoCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const query = [event.venue, event.city, event.country].filter(Boolean).join(', ');
              Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(query)}`);
            }}
          >
            <View style={[styles.infoIconBg, { backgroundColor: Colors.secondary + '12' }]}>
              <Ionicons name="location" size={20} color={Colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Venue</Text>
              <Text style={styles.infoValue}>{event.venue}</Text>
              <Text style={styles.infoSub} numberOfLines={1}>
                {event.address}
              </Text>
            </View>
            <Ionicons name="open-outline" size={14} color={Colors.textTertiary} />
          </Pressable>
        </Animated.View>

        {isPlus && (
          <View style={styles.earlyAccessBadge}>
            <Ionicons name="flash" size={14} color="#2E86C1" />
            <Text style={styles.earlyAccessText}>48h Early Access</Text>
            <View style={styles.earlyAccessDot} />
            <Ionicons name="star" size={12} color="#2E86C1" />
            <Text style={styles.earlyAccessText}>CulturePass+ Member</Text>
          </View>
        )}

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <View style={styles.capacityRow}>
            <Text style={styles.sectionTitle}>Capacity</Text>
            <Text style={styles.capacityLabel}>{capacityPercent}% filled</Text>
          </View>
          <View style={styles.capacityBar}>
            <View
              style={[
                styles.capacityFill,
                {
                  width: `${capacityPercent}%`,
                  backgroundColor:
                    capacityPercent > 80 ? Colors.warning : Colors.secondary,
                },
              ]}
            />
          </View>
          <View style={styles.capacityDetails}>
            <Text style={styles.capacityText}>{event.attending} attending</Text>
            <Text style={styles.capacityText}>
              {Math.max(0, event.capacity - event.attending)} spots left
            </Text>
          </View>
        </Animated.View>

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{event.description}</Text>
        </Animated.View>

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        {event.indigenousTags && event.indigenousTags.length > 0 && (
          <>
            <Animated.View entering={FadeInDown.delay(350).duration(500)} style={styles.section}>
              <View style={styles.educationCard}>
                <View style={styles.educationHeader}>
                  <View style={styles.educationIconBg}>
                    <Ionicons name="book" size={18} color="#8B4513" />
                  </View>
                  <Text style={styles.educationTitle}>Cultural Information</Text>
                </View>
                <Text style={styles.educationBody}>
                  This is an event led by Aboriginal and Torres Strait Islander peoples. Please be mindful of cultural protocols and respect the traditions shared during this event.
                </Text>
                {event.indigenousTags.includes('NAIDOC Week') && (
                  <View style={styles.educationHighlight}>
                    <Ionicons name="information-circle" size={16} color="#1A5276" />
                    <Text style={styles.educationHighlightText}>
                      NAIDOC Week celebrates the history, culture, and achievements of Aboriginal and Torres Strait Islander peoples.
                    </Text>
                  </View>
                )}
                {event.indigenousTags.includes('Reconciliation Week') && (
                  <View style={styles.educationHighlight}>
                    <Ionicons name="information-circle" size={16} color="#1A5276" />
                    <Text style={styles.educationHighlightText}>
                      National Reconciliation Week commemorates two significant milestones in the reconciliation journey.
                    </Text>
                  </View>
                )}
                {event.indigenousTags.includes('Cultural Ceremony') && (
                  <View style={styles.educationHighlight}>
                    <Ionicons name="information-circle" size={16} color="#1A5276" />
                    <Text style={styles.educationHighlightText}>
                      This event includes cultural ceremonies. Photography may be restricted during certain performances. Please follow the guidance of event organisers.
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
            <View style={styles.sectionDivider}>
              <View style={styles.accentBar} />
            </View>
          </>
        )}

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Tickets</Text>
          {event.tiers.map((tier: any, idx: number) => (
            <Pressable key={`${tier.name}-${idx}`} style={styles.tierCard} onPress={() => openTicketModal(idx)}>
              <View style={styles.tierInfo}>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierAvail}>{tier.available} available</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.tierPrice}>
                  {tier.priceCents === 0 ? 'Free' : `$${(tier.priceCents / 100).toFixed(2)}`}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              </View>
            </Pressable>
          ))}
        </Animated.View>

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="finger-print-outline" size={16} color={Colors.secondary} />
            <Text style={[styles.detailText, { color: Colors.secondary, fontFamily: 'Poppins_600SemiBold' }]}>CPID: {event.cpid}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="pricetag-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Category: {event.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Community: {event.communityTag}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.detailText}>
              Refund policy applies. Contact organizer for details.
            </Text>
          </View>
        </Animated.View>

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={FadeInDown.delay(550).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Who&apos;s Going</Text>
          <View style={styles.whosGoingRow}>
            <View style={styles.avatarStack}>
              {Array.from({ length: avatarCount }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.avatarCircle,
                    { marginLeft: i === 0 ? 0 : -12, zIndex: avatarCount - i },
                    { backgroundColor: [Colors.primary, Colors.secondary, Colors.accent, Colors.primaryLight, Colors.secondaryLight][i % 5] },
                  ]}
                >
                  <Ionicons name="person" size={14} color="#FFF" />
                </View>
              ))}
            </View>
            <View style={styles.whosGoingInfo}>
              <Text style={styles.whosGoingCount}>{event.attending} attending</Text>
              {remainingCount > 0 && (
                <Text style={styles.whosGoingOthers}>+{remainingCount} others</Text>
              )}
            </View>
          </View>
        </Animated.View>

        {relatedEvents.length > 0 && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.accentBar} />
            </View>
            <Animated.View entering={FadeInDown.delay(600).duration(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>You Might Also Like</Text>
              {relatedEvents.map((re: any) => (
                <Pressable
                  key={re.id}
                  style={styles.relatedCard}
                  onPress={() => router.push(`/event/${re.id}`)}
                >
                  <Image source={{ uri: re.imageUrl }} style={styles.relatedSwatch} />
                  <View style={styles.relatedInfo}>
                    <Text style={styles.relatedTitle} numberOfLines={1}>{re.title}</Text>
                    <Text style={styles.relatedMeta}>{formatDateShort(re.date)}</Text>
                    <Text style={styles.relatedMeta} numberOfLines={1}>{re.venue}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 14 }]}>
        <View style={styles.priceSection}>
          <Text style={styles.priceFrom}>From</Text>
          <Text style={styles.priceBig}>{event.priceLabel}</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.buyButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleGetTickets}
        >
          <Ionicons name="ticket" size={20} color="#FFF" />
          <Text style={styles.buyText}>Get Tickets</Text>
        </Pressable>
      </View>

      <Modal
        visible={ticketModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTicketModalVisible(false)}
      >
        <Pressable style={modalStyles.overlay} onPress={() => setTicketModalVisible(false)}>
          <Pressable style={modalStyles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={modalStyles.handle} />
            <View style={modalStyles.header}>
              <Text style={modalStyles.headerTitle}>Select Tickets</Text>
              <Pressable onPress={() => setTicketModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={Colors.textTertiary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={modalStyles.content}>
              <Text style={modalStyles.sectionLabel}>How are you booking?</Text>
              <View style={modalStyles.buyModeRow}>
                {([
                  { key: 'single' as const, icon: 'person' as const, label: 'Single' },
                  { key: 'family' as const, icon: 'people' as const, label: 'Family Pack' },
                  { key: 'group' as const, icon: 'people-circle' as const, label: 'Group' },
                ] as const).map(mode => {
                  const active = buyMode === mode.key;
                  return (
                    <Pressable
                      key={mode.key}
                      style={[modalStyles.buyModeBtn, active && modalStyles.buyModeBtnActive]}
                      onPress={() => {
                        setBuyMode(mode.key);
                        setQuantity(mode.key === 'family' ? 1 : 1);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <Ionicons name={mode.icon} size={20} color={active ? Colors.primary : Colors.textSecondary} />
                      <Text style={[modalStyles.buyModeText, active && { color: Colors.primary, fontFamily: 'Poppins_600SemiBold' }]}>{mode.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {buyMode === 'family' && (
                <View style={modalStyles.savingsBadge}>
                  <Ionicons name="pricetag" size={14} color="#27AE60" />
                  <Text style={modalStyles.savingsText}>Family of {familySize} — Save 10%</Text>
                </View>
              )}
              {buyMode === 'group' && quantity >= 5 && (
                <View style={modalStyles.savingsBadge}>
                  <Ionicons name="pricetag" size={14} color="#27AE60" />
                  <Text style={modalStyles.savingsText}>
                    {quantity >= 10 ? 'Group of 10+ — Save 15%' : 'Group of 5+ — Save 10%'}
                  </Text>
                </View>
              )}

              <Text style={[modalStyles.sectionLabel, { marginTop: 20 }]}>Ticket Tier</Text>
              {event.tiers.map((tier: any, idx: number) => {
                const isSelected = idx === selectedTierIndex;
                return (
                  <Pressable
                    key={`modal-tier-${idx}`}
                    style={[
                      modalStyles.tierOption,
                      isSelected && modalStyles.tierOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedTierIndex(idx);
                      setQuantity(1);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View style={modalStyles.tierOptionLeft}>
                      <View style={[modalStyles.radioOuter, isSelected && modalStyles.radioOuterSelected]}>
                        {isSelected && <View style={modalStyles.radioInner} />}
                      </View>
                      <View>
                        <Text style={[modalStyles.tierOptionName, isSelected && { color: Colors.primary }]}>{tier.name}</Text>
                        <Text style={modalStyles.tierOptionAvail}>{tier.available} available</Text>
                      </View>
                    </View>
                    <Text style={[modalStyles.tierOptionPrice, isSelected && { color: Colors.primary }]}>
                      {tier.priceCents === 0 ? 'Free' : `$${(tier.priceCents / 100).toFixed(2)}`}
                    </Text>
                  </Pressable>
                );
              })}

              {buyMode !== 'family' && (
                <>
                  <Text style={[modalStyles.sectionLabel, { marginTop: 20 }]}>
                    {buyMode === 'group' ? 'Group Size' : 'Quantity'}
                  </Text>
                  <View style={modalStyles.quantityRow}>
                    <Pressable
                      style={[modalStyles.quantityBtn, quantity <= 1 && modalStyles.quantityBtnDisabled]}
                      onPress={() => {
                        if (quantity > 1) {
                          setQuantity(q => q - 1);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <Ionicons name="remove" size={20} color={quantity <= 1 ? Colors.textTertiary : Colors.primary} />
                    </Pressable>
                    <Text style={modalStyles.quantityText}>{quantity}</Text>
                    <Pressable
                      style={[modalStyles.quantityBtn, quantity >= maxQty && modalStyles.quantityBtnDisabled]}
                      onPress={() => {
                        if (quantity < maxQty) {
                          setQuantity(q => q + 1);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <Ionicons name="add" size={20} color={quantity >= maxQty ? Colors.textTertiary : Colors.primary} />
                    </Pressable>
                  </View>
                </>
              )}

              <View style={modalStyles.priceSummary}>
                <View style={modalStyles.priceRow}>
                  <Text style={modalStyles.priceRowLabel}>
                    {effectiveQty}x {selectedTier?.name} @ ${(basePrice / 100).toFixed(2)}
                  </Text>
                  <Text style={modalStyles.priceRowValue}>${(rawTotal / 100).toFixed(2)}</Text>
                </View>
                {discountAmount > 0 && (
                  <View style={modalStyles.priceRow}>
                    <Text style={[modalStyles.priceRowLabel, { color: '#27AE60' }]}>
                      {buyMode === 'family' ? 'Family' : 'Group'} Discount ({Math.round(discountRate * 100)}%)
                    </Text>
                    <Text style={[modalStyles.priceRowValue, { color: '#27AE60' }]}>-${(discountAmount / 100).toFixed(2)}</Text>
                  </View>
                )}
                <View style={modalStyles.totalDivider} />
                <View style={modalStyles.priceRow}>
                  <Text style={modalStyles.totalLabel}>Total</Text>
                  <Text style={modalStyles.totalValue}>
                    {totalPrice === 0 ? 'Free' : `A$${(totalPrice / 100).toFixed(2)}`}
                  </Text>
                </View>
              </View>

              {isPlus && totalPrice > 0 && (
                <View style={modalStyles.cashbackNote}>
                  <Ionicons name="star" size={14} color="#2E86C1" />
                  <Text style={modalStyles.cashbackNoteText}>
                    You&apos;ll earn ${cashbackAmount.toFixed(2)} cashback with CulturePass+
                  </Text>
                </View>
              )}

              {!isPlus && totalPrice > 0 && (
                <Pressable style={modalStyles.upgradeNote} onPress={() => { setTicketModalVisible(false); router.push('/membership/upgrade'); }}>
                  <Ionicons name="star-outline" size={14} color="#2E86C1" />
                  <Text style={modalStyles.upgradeNoteText}>
                    CulturePass+ members earn 2% cashback on tickets
                  </Text>
                  <Ionicons name="chevron-forward" size={12} color="#2E86C1" />
                </Pressable>
              )}

              <Pressable
                style={({ pressed }) => [
                  modalStyles.purchaseBtn,
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                  (purchaseMutation.isPending || paymentLoading) && { opacity: 0.6 },
                ]}
                onPress={handlePurchase}
                disabled={purchaseMutation.isPending || paymentLoading}
              >
                {purchaseMutation.isPending || paymentLoading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={modalStyles.purchaseBtnText}>Processing...</Text>
                  </View>
                ) : totalPrice > 0 ? (
                  <>
                    <Ionicons name="card" size={20} color="#FFF" />
                    <Text style={modalStyles.purchaseBtnText}>
                      Pay A${(totalPrice / 100).toFixed(2)}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="ticket" size={20} color="#FFF" />
                    <Text style={modalStyles.purchaseBtnText}>
                      Get Free {effectiveQty === 1 ? 'Ticket' : `${effectiveQty} Tickets`}
                    </Text>
                  </>
                )}
              </Pressable>

              <View style={{ height: bottomInset + 20 }} />
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  backLink: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    marginTop: 12,
  },
  heroSection: {},
  heroOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 20,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActions: { flexDirection: 'row', gap: 8 },
  heroContent: { gap: 8 },
  heroBadges: { flexDirection: 'row', gap: 8 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroBadgeText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  heroTitle: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    lineHeight: 32,
  },
  heroOrganizer: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
  },
  countdownContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  countdownBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    minWidth: 72,
    ...shadows.small,
  },
  countdownNumber: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
  },
  countdownLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  countdownSeparator: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textTertiary,
  },
  countdownEndedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  countdownEndedText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  infoCards: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    ...shadows.small,
  },
  infoIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
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
  infoValue: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  infoSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 1 },
  sectionDivider: {
    paddingHorizontal: 20,
    marginTop: 28,
    alignItems: 'center',
  },
  accentBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary + '25',
  },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  capacityFill: { height: '100%', borderRadius: 4 },
  capacityDetails: { flexDirection: 'row', justifyContent: 'space-between' },
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
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 10,
    ...shadows.small,
  },
  tierInfo: { gap: 2 },
  tierName: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  tierAvail: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  tierPrice: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  whosGoingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  whosGoingInfo: {
    gap: 2,
  },
  whosGoingCount: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  whosGoingOthers: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...shadows.small,
  },
  relatedSwatch: {
    width: 52,
    height: 52,
    borderRadius: 14,
  },
  relatedInfo: {
    flex: 1,
    gap: 2,
  },
  relatedTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  relatedMeta: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
    ...shadows.medium,
  },
  priceSection: {},
  priceFrom: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  priceBig: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buyText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  earlyAccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 5,
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  earlyAccessText: { fontSize: 12, fontWeight: '600', color: '#1A5276' },
  earlyAccessDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#2E86C1', opacity: 0.4 },
  educationCard: {
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  educationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  educationIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#8B451318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  educationTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#3E2723',
  },
  educationBody: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#5D4037',
    lineHeight: 20,
    marginBottom: 8,
  },
  educationHighlight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  educationHighlightText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#1A5276',
    lineHeight: 18,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.textTertiary,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tierOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tierOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  tierOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  tierOptionName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  tierOptionAvail: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  tierOptionPrice: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quantityBtnDisabled: {
    opacity: 0.4,
  },
  quantityText: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    minWidth: 40,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  purchaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
  },
  purchaseBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  cashbackNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  cashbackNoteText: {
    fontSize: 13,
    color: '#1A5276',
    fontWeight: '500',
    flex: 1,
  },
  upgradeNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  upgradeNoteText: {
    fontSize: 12,
    color: '#2E86C1',
    fontWeight: '500',
    flex: 1,
  },
  buyModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  buyModeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buyModeBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  buyModeText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C8F0DB',
  },
  savingsText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#27AE60',
  },
  priceSummary: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  priceRowLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  priceRowValue: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  totalDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 8,
  },
});
