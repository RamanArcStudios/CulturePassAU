import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Switch, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents, sampleCommunities } from '@/data/mockData';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Wallet, User, Membership } from '@shared/schema';
import Animated, { FadeInDown } from 'react-native-reanimated';

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function MenuItem({ icon, label, value, onPress, color, showDivider = true, badge }: {
  icon: string; label: string; value?: string; onPress?: () => void; color?: string; showDivider?: boolean; badge?: number;
}) {
  return (
    <>
      <Pressable style={styles.menuItem} onPress={onPress}>
        <View style={[styles.menuIcon, { backgroundColor: (color || Colors.primary) + '12' }]}>
          <Ionicons name={icon as any} size={20} color={color || Colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        {badge != null && badge > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>
        )}
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </Pressable>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

function ToggleItem({ icon, label, value, onToggle, color, showDivider = true }: {
  icon: string; label: string; value: boolean; onToggle: (v: boolean) => void; color?: string; showDivider?: boolean;
}) {
  return (
    <>
      <View style={styles.menuItem}>
        <View style={[styles.menuIcon, { backgroundColor: (color || Colors.primary) + '12' }]}>
          <Ionicons name={icon as any} size={20} color={color || Colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <Switch value={value} onValueChange={onToggle} trackColor={{ false: Colors.border, true: Colors.primary + '60' }} thumbColor={value ? Colors.primary : '#f4f3f4'} />
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const TIER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  free: { bg: Colors.textTertiary + '15', text: Colors.textSecondary, icon: 'shield-outline' },
  plus: { bg: '#3498DB15', text: '#3498DB', icon: 'star' },
  premium: { bg: '#F39C1215', text: '#F39C12', icon: 'diamond' },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state, resetOnboarding } = useOnboarding();
  const { savedEvents, joinedCommunities } = useSaved();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);

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

  const savedEventsList = sampleEvents.filter(e => savedEvents.includes(e.id));
  const joinedCommunitiesList = sampleCommunities.filter(c => joinedCommunities.includes(c.id));
  const tier = membership?.tier || 'free';
  const tierStyle = TIER_COLORS[tier] || TIER_COLORS.free;

  const handleReset = () => {
    Alert.alert('Reset App', 'This will clear all your data and return you to the onboarding screen.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: async () => { await resetOnboarding(); router.replace('/(onboarding)'); } }]);
  };

  const displayName = user?.displayName || 'CulturePass User';
  const displayLocation = user?.city && user?.country ? `${user.city}, ${user.country}` : `${state.city}, ${state.country}`;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <Pressable style={styles.settingsBtn} onPress={async () => { try { await Share.share({ message: `Check out my CulturePass profile! ${displayName} from ${displayLocation}. Download CulturePass to connect with cultural communities!` }); } catch {} }}>
              <Ionicons name="share-outline" size={20} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerLabel}>Profile</Text>
            <Pressable style={styles.settingsBtn} onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={22} color={Colors.text} />
              {(unreadNotifs?.count || 0) > 0 && <View style={styles.notifDot} />}
            </Pressable>
          </View>

          <View style={styles.avatarSection}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color={Colors.primary} />
                <View style={[styles.tierIcon, { backgroundColor: tierStyle.bg, borderColor: tierStyle.text + '30' }]}>
                  <Ionicons name={tierStyle.icon as any} size={13} color={tierStyle.text} />
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.name}>{displayName}</Text>
          {user?.username && <Text style={styles.username}>@{user.username}</Text>}

          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={Colors.primary} />
            <Text style={styles.location}>{displayLocation}</Text>
          </View>

          <View style={styles.tierBadge}>
            <View style={[styles.tierBadgeInner, { backgroundColor: tierStyle.bg }]}>
              <View style={[styles.tierGlass, { backgroundColor: tierStyle.text + '08' }]} />
              <Ionicons name={tierStyle.icon as any} size={14} color={tierStyle.text} />
              <Text style={[styles.tierBadgeText, { color: tierStyle.text }]}>{tier.charAt(0).toUpperCase() + tier.slice(1)} Member</Text>
            </View>
          </View>

          {user?.bio && <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text>}

          <Pressable style={styles.editProfileBtn} onPress={() => router.push('/profile/edit')}>
            <Ionicons name="create-outline" size={17} color={Colors.primary} />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.statsRow}>
          <Pressable style={styles.statCard} onPress={() => {}}>
            <Text style={styles.statNum}>{joinedCommunities.length}</Text>
            <Text style={styles.statLabel}>Communities</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => {}}>
            <Text style={styles.statNum}>{savedEvents.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => router.push('/tickets')}>
            <Text style={styles.statNum}>{ticketCount?.count || 0}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </Pressable>
          <Pressable style={styles.statCard} onPress={() => router.push('/payment/wallet')}>
            <Text style={styles.statNum}>${(wallet?.balance || 0).toFixed(0)}</Text>
            <Text style={styles.statLabel}>T. Wallet</Text>
          </Pressable>
        </Animated.View>

        {joinedCommunitiesList.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
            <SectionTitle title="My Communities" />
            {joinedCommunitiesList.slice(0, 3).map(c => (
              <Pressable key={c.id} style={styles.miniCard}
                onPress={() => router.push({ pathname: '/community/[id]', params: { id: c.id } })}>
                <View style={[styles.miniIcon, { backgroundColor: c.color + '15' }]}><Ionicons name={c.icon as any} size={20} color={c.color} /></View>
                <View style={{ flex: 1 }}><Text style={styles.miniTitle}>{c.name}</Text><Text style={styles.miniSub}>{c.members.toLocaleString()} members</Text></View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </Pressable>
            ))}
            {joinedCommunitiesList.length > 3 && (
              <Pressable style={styles.seeAllBtn} onPress={() => router.push('/(tabs)/communities')}>
                <Text style={styles.seeAllText}>See All ({joinedCommunitiesList.length})</Text>
              </Pressable>
            )}
          </Animated.View>
        )}

        {savedEventsList.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
            <SectionTitle title="Saved Events" />
            {savedEventsList.slice(0, 3).map(e => (
              <Pressable key={e.id} style={styles.miniCard}
                onPress={() => router.push({ pathname: '/event/[id]', params: { id: e.id } })}>
                <View style={[styles.miniIcon, { backgroundColor: e.imageColor + '15' }]}><Ionicons name="calendar" size={20} color={e.imageColor} /></View>
                <View style={{ flex: 1 }}><Text style={styles.miniTitle} numberOfLines={1}>{e.title}</Text><Text style={styles.miniSub}>{formatDate(e.date)}</Text></View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </Pressable>
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <SectionTitle title="Location & Preferences" />
          <View style={styles.menuCard}>
            <MenuItem icon="location-outline" label="Location" value={displayLocation} color={Colors.primary}
              onPress={() => router.push('/profile/edit')} />
            <MenuItem icon="people-outline" label="My Communities" value={`${state.communities.length} selected`} color={Colors.secondary}
              onPress={() => router.push('/(tabs)/communities')} />
            <MenuItem icon="heart-outline" label="Interests" value={`${state.interests.length} selected`} color={Colors.accent}
              onPress={() => Alert.alert('Interests', state.interests.join(', ') || 'None selected')} showDivider={false} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.section}>
          <SectionTitle title="Tickets & Wallet" />
          <View style={styles.menuCard}>
            <MenuItem icon="ticket-outline" label="My Tickets" color="#E74C3C" badge={ticketCount?.count || 0}
              onPress={() => router.push('/tickets')} />
            <MenuItem icon="wallet-outline" label="Ticket Wallet" value={`$${(wallet?.balance || 0).toFixed(2)}`} color="#2ECC71"
              onPress={() => router.push('/payment/wallet')} />
            <MenuItem icon="gift-outline" label="Perks & Benefits" color={Colors.accent}
              onPress={() => router.push('/perks')} showDivider={false} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <SectionTitle title="Payment & Billing" />
          <View style={styles.menuCard}>
            <MenuItem icon="card-outline" label="Payment Methods" color="#3498DB"
              onPress={() => router.push('/payment/methods')} />
            <MenuItem icon="receipt-outline" label="Transaction History" color="#9B59B6"
              onPress={() => router.push('/payment/transactions')} showDivider={false} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).duration(400)} style={styles.section}>
          <SectionTitle title="Notifications" />
          <View style={styles.menuCard}>
            <MenuItem icon="notifications-outline" label="View Notifications" color="#FF9F0A" badge={unreadNotifs?.count || 0}
              onPress={() => router.push('/notifications')} />
            <ToggleItem icon="megaphone-outline" label="Push Notifications" value={pushNotifs} onToggle={setPushNotifs} color="#FF2D55" />
            <ToggleItem icon="mail-outline" label="Email Updates" value={emailNotifs} onToggle={setEmailNotifs} color="#5856D6" showDivider={false} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
          <SectionTitle title="Help & Support" />
          <View style={styles.menuCard}>
            <MenuItem icon="help-buoy-outline" label="Help Centre" color="#34C759"
              onPress={() => router.push('/help')} />
            <MenuItem icon="chatbubble-outline" label="Contact Support" color="#007AFF"
              onPress={() => router.push('/help')} />
            <MenuItem icon="document-text-outline" label="Terms & Privacy" color="#8E8E93"
              onPress={() => router.push('/help')} />
            <MenuItem icon="information-circle-outline" label="About CulturePass" color={Colors.primary}
              onPress={() => router.push('/help')} showDivider={false} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(550).duration(400)} style={styles.bottomActions}>
          <Pressable style={styles.logoutBtn}
            onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [{ text: 'Cancel' }, { text: 'Sign Out', style: 'destructive' }])}>
            <Ionicons name="log-out-outline" size={18} color={Colors.primary} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
          <Pressable style={styles.resetButton}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleReset(); }}>
            <Ionicons name="refresh-outline" size={18} color={Colors.error} />
            <Text style={styles.resetText}>Reset App Data</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.version}>CulturePass v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: Colors.backgroundSecondary + '80',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.divider,
  },
  headerLabel: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.small,
  },
  notifDot: { position: 'absolute', top: 7, right: 7, width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.error, borderWidth: 1.5, borderColor: Colors.card },
  profileHeader: { alignItems: 'center', paddingBottom: 20 },
  avatarSection: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  avatarGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primaryGlow,
    top: -22,
  },
  avatarRow: { zIndex: 1 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary + '25',
    marginBottom: 12,
    ...Colors.shadow.medium,
  },
  tierIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...Colors.shadow.small,
  },
  name: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text },
  username: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  location: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  tierBadge: { marginTop: 10 },
  tierBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tierGlass: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    opacity: 0.5,
  },
  tierBadgeText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  bio: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40, marginTop: 8, lineHeight: 18 },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.primary + '18',
    ...Colors.shadow.small,
  },
  editProfileText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    ...Colors.shadow.small,
  },
  statNum: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },
  statLabel: { fontSize: 10, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionAccent: { width: 4, height: 18, borderRadius: 2, backgroundColor: Colors.primary },
  sectionTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text },
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    ...Colors.shadow.small,
  },
  miniIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  miniTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  miniSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  seeAllBtn: { alignItems: 'center', paddingVertical: 10 },
  seeAllText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    ...Colors.shadow.small,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: 'Poppins_500Medium', color: Colors.text },
  menuValue: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginRight: 4 },
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
  divider: { height: 1, backgroundColor: Colors.divider, marginLeft: 66 },
  bottomActions: { paddingHorizontal: 20, marginBottom: 24, gap: 10 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 0.5,
    borderColor: Colors.primary + '20',
    ...Colors.shadow.small,
  },
  logoutText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 0.5,
    borderColor: Colors.error + '20',
    ...Colors.shadow.small,
  },
  resetText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.error },
  version: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, textAlign: 'center', marginBottom: 20 },
});
