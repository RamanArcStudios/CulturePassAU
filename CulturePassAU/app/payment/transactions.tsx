import { View, Text, Pressable, StyleSheet, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
    case 'topup': return 'arrow-down-circle';
    case 'payment': return 'arrow-up-circle';
    default: return 'swap-horizontal';
  }
}

function getStatusColor(status: string | null): string {
  switch (status) {
    case 'completed': return Colors.success;
    case 'pending': return Colors.warning;
    case 'failed': return Colors.error;
    default: return Colors.textSecondary;
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function TransactionItem({ item, index }: { item: Transaction; index: number }) {
  const isTopup = item.type === 'topup';
  const color = isTopup ? Colors.success : Colors.error;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60)} style={styles.txCard}>
      <View style={[styles.txIcon, { backgroundColor: color + '12' }]}>
        <Ionicons name={getTypeIcon(item.type) as any} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.txDescription} numberOfLines={1}>
          {item.description || (isTopup ? 'Wallet Top Up' : 'Payment')}
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
          {isTopup ? '+' : '-'}${Math.abs(item.amount).toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status || 'unknown'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const userId = useDemoUserId();

  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', userId],
    enabled: !!userId,
  });

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </View>

      {transactions.length > 0 && (
        <Animated.View entering={FadeInDown.delay(50)} style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="arrow-down-circle" size={18} color={Colors.success} />
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, { color: Colors.success }]}>
              +${transactions.filter(t => t.type === 'topup').reduce((s, t) => s + t.amount, 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="arrow-up-circle" size={18} color={Colors.error} />
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={[styles.summaryAmount, { color: Colors.error }]}>
              -${transactions.filter(t => t.type === 'payment').reduce((s, t) => s + Math.abs(t.amount), 0).toFixed(2)}
            </Text>
          </View>
        </Animated.View>
      )}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <TransactionItem item={item} index={index} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: bottomInset + 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={transactions.length > 0}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.loadingText}>Loading transactions...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="receipt-outline" size={48} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No Transactions Yet</Text>
              <Text style={styles.emptySubtitle}>Your booking and payment history will appear here</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.cardBorder },
  summaryLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  summaryAmount: { fontSize: 16, fontFamily: 'Poppins_700Bold' },
  txCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.cardBorder },
  txIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txDescription: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  txDate: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  txDot: { fontSize: 12, color: Colors.textTertiary },
  txCategory: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textTertiary },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: 16, fontFamily: 'Poppins_700Bold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 10, fontFamily: 'Poppins_600SemiBold', textTransform: 'capitalize' as any },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 60 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center' },
  loadingText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
});
