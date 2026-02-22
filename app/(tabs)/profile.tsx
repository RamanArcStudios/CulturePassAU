 import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Switch,
  Share,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents, sampleCommunities } from '@/data/mockData';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import type { Wallet, User, Membership } from '@shared/schema';
import Animated, { FadeInDown } from 'react-native-reanimated';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  // Parse manually to avoid UTC/local timezone shifting the date
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  free: { bg: Colors.textTertiary + '15', text: Colors.textSecondary, icon: 'shield-outline' },
  plus: { bg: '#3498DB15', text: '#3498DB', icon: 'star' },
  premium: { bg: '#F39C1215', text: '#F39C12', icon: 'diamond' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

interface MenuItemProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
  showDivider?: boolean;
  badge?: number;
}

function MenuItem({
  icon,
  label,
  value,
  onPress,
  color,
  showDivider = true,
  badge,
}: MenuItemProps) {
  return (
    <>
      <Pressable style={styles.menuItem} onPress={onPress}>
        <View style={[styles.menuIcon, { backgroundColor: (color ?? Colors.primary) + '12' }]}>
          <Ionicons name={icon as any} size={20} color={color ?? Colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        {badge != null && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        {value ? <Text style={styles.menuValue}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </Pressable>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

interface ToggleItemProps {
  icon: string;
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  color?: string;
  showDivider?: boolean;
}

function ToggleItem({
  icon,
  label,
  value,
  onToggle,
  color,
  showDivider = true,
}: ToggleItemProps) {
  return (
    <>
      <View style={styles.menuItem}>
        <View style={[styles.menuIcon, { backgroundColor: (color ?? Colors.primary) + '12' }]}>
          <Ionicons name={icon as any} size={20} color={color ?? Colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
          thumbColor={value ? Colors.primary : '#f4f3f4'}
        />
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

// ─── ProfileScreen ────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state, resetOnboarding } = useOnboarding();
  const { savedEvents, joinedCommunities } = useSaved();
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    queryClient.invalidateQueries();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // ── API queries ──────────────────────────────────────────────────────────────
  const { data: usersData } = useQuery<User[]>({ queryKey: ['/api/users'] });
  const user = usersData?.[0];
  const userId = user?.id;

  const { data: wallet } = useQuery<Wallet>({
    queryKey: ['/api/wallet', userId],
    enabled: !!userId,
  });

  const { data: membership } = useQuery<Membership>({
    queryKey: [`/api/membership/${userId}`],
    enabled: !!userId,
  });

  const { data: ticketCount } = useQuery<{ count: number }>({
    queryKey: [`/api/tickets/${userId}/count`],
    enabled: !!userId,
  });

  const { data: unreadNotifs } = useQuery<{ count: number }>({
    queryKey: [`/api/notifications/${userId}/unread-count`],
    enabled: !!userId,
  });

  // ── Derived values ───────────────────────────────────────────────────────────
  const savedEventsList = useMemo(
    () => sampleEvents.filter(e => savedEvents.includes(e.id)),
    [savedEvents],
  );

  const joinedCommunitiesList = useMemo(
    () => sampleCommunities.filter(c => joinedCommunities.includes(c.id)),
    [joinedCommunities],
  );

  const tier = membership?.tier ?? 'free';
  const tierStyle = TIER_COLORS[tier] ?? TIER_COLORS.free;

  const displayName = user?.displayName ?? 'CulturePass User';

  const profileCompleteness = useMemo(() => {
    let pct = 0;
    if (user?.displayName) pct += 20;
    if (user?.bio) pct += 20;
    if (user?.avatarUrl) pct += 10;
    if (user?.city || user?.location) pct += 20;
    if (user?.username) pct += 15;
    if (user?.socialLinks && Object.keys(user.socialLinks).length > 0) pct += 15;
    return pct;
  }, [user?.displayName, user?.bio, user?.avatarUrl, user?.city, user?.location, user?.username, user?.socialLinks]);

  const nextTierInfo = useMemo(() => {
    if (tier === 'free') return { name: 'Plus', color: '#3498DB' };
    if (tier === 'plus') return { name: 'Premium', color: '#F39C12' };
    return null;
  }, [tier]);

  // Guard against "Sydney, undefined" when country is missing
  const displayLocation = useMemo(() => {
    if (user?.city && user?.country) return `${user.city}, ${user.country}`;
    if (state.city && state.country) return `${state.city}, ${state.country}`;
    return state.city ?? '';
  }, [user?.city, user?.country, state.city, state.country]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out my CulturePass profile! ${displayName} from ${displayLocation}. Download CulturePass to connect with cultural communities!`,
      });
    } catch {
      // Silently ignore share cancellation / errors
    }
  }, [displayName, displayLocation]);

  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset App',
      'This will clear all your data and return you to the onboarding screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            router.replace('/(onboarding)');
          },
        },
      ],
    );
  }, [resetOnboarding]);

  const handleResetPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleReset();
  }, [handleReset]);

  const handleSignOut = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel' },
      { text: 'Sign Out', style: 'destructive' },
    ]);
  }, []);

  const walletBalance = wallet?.balance ?? 0;
  const tickets = ticketCount?.count ?? 0;
  const unreadCount = unreadNotifs?.count ?? 0;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.profileHeader}>
          <View style={styles.heroCard}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark || '#B8431F', Colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroBanner}
            >
              <View style={styles.heroBannerOverlay}>
                <View style={styles.heroBannerActions}>
                  <Pressable style={styles.heroBannerBtn} onPress={handleShare}>
                    <Ionicons name="share-outline" size={18} color="#FFF" />
                  </Pressable>
                  <Text style={styles.heroLabel}>Profile</Text>
                  <Pressable style={styles.heroBannerBtn} onPress={() => router.push('/notifications')}>
                    <Ionicons name="notifications-outline" size={18} color="#FFF" />
                    {unreadCount > 0 && <View style={styles.notifDot} />}
                  </Pressable>
                </View>
                <View style={styles.heroBannerPattern}>
                  {[0, 1, 2, 3, 4].map(i => (
                    <View key={i} style={[styles.patternCircle, { opacity: 0.06 + i * 0.02, left: 30 + i * 55, top: 10 + (i % 2) * 20 }]} />
                  ))}
                </View>
              </View>
            </LinearGradient>

            <View style={styles.avatarContainer}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>
                    {(displayName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={[styles.tierIcon, { backgroundColor: tierStyle.bg, borderColor: '#FFF' }]}>
                <Ionicons name={tierStyle.icon as any} size={12} color={tierStyle.text} />
              </View>
            </View>

            <View style={styles.heroBody}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{displayName}</Text>
                {user?.isVerified && (
                  <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                )}
              </View>
              {user?.username ? (
                <Text style={styles.username}>@{user.username}</Text>
              ) : null}

              <View style={styles.idLocationRow}>
                {user?.culturePassId ? (
                  <View style={styles.cpidChip}>
                    <Ionicons name="finger-print" size={12} color={Colors.primary} />
                    <Text style={styles.cpidText}>{user.culturePassId}</Text>
                  </View>
                ) : null}
                {displayLocation ? (
                  <View style={styles.locationChip}>
                    <Ionicons name="location" size={12} color={Colors.secondary} />
                    <Text style={styles.locationChipText}>{displayLocation}</Text>
                  </View>
                ) : null}
                <View style={[styles.tierBadge, { backgroundColor: tierStyle.bg }]}>
                  <Ionicons name={tierStyle.icon as any} size={11} color={tierStyle.text} />
                  <Text style={[styles.tierBadgeText, { color: tierStyle.text }]}>
                    {capitalize(tier)}
                  </Text>
                </View>
              </View>

              {user?.bio ? (
                <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text>
              ) : null}

              <View style={styles.completenessContainer}>
                <View style={styles.completenessHeader}>
                  <Text style={styles.completenessText}>Profile completeness</Text>
                  <Text style={[styles.completenessPercent, profileCompleteness >= 80 ? { color: Colors.success } : profileCompleteness >= 50 ? { color: Colors.accent } : {}]}>
                    {profileCompleteness}%
                  </Text>
                </View>
                <View style={styles.completenessBarBg}>
                  <View style={[styles.completenessBarFill, { width: `${profileCompleteness}%` as any }, profileCompleteness >= 80 ? { backgroundColor: Colors.success } : profileCompleteness >= 50 ? { backgroundColor: Colors.accent } : {}]} />
                </View>
              </View>

              <View style={styles.profileActions}>
                <Pressable style={styles.editProfileBtn} onPress={() => router.push('/profile/edit')}>
                  <Ionicons name="create-outline" size={16} color="#FFF" />
                  <Text style={styles.editProfileText}>Edit Profile</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {nextTierInfo && (
            <Pressable style={[styles.upgradeCta, { backgroundColor: nextTierInfo.color + '08', borderColor: nextTierInfo.color + '20' }]}>
              <View style={[styles.upgradeIconWrap, { backgroundColor: nextTierInfo.color + '15' }]}>
                <Ionicons name="arrow-up-circle" size={20} color={nextTierInfo.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.upgradeCtaTitle, { color: nextTierInfo.color }]}>
                  Upgrade to {nextTierInfo.name}
                </Text>
                <Text style={styles.upgradeCtaSub}>Unlock more perks and benefits</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={nextTierInfo.color} />
            </Pressable>
          )}

          <View style={styles.quickActionRow}>
            <Pressable
              style={styles.quickActionChip}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/profile/public');
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.secondary + '12' }]}>
                <Ionicons name="eye-outline" size={18} color={Colors.secondary} />
              </View>
              <Text style={styles.quickActionText}>View Public</Text>
            </Pressable>
            <Pressable
              style={styles.quickActionChip}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/profile/qr');
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#8B5CF6' + '12' }]}>
                <Ionicons name="qr-code-outline" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.quickActionText}>My QR ID</Text>
            </Pressable>
            <Pressable
              style={styles.quickActionChip}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleShare();
              }}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.accent + '12' }]}>
                <Ionicons name="share-social-outline" size={18} color={Colors.accent} />
              </View>
              <Text style={styles.quickActionText}>Share</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
          <Pressable style={styles.statCard} onPress={() => router.push('/(tabs)/communities')}>
            <Text style={styles.statNum}>{joinedCommunities.length}</Text>
            <Text style={styles.statLabel}>Communities</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.statNum}>{savedEvents.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => router.push('/tickets')}>
            <Text style={styles.statNum}>{tickets}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => router.push('/payment/wallet')}>
            <Text style={styles.statNum}>${walletBalance.toFixed(0)}</Text>
            <Text style={styles.statLabel}>T. Wallet</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.activityCard}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          <View style={styles.activityRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
            <Text style={styles.activityText}>{savedEvents.length} events saved this month</Text>
          </View>
          <View style={styles.activityRow}>
            <Ionicons name="people-outline" size={16} color={Colors.secondary} />
            <Text style={styles.activityText}>{joinedCommunities.length} communities active</Text>
          </View>
        </Animated.View>

        {/* My Communities */}
        {joinedCommunitiesList.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
            <SectionTitle title="My Communities" />
            {joinedCommunitiesList.slice(0, 3).map(c => (
              <Pressable
                key={c.id}
                style={styles.miniCard}
                onPress={() =>
                  router.push({ pathname: '/community/[id]', params: { id: c.id } })
                }
              >
                <View style={[styles.miniIcon, { backgroundColor: c.color + '15' }]}>
                  <Ionicons name={c.icon as any} size={20} color={c.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniTitle}>{c.name}</Text>
                  <Text style={styles.miniSub}>{c.members.toLocaleString()} members</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </Pressable>
            ))}
            {joinedCommunitiesList.length > 3 && (
              <Pressable
                style={styles.seeAllBtn}
                onPress={() => router.push('/(tabs)/communities')}
              >
                <Text style={styles.seeAllText}>
                  See All ({joinedCommunitiesList.length})
                </Text>
              </Pressable>
            )}
          </Animated.View>
        )}

        {/* Saved Events */}
        {savedEventsList.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
            <SectionTitle title="Saved Events" />
            {savedEventsList.slice(0, 3).map(e => (
              <Pressable
                key={e.id}
                style={styles.miniCard}
                onPress={() =>
                  router.push({ pathname: '/event/[id]', params: { id: e.id } })
                }
              >
                <View style={[styles.miniIcon, { backgroundColor: e.imageColor + '15' }]}>
                  <Ionicons name="calendar" size={20} color={e.imageColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniTitle} numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text style={styles.miniSub}>{formatDate(e.date)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* Location & Preferences */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <SectionTitle title="Location & Preferences" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="location-outline"
              label="Location"
              value={displayLocation}
              color={Colors.primary}
              onPress={() => router.push('/profile/edit')}
            />
            <MenuItem
              icon="people-outline"
              label="My Communities"
              value={`${state.communities.length} selected`}
              color={Colors.secondary}
              onPress={() => router.push('/(tabs)/communities')}
            />
            <MenuItem
              icon="heart-outline"
              label="Interests"
              value={`${state.interests.length} selected`}
              color={Colors.accent}
              onPress={() =>
                Alert.alert(
                  'Interests',
                  state.interests.join(', ') || 'None selected',
                )
              }
              showDivider={false}
            />
          </View>
        </Animated.View>

        {/* Tickets & Wallet */}
        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.section}>
          <SectionTitle title="Tickets & Wallet" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="ticket-outline"
              label="My Tickets"
              color="#E74C3C"
              badge={tickets}
              onPress={() => router.push('/tickets')}
            />
            <MenuItem
              icon="wallet-outline"
              label="Ticket Wallet"
              value={`$${walletBalance.toFixed(2)}`}
              color="#2ECC71"
              onPress={() => router.push('/payment/wallet')}
            />
            <MenuItem
              icon="gift-outline"
              label="Perks & Benefits"
              color={Colors.accent}
              onPress={() => router.push('/perks')}
              showDivider={false}
            />
          </View>
        </Animated.View>

        {/* Payment & Billing */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <SectionTitle title="Payment & Billing" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="card-outline"
              label="Payment Methods"
              color="#3498DB"
              onPress={() => router.push('/payment/methods')}
            />
            <MenuItem
              icon="receipt-outline"
              label="Transaction History"
              color="#9B59B6"
              onPress={() => router.push('/payment/transactions')}
              showDivider={false}
            />
          </View>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.section}>
          <SectionTitle title="Notifications" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="View Notifications"
              color="#FF9F0A"
              badge={unreadCount}
              onPress={() => router.push('/notifications')}
            />
            <MenuItem
              icon="options-outline"
              label="Notification Preferences"
              color="#FF2D55"
              onPress={() => router.push('/settings/notifications')}
              showDivider={false}
            />
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
          <SectionTitle title="Settings" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="shield-checkmark-outline"
              label="Privacy"
              color="#5856D6"
              onPress={() => router.push('/settings/privacy')}
            />
            <MenuItem
              icon="add-circle-outline"
              label="Submit a Listing"
              color={Colors.secondary}
              onPress={() => router.push('/submit')}
            />
          </View>
        </Animated.View>

        {/* Help & Support */}
        <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.section}>
          <SectionTitle title="Help & Support" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-buoy-outline"
              label="Help Centre"
              color="#34C759"
              onPress={() => router.push('/settings/help')}
            />
            <MenuItem
              icon="document-text-outline"
              label="Terms & Privacy"
              color="#8E8E93"
              onPress={() => router.push('/legal/terms')}
            />
            <MenuItem
              icon="information-circle-outline"
              label="About CulturePass"
              color={Colors.primary}
              onPress={() => router.push('/settings/about')}
              showDivider={false}
            />
          </View>
        </Animated.View>

        {/* Bottom actions */}
        <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.bottomActions}>
          <Pressable style={styles.logoutBtn} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color={Colors.primary} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
          <Pressable style={styles.resetButton} onPress={handleResetPress}>
            <Ionicons name="refresh-outline" size={18} color={Colors.error} />
            <Text style={styles.resetText}>Reset App Data</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.version}>CulturePass v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  profileHeader: { paddingBottom: 12 },
  heroCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 28,
    overflow: 'hidden',
    ...Colors.shadow.large,
  },
  heroBanner: {
    height: 110,
    width: '100%',
  },
  heroBannerOverlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  heroBannerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBannerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  heroBannerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
  },
  notifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginTop: -48,
    marginBottom: 14,
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: Colors.surface,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.surface,
    ...Colors.shadow.large,
  },
  avatarInitials: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  tierIcon: {
    position: 'absolute',
    bottom: 2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...Colors.shadow.small,
  },
  heroBody: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: { fontSize: 26, fontFamily: 'Poppins_700Bold', color: Colors.text, letterSpacing: -0.3 },
  username: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 1,
  },
  idLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  cpidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '0D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cpidText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  locationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.secondary + '0D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  locationChipText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.secondary },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    ...Colors.shadow.small,
  },
  tierBadgeText: { fontSize: 12, fontFamily: 'Poppins_700Bold', letterSpacing: 0.2 },
  bio: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginTop: 10,
    lineHeight: 19,
  },
  completenessContainer: {
    width: '100%',
    marginTop: 14,
    paddingHorizontal: 8,
  },
  completenessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  completenessText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textTertiary,
  },
  completenessPercent: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
  },
  completenessBarBg: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border + '80',
    overflow: 'hidden',
  },
  completenessBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 13,
    borderRadius: 16,
    ...Colors.shadow.medium,
  },
  editProfileText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.textInverse },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.small,
  },
  statNum: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.primary, letterSpacing: -0.5 },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionAccent: { width: 5, height: 22, borderRadius: 2.5, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text, letterSpacing: -0.3 },
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...Colors.shadow.small,
  },
  miniIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  miniTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  miniSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  seeAllBtn: { alignItems: 'center', paddingVertical: 10 },
  seeAllText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...Colors.shadow.medium,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 18, gap: 14, minHeight: 56 },
  menuIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  menuValue: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginRight: 4,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginRight: 4,
    ...Colors.shadow.small,
  },
  badgeText: { fontSize: 11, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 76 },
  bottomActions: { paddingHorizontal: 20, marginBottom: 24, gap: 12 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    ...Colors.shadow.small,
  },
  logoutText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    paddingVertical: 16,
    ...Colors.shadow.small,
  },
  resetText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.error },
  version: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: 20,
  },
  upgradeCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    ...Colors.shadow.small,
  },
  upgradeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeCtaTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
  },
  upgradeCtaSub: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  quickActionChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    ...Colors.shadow.small,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
  },
  activityCard: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 18,
    padding: 18,
    gap: 12,
    ...Colors.shadow.small,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
});