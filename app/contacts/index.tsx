import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useContacts, SavedContact } from '@/contexts/ContactsContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCallback, useMemo, useState } from 'react';

const TIER_COLORS: Record<string, string> = {
  free: Colors.textSecondary,
  plus: '#3498DB',
  premium: '#F39C12',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

function ContactItem({ contact, onPress, onRemove }: { contact: SavedContact; onPress: () => void; onRemove: () => void }) {
  const initials = (contact.name || contact.cpid)
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tierColor = TIER_COLORS[contact.tier || 'free'] || Colors.textSecondary;

  return (
    <Pressable style={styles.contactItem} onPress={onPress}>
      <View style={[styles.contactAvatar, { borderColor: tierColor + '40' }]}>
        <Text style={[styles.contactInitials, { color: tierColor }]}>{initials}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>{contact.name || 'CulturePass User'}</Text>
        <View style={styles.contactMeta}>
          <View style={styles.cpidMini}>
            <Ionicons name="finger-print" size={10} color={Colors.primary} />
            <Text style={styles.cpidMiniText}>{contact.cpid}</Text>
          </View>
          {contact.city && (
            <Text style={styles.contactLocation} numberOfLines={1}>
              {contact.city}{contact.country ? `, ${contact.country}` : ''}
            </Text>
          )}
        </View>
        <Text style={styles.contactSavedAt}>Saved {timeAgo(contact.savedAt)}</Text>
      </View>
      <Pressable
        style={styles.removeBtn}
        onPress={(e) => {
          e.stopPropagation?.();
          onRemove();
        }}
      >
        <Ionicons name="trash-outline" size={16} color={Colors.error} />
      </Pressable>
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    </Pressable>
  );
}

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const { contacts, removeContact, clearContacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.cpid?.toLowerCase().includes(q) ||
      c.username?.toLowerCase().includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const handleRemove = useCallback((contact: SavedContact) => {
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
          },
        },
      ]
    );
  }, [removeContact]);

  const handleClearAll = useCallback(() => {
    if (contacts.length === 0) return;
    Alert.alert(
      'Clear All Contacts',
      `Remove all ${contacts.length} saved contacts? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); clearContacts(); } },
      ]
    );
  }, [contacts.length, clearContacts]);

  const handleContactPress = useCallback((contact: SavedContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/contacts/[cpid]' as any, params: { cpid: contact.cpid } });
  }, []);

  const renderItem = useCallback(({ item }: { item: SavedContact }) => (
    <ContactItem
      contact={item}
      onPress={() => handleContactPress(item)}
      onRemove={() => handleRemove(item)}
    />
  ), [handleContactPress, handleRemove]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Contacts</Text>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.headerAction}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/scanner'); }}
          >
            <Ionicons name="scan-outline" size={20} color={Colors.primary} />
          </Pressable>
          {contacts.length > 0 && (
            <Pressable style={styles.headerAction} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </Pressable>
          )}
        </View>
      </View>

      <Animated.View entering={FadeInDown.duration(300)} style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{contacts.length}</Text>
          <Text style={styles.statLabel}>Contacts</Text>
        </View>
        <View style={styles.statDivider} />
        <Pressable
          style={styles.scanCta}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/scanner'); }}
        >
          <Ionicons name="camera-outline" size={18} color="#FFF" />
          <Text style={styles.scanCtaText}>Scan Card</Text>
        </Pressable>
      </Animated.View>

      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No saved contacts</Text>
          <Text style={styles.emptySub}>Scan CulturePass QR codes to save contacts and keep a copy of their CPID</Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/scanner'); }}
          >
            <Ionicons name="scan-outline" size={18} color="#FFF" />
            <Text style={styles.emptyBtnText}>Open Scanner</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={item => item.cpid}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 + bottomInset, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!!filteredContacts.length}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
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
  headerRight: { flexDirection: 'row', gap: 8 },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    ...Colors.shadow.small,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.text },
  statLabel: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.borderLight, marginHorizontal: 16 },
  scanCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  scanCtaText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  contactInitials: { fontSize: 16, fontFamily: 'Poppins_700Bold' },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  contactMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  cpidMini: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cpidMiniText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.primary },
  contactLocation: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  contactSavedAt: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, marginTop: 2 },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.error + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: { height: 1, backgroundColor: Colors.borderLight },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  emptySub: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
});
