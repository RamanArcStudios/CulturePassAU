import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { shadows } from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string | null;
  eventTime: string | null;
  eventVenue: string | null;
  tierName: string | null;
  quantity: number | null;
  totalPrice: number | null;
  currency: string | null;
  status: string | null;
  ticketCode: string | null;
  imageColor: string | null;
  createdAt: string | null;
}

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getStatusStyle(status: string | null) {
  switch (status) {
    case 'confirmed': return { bg: Colors.success + '15', color: Colors.success, label: 'Confirmed' };
    case 'used': return { bg: '#8E8E93' + '15', color: '#8E8E93', label: 'Scanned' };
    case 'cancelled': return { bg: Colors.error + '15', color: Colors.error, label: 'Cancelled' };
    case 'expired': return { bg: Colors.warning + '15', color: Colors.warning, label: 'Expired' };
    default: return { bg: Colors.textTertiary + '15', color: Colors.textTertiary, label: status || 'Unknown' };
  }
}

async function handleShare(ticket: Ticket) {
  try {
    const dateStr = ticket.eventDate ? formatDate(ticket.eventDate) : '';
    const timeStr = ticket.eventTime ? ` at ${ticket.eventTime}` : '';
    const venueStr = ticket.eventVenue ? `\nVenue: ${ticket.eventVenue}` : '';
    const message = `Check out my ticket for ${ticket.eventTitle}!\n${dateStr}${timeStr}${venueStr}`;
    await Share.share({
      message,
      title: ticket.eventTitle,
    });
  } catch (_e) {
  }
}

export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const userId = useDemoUserId();

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets', userId],
    enabled: !!userId,
  });

  const cancelMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      await apiRequest('PUT', `/api/tickets/${ticketId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tickets'] });
      Alert.alert('Ticket Cancelled', 'Your ticket has been cancelled. A refund will be processed.');
    },
  });

  const activeTickets = tickets.filter(t => t.status === 'confirmed');
  const pastTickets = tickets.filter(t => t.status !== 'confirmed');

  const handleCancel = (ticket: Ticket) => {
    Alert.alert('Cancel Ticket', `Are you sure you want to cancel your ticket for "${ticket.eventTitle}"?`, [
      { text: 'Keep Ticket', style: 'cancel' },
      { text: 'Cancel Ticket', style: 'destructive', onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        cancelMutation.mutate(ticket.id);
      }},
    ]);
  };

  const handleAddToWallet = (ticket: Ticket) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Added to Wallet', `Your ticket for "${ticket.eventTitle}" has been saved to your wallet.`);
  };

  const renderTicket = (ticket: Ticket, index: number) => {
    const statusStyle = getStatusStyle(ticket.status);
    const isActive = ticket.status === 'confirmed';

    return (
      <Animated.View key={ticket.id} entering={FadeInDown.delay(index * 80).duration(400)}>
        <Pressable
          style={styles.ticketCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: '/tickets/[id]', params: { id: ticket.id } });
          }}
        >
          <View style={[styles.ticketBanner, { backgroundColor: ticket.imageColor || Colors.primary }]}>
            <View style={styles.ticketBannerOverlay}>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
              </View>
              <Ionicons name="ticket" size={28} color="rgba(255,255,255,0.6)" />
            </View>
          </View>

          <View style={styles.ticketBody}>
            <Text style={styles.ticketTitle} numberOfLines={2}>{ticket.eventTitle}</Text>

            <View style={styles.ticketMeta}>
              {ticket.eventDate && (
                <View style={styles.ticketMetaItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.ticketMetaText}>{formatDate(ticket.eventDate)}</Text>
                </View>
              )}
              {ticket.eventTime && (
                <View style={styles.ticketMetaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.ticketMetaText}>{ticket.eventTime}</Text>
                </View>
              )}
            </View>

            {ticket.eventVenue && (
              <View style={styles.ticketMetaItem}>
                <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.ticketMetaText} numberOfLines={1}>{ticket.eventVenue}</Text>
              </View>
            )}

            <View style={styles.ticketFooter}>
              <View style={styles.ticketDetails}>
                {ticket.tierName && <View style={styles.tierBadge}><Text style={styles.tierText}>{ticket.tierName}</Text></View>}
                <Text style={styles.ticketQty}>{ticket.quantity || 1}x ticket{(ticket.quantity || 1) > 1 ? 's' : ''}</Text>
              </View>
              <Text style={styles.ticketPrice}>${(ticket.totalPrice || 0).toFixed(2)}</Text>
            </View>

            {ticket.ticketCode && isActive && (
              <View style={styles.codeRow}>
                <Ionicons name="qr-code" size={16} color={Colors.primary} />
                <Text style={styles.codeText}>{ticket.ticketCode}</Text>
              </View>
            )}

            {isActive && (
              <View style={styles.actionRow}>
                <Pressable
                  style={styles.actionBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    handleShare(ticket);
                  }}
                >
                  <Ionicons name="share-outline" size={18} color={Colors.primary} />
                  <Text style={styles.actionBtnText}>Share</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    handleAddToWallet(ticket);
                  }}
                >
                  <Ionicons name="wallet-outline" size={18} color={Colors.primary} />
                  <Text style={styles.actionBtnText}>Add to Wallet</Text>
                </Pressable>
              </View>
            )}

            {isActive && (
              <Pressable
                style={styles.cancelBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  handleCancel(ticket);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel Ticket</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>My Tickets</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : insets.bottom) }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Loading tickets...</Text>
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="ticket-outline" size={48} color={Colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Tickets Yet</Text>
            <Text style={styles.emptySub}>Your purchased event tickets will appear here</Text>
            <Pressable style={styles.browseBtn} onPress={() => router.push('/(tabs)/explore')}>
              <Ionicons name="search" size={18} color="#FFF" />
              <Text style={styles.browseBtnText}>Browse Events</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {activeTickets.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming ({activeTickets.length})</Text>
                {activeTickets.map((t, i) => renderTicket(t, i))}
              </View>
            )}
            {pastTickets.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past Tickets ({pastTickets.length})</Text>
                {pastTickets.map((t, i) => renderTicket(t, i + activeTickets.length))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', ...shadows.small },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12, letterSpacing: 0.35 },
  ticketCard: { backgroundColor: Colors.surface, borderRadius: 12, marginBottom: 14, overflow: 'hidden', ...shadows.medium },
  ticketBanner: { height: 70, justifyContent: 'center' },
  ticketBannerOverlay: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, backgroundColor: 'rgba(0,0,0,0.2)', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold' },
  ticketBody: { padding: 16 },
  ticketTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },
  ticketMeta: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  ticketMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  ticketMetaText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.divider },
  ticketDetails: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierBadge: { backgroundColor: Colors.accent + '15', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tierText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: Colors.accent },
  ticketQty: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  ticketPrice: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, backgroundColor: Colors.primary + '08', borderRadius: 10, padding: 10 },
  codeText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, letterSpacing: 1 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.primary + '0A' },
  actionBtnText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  cancelBtn: { marginTop: 10, alignItems: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.error + '08' },
  cancelBtnText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.error },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 8 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  emptySub: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center' },
  browseBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, marginTop: 16 },
  browseBtnText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
});
