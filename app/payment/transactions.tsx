import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router, useNavigation } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCallback, useMemo, useState, memo } from 'react';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

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

function getTypeIcon(type: string): string {
  switch (type) {
    case 'topup':
      return 'arrow-down-circle';
    case 'payment':
      return 'arrow-up-circle';
    case 'refund':
      return 'return-up-back';
    case 'cashback':
      return 'gift';
    default:
      return 'swap-horizontal';
  }
}

function getStatusColor(status: string | null): string {
  switch (status) {
    case 'completed':
      return Colors.success;
    case 'pending':
      return Colors.warning;
    case 'failed':
      return Colors.error;
    case 'cancelled':
      return Colors.textSecondary;
    default:
      return Colors.textSecondary;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Today
    if (days === 0) {
      return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Yesterday
    if (days === 1) {
      return 'Yesterday';
    }
    
    // Within a week
    if (days < 7) {
      return d.toLocaleDateString('en-AU', { weekday: 'short' });
    }
    
    // Older
    return d.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return '';
  }
}

const TransactionItem = memo(({ item, index }: { item: Transaction; index: number }) => {
  const isPositive = item.type === 'topup' || item.type === 'refund' || item.type === 'cashback';
  const color = isPositive ? Colors.success : Colors.error;

  const handlePress = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Navigate to transaction detail if metadata exists
    if (item.metadata?.eventId) {
      router.push(`/events/${item.metadata.eventId}`);
    } else if (item.metadata?.ticketId) {
      router.push(`/tickets/${item.metadata.ticketId}`);
    }
  }, [item]);

  return (
    <Animated.View entering={isWeb ? undefined : FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        style={styles.txCard}
        onPress={handlePress}
        android_ripple={{ color: color + '10' }}
        accessibilityRole="button"
        accessibilityLabel={`${item.description || 'Transaction'}, ${isPositive ? 'received' : 'spent'} $${Math.abs(item.amount).toFixed(2)}, ${item.status}`}
      >
        <View style={[styles.txIcon, { backgroundColor: color + '12' }]}>
          <Ionicons name={getTypeIcon(item.type) as any} size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.txDescription} numberOfLines={1}>
            {item.description || (isPositive ? 'Credit' : 'Payment')}
          </Text>
          <View style={styles.txMeta}>
            <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
            {item.category && (
              <>
                <Text style={styles.txDot}>·</Text>
                <Text style={styles.txCategory}>{item.category}</Text>
              </>
            )}
          </View>
        </View>
        <View style={styles.txRight}>
          <Text style={[styles.txAmount, { color }]}>
            {isPositive ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
          </Text>
          {item.status && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

TransactionItem.displayName = 'TransactionItem';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  const userId = useDemoUserId();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: transactions = [],
    isLoading,
    refetch,
  } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', userId],
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'topup' || t.type === 'refund' || t.type === 'cashback')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const spent = transactions
      .filter((t) => t.type === 'payment')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, spent };
  }, [transactions]);

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => (
      <TransactionItem item={item} index={index} />
    ),
    []
  );

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Ionicons name="receipt-outline" size={48} color={Colors.textTertiary} />
        </View>
        <Text style={styles.emptyTitle}>No Transactions Yet</Text>
        <Text style={styles.emptySubtitle}>
          Your booking and payment history will appear here
        </Text>
      </View>
    );
  }, [isLoading]);

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      {transactions.length > 0 && (
        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(50).duration(400)}
          style={styles.summaryRow}
        >
          <View style={styles.summaryCard}>
            <Ionicons name="arrow-down-circle" size={18} color={Colors.success} />
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: Colors.success }]}>
              +${summary.income.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="arrow-up-circle" size={18} color={Colors.error} />
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={[styles.summaryAmount, { color: Colors.error }]}>
              -${summary.spent.toFixed(2)}
            </Text>
          </View>
        </Animated.View>
      )}

      <FlatList
        data={transactions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomInset + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },

  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },

  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  summaryLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },

  summaryAmount: { fontSize: 16, fontFamily: 'Poppins_700Bold' },

  listContent: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },

  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  txIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  txDescription: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },

  txMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },

  txDate: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },

  txDot: { fontSize: 12, color: Colors.textTertiary },

  txCategory: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textTertiary },

  txRight: { alignItems: 'flex-end', gap: 4 },

  txAmount: { fontSize: 16, fontFamily: 'Poppins_700Bold' },

  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },

  statusText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    textTransform: 'capitalize',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },

  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  emptyTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },

  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  loadingText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
});