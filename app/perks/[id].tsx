import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient, getApiUrl } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/lib/auth';

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

const PERK_TYPE_INFO: Record<string, { icon: string; color: string; label: string; gradient: string }> = {
  discount_percent: { icon: 'pricetag', color: '#E85D3A', label: 'Percentage Discount', gradient: '#FF8C6B' },
  discount_fixed: { icon: 'cash', color: '#1A7A6D', label: 'Fixed Discount', gradient: '#2ECC71' },
  free_ticket: { icon: 'ticket', color: '#9B59B6', label: 'Free Ticket', gradient: '#C39BD3' },
  early_access: { icon: 'time', color: '#3498DB', label: 'Early Access', gradient: '#7EC8E3' },
  vip_upgrade: { icon: 'star', color: '#F2A93B', label: 'VIP Upgrade', gradient: '#F7DC6F' },
  cashback: { icon: 'wallet', color: '#34C759', label: 'Cashback Reward', gradient: '#82E0AA' },
};

const CATEGORY_LABELS: Record<string, string> = {
  tickets: 'Tickets',
  events: 'Events',
  dining: 'Dining',
  shopping: 'Shopping',
  wallet: 'Wallet',
  indigenous: 'First Nations',
};

function formatValue(perk: Perk) {
  if (perk.perkType === 'discount_percent') return `${perk.discountPercent}% Off`;
  if (perk.perkType === 'discount_fixed') return `$${(perk.discountFixedCents || 0) / 100} Off`;
  if (perk.perkType === 'free_ticket') return 'Free';
  if (perk.perkType === 'early_access') return '48h Early';
  if (perk.perkType === 'vip_upgrade') return 'VIP';
  if (perk.perkType === 'cashback') return perk.discountPercent ? `${perk.discountPercent}% Cashback` : `$${(perk.discountFixedCents || 0) / 100} Cashback`;
  return '';
}

export default function PerkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const { userId } = useAuth();
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');

  const { data: perk, isLoading } = useQuery<Perk>({
    queryKey: ['/api/perks', id],
    queryFn: async () => {
      const baseUrl = getApiUrl().replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/perks/${id}`);
      if (!res.ok) throw new Error('Perk not found');
      return res.json();
    },
    enabled: !!id,
  });

  const { data: membership } = useQuery<{ tier: string }>({
    queryKey: ['/api/membership', userId],
    enabled: !!userId,
  });

  const redeemMutation = useMutation({
    mutationFn: async (perkId: string) => {
      const res = await apiRequest('POST', `/api/perks/${perkId}/redeem`, { userId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/perks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/redemptions'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const code = `CP-${perk.perkType.toUpperCase().replace('_', '')}-${Date.now().toString(36).toUpperCase()}`;
      setCouponCode(code);
      setShowCoupon(true);
    },
    onError: (err: Error) => {
      Alert.alert('Cannot Redeem', err.message);
    },
  });

  if (isLoading || !perk) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="gift-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.loadingText}>{isLoading ? 'Loading...' : 'Perk not found'}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const typeInfo = PERK_TYPE_INFO[perk.perkType] || PERK_TYPE_INFO.discount_percent;
  const canRedeem = (() => {
    if (perk.isMembershipRequired && (!membership?.tier || membership.tier === 'free')) return false;
    if (perk.usageLimit && (perk.usedCount || 0) >= perk.usageLimit) return false;
    return true;
  })();
  const usagePercent = perk.usageLimit ? Math.round(((perk.usedCount || 0) / perk.usageLimit) * 100) : 0;
  const remaining = perk.usageLimit ? perk.usageLimit - (perk.usedCount || 0) : null;

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const shareUrl = `https://culturepass.app/perks/${id}`;
      await Share.share({
        title: `${perk.title} - CulturePass Perk`,
        message: `Check out this perk on CulturePass: ${perk.title}! ${perk.description || ''} ${perk.providerName ? `From ${perk.providerName}.` : ''}\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {}
  };

  const handleRedeem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!canRedeem && perk.isMembershipRequired) {
      router.push('/membership/upgrade');
    } else {
      redeemMutation.mutate(perk.id);
    }
  };

  const isIndigenous = perk.category === 'indigenous';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isIndigenous ? ['#8B4513', '#A0522D'] : [typeInfo.color, typeInfo.gradient]}
        style={[styles.hero, { paddingTop: topInset + 12 }]}
      >
        <View style={styles.heroNav}>
          <Pressable style={styles.navButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </Pressable>
          <Pressable style={styles.navButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </Pressable>
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroIconWrap}>
            <Ionicons name={isIndigenous ? 'earth' : typeInfo.icon as any} size={36} color="#FFF" />
          </View>
          <Text style={styles.heroValue}>{formatValue(perk)}</Text>
          <Text style={styles.heroLabel}>{typeInfo.label}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.section}>
          <Text style={styles.title}>{perk.title}</Text>
          <View style={styles.providerRow}>
            <Ionicons name="business-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.providerText}>{perk.providerName || 'CulturePass'}</Text>
          </View>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>About this perk</Text>
          <Text style={styles.description}>{perk.description || 'No description available.'}</Text>
        </Animated.View>

        <View style={styles.divider} />

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: typeInfo.color + '15' }]}>
                <Ionicons name="albums" size={18} color={typeInfo.color} />
              </View>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{CATEGORY_LABELS[perk.category || ''] || perk.category || 'General'}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: typeInfo.color + '15' }]}>
                <Ionicons name="business" size={18} color={typeInfo.color} />
              </View>
              <Text style={styles.detailLabel}>Provider</Text>
              <Text style={styles.detailValue}>{perk.providerType === 'platform' ? 'CulturePass' : perk.providerType === 'business' ? 'Business' : 'Partner'}</Text>
            </View>
            {perk.perUserLimit && (
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: '#FF9F0A15' }]}>
                  <Ionicons name="person" size={18} color="#FF9F0A" />
                </View>
                <Text style={styles.detailLabel}>Limit</Text>
                <Text style={styles.detailValue}>{perk.perUserLimit}/user</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <View style={[styles.detailIcon, { backgroundColor: perk.status === 'active' ? '#34C75915' : '#FF3B3015' }]}>
                <Ionicons name={perk.status === 'active' ? 'checkmark-circle' : 'close-circle'} size={18} color={perk.status === 'active' ? '#34C759' : '#FF3B30'} />
              </View>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>{perk.status === 'active' ? 'Active' : 'Inactive'}</Text>
            </View>
          </View>
        </Animated.View>

        {perk.usageLimit && (
          <>
            <View style={styles.divider} />
            <Animated.View entering={FadeInDown.delay(350).duration(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.availabilityCard}>
                <View style={styles.availRow}>
                  <Text style={styles.availLabel}>{remaining} of {perk.usageLimit} remaining</Text>
                  <Text style={[styles.availPercent, { color: usagePercent > 80 ? Colors.error : typeInfo.color }]}>{usagePercent}% claimed</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(usagePercent, 100)}%` as any, backgroundColor: usagePercent > 80 ? Colors.error : typeInfo.color }]} />
                </View>
              </View>
            </Animated.View>
          </>
        )}

        {perk.isMembershipRequired && (
          <>
            <View style={styles.divider} />
            <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
              <View style={styles.membershipCard}>
                <View style={styles.membershipIcon}>
                  <Ionicons name="star" size={20} color="#2E86C1" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.membershipTitle}>CulturePass+ Exclusive</Text>
                  <Text style={styles.membershipSub}>This perk requires an active CulturePass+ membership to redeem.</Text>
                </View>
              </View>
            </Animated.View>
          </>
        )}

        {isIndigenous && (
          <>
            <View style={styles.divider} />
            <Animated.View entering={FadeInDown.delay(450).duration(500)} style={styles.section}>
              <View style={styles.indigenousCard}>
                <View style={styles.indigenousHeader}>
                  <View style={styles.indigenousIconBg}>
                    <Ionicons name="earth" size={18} color="#8B4513" />
                  </View>
                  <Text style={styles.indigenousTitle}>Supporting First Nations</Text>
                </View>
                <Text style={styles.indigenousBody}>
                  This perk supports Aboriginal and Torres Strait Islander businesses and communities. By redeeming this perk, you are helping to grow Indigenous enterprise and cultural visibility.
                </Text>
              </View>
            </Animated.View>
          </>
        )}

        {perk.endDate && (
          <>
            <View style={styles.divider} />
            <Animated.View entering={FadeInDown.delay(450).duration(500)} style={styles.section}>
              <View style={styles.expiryRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.expiryText}>Valid until {new Date(perk.endDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>

      {showCoupon && (
        <View style={styles.couponOverlay}>
          <View style={styles.couponModal}>
            <View style={styles.couponIconWrap}>
              <Ionicons name="checkmark-circle" size={48} color="#34C759" />
            </View>
            <Text style={styles.couponTitle}>Perk Redeemed!</Text>
            <Text style={styles.couponSubtitle}>Here's your coupon code</Text>
            <View style={styles.couponCodeWrap}>
              <Text style={styles.couponCodeText}>{couponCode}</Text>
            </View>
            <Text style={styles.couponHint}>Show this code at checkout or enter it online</Text>
            <Pressable
              style={styles.couponCopyBtn}
              onPress={async () => {
                await Clipboard.setStringAsync(couponCode);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Copied!', 'Coupon code copied to clipboard.');
              }}
            >
              <Ionicons name="copy-outline" size={18} color="#FFF" />
              <Text style={styles.couponCopyText}>Copy Code</Text>
            </Pressable>
            <Pressable style={styles.couponDoneBtn} onPress={() => setShowCoupon(false)}>
              <Text style={styles.couponDoneText}>Done</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 14 }]}>
        <Pressable
          onPress={handleRedeem}
          disabled={(!canRedeem && !perk.isMembershipRequired) || redeemMutation.isPending}
          style={({ pressed }) => [
            styles.redeemBtn,
            !canRedeem && !perk.isMembershipRequired && styles.redeemBtnDisabled,
            !canRedeem && perk.isMembershipRequired && styles.upgradeBtn,
            pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
          ]}
        >
          <Ionicons
            name={canRedeem ? 'gift' : (perk.isMembershipRequired ? 'star' : 'lock-closed')}
            size={20}
            color={canRedeem ? '#FFF' : (perk.isMembershipRequired ? '#2E86C1' : Colors.textTertiary)}
          />
          <Text style={[
            styles.redeemBtnText,
            !canRedeem && !perk.isMembershipRequired && styles.redeemBtnTextDisabled,
            !canRedeem && perk.isMembershipRequired && styles.upgradeBtnText,
          ]}>
            {redeemMutation.isPending ? 'Redeeming...' : !canRedeem ? (perk.isMembershipRequired ? 'Upgrade to CulturePass+' : 'Fully Redeemed') : 'Redeem Now'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { alignItems: 'center' },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroValue: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    textAlign: 'center',
  },
  heroLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: { paddingHorizontal: 20, paddingVertical: 16 },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  providerText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 23,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    width: '47%' as any,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginTop: 2,
  },
  availabilityCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  availRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  availLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  availPercent: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  membershipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EBF5FB',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2E86C1',
  },
  membershipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#2E86C115',
    alignItems: 'center',
    justifyContent: 'center',
  },
  membershipTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#1A5276',
  },
  membershipSub: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#2E86C1',
    marginTop: 2,
  },
  indigenousCard: {
    backgroundColor: '#FDF8F3',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  indigenousHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  indigenousIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#8B451318',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indigenousTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#3E2723',
  },
  indigenousBody: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#5D4037',
    lineHeight: 20,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expiryText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingTop: 14,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 16,
  },
  redeemBtnDisabled: {
    backgroundColor: Colors.backgroundSecondary,
  },
  upgradeBtn: {
    backgroundColor: '#EBF5FB',
    borderWidth: 1.5,
    borderColor: '#2E86C1',
  },
  redeemBtnText: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  redeemBtnTextDisabled: { color: Colors.textTertiary },
  upgradeBtnText: { color: '#2E86C1' },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  backLink: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    marginTop: 8,
  },
  couponOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 30,
  },
  couponModal: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%' as any,
    maxWidth: 340,
  },
  couponIconWrap: {
    marginBottom: 12,
  },
  couponTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  couponSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#8E8E93',
    marginBottom: 16,
  },
  couponCodeWrap: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  couponCodeText: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#1C1C1E',
    letterSpacing: 2,
    textAlign: 'center' as const,
  },
  couponHint: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center' as const,
  },
  couponCopyBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: '#1A7A6D',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '100%' as any,
    marginBottom: 10,
  },
  couponCopyText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  couponDoneBtn: {
    paddingVertical: 10,
  },
  couponDoneText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#8E8E93',
  },
});
