import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
  ActivityIndicator,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { User, Membership } from '@shared/schema';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo } from 'react';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

const CP = {
  teal:       '#00D4AA',
  tealDark:   '#00A882',
  purple:     '#7C3AED',
  purpleDark: '#5B21B6',
  ember:      '#FF6B35',
  gold:       '#FFB347',
  dark:       '#1C1C1E',
  darkMid:    '#F2F2F7',
  muted:      '#94A3B8',
  border:     '#E5E5EA',
  bg:         '#F2F2F7',
  surface:    '#FFFFFF',
  text:       '#1C1C1E',
  success:    '#10B981',
  info:       '#3B82F6',
} as const;

const SOCIAL_ICONS = [
  { key: 'instagram', icon: 'logo-instagram' as const, label: 'Instagram', color: CP.ember },
  { key: 'twitter',   icon: 'logo-twitter'   as const, label: 'Twitter',   color: CP.info  },
  { key: 'linkedin',  icon: 'logo-linkedin'  as const, label: 'LinkedIn',  color: CP.purple },
  { key: 'facebook',  icon: 'logo-facebook'  as const, label: 'Facebook',  color: CP.info  },
] as const;

const TIER_CONFIG: Record<string, {
  color: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  free:    { color: CP.muted,  label: 'Standard', icon: 'shield-outline' },
  plus:    { color: CP.teal,   label: 'Plus',     icon: 'star'           },
  pro:     { color: CP.purple, label: 'Pro',      icon: 'star'           },
  premium: { color: CP.ember,  label: 'Premium',  icon: 'diamond'        },
  vip:     { color: CP.gold,   label: 'VIP',      icon: 'diamond'        },
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

function formatMemberDate(d: string | Date | null | undefined): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const topInset    = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/users', id as string],
    enabled: !!id,
  });

  const { data: membership } = useQuery<Membership>({
    queryKey: [`/api/membership/${id}`],
    enabled: !!id,
  });

  const tier     = membership?.tier ?? 'free';
  const tierConf = TIER_CONFIG[tier] ?? TIER_CONFIG.free;

  const socialLinks   = useMemo(() => (user?.socialLinks ?? {}) as Record<string, string | undefined>, [user?.socialLinks]);
  const activeSocials = useMemo(() => SOCIAL_ICONS.filter(s => socialLinks[s.key]), [socialLinks]);

  const displayName  = user?.displayName ?? 'CulturePass User';
  const initials     = useMemo(() => getInitials(displayName), [displayName]);
  const locationText = useMemo(() => [user?.city, user?.country].filter(Boolean).join(', '), [user?.city, user?.country]);
  const memberSince  = useMemo(() => formatMemberDate(user?.createdAt), [user?.createdAt]);
  const hasDetails   = !!(locationText || user?.website || user?.phone);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const shareUrl = `https://culturepass.app/u/${user?.username}`;
      await Share.share({
        title: `${displayName} on CulturePass`,
        message: `Check out ${displayName}'s profile on CulturePass!\n\nCPID: ${user?.culturePassId}\n@${user?.username}\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch { /* noop */ }
  }, [displayName, user?.culturePassId, user?.username]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[CP.dark, '#1a0533', '#0a2a2a']}
          style={[styles.hero, { paddingTop: topInset + 8, justifyContent: 'center', alignItems: 'center', minHeight: 340 }]}
        >
          <ActivityIndicator size="large" color={CP.teal} />
          <Text style={{ color: CP.muted, marginTop: 12, fontFamily: 'Poppins_400Regular', fontSize: 13 }}>
            Loading profile...
          </Text>
        </LinearGradient>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="person-outline" size={52} color={CP.muted} />
        <Text style={[styles.errorText, { marginTop: 14 }]}>Profile not found</Text>
        <Pressable style={styles.goBackButton} onPress={handleBack}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 52 }}
      >
        <LinearGradient
          colors={[CP.dark, '#1a0533', '#0a2a2a']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={[styles.hero, { paddingTop: topInset + 8 }]}
        >
          <View style={styles.arcOuter} pointerEvents="none" />
          <View style={styles.arcInner} pointerEvents="none" />

          <View style={styles.heroNav}>
            <Pressable style={styles.navBtn} onPress={handleBack} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#FFF" />
            </Pressable>
            <Pressable style={styles.navBtn} onPress={handleShare} hitSlop={8}>
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </Pressable>
          </View>

          <Animated.View entering={FadeInDown.delay(60).duration(500).springify()} style={styles.heroCenter}>
            <View style={styles.avatarGlow} />

            <LinearGradient
              colors={[CP.teal, CP.purple, CP.teal]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.avatarGradientRing}
            >
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </LinearGradient>

            {user.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color="#FFF" />
              </View>
            )}

            <Text style={styles.heroName}>{displayName}</Text>
            {user.username && <Text style={styles.heroHandle}>@{user.username}</Text>}

            <View style={styles.heroPills}>
              {user.culturePassId && (
                <View style={[styles.heroPill, styles.heroPillAccent]}>
                  <Ionicons name="finger-print" size={12} color={CP.teal} />
                  <Text style={[styles.heroPillText, { color: CP.teal }]}>{user.culturePassId}</Text>
                </View>
              )}
              {locationText ? (
                <View style={styles.heroPill}>
                  <Ionicons name="location" size={12} color={CP.muted} />
                  <Text style={styles.heroPillText}>{locationText}</Text>
                </View>
              ) : null}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(130).duration(400)} style={styles.statsBar}>
            <LinearGradient
              colors={['transparent', CP.teal, CP.purple, CP.teal, 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.statsAccentLine}
            />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{formatNumber(user.followersCount ?? 0)}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{formatNumber(user.followingCount ?? 0)}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{formatNumber(user.likesCount ?? 0)}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </Animated.View>
        </LinearGradient>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.tierRow}>
          <LinearGradient
            colors={[tierConf.color + '25', tierConf.color + '08']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[styles.tierBadge, { borderColor: tierConf.color + '45' }]}
          >
            <Ionicons name={tierConf.icon} size={15} color={tierConf.color} />
            <Text style={[styles.tierText, { color: tierConf.color }]}>{tierConf.label} Member</Text>
          </LinearGradient>
          {memberSince ? (
            <View style={styles.memberSince}>
              <Ionicons name="calendar-outline" size={14} color={CP.muted} />
              <Text style={styles.memberSinceText}>Since {memberSince}</Text>
            </View>
          ) : null}
        </Animated.View>

        {user.bio ? (
          <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>About</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.bioText}>{user.bio}</Text>
            </View>
          </Animated.View>
        ) : null}

        {activeSocials.length > 0 && (
          <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Social</Text>
            </View>
            <View style={styles.socialGrid}>
              {activeSocials.map((s) => (
                <Pressable
                  key={s.key}
                  style={styles.socialCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const url = socialLinks[s.key];
                    if (url) Linking.openURL(url);
                  }}
                >
                  <View style={[styles.socialStrip, { backgroundColor: s.color }]} />
                  <View style={[styles.socialIconWrap, { backgroundColor: s.color + '14' }]}>
                    <Ionicons name={s.icon} size={22} color={s.color} />
                  </View>
                  <Text style={styles.socialLabel}>{s.label}</Text>
                  <Ionicons name="open-outline" size={14} color={CP.muted} />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {hasDetails && (
          <Animated.View entering={FadeInDown.delay(320).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Details</Text>
            </View>
            <View style={styles.card}>
              {locationText ? (
                <View style={styles.detailRow}>
                  <View style={[styles.detailIconWrap, { backgroundColor: CP.purple + '14' }]}>
                    <Ionicons name="location" size={18} color={CP.purple} />
                  </View>
                  <View style={styles.detailText}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{locationText}</Text>
                  </View>
                </View>
              ) : null}
              {user.website ? (
                <>
                  {locationText && <View style={styles.detailDivider} />}
                  <Pressable style={styles.detailRow} onPress={() => Linking.openURL(user.website!)}>
                    <View style={[styles.detailIconWrap, { backgroundColor: CP.teal + '14' }]}>
                      <Ionicons name="globe-outline" size={18} color={CP.teal} />
                    </View>
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Website</Text>
                      <Text style={[styles.detailValue, { color: CP.teal }]}>{user.website}</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color={CP.muted} />
                  </Pressable>
                </>
              ) : null}
              {user.phone ? (
                <>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconWrap, { backgroundColor: CP.ember + '14' }]}>
                      <Ionicons name="call-outline" size={18} color={CP.ember} />
                    </View>
                    <View style={styles.detailText}>
                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailValue}>{user.phone}</Text>
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          </Animated.View>
        )}

        {user.culturePassId && (
          <Animated.View entering={FadeInDown.delay(360).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Digital Identity</Text>
            </View>

            <LinearGradient
              colors={[CP.dark, '#1a0533', CP.darkMid]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.cpidCard}
            >
              <LinearGradient
                colors={['transparent', CP.teal, CP.purple, CP.teal, 'transparent']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.cpidAccentEdge}
              />

              <View style={styles.cpidTop}>
                <View style={styles.cpidLogoRow}>
                  <LinearGradient colors={[CP.teal, CP.purple]} style={styles.cpidLogoIcon}>
                    <Ionicons name="globe" size={13} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.cpidLogoText}>CulturePass</Text>
                </View>
                <View style={styles.cpidVerifiedIcon}>
                  <Ionicons name="shield-checkmark" size={15} color={CP.teal} />
                </View>
              </View>

              <View style={styles.cpidCenter}>
                <Text style={styles.cpidLabel}>CULTUREPASS ID</Text>
                <Text style={styles.cpidValue}>{user.culturePassId}</Text>
                <LinearGradient
                  colors={['transparent', CP.teal, 'transparent']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.cpidUnderline}
                />
              </View>

              <View style={styles.cpidMeta}>
                <View style={styles.cpidMetaItem}>
                  <Text style={styles.cpidMetaLabel}>Name</Text>
                  <Text style={styles.cpidMetaValue}>{displayName}</Text>
                </View>
                <View style={styles.cpidMetaItem}>
                  <Text style={styles.cpidMetaLabel}>Since</Text>
                  <Text style={styles.cpidMetaValue}>{memberSince || 'N/A'}</Text>
                </View>
                <View style={[styles.cpidMetaItem, { alignItems: 'flex-end' as const }]}>
                  <Text style={styles.cpidMetaLabel}>Tier</Text>
                  <Text style={[styles.cpidMetaValue, { color: CP.teal }]}>{tierConf.label}</Text>
                </View>
              </View>

              <View style={styles.cpidFooter}>
                <Text style={styles.cpidFooterText}>Verified Digital Identity</Text>
                <Ionicons name="finger-print" size={20} color={CP.teal + '55'} />
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CP.bg },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center' },

  errorText:        { fontSize: 16, fontFamily: 'Poppins_500Medium', color: CP.muted },
  goBackButton:     { marginTop: 16, paddingHorizontal: 24, paddingVertical: 11, borderRadius: 14, backgroundColor: CP.purple },
  goBackButtonText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },

  hero: { paddingBottom: 30, overflow: 'hidden' },

  arcOuter: {
    position: 'absolute', top: -90, right: -90,
    width: 240, height: 240, borderRadius: 120,
    borderWidth: 30, borderColor: CP.teal + '10',
  },
  arcInner: {
    position: 'absolute', top: -44, right: -44,
    width: 140, height: 140, borderRadius: 70,
    borderWidth: 20, borderColor: CP.purple + '10',
  },

  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  heroCenter: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 30,
  },

  avatarGlow: {
    position: 'absolute', top: -20,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: CP.teal + '0A',
    shadowColor: CP.teal,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25, shadowRadius: 40,
  },
  avatarGradientRing: {
    width: 104, height: 104, borderRadius: 52,
    padding: 3, marginBottom: 18,
    shadowColor: CP.teal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 18,
    elevation: 12,
  },
  avatarInner: {
    flex: 1, borderRadius: 50,
    backgroundColor: CP.darkMid,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 33, color: CP.teal, letterSpacing: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 74,
    alignSelf: 'center',
    marginLeft: 38,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: CP.teal,
    borderWidth: 3, borderColor: CP.dark,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: CP.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7, shadowRadius: 5,
  },

  heroName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26, color: '#FFF',
    textAlign: 'center', letterSpacing: -0.4,
  },
  heroHandle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15, color: CP.muted,
    marginTop: 3, marginBottom: 16,
  },

  heroPills: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8,
  },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50,
  },
  heroPillAccent: {
    backgroundColor: CP.teal + '16',
    borderColor: CP.teal + '35',
  },
  heroPillText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.2,
  },

  statsBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 22, paddingVertical: 20, paddingHorizontal: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  statsAccentLine: {
    position: 'absolute', top: 0, left: 30, right: 30,
    height: 1.5, opacity: 0.6,
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statNum:     { fontFamily: 'Poppins_700Bold', fontSize: 22, color: '#FFF', letterSpacing: -0.5 },
  statLabel:   { fontFamily: 'Poppins_400Regular', fontSize: 11, color: CP.muted, marginTop: 3, letterSpacing: 0.4 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },

  tierRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, paddingTop: 22, paddingBottom: 4, gap: 12,
  },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 50, borderWidth: 1.5,
  },
  tierText:        { fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  memberSince:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  memberSinceText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: Colors.textTertiary },

  section:       { paddingHorizontal: 20, marginTop: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionAccent: { width: 4, height: 22, borderRadius: 2, backgroundColor: CP.teal },
  sectionTitle:  { fontFamily: 'Poppins_700Bold', fontSize: 18, color: CP.text, letterSpacing: -0.3 },

  card: {
    backgroundColor: CP.surface,
    borderRadius: 20, padding: 20,
    shadowColor: CP.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  bioText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15, color: Colors.textSecondary, lineHeight: 26,
  },

  socialGrid: { gap: 10 },
  socialCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: CP.surface, borderRadius: 16, padding: 16,
    overflow: 'hidden',
    shadowColor: CP.dark,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  socialStrip: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 3.5, borderRadius: 2,
  },
  socialIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  socialLabel: { flex: 1, fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: CP.text },

  detailRow:      { flexDirection: 'row', alignItems: 'center', gap: 14 },
  detailIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  detailText:     { flex: 1 },
  detailLabel:    { fontFamily: 'Poppins_400Regular', fontSize: 11, color: CP.muted, letterSpacing: 0.4, marginBottom: 2 },
  detailValue:    { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: CP.text },
  detailDivider:  { height: 1, backgroundColor: CP.bg, marginVertical: 16, marginLeft: 60 },

  cpidCard: {
    borderRadius: 24, padding: 24, overflow: 'hidden',
    shadowColor: CP.purple,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35, shadowRadius: 28, elevation: 14,
  },
  cpidAccentEdge: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2.5,
  },
  cpidTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 26,
  },
  cpidLogoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cpidLogoIcon: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  cpidLogoText:    { fontFamily: 'Poppins_700Bold', fontSize: 15, color: '#FFF', letterSpacing: 0.4 },
  cpidVerifiedIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: CP.teal + '40',
    alignItems: 'center', justifyContent: 'center',
  },

  cpidCenter:    { alignItems: 'center', marginBottom: 26 },
  cpidLabel:     { fontFamily: 'Poppins_500Medium', fontSize: 9, color: CP.muted, letterSpacing: 4, marginBottom: 8 },
  cpidValue:     { fontFamily: 'Poppins_700Bold', fontSize: 30, color: '#FFF', letterSpacing: 5 },
  cpidUnderline: { width: 160, height: 1.5, marginTop: 10, opacity: 0.65 },

  cpidMeta:      { flexDirection: 'row', marginBottom: 20, gap: 8 },
  cpidMetaItem:  { flex: 1 },
  cpidMetaLabel: {
    fontFamily: 'Poppins_400Regular', fontSize: 9, color: CP.muted,
    textTransform: 'uppercase' as const, letterSpacing: 1.2, marginBottom: 4,
  },
  cpidMetaValue: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#FFF' },

  cpidFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 14,
  },
  cpidFooterText: {
    fontFamily: 'Poppins_500Medium', fontSize: 11, color: CP.muted, letterSpacing: 0.3,
  },
});
