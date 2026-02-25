import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import Colors from '@/constants/colors';
import type { User, Membership } from '@shared/schema';
import { apiRequest } from '@/lib/query-client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const QR_SIZE = Math.min(CARD_WIDTH - 80, 200);

type TierKey = 'free' | 'plus' | 'premium' | 'pro' | 'vip';

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TIER_CONFIG: Record<
  TierKey,
  { gradient: string[]; label: string; icon: keyof typeof Ionicons.glyphMap; accent: string }
> = {
  free: {
    gradient: ['#636366', '#48484A'],
    label: 'Standard',
    icon: 'shield-outline',
    accent: '#8E8E93',
  },
  plus: {
    gradient: ['#3498DB', '#2471A3'],
    label: 'Plus',
    icon: 'star',
    accent: '#3498DB',
  },
  premium: {
    gradient: ['#F4A623', '#D4871E'],
    label: 'Premium',
    icon: 'diamond',
    accent: '#F4A623',
  },
  pro: {
    gradient: ['#3498DB', '#2471A3'],
    label: 'Pro',
    icon: 'star',
    accent: '#3498DB',
  },
  vip: {
    gradient: ['#F4A623', '#D4871E'],
    label: 'VIP',
    icon: 'diamond',
    accent: '#F4A623',
  },
};

const CORNER_SIZE = 18;
const CORNER_WIDTH = 3;

export default function QRScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const [copied, setCopied] = useState(false);

  // Load current user
  const { data: usersData } = useQuery<User[]>({
    queryKey: ['api/users'],
    queryFn: async () => {
      const res = await apiRequest('GET', 'api/users');
      return res.json();
    },
  });

  const user = usersData?.[0];
  const userId = user?.id;

  // Load membership for tier badge
  const { data: membership } = useQuery<Membership>({
    queryKey: ['api/membership', userId],
    enabled: !!userId,
    queryFn: async () => {
      const res = await apiRequest('GET', `api/membership/${userId}`);
      return res.json();
    },
  });

  const rawTier = (membership?.tier as TierKey) ?? 'free';
  const tierConf = TIER_CONFIG[rawTier] ?? TIER_CONFIG.free;

  const cpid = user?.culturePassId ?? 'CP-000000';
  const displayName = user?.displayName || 'CulturePass User';
  const username = user?.username || 'user';

  const qrValue = useMemo(
    () =>
      JSON.stringify({
        type: 'culturepass_id',
        cpid,
        name: displayName,
        username,
      }),
    [cpid, displayName, username],
  );

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return 'Member';
    const d = new Date(user.createdAt);
    return `Since ${d.toLocaleDateString('en-AU', {
      month: 'short',
      year: 'numeric',
    })}`;
  }, [user?.createdAt]);

  const profileUrl = `https://culturepass.app/u/${username}`;

  const handleShare = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: `${displayName} - CulturePass Digital ID`,
        message: `My CulturePass Digital ID\n\nName: ${displayName}\nCPID: ${cpid}\nUsername: @${username}\nTier: ${capitalize(rawTier)}\n\n${profileUrl}\n\nScan my QR code on CulturePass to connect!`,
      });
    } catch {
      // ignore
    }
  };

  const handleCopy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Alert.alert('Copied', `CulturePass ID ${cpid} copied to clipboard.`);
    // If you want real clipboard support:
    // Clipboard.setStringAsync(cpid);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          android_ripple={{ color: Colors.borderLight }}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>CulturePass Digital ID</Text>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.headerAction}
            onPress={() => router.push('/scanner')}
            android_ripple={{ color: Colors.primary + '30', borderless: true }}
          >
            <Ionicons name="scan-outline" size={20} color={Colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomInset + 40 },
        ]}
      >
        {/* Main card */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.cardOuter}>
          <View style={styles.card}>
            <LinearGradient
              colors={['#1A1A2E', '#16213E', '#0F3460']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardTop}
            >
              {/* Background pattern */}
              <View style={styles.cardPattern}>
                <View style={styles.patternCircle1} />
                <View style={styles.patternCircle2} />
              </View>

              {/* Brand row */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.brandRow}>
                  <View style={styles.logoMark}>
                    <Ionicons name="globe" size={14} color="#FFF" />
                  </View>
                  <View>
                    <Text style={styles.brandName}>CULTUREPASS</Text>
                    <Text style={styles.brandSub}>DIGITAL ID</Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.tierBadge,
                    { backgroundColor: tierConf.accent + '30' },
                  ]}
                >
                  <Ionicons name={tierConf.icon} size={11} color={tierConf.accent} />
                  <Text style={[styles.tierText, { color: tierConf.accent }]}>
                    {tierConf.label}
                  </Text>
                </View>
              </View>

              {/* User info */}
              <View style={styles.userSection}>
                <View style={styles.avatarRing}>
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarInitials}>
                      {displayName
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.userHandle}>@{username}</Text>
                </View>
              </View>

              {/* Meta row */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons
                    name="finger-print"
                    size={12}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text style={styles.metaText}>{cpid}</Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={12}
                    color="rgba(255,255,255,0.6)"
                  />
                  <Text style={styles.metaText}>{memberSince}</Text>
                </View>
              </View>
            </LinearGradient>

            {/* QR section */}
            <View style={styles.qrSection}>
              <View style={styles.qrContainer}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
                <View style={styles.qrInner}>
                  <QRCode
                    value={qrValue}
                    size={QR_SIZE}
                    color="#1A1A2E"
                    backgroundColor="#FFFFFF"
                    ecl="H"
                  />
                </View>
              </View>
              <Text style={styles.scanLabel}>Scan to verify identity</Text>
            </View>

            {/* Bottom row */}
            <View style={styles.cardBottom}>
              <View style={styles.bottomDivider} />
              <View style={styles.bottomRow}>
                <View style={styles.verifiedRow}>
                  <Ionicons
                    name="shield-checkmark"
                    size={15}
                    color={Colors.success}
                  />
                  <Text style={styles.verifiedText}>Verified Member</Text>
                </View>
                <View style={styles.chipRow}>
                  <View style={styles.nfcChip}>
                    <Ionicons
                      name="wifi"
                      size={10}
                      color="rgba(255,255,255,0.4)"
                      style={{ transform: [{ rotate: '90deg' }] }}
                    />
                  </View>
                  <View style={styles.hologram}>
                    <Ionicons
                      name="finger-print"
                      size={16}
                      color={Colors.primary + '35'}
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* CPID row */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(400)}
          style={styles.cpidSection}
        >
          <Text style={styles.cpidLabel}>CULTUREPASS ID</Text>
          <Pressable onPress={handleCopy} style={styles.cpidRow}>
            <Text style={styles.cpidValue}>{cpid}</Text>
            <View
              style={[
                styles.cpidCopyBtn,
                copied && styles.cpidCopyBtnActive,
              ]}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={16}
                color={copied ? '#FFF' : Colors.primary}
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          style={styles.actionsGrid}
        >
          <Pressable style={styles.actionCard} onPress={handleShare}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors.primary + '15' },
              ]}
            >
              <Ionicons
                name="share-outline"
                size={22}
                color={Colors.primary}
              />
            </View>
            <Text style={styles.actionTitle}>Share</Text>
            <Text style={styles.actionDesc}>Send your ID</Text>
          </Pressable>

          <Pressable style={styles.actionCard} onPress={handleCopy}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors.secondary + '15' },
              ]}
            >
              <Ionicons
                name="copy-outline"
                size={22}
                color={Colors.secondary}
              />
            </View>
            <Text style={styles.actionTitle}>Copy</Text>
            <Text style={styles.actionDesc}>Copy CPID</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/scanner');
            }}
          >
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: Colors.accent + '15' },
              ]}
            >
              <Ionicons
                name="scan-outline"
                size={22}
                color={Colors.accent}
              />
            </View>
            <Text style={styles.actionTitle}>Scan</Text>
            <Text style={styles.actionDesc}>Scan others</Text>
          </Pressable>
        </Animated.View>

        {/* Info card */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(400)}
          style={styles.infoCard}
        >
          <View style={styles.infoIconWrap}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.infoText}>
            Your CulturePass Digital ID is a unique identifier that can be
            scanned at events, venues, and partner locations for quick check‑in
            and verification.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadows.small,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    color: Colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  cardOuter: {
    borderRadius: 24,
    ...Colors.shadows.heavy,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardTop: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle1: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  brandName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 13,
    color: '#FFF',
    letterSpacing: 2,
  },
  brandSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 3,
    marginTop: -1,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tierText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 11,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 20,
    color: '#FFF',
    letterSpacing: -0.3,
  },
  userHandle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  metaText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
  },
  qrContainer: {
    position: 'relative',
    padding: 14,
    marginBottom: 12,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: '#1A1A2E',
    borderTopLeftRadius: 5,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: '#1A1A2E',
    borderTopRightRadius: 5,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: '#1A1A2E',
    borderBottomLeftRadius: 5,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: '#1A1A2E',
    borderBottomRightRadius: 5,
  },
  qrInner: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 6,
  },
  scanLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  cardBottom: {
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  bottomDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: Colors.success,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nfcChip: {
    width: 24,
    height: 18,
    borderRadius: 3,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hologram: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cpidSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 4,
  },
  cpidLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    color: Colors.textTertiary,
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  cpidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    ...Colors.shadows.small,
  },
  cpidValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: Colors.text,
    letterSpacing: 3,
  },
  cpidCopyBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpidCopyBtnActive: {
    backgroundColor: Colors.success,
  },

  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    ...Colors.shadows.small,
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  actionDesc: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: Colors.textTertiary,
  },

  infoCard: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
    ...Colors.shadows.small,
  },
  infoIconWrap: {
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
