import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Linking, ActivityIndicator, Share, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { User, Membership } from '@shared/schema';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';

const { width: SCREEN_W } = Dimensions.get('window');

const SOCIAL_ICONS: { key: string; icon: keyof typeof Ionicons.glyphMap; label: string; color: string }[] = [
  { key: 'instagram', icon: 'logo-instagram', label: 'Instagram', color: '#E1306C' },
  { key: 'twitter', icon: 'logo-twitter', label: 'Twitter', color: '#1DA1F2' },
  { key: 'linkedin', icon: 'logo-linkedin', label: 'LinkedIn', color: '#0077B5' },
  { key: 'facebook', icon: 'logo-facebook', label: 'Facebook', color: '#1877F2' },
];

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function formatMemberDate(dateStr: string | Date | null) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' });
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

const TIER_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  free: { color: '#8E8E93', label: 'Standard', icon: 'shield-outline' },
  plus: { color: '#3498DB', label: 'Plus', icon: 'star' },
  pro: { color: '#3498DB', label: 'Pro', icon: 'star' },
  premium: { color: '#F39C12', label: 'Premium', icon: 'diamond' },
  vip: { color: '#F39C12', label: 'VIP', icon: 'diamond' },
};

export default function PublicProfileScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: usersData, isLoading } = useQuery<User[]>({ queryKey: ['/api/users'] });
  const user = usersData?.[0];
  const userId = user?.id;

  const { data: membership } = useQuery<Membership>({
    queryKey: [`/api/membership/${userId}`],
    enabled: !!userId,
  });

  const tier = membership?.tier ?? 'free';
  const tierConf = TIER_CONFIG[tier] ?? TIER_CONFIG.free;

  const socialLinks = useMemo(() => (user?.socialLinks || {}) as Record<string, string | undefined>, [user?.socialLinks]);
  const activeSocials = useMemo(() => SOCIAL_ICONS.filter(s => socialLinks[s.key]), [socialLinks]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Profile not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const locationText = [user.city, user.country].filter(Boolean).join(', ');
  const displayName = user.displayName ?? 'CulturePass User';
  const initials = getInitials(displayName);
  const memberSince = formatMemberDate(user.createdAt);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `Check out ${displayName}'s profile on CulturePass!\n\nCPID: ${user.culturePassId}\n@${user.username}`,
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 40 }}>
        <LinearGradient
          colors={[Colors.primary, '#A33D1E', '#7A2E17']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.hero, { paddingTop: topInset + 8 }]}
        >
          <View style={styles.heroNav}>
            <Pressable style={styles.navBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#FFF" />
            </Pressable>
            <Text style={styles.navTitle}>Profile</Text>
            <Pressable style={styles.navBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </Pressable>
          </View>

          <View style={styles.heroCenter}>
            <View style={styles.avatarOuter}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              </View>
              {user.isVerified && (
                <View style={styles.verifiedDot}>
                  <Ionicons name="checkmark" size={12} color="#FFF" />
                </View>
              )}
            </View>

            <Text style={styles.heroName}>{displayName}</Text>
            {user.username && <Text style={styles.heroHandle}>@{user.username}</Text>}

            <View style={styles.heroPills}>
              {user.culturePassId && (
                <View style={styles.heroPill}>
                  <Ionicons name="finger-print" size={13} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroPillText}>{user.culturePassId}</Text>
                </View>
              )}
              {locationText ? (
                <View style={styles.heroPill}>
                  <Ionicons name="location" size={13} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroPillText}>{locationText}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.statsBar}>
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
          </View>
        </LinearGradient>

        <View style={styles.tierRow}>
          <View style={[styles.tierBadge, { backgroundColor: tierConf.color + '12', borderColor: tierConf.color + '30' }]}>
            <Ionicons name={tierConf.icon as any} size={16} color={tierConf.color} />
            <Text style={[styles.tierText, { color: tierConf.color }]}>{tierConf.label} Member</Text>
          </View>
          {memberSince ? (
            <View style={styles.memberSince}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.memberSinceText}>Since {memberSince}</Text>
            </View>
          ) : null}
        </View>

        {user.bio ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
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
          <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Social</Text>
            </View>
            <View style={styles.socialGrid}>
              {activeSocials.map(s => (
                <Pressable
                  key={s.key}
                  style={styles.socialCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const url = socialLinks[s.key];
                    if (url) Linking.openURL(url);
                  }}
                >
                  <View style={[styles.socialIconWrap, { backgroundColor: s.color + '12' }]}>
                    <Ionicons name={s.icon as any} size={22} color={s.color} />
                  </View>
                  <Text style={styles.socialLabel}>{s.label}</Text>
                  <Ionicons name="open-outline" size={14} color={Colors.textTertiary} />
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {(locationText || user.website) ? (
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Details</Text>
            </View>
            <View style={styles.card}>
              {locationText ? (
                <View style={styles.detailRow}>
                  <View style={[styles.detailIconWrap, { backgroundColor: Colors.primary + '10' }]}>
                    <Ionicons name="location" size={18} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{locationText}</Text>
                  </View>
                </View>
              ) : null}
              {user.website ? (
                <>
                  {locationText && <View style={styles.detailDivider} />}
                  <Pressable style={styles.detailRow} onPress={() => Linking.openURL(user.website!)}>
                    <View style={[styles.detailIconWrap, { backgroundColor: Colors.secondary + '10' }]}>
                      <Ionicons name="globe-outline" size={18} color={Colors.secondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Website</Text>
                      <Text style={[styles.detailValue, { color: Colors.primary }]}>{user.website}</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color={Colors.textTertiary} />
                  </Pressable>
                </>
              ) : null}
              {user.phone ? (
                <>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconWrap, { backgroundColor: Colors.accent + '10' }]}>
                      <Ionicons name="call-outline" size={18} color={Colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Phone</Text>
                      <Text style={styles.detailValue}>{user.phone}</Text>
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          </Animated.View>
        ) : null}

        {user.culturePassId && (
          <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Digital Identity</Text>
            </View>
            <LinearGradient
              colors={[Colors.primary, '#A33D1E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cpidCard}
            >
              <View style={styles.cpidTop}>
                <View style={styles.cpidLogoRow}>
                  <View style={styles.cpidLogoIcon}>
                    <Ionicons name="globe" size={14} color={Colors.primary} />
                  </View>
                  <Text style={styles.cpidLogoText}>CulturePass</Text>
                </View>
                <View style={styles.cpidVerified}>
                  <Ionicons name="shield-checkmark" size={14} color="#FFF" />
                </View>
              </View>

              <View style={styles.cpidCenter}>
                <Text style={styles.cpidLabel}>CULTUREPASS ID</Text>
                <Text style={styles.cpidValue}>{user.culturePassId}</Text>
              </View>

              <View style={styles.cpidBottom}>
                <View style={styles.cpidMeta}>
                  <Text style={styles.cpidMetaLabel}>Name</Text>
                  <Text style={styles.cpidMetaValue}>{displayName}</Text>
                </View>
                <View style={styles.cpidMeta}>
                  <Text style={styles.cpidMetaLabel}>Since</Text>
                  <Text style={styles.cpidMetaValue}>{memberSince || 'N/A'}</Text>
                </View>
              </View>

              <View style={styles.cpidFooter}>
                <Text style={styles.cpidFooterText}>Verified Digital Identity</Text>
                <Ionicons name="finger-print" size={16} color="rgba(255,255,255,0.35)" />
              </View>
            </LinearGradient>

            <Pressable
              style={styles.viewQrBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/profile/qr');
              }}
            >
              <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
              <Text style={styles.viewQrText}>View QR Code</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorText: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  backLink: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginTop: 12 },

  hero: {
    paddingBottom: 24,
  },
  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: '#FFF',
  },

  heroCenter: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  avatarOuter: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 30,
    color: '#FFF',
    letterSpacing: 1,
  },
  verifiedDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.success,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  heroHandle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    marginBottom: 12,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroPillText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 0.3,
  },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#FFF',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
    gap: 12,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  tierText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  memberSinceText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textTertiary,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: Colors.text,
    letterSpacing: -0.3,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    ...Colors.shadow.small,
  },
  bioText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  socialGrid: {
    gap: 10,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    ...Colors.shadow.small,
  },
  socialIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialLabel: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: Colors.text,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
  },
  detailValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: Colors.text,
    marginTop: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 14,
    marginLeft: 58,
  },

  cpidCard: {
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
  },
  cpidTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cpidLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cpidLogoIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpidLogoText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 15,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  cpidVerified: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpidCenter: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cpidLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    marginBottom: 6,
  },
  cpidValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: '#FFF',
    letterSpacing: 4,
  },
  cpidBottom: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  cpidMeta: {
    flex: 1,
  },
  cpidMetaLabel: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  cpidMetaValue: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#FFF',
  },
  cpidFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 14,
  },
  cpidFooterText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },

  viewQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    ...Colors.shadow.small,
  },
  viewQrText: {
    flex: 1,
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: Colors.text,
  },
});
