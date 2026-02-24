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
import { useLocalSearchParams, router } from 'expo-router';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useContacts } from '@/contexts/ContactsContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCallback } from 'react';

const TIER_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
  free: { label: 'Standard', color: Colors.textSecondary, icon: 'shield-outline' },
  plus: { label: 'Plus', color: '#3498DB', icon: 'star' },
  premium: { label: 'Premium', color: '#F39C12', icon: 'diamond' },
};

export default function ContactDetailScreen() {
  const { cpid } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const { getContact, removeContact } = useContacts();

  const contact = getContact(cpid as string);

  const handleShare = useCallback(async () => {
    if (!contact) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const profileUrl = contact.username ? `https://culturepass.app/u/${contact.username}` : '';
    try {
      await Share.share({
        title: `${contact.name} on CulturePass`,
        message: `Check out ${contact.name || contact.cpid} on CulturePass!\nCPID: ${contact.cpid}${profileUrl ? `\n\n${profileUrl}` : ''}`,
        url: profileUrl || undefined,
      });
    } catch {}
  }, [contact]);

  const handleRemove = useCallback(() => {
    if (!contact) return;
    Alert.alert(
      'Remove Contact',
      `Remove ${contact.name || contact.cpid} from your saved contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            removeContact(contact.cpid);
            router.back();
          },
        },
      ]
    );
  }, [contact, removeContact]);

  const handleViewProfile = useCallback(() => {
    if (!contact?.userId) {
      Alert.alert('Profile', 'Full profile is not available for this contact.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/profile/[id]', params: { id: contact.userId } });
  }, [contact]);

  const handleOpenLocation = useCallback(() => {
    if (!contact?.city) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const query = `${contact.city}${contact.country ? `, ${contact.country}` : ''}`;
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(query)}`);
  }, [contact]);

  if (!contact) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="person-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.notFoundText}>Contact not found</Text>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const tier = TIER_DISPLAY[contact.tier || 'free'] || TIER_DISPLAY.free;
  const initials = (contact.name || contact.cpid)
    .split(' ')
    .map(w => w[0])
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
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Contact</Text>
        <Pressable style={styles.headerAction} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 + bottomInset }}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.profileCard}>
          <View style={[styles.avatar, { borderColor: tier.color + '40' }]}>
            <Text style={[styles.avatarText, { color: tier.color }]}>{initials}</Text>
          </View>

          <Text style={styles.name}>{contact.name || 'CulturePass User'}</Text>
          {contact.username && <Text style={styles.username}>@{contact.username}</Text>}

          <View style={styles.chipRow}>
            <View style={styles.cpidChip}>
              <Ionicons name="finger-print" size={14} color={Colors.primary} />
              <Text style={styles.cpidText}>{contact.cpid}</Text>
            </View>
            <View style={[styles.tierChip, { backgroundColor: tier.color + '15' }]}>
              <Ionicons name={tier.icon as any} size={12} color={tier.color} />
              <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          {contact.bio && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.infoValue}>{contact.bio}</Text>
            </View>
          )}

          {contact.city && (
            <Pressable style={styles.infoCard} onPress={handleOpenLocation}>
              <Text style={styles.infoLabel}>Location</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={Colors.primary} />
                <Text style={[styles.infoValue, { color: Colors.primary }]}>
                  {contact.city}{contact.country ? `, ${contact.country}` : ''}
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
            <Text style={styles.infoValue}>{savedDate}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.actionsSection}>
          {contact.userId && (
            <Pressable style={styles.actionBtn} onPress={handleViewProfile}>
              <Ionicons name="person-outline" size={20} color={Colors.primary} />
              <Text style={[styles.actionBtnText, { color: Colors.primary }]}>View Full Profile</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </Pressable>
          )}

          <Pressable style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color={Colors.secondary} />
            <Text style={[styles.actionBtnText, { color: Colors.secondary }]}>Share Contact</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </Pressable>

          <Pressable style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleRemove}>
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
            <Text style={[styles.actionBtnText, { color: Colors.error }]}>Remove Contact</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
          </Pressable>
        </Animated.View>
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
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
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
  avatarText: { fontSize: 28, fontFamily: 'Poppins_700Bold' },
  name: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.text, textAlign: 'center' },
  username: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 2 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  cpidChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  cpidText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  tierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tierText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold' },

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
  infoLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textTertiary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text, lineHeight: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  actionsSection: {
    marginHorizontal: 20,
    marginTop: 24,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    ...Colors.shadow.small,
  },
  actionBtnDanger: {
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  actionBtnText: { flex: 1, fontSize: 15, fontFamily: 'Poppins_600SemiBold' },

  notFoundText: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginTop: 12 },
  backLink: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.primary },
  backLinkText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
});
