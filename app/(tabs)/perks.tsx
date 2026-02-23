import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Share, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FilterChipRow, FilterItem } from '@/components/FilterChip';

interface Perk {
  id: string;
  title: string;
  description: string | null;
  perkType: string;
  discountPercent: number | null;
  discountFixedCents: number | null;
  providerType: string | null;
  providerId: string | null;
  providerName: string | null;
  category: string | null;
  isMembershipRequired: boolean | null;
  requiredMembershipTier: string | null;
  usageLimit: number | null;
  usedCount: number | null;
  perUserLimit: number | null;
  status: string | null;
  startDate: string | null;
  endDate: string | null;
}

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

const PERK_TYPE_INFO: Record<string, { icon: string; color: string; label: string }> = {
  discount_percent: { icon: 'pricetag', color: '#FF3B30', label: '% Off' },
  discount_fixed: { icon: 'cash', color: '#34C759', label: '$ Off' },
  free_ticket: { icon: 'ticket', color: '#AF52DE', label: 'Free' },
  early_access: { icon: 'time', color: '#007AFF', label: 'Early' },
  vip_upgrade: { icon: 'star', color: '#FF9F0A', label: 'VIP' },
  cashback: { icon: 'wallet', color: '#34C759', label: 'Cash' },
};

const CATEGORIES = [
  { id: 'All', label: 'All Perks', icon: 'gift' },
  { id: 'tickets', label: 'Tickets', icon: 'ticket' },
  { id: 'events', label: 'Events', icon: 'calendar' },
  { id: 'dining', label: 'Dining', icon: 'restaurant' },
  { id: 'shopping', label: 'Shopping', icon: 'bag' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  { id: 'indigenous', label: 'First Nations', icon: 'earth' },
];

const filterItems: FilterItem[] = CATEGORIES.map(cat => ({
  id: cat.id,
  label: cat.label,
  icon: cat.icon,
}));

export default function PerksTabScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const userId = useDemoUserId();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const { data: perks = [], isLoading, refetch } = useQuery<Perk[]>({ queryKey: ['/api/perks'] });
  const { data: membership } = useQuery<{ tier: string }>({
    queryKey: ['/api/membership', userId],
    enabled: !!userId,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const redeemMutation = useMutation({
    mutationFn: async (perkId: string) => {
      const res = await apiRequest('POST', `/api/perks/${perkId}/redeem`, { userId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/perks'] });
      Alert.alert('Redeemed!', 'Perk has been added to your account.');
    },
    onError: (err: Error) => {
      Alert.alert('Cannot Redeem', err.message);
    },
  });

  const filteredPerks = selectedCategory === 'All'
    ? perks
    : perks.filter(p => p.category === selectedCategory);

  const formatValue = (perk: Perk) => {
    if (perk.perkType === 'discount_percent') return `${perk.discountPercent}% Off`;
    if (perk.perkType === 'discount_fixed') return `$${(perk.discountFixedCents || 0) / 100} Off`;
    if (perk.perkType === 'free_ticket') return 'Free';
    if (perk.perkType === 'early_access') return '48h Early';
    if (perk.perkType === 'vip_upgrade') return 'VIP';
    if (perk.perkType === 'cashback') return perk.discountPercent ? `${perk.discountPercent}%` : `$${(perk.discountFixedCents || 0) / 100}`;
    return '';
  };

  const canRedeem = (perk: Perk) => {
    if (perk.isMembershipRequired && (!membership?.tier || membership.tier === 'free')) return false;
    if (perk.usageLimit && (perk.usedCount || 0) >= perk.usageLimit) return false;
    return true;
  };

  const handleSharePerk = async (perk: Perk) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: `${perk.title} - CulturePass Perk`,
        message: `Check out this perk on CulturePass: ${perk.title}! ${perk.description || ''} ${perk.providerName ? `From ${perk.providerName}.` : ''}`,
      });
    } catch {}
  };

  const activePerkCount = perks.filter(p => canRedeem(p)).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perks & Benefits</Text>
        <Pressable onPress={() => router.push('/submit')} style={styles.addBtn} hitSlop={8}>
          <Ionicons name="add" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 + (Platform.OS === 'web' ? 34 : insets.bottom) }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.heroBanner}>
          <View style={styles.heroIconWrap}>
            <Ionicons name="gift" size={26} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>Exclusive Perks</Text>
          <Text style={styles.heroSub}>{activePerkCount} perks available for you</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{perks.length}</Text>
              <Text style={styles.heroStatLabel}>Total</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{activePerkCount}</Text>
              <Text style={styles.heroStatLabel}>Available</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNum}>{membership?.tier?.toUpperCase() || 'FREE'}</Text>
              <Text style={styles.heroStatLabel}>Your Tier</Text>
            </View>
          </View>
        </Animated.View>

        {membership?.tier === 'free' && (
          <Animated.View entering={FadeInDown.delay(150).duration(400)}>
            <Pressable
              style={styles.upgradePrompt}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/membership/upgrade');
              }}
            >
              <View style={styles.upgradePromptIcon}>
                <Ionicons name="star" size={18} color="#2E86C1" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.upgradePromptTitle}>Unlock Exclusive Perks</Text>
                <Text style={styles.upgradePromptSub}>CulturePass+ members get access to members-only deals</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#2E86C1" />
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <FilterChipRow items={filterItems} selectedId={selectedCategory} onSelect={setSelectedCategory} size="small" />
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Perks' : CATEGORIES.find(c => c.id === selectedCategory)?.label || 'Perks'}
          </Text>
        </View>

        <View style={styles.list}>
          {isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="hourglass" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>Loading perks...</Text>
            </View>
          ) : filteredPerks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No perks available in this category</Text>
            </View>
          ) : (
            filteredPerks.map((perk, i) => {
              const typeInfo = PERK_TYPE_INFO[perk.perkType] || PERK_TYPE_INFO.discount_percent;
              const redeemable = canRedeem(perk);
              const usagePercent = perk.usageLimit ? Math.round(((perk.usedCount || 0) / perk.usageLimit) * 100) : 0;
              return (
                <Animated.View key={perk.id} entering={FadeInDown.delay(250 + i * 60).duration(400)}>
                  <Pressable style={styles.perkCard} onPress={() => router.push(`/perks/${perk.id}`)}>
                    <View style={styles.perkTop}>
                      <View style={[styles.perkBadge, { backgroundColor: typeInfo.color + '12' }]}>
                        <Ionicons name={typeInfo.icon as any} size={22} color={typeInfo.color} />
                      </View>
                      <View style={styles.perkInfo}>
                        <Text style={styles.perkTitle} numberOfLines={2}>{perk.title}</Text>
                        <View style={styles.providerRow}>
                          <Ionicons name="business-outline" size={12} color={Colors.textTertiary} />
                          <Text style={styles.perkProvider}>{perk.providerName || 'CulturePass'}</Text>
                        </View>
                      </View>
                      <View style={styles.perkValueWrap}>
                        <View style={[styles.perkValue, { backgroundColor: typeInfo.color + '12' }]}>
                          <Text style={[styles.perkValueText, { color: typeInfo.color }]}>{formatValue(perk)}</Text>
                        </View>
                        <Pressable hitSlop={8} onPress={() => handleSharePerk(perk)} style={styles.perkShareBtn}>
                          <Ionicons name="share-outline" size={16} color={Colors.textTertiary} />
                        </Pressable>
                      </View>
                    </View>

                    {perk.description && <Text style={styles.perkDesc} numberOfLines={2}>{perk.description}</Text>}

                    <View style={styles.perkMeta}>
                      {perk.isMembershipRequired && (
                        <View style={[styles.metaTag, { backgroundColor: '#2E86C110' }]}>
                          <Ionicons name="star" size={12} color="#2E86C1" />
                          <Text style={[styles.metaTagText, { color: '#2E86C1' }]}>CulturePass+ Only</Text>
                        </View>
                      )}
                      {perk.usageLimit && (
                        <View style={styles.metaTag}>
                          <Ionicons name="people" size={12} color={Colors.textSecondary} />
                          <Text style={styles.metaTagText}>{(perk.usageLimit - (perk.usedCount || 0))} left</Text>
                        </View>
                      )}
                      {perk.endDate && (
                        <View style={styles.metaTag}>
                          <Ionicons name="calendar" size={12} color={Colors.textSecondary} />
                          <Text style={styles.metaTagText}>Ends {new Date(perk.endDate).toLocaleDateString()}</Text>
                        </View>
                      )}
                      {perk.perUserLimit && (
                        <View style={styles.metaTag}>
                          <Ionicons name="person" size={12} color={Colors.textSecondary} />
                          <Text style={styles.metaTagText}>Max {perk.perUserLimit}/user</Text>
                        </View>
                      )}
                    </View>

                    {perk.usageLimit && (
                      <View style={styles.progressWrap}>
                        <View style={styles.progressBar}>
                          <View style={[styles.progressFill, { width: `${Math.min(usagePercent, 100)}%` as any, backgroundColor: usagePercent > 80 ? Colors.error : typeInfo.color }]} />
                        </View>
                        <Text style={styles.progressText}>{usagePercent}% claimed</Text>
                      </View>
                    )}

                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        if (!redeemable && perk.isMembershipRequired) {
                          router.push('/membership/upgrade');
                        } else {
                          redeemMutation.mutate(perk.id);
                        }
                      }}
                      disabled={(!redeemable && !perk.isMembershipRequired) || redeemMutation.isPending}
                      style={[styles.redeemBtn, !redeemable && !perk.isMembershipRequired && styles.redeemBtnDisabled, !redeemable && perk.isMembershipRequired && styles.upgradeBtn]}>
                      <Ionicons name={redeemable ? 'gift' : (perk.isMembershipRequired ? 'star' : 'lock-closed')} size={16} color={redeemable ? '#FFF' : (perk.isMembershipRequired ? '#2E86C1' : Colors.textTertiary)} />
                      <Text style={[styles.redeemBtnText, !redeemable && !perk.isMembershipRequired && styles.redeemBtnTextDisabled, !redeemable && perk.isMembershipRequired && styles.upgradeBtnText]}>
                        {!redeemable ? (perk.isMembershipRequired ? 'Upgrade to CulturePass+' : 'Fully Redeemed') : 'Redeem Now'}
                      </Text>
                    </Pressable>
                  </Pressable>
                </Animated.View>
              );
            })
          )}
        </View>
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    letterSpacing: 0.37,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBanner: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    ...Colors.shadow.small,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 18,
    width: '100%',
    justifyContent: 'center',
  },
  heroStat: { alignItems: 'center' },
  heroStatNum: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#FFFFFF' },
  heroStatLabel: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.75)' },
  heroStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    letterSpacing: 0.35,
  },
  list: { paddingHorizontal: 20 },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 14 },
  emptyText: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  perkCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...Colors.shadow.small,
  },
  perkTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 12 },
  perkBadge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  perkInfo: { flex: 1 },
  perkTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.text, lineHeight: 22 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  perkProvider: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  perkValueWrap: { alignItems: 'flex-end', gap: 8 },
  perkValue: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  perkValueText: { fontSize: 13, fontFamily: 'Poppins_700Bold' },
  perkShareBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center' },
  perkDesc: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginBottom: 14, lineHeight: 20 },
  perkMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  metaTagText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  progressBar: { flex: 1, height: 4, backgroundColor: Colors.backgroundSecondary, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textTertiary, width: 70, textAlign: 'right' },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  redeemBtnDisabled: { backgroundColor: Colors.backgroundSecondary },
  redeemBtnText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  redeemBtnTextDisabled: { color: Colors.textTertiary },
  upgradePrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#EBF5FB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  upgradePromptIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#D6EAF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upgradePromptTitle: { fontSize: 14, fontWeight: '600', color: '#1A5276' },
  upgradePromptSub: { fontSize: 12, color: '#5D6D7E', marginTop: 1 },
  upgradeBtn: {
    backgroundColor: '#EBF5FB',
    borderWidth: 1,
    borderColor: '#D6EAF8',
  },
  upgradeBtnText: {
    color: '#2E86C1',
  },
});
