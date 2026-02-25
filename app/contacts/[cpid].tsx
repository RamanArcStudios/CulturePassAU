import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useContacts } from '@/contexts/ContactsContext';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useCallback } from 'react';

const isWeb = Platform.OS === 'web';

const TIER_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
  free: { label: 'Standard', color: Colors.textSecondary, icon: 'shield-outline' },
  plus: { label: 'Plus', color: '#3498DB', icon: 'star' },
  premium: { label: 'Premium', color: '#F39C12', icon: 'diamond' },
};

export default function ContactDetailScreen() {
  const { cpid } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  const { getContact, removeContact } = useContacts();

  const contact = getContact(cpid as string);

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (!contact) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const profileUrl = contact.username ? `https://culturepass.app/u/${contact.username}` : '';
    const message = `Check out ${contact.name || contact.cpid} on CulturePass!\nCPID: ${contact.cpid}${profileUrl ? `\n\n${profileUrl}` : ''}`;

    try {
      if (isWeb) {
        if (navigator?.share) {
          await navigator.share({
            title: `${contact.name} on CulturePass`,
            text: message,
            url: profileUrl || undefined,
          });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(profileUrl || contact.cpid);
          Alert.alert('Copied', 'Contact information copied to clipboard');
        }
      } else {
        await Share.share({
          title: `${contact.name} on CulturePass`,
          message,
          url: profileUrl || undefined,
        });
      }

      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      if (error?.message && !error.message.includes('cancel')) {
        console.error('Share error:', error);
      }
    }
  }, [contact]);

  const handleRemove = useCallback(() => {
    if (!contact) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      'Remove Contact',
      `Remove ${contact.name || contact.cpid} from your saved contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (!isWeb) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            removeContact(contact.cpid);
            handleBack();
          },
        },
      ]
    );
  }, [contact, removeContact, handleBack]);

  const handleViewProfile = useCallback(() => {
    if (!contact?.userId) {
      Alert.alert('Profile Unavailable', 'Full profile is not available for this contact.');
      return;
    }

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    router.push({ pathname: '/user/[id]', params: { id: contact.userId } });
  }, [contact]);

  const handleOpenLocation = useCallback(() => {
    if (!contact?.city) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const query = `${contact.city}${contact.country ? `, ${contact.country}` : ''}`;
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(query)}`).catch((err) => {
      console.error('Failed to open maps:', err);
      Alert.alert('Error', 'Unable to open maps');
    });
  }, [contact]);

  const handleCopyCPID = useCallback(() => {
    if (!contact) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isWeb) {
      if (navigator?.clipboard) {
        navigator.clipboard.writeText(contact.cpid);
        Alert.alert('Copied', 'CPID copied to clipboard');
      }
    } else {
      // For native, we'll use Share with just the CPID
      Share.share({ message: contact.cpid });
    }
  }, [contact]);

  if (!contact) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="person-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.notFoundText}>Contact not found</Text>
        <Pressable
          style={styles.backLink}
          onPress={handleBack}
          android_ripple={{ color: '#FFF3' }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backLinkText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const tier = TIER_DISPLAY[contact.tier || 'free'] || TIER_DISPLAY.free;
  const initials = (contact.name || contact.cpid)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const savedDate = new Date(contact.savedAt).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
          android_ripple={{ color: Colors.primary + '20', radius: 19 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Contact</Text>
        <Pressable
          style={styles.headerAction}
          onPress={handleShare}
          android_ripple={{ color: Colors.primary + '30', radius: 19 }}
          accessibilityRole="button"
          accessibilityLabel="Share contact"
        >
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + bottomInset }]}
      >
        <Animated.View entering={isWeb ? undefined : FadeIn.duration(600)} style={styles.profileCard}>
          <View style={[styles.avatar, { borderColor: tier.color + '40' }]}>
            <Text style={[styles.avatarText, { color: tier.color }]}>{initials}</Text>
          </View>

          <Text style={styles.name}>{contact.name || 'CulturePass User'}</Text>
          {contact.username && <Text style={styles.username}>@{contact.username}</Text>}

          <View style={styles.chipRow}>
            <Pressable
              style={styles.cpidChip}
              onPress={handleCopyCPID}
              android_ripple={{ color: Colors.primary + '20' }}
              accessibilityRole="button"
              accessibilityLabel="Copy CPID"
            >
              <Ionicons name="finger-print" size={14} color={Colors.primary} />
              <Text style={styles.cpidText}>{contact.cpid}</Text>
              <Ionicons name="copy-outline" size={12} color={Colors.primary} />
            </Pressable>
            <View style={[styles.tierChip, { backgroundColor: tier.color + '15' }]}>
              <Ionicons name={tier.icon as any} size={12} color={tier.color} />
              <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(400)} style={styles.section}>
          {contact.bio && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.infoValue}>{contact.bio}</Text>
            </View>
          )}

          {contact.city && (
            <Pressable
              style={styles.infoCard}
              onPress={handleOpenLocation}
              android_ripple={{ color: Colors.primary + '10' }}
              accessibilityRole="button"
              accessibilityLabel={`Open location: ${contact.city}${contact.country ? `, ${contact.country}` : ''}`}
            >
              <Text style={styles.infoLabel}>Location</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={Colors.primary} />
                <Text style={[styles.infoValue, { color: Colors.primary }]}>
                  {contact.city}
                  {contact.country ? `, ${contact.country}` : ''}
                </Text>
                <Ionicons name="open-outline" size={12} color={Colors.textTertiary} />
              </View>
            </Pressable>
          )}

          {contact.org && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Organization</Text>
              <View style={styles.locationRow}>
                <Ionicons name="business-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoValue}>{contact.org}</Text>
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Saved</Text>
            <View style={styles.locationRow}>
              <Ionicons name="bookmark" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoValue}>{savedDate}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(200).duration(400)} style={styles.actionsSection}>
          <Text style={styles.actionsSectionTitle}>Actions</Text>

          {contact.userId && (
            <Pressable
              style={styles.actionBtn}
              onPress={handleViewProfile}
              android_ripple={{ color: Colors.primary + '10' }}
              accessibilityRole="button"
              accessibilityLabel="View full profile"
            >
              <View style={[styles.actionIconBg, { backgroundColor: Colors.primary + '10' }]}>
                <Ionicons name="person-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={[styles.actionBtnText, { color: Colors.primary }]}>View Full Profile</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </Pressable>
          )}

          <Pressable
            style={styles.actionBtn}
            onPress={handleShare}
            android_ripple={{ color: Colors.secondary + '10' }}
            accessibilityRole="button"
            accessibilityLabel="Share contact"
          >
            <View style={[styles.actionIconBg, { backgroundColor: Colors.secondary + '10' }]}>
              <Ionicons name="share-outline" size={20} color={Colors.secondary} />
            </View>
            <Text style={[styles.actionBtnText, { color: Colors.secondary }]}>Share Contact</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </Pressable>

          <Pressable
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={handleRemove}
            android_ripple={{ color: Colors.error + '10' }}
            accessibilityRole="button"
            accessibilityLabel="Remove contact"
          >
            <View style={[styles.actionIconBg, { backgroundColor: Colors.error + '10' }]}>
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </View>
            <Text style={[styles.actionBtnText, { color: Colors.error }]}>Remove Contact</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </Pressable>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.small,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },

  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    ...Colors.shadow.small,
  },

  scrollContent: {
    paddingTop: 8,
  },

  profileCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    ...Colors.shadow.medium,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    marginBottom: 16,
  },

  avatarText: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
  },

  name: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },

  username: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },

  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
  },

  cpidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },

  cpidText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    letterSpacing: 0.3,
  },

  tierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },

  tierText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },

  section: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    ...Colors.shadow.small,
  },

  infoLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textTertiary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  infoValue: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    lineHeight: 22,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  actionsSection: {
    marginHorizontal: 20,
    marginTop: 24,
    gap: 8,
  },

  actionsSectionTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 4,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    ...Colors.shadow.small,
  },

  actionBtnDanger: {
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },

  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionBtnText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },

  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
    padding: 24,
  },

  notFoundText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },

  backLink: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    ...Colors.shadow.small,
  },

  backLinkText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
});
