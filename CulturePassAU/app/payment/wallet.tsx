import { View, Text, Pressable, StyleSheet, ScrollView, Platform, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface Wallet {
  id?: string;
  userId?: string;
  balance: number;
  currency: string;
  updatedAt?: string | null;
}

interface Ticket {
  id: string;
  eventTitle: string;
  eventDate: string | null;
  eventVenue: string | null;
  tierName: string | null;
  quantity: number | null;
  status: string | null;
  imageColor: string | null;
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string | null;
  description: string | null;
  status: string | null;
  category: string | null;
  metadata: Record<string, any> | null;
  createdAt: string | null;
}

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const userId = useDemoUserId();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [selectedQuick, setSelectedQuick] = useState<number | null>(null);

  const { data: wallet } = useQuery<Wallet>({
    queryKey: ['/api/wallet', userId],
    enabled: !!userId,
  });

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', userId],
    enabled: !!userId,
  });

  const { data: ticketsData = [] } = useQuery<Ticket[]>({
    queryKey: ['/api/tickets', userId],
    enabled: !!userId,
  });
  const activeTickets = ticketsData.filter(t => t.status === 'confirmed').slice(0, 3);

  const { data: membership } = useQuery<{ tier: string; cashbackMultiplier?: number }>({
    queryKey: [`/api/membership/${userId}`],
    enabled: !!userId,
  });
  const isPlus = membership?.tier === 'plus';

  const topUpMutation = useMutation({
    mutationFn: async (amount: number) => {
      await apiRequest('POST', `/api/wallet/${userId}/topup`, { amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions', userId] });
      setTopUpAmount('');
      setSelectedQuick(null);
      Alert.alert('Top Up Successful', 'Your wallet has been topped up!');
    },
    onError: (error: any) => {
      Alert.alert('Top Up Failed', error.message || 'Something went wrong');
    },
  });

  const handleTopUp = () => {
    const amount = selectedQuick || parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to top up.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    topUpMutation.mutate(amount);
  };

  const handleQuickSelect = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedQuick(amount === selectedQuick ? null : amount);
    setTopUpAmount('');
  };

  const balance = wallet?.balance ?? 0;
  const currency = wallet?.currency ?? 'AUD';
  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Ticket Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 20 }}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.balanceCard}>
          <View style={styles.balanceIconContainer}>
            <Ionicons name="wallet" size={32} color={Colors.textInverse} />
          </View>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          <Text style={styles.balanceCurrency}>{currency}</Text>
        </Animated.View>

        {isPlus && (
          <Animated.View entering={FadeInDown.delay(125)} style={styles.cashbackBanner}>
            <Ionicons name="star" size={16} color="#2E86C1" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cashbackBannerTitle}>2% Cashback Active</Text>
              <Text style={styles.cashbackBannerSub}>CulturePass+ cashback is applied to all ticket purchases</Text>
            </View>
          </Animated.View>
        )}

        {!isPlus && (
          <Animated.View entering={FadeInDown.delay(125)}>
            <Pressable style={styles.cashbackPrompt} onPress={() => router.push('/membership/upgrade')}>
              <Ionicons name="star-outline" size={16} color="#2E86C1" />
              <Text style={styles.cashbackPromptText}>Earn 2% cashback with CulturePass+</Text>
              <Ionicons name="chevron-forward" size={14} color="#2E86C1" />
            </Pressable>
          </Animated.View>
        )}

        {activeTickets.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Tickets</Text>
              <Pressable onPress={() => router.push('/tickets')}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            </View>
            <View style={styles.ticketsRow}>
              {activeTickets.map(ticket => (
                <Pressable key={ticket.id} style={[styles.ticketMini, { borderLeftColor: ticket.imageColor || Colors.primary }]}
                  onPress={() => router.push('/tickets')}>
                  <Text style={styles.ticketMiniTitle} numberOfLines={1}>{ticket.eventTitle}</Text>
                  <View style={styles.ticketMiniMeta}>
                    <Ionicons name="calendar-outline" size={11} color={Colors.textTertiary} />
                    <Text style={styles.ticketMiniDate}>{ticket.eventDate ? new Date(ticket.eventDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}</Text>
                    {ticket.tierName && <Text style={styles.ticketMiniTier}>{ticket.tierName}</Text>}
                  </View>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Top Up Wallet</Text>
          <View style={styles.topUpCard}>
            <Text style={styles.quickLabel}>Quick amounts</Text>
            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map(amount => (
                <Pressable
                  key={amount}
                  style={[styles.quickBtn, selectedQuick === amount && styles.quickBtnActive]}
                  onPress={() => handleQuickSelect(amount)}
                >
                  <Text style={[styles.quickBtnText, selectedQuick === amount && styles.quickBtnTextActive]}>
                    ${amount}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.orText}>or enter custom amount</Text>
            <View style={styles.customAmountRow}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
                value={topUpAmount}
                onChangeText={(v) => {
                  setTopUpAmount(v.replace(/[^0-9.]/g, ''));
                  setSelectedQuick(null);
                }}
                keyboardType="decimal-pad"
              />
            </View>

            <Pressable
              style={[styles.topUpBtn, topUpMutation.isPending && styles.topUpBtnDisabled]}
              onPress={handleTopUp}
              disabled={topUpMutation.isPending}
            >
              <Ionicons name="flash" size={20} color={Colors.textInverse} />
              <Text style={styles.topUpBtnText}>
                {topUpMutation.isPending ? 'Processing...' : `Top Up ${selectedQuick ? `$${selectedQuick}` : topUpAmount ? `$${topUpAmount}` : ''}`}
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {transactions.length > 5 && (
              <Pressable onPress={() => router.push('/payment/transactions')}>
                <Text style={styles.viewAllText}>View All</Text>
              </Pressable>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Ionicons name="time-outline" size={32} color={Colors.textTertiary} />
              <Text style={styles.emptyActivityText}>No recent activity</Text>
            </View>
          ) : (
            <View style={styles.activityCard}>
              {recentTransactions.map((tx, index) => {
                const isTopup = tx.type === 'topup';
                const color = isTopup ? Colors.success : Colors.error;
                return (
                  <View key={tx.id}>
                    <View style={styles.activityItem}>
                      <View style={[styles.activityIcon, { backgroundColor: color + '12' }]}>
                        <Ionicons
                          name={(isTopup ? 'arrow-down-circle' : 'arrow-up-circle') as any}
                          size={18}
                          color={color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityDesc} numberOfLines={1}>
                          {tx.description || (isTopup ? 'Wallet Top Up' : 'Payment')}
                        </Text>
                        <Text style={styles.activityDate}>
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : ''}
                        </Text>
                      </View>
                      <Text style={[styles.activityAmount, { color }]}>
                        {isTopup ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </Text>
                    </View>
                    {index < recentTransactions.length - 1 && <View style={styles.activityDivider} />}
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  balanceCard: { marginHorizontal: 20, marginBottom: 24, backgroundColor: Colors.primary, borderRadius: 20, padding: 28, alignItems: 'center' },
  balanceIconContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  balanceLabel: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  balanceAmount: { fontSize: 42, fontFamily: 'Poppins_700Bold', color: Colors.textInverse },
  balanceCurrency: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },
  viewAllText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  topUpCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: Colors.cardBorder },
  quickLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, marginBottom: 10 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  quickBtnActive: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary },
  quickBtnText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  quickBtnTextActive: { color: Colors.primary },
  orText: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, textAlign: 'center', marginVertical: 14 },
  customAmountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.backgroundSecondary, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.border },
  dollarSign: { fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 20, fontFamily: 'Poppins_600SemiBold', color: Colors.text, paddingVertical: 14 },
  topUpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.success, borderRadius: 14, paddingVertical: 16, marginTop: 16 },
  topUpBtnDisabled: { opacity: 0.6 },
  topUpBtnText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.textInverse },
  emptyActivity: { alignItems: 'center', paddingVertical: 30, gap: 8 },
  emptyActivityText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary },
  activityCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: Colors.cardBorder },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  activityIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  activityDesc: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text },
  activityDate: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 2 },
  activityAmount: { fontSize: 15, fontFamily: 'Poppins_700Bold' },
  activityDivider: { height: 1, backgroundColor: Colors.divider, marginLeft: 60 },
  ticketsRow: { gap: 8 },
  ticketMini: { backgroundColor: Colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.cardBorder, borderLeftWidth: 4 },
  ticketMiniTitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginBottom: 4 },
  ticketMiniMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ticketMiniDate: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary },
  ticketMiniTier: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', color: Colors.accent, marginLeft: 8, backgroundColor: Colors.accent + '12', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  cashbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#EBF5FB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  cashbackBannerTitle: { fontSize: 14, fontWeight: '600', color: '#1A5276' },
  cashbackBannerSub: { fontSize: 12, color: '#5D6D7E', marginTop: 1 },
  cashbackPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: '#EBF5FB',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  cashbackPromptText: { fontSize: 13, color: '#2E86C1', fontWeight: '500', flex: 1 },
});
