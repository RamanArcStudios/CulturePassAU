import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Share,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, getQueryFn } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCallback } from 'react';
import { Ticket } from '@shared/schema';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [y, m, d] = parts.map(Number);
    const date = new Date(y!, m! - 1, d);
    return date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function getStatusInfo(status: string | null) {
  switch (status) {
    case 'confirmed': return { color: Colors.success, bg: Colors.success + '12', label: 'Confirmed', icon: 'checkmark-circle' as const };
    case 'pending': return { color: Colors.warning, bg: Colors.warning + '12', label: 'Payment Pending', icon: 'time' as const };
    case 'used': return { color: '#8E8E93', bg: '#8E8E93' + '12', label: 'Scanned', icon: 'checkmark-done' as const };
    case 'cancelled': return { color: Colors.error, bg: Colors.error + '12', label: 'Cancelled', icon: 'close-circle' as const };
    case 'expired': return { color: Colors.warning, bg: Colors.warning + '12', label: 'Expired', icon: 'time' as const };
    default: return { color: Colors.textSecondary, bg: Colors.textSecondary + '12', label: status || 'Unknown', icon: 'help-circle' as const };
  }
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: ticket, isLoading } = useQuery<Ticket>({
    queryKey: ['/api/ticket', id],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      const res = await apiRequest('POST', '/api/stripe/refund', { ticketId });
      return await res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const msg = data.refundId
        ? 'Your ticket has been cancelled and a refund has been initiated to your card.'
        : 'Your ticket has been cancelled.';
      Alert.alert('Ticket Cancelled', msg);
    },
    onError: (error: Error) => {
      Alert.alert('Refund Failed', error.message || 'Could not process the refund. Please try again.');
    },
  });

  const handleCancel = useCallback(() => {
    if (!ticket) return;
    const hasPayment = !!(ticket as any).stripePaymentIntentId;
    const title = hasPayment ? 'Cancel & Refund' : 'Cancel Ticket';
    const message = hasPayment
      ? `Are you sure you want to cancel your ticket for "${ticket.eventTitle}"? A refund will be processed to your card.`
      : `Are you sure you want to cancel your ticket for "${ticket.eventTitle}"?`;
    Alert.alert(
      title,
      message,
      [
        { text: 'Keep Ticket', style: 'cancel' },
        {
          text: hasPayment ? 'Cancel & Refund' : 'Cancel Ticket',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            cancelMutation.mutate(ticket.id);
          },
        },
      ],
    );
  }, [ticket]);

  const handleShare = useCallback(async () => {
    if (!ticket) return;
    try {
      const shareUrl = `https://culturepass.app/tickets/${ticket.id}`;
      await Share.share({
        title: ticket.eventTitle,
        message: `I'm going to ${ticket.eventTitle}! 🎫\n${ticket.eventVenue ? `📍 ${ticket.eventVenue}` : ''}\n${ticket.eventDate ? `📅 ${formatDate(ticket.eventDate)}` : ''}\n\nTicket Code: ${ticket.ticketCode || 'N/A'}\n\nGet yours on CulturePass!\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {}
  }, [ticket]);

  const handleAddToWallet = useCallback(async (walletType: 'apple' | 'google') => {
    if (!ticket) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const walletName = walletType === 'apple' ? 'Apple Wallet' : 'Google Wallet';
    Alert.alert(
      `Add to ${walletName}`,
      `Your ticket for "${ticket.eventTitle}" will be added to ${walletName}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: async () => {
            try {
              const endpoint = walletType === 'apple'
                ? `/api/tickets/${ticket.id}/wallet/apple`
                : `/api/tickets/${ticket.id}/wallet/google`;
              const res = await apiRequest('GET', endpoint);
              const data = await res.json();
              if (data.url) {
                const { Linking } = require('react-native');
                await Linking.openURL(data.url);
              } else {
                Alert.alert('Success', `Ticket added to ${walletName}!`);
              }
            } catch (e: any) {
              Alert.alert('Error', `Could not add to ${walletName}. Please try again.`);
            }
          },
        },
      ],
    );
  }, [ticket]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Ticket</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.loadingState}>
          <Ionicons name="hourglass-outline" size={36} color={Colors.textTertiary} />
          <Text style={styles.loadingText}>Loading ticket...</Text>
        </View>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Ticket</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.loadingState}>
          <Ionicons name="ticket-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Ticket Not Found</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const statusInfo = getStatusInfo(ticket.status);
  const isActive = ticket.status === 'confirmed';
  const isScanned = ticket.status === 'used';

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <Pressable onPress={handleShare} style={styles.backBtn}>
          <Ionicons name="share-outline" size={20} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 + bottomInset }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.ticketContainer}>
          <View style={[styles.ticketTop, { backgroundColor: ticket.imageColor || Colors.primary }]}>
            <View style={styles.ticketTopOverlay}>
              <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
                <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
              </View>
              <Ionicons name="ticket" size={32} color="rgba(255,255,255,0.5)" />
            </View>
          </View>

          <View style={styles.ticketNotch}>
            <View style={[styles.notchCircle, styles.notchLeft]} />
            <View style={styles.notchLine} />
            <View style={[styles.notchCircle, styles.notchRight]} />
          </View>

          <View style={styles.ticketBody}>
            <Text style={styles.eventTitle}>{ticket.eventTitle}</Text>

            <View style={styles.infoGrid}>
              {ticket.eventDate && (
                <View style={styles.infoItem}>
                  <Ionicons name="calendar" size={16} color={Colors.primary} />
                  <View>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{formatDate(ticket.eventDate)}</Text>
                  </View>
                </View>
              )}
              {ticket.eventTime && (
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={16} color={Colors.secondary} />
                  <View>
                    <Text style={styles.infoLabel}>Time</Text>
                    <Text style={styles.infoValue}>{ticket.eventTime}</Text>
                  </View>
                </View>
              )}
              {ticket.eventVenue && (
                <View style={styles.infoItem}>
                  <Ionicons name="location" size={16} color={Colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.infoLabel}>Venue</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>{ticket.eventVenue}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsRow}>
              {ticket.tierName && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Tier</Text>
                  <Text style={styles.detailValue}>{ticket.tierName}</Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>{ticket.quantity || 1}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Total</Text>
                <Text style={[styles.detailValue, { color: Colors.primary }]}>
                  ${(ticket.totalPrice || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {ticket.ticketCode && (
              <>
                <View style={styles.divider} />
                <View style={styles.qrSection}>
                  <Text style={styles.qrTitle}>
                    {isScanned ? 'Ticket Scanned' : isActive ? 'Scan at Entry' : 'Ticket Code'}
                  </Text>
                  {ticket.qrCode && isActive ? (
                    <View style={styles.qrImageContainer}>
                      <Image
                        source={{ uri: ticket.qrCode }}
                        style={styles.qrImage}
                        resizeMode="contain"
                      />
                    </View>
                  ) : isScanned ? (
                    <View style={styles.scannedOverlay}>
                      <Ionicons name="checkmark-circle" size={48} color="#8E8E93" />
                      <Text style={styles.scannedText}>Checked In</Text>
                      {ticket.scannedAt && (
                        <Text style={styles.scannedTime}>
                          {new Date(ticket.scannedAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                        </Text>
                      )}
                    </View>
                  ) : null}
                  <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {isActive && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.walletSection}>
            <Text style={styles.walletTitle}>Add to Wallet</Text>
            <View style={styles.walletButtons}>
              {Platform.OS === 'ios' || Platform.OS === 'web' ? (
                <Pressable
                  style={styles.walletBtn}
                  onPress={() => handleAddToWallet('apple')}
                >
                  <Ionicons name="wallet" size={20} color="#FFF" />
                  <Text style={styles.walletBtnText}>Apple Wallet</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={[styles.walletBtn, { backgroundColor: '#4285F4' }]}
                onPress={() => handleAddToWallet('google')}
              >
                <Ionicons name="logo-google" size={18} color="#FFF" />
                <Text style={styles.walletBtnText}>Google Wallet</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.actionsSection}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/event/[id]', params: { id: ticket.eventId } })}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primary + '12' }]}>
              <Ionicons name="calendar" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>View Event</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.secondary + '12' }]}>
              <Ionicons name="share-outline" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.actionText}>Share Ticket</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
          </Pressable>

          {isActive && (
            <Pressable style={styles.actionBtn} onPress={handleCancel}>
              <View style={[styles.actionIcon, { backgroundColor: Colors.error + '12' }]}>
                <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
              </View>
              <Text style={[styles.actionText, { color: Colors.error }]}>Cancel Ticket</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </Pressable>
          )}
        </Animated.View>
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
    paddingVertical: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text, marginTop: 8 },
  backLink: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginTop: 8 },
  ticketContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    ...Colors.shadow.medium,
  },
  ticketTop: {
    height: 100,
    justifyContent: 'center',
  },
  ticketTopOverlay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold' },
  ticketNotch: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: -10,
    zIndex: 2,
  },
  notchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.background,
  },
  notchLeft: { marginLeft: -10 },
  notchRight: { marginRight: -10 },
  notchLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ticketBody: { padding: 20 },
  eventTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 16 },
  infoGrid: { gap: 14 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  infoLabel: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.borderLight, marginVertical: 16 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailItem: { alignItems: 'center', flex: 1 },
  detailLabel: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  detailValue: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text },
  qrSection: { alignItems: 'center', gap: 12 },
  qrTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },
  qrImageContainer: {
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  scannedOverlay: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  scannedText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#8E8E93',
  },
  scannedTime: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
  ticketCode: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
    letterSpacing: 2,
  },
  walletSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  walletTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },
  walletButtons: { flexDirection: 'row', gap: 10 },
  walletBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 14,
  },
  walletBtnText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  actionsSection: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    ...Colors.shadow.small,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { flex: 1, fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
});
