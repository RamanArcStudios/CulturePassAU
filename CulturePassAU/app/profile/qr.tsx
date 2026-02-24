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
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import type { User, Membership } from '@shared/schema';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const QR_SIZE = Math.min(CARD_WIDTH - 80, 220);

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const TIER_CONFIG: Record<string, { colors: string[]; label: string; icon: string }> = {
  free: { colors: ['#8E8E93', '#636366'], label: 'Standard', icon: 'shield-outline' },
  plus: { colors: ['#3498DB', '#2980B9'], label: 'Plus', icon: 'star' },
  premium: { colors: ['#F39C12', '#E67E22'], label: 'Premium', icon: 'diamond' },
  pro: { colors: ['#3498DB', '#2980B9'], label: 'Pro', icon: 'star' },
  vip: { colors: ['#F39C12', '#E67E22'], label: 'VIP', icon: 'diamond' },
};

export default function QRScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const { data: usersData } = useQuery<User[]>({ queryKey: ['/api/users'] });
  const user = usersData?.[0];
  const userId = user?.id;

  const { data: membership } = useQuery<Membership>({
    queryKey: [`/api/membership/${userId}`],
    enabled: !!userId,
  });

  const tier = membership?.tier ?? 'free';
  const tierConf = TIER_CONFIG[tier] ?? TIER_CONFIG.free;
  const cpid = user?.culturePassId ?? 'CP-000000';
  const displayName = user?.displayName ?? 'CulturePass User';
  const username = user?.username ?? 'user';

  const qrValue = useMemo(() => {
    return JSON.stringify({
      type: 'culturepass_id',
      cpid,
      name: displayName,
      username,
      tier,
      verified: true,
    });
  }, [cpid, displayName, username, tier]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return 'Member';
    const d = new Date(user.createdAt);
    return `Since ${d.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}`;
  }, [user?.createdAt]);

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: `${displayName} - CulturePass Digital ID`,
        message: `My CulturePass Digital ID\n\nName: ${displayName}\nCPID: ${cpid}\nUsername: @${username}\nTier: ${capitalize(tier)}\n\nScan my QR code on CulturePass to connect!`,
      });
    } catch {}
  };

  const handleCopy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Copied!', `CulturePass ID ${cpid} copied to clipboard.`);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Digital ID</Text>
        <Pressable style={styles.headerAction} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 40 }]}
      >
        <Animated.View entering={FadeInDown.duration(500)} style={styles.cardOuter}>
          <View style={styles.card}>
            <LinearGradient
              colors={[Colors.primary, '#B8411F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardHeader}
            >
              <View style={styles.cardHeaderTop}>
                <View style={styles.logoRow}>
                  <View style={styles.logoIcon}>
                    <Ionicons name="globe" size={16} color={Colors.primary} />
                  </View>
                  <Text style={styles.logoText}>CulturePass</Text>
                </View>
                <View style={styles.tierPill}>
                  <Ionicons name={tierConf.icon as any} size={12} color="#FFF" />
                  <Text style={styles.tierPillText}>{tierConf.label}</Text>
                </View>
              </View>

              <View style={styles.userInfo}>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.userHandle}>@{username}</Text>
              </View>

              <View style={styles.headerMeta}>
                <View style={styles.metaChip}>
                  <Ionicons name="id-card-outline" size={12} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.metaChipText}>{cpid}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.metaChipText}>{memberSince}</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.qrSection}>
              <View style={styles.qrFrame}>
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />

                <View style={styles.qrInner}>
                  <QRCode
                    value={qrValue}
                    size={QR_SIZE}
                    color={Colors.text}
                    backgroundColor="#FFFFFF"
                    ecl="H"
                  />
                </View>
              </View>

              <Text style={styles.scanHint}>Scan to verify identity</Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.footerDivider} />
              <View style={styles.footerContent}>
                <View style={styles.footerLeft}>
                  <Ionicons name="shield-checkmark" size={16} color={Colors.success} />
                  <Text style={styles.footerVerified}>Verified Digital ID</Text>
                </View>
                <View style={styles.hologram}>
                  <Ionicons name="finger-print" size={18} color={Colors.primary + '40'} />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.cpidDisplay}>
          <Text style={styles.cpidLabel}>CULTUREPASS ID</Text>
          <Pressable onPress={handleCopy} style={styles.cpidRow}>
            <Text style={styles.cpidValue}>{cpid}</Text>
            <View style={styles.cpidCopyIcon}>
              <Ionicons name="copy-outline" size={16} color={Colors.primary} />
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.actionsRow}>
          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.primary }]}>
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </View>
            <Text style={styles.actionLabel}>Share</Text>
            <Text style={styles.actionSub}>Send your ID</Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handleCopy}>
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.secondary }]}>
              <Ionicons name="copy-outline" size={20} color="#FFF" />
            </View>
            <Text style={styles.actionLabel}>Copy</Text>
            <Text style={styles.actionSub}>Copy CPID</Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.accent }]}>
              <Ionicons name="download-outline" size={20} color="#FFF" />
            </View>
            <Text style={styles.actionLabel}>Save</Text>
            <Text style={styles.actionSub}>Save image</Text>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
              <Text style={styles.infoText}>
                Your CulturePass Digital ID is a unique identifier that can be scanned at events, venues, and partner locations for quick check-in and verification.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const CORNER_SIZE = 20;
const CORNER_WIDTH = 3;

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
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.small,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    color: Colors.text,
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
    paddingTop: 8,
  },
  cardOuter: {
    ...Colors.shadow.large,
    borderRadius: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  cardHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  tierPillText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: '#FFF',
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: '#FFF',
    letterSpacing: -0.3,
  },
  userHandle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  headerMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  metaChipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },

  qrSection: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  qrFrame: {
    position: 'relative',
    padding: 16,
    marginBottom: 14,
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: Colors.primary,
    borderTopLeftRadius: 6,
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: Colors.primary,
    borderTopRightRadius: 6,
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
    borderColor: Colors.primary,
    borderBottomLeftRadius: 6,
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
    borderColor: Colors.primary,
    borderBottomRightRadius: 6,
  },
  qrInner: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
  },
  scanHint: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },

  cardFooter: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  footerDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 14,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerVerified: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: Colors.success,
  },
  hologram: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cpidDisplay: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 4,
  },
  cpidLabel: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 11,
    color: Colors.textTertiary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  cpidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    ...Colors.shadow.small,
  },
  cpidValue: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: Colors.text,
    letterSpacing: 3,
  },
  cpidCopyIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    ...Colors.shadow.small,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  actionSub: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: Colors.textTertiary,
  },

  infoSection: {
    marginTop: 24,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    ...Colors.shadow.small,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
