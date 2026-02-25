import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
  FlatList,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useContacts, SavedContact } from '@/contexts/ContactsContext';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCallback, useMemo, useState } from 'react';

const isWeb = Platform.OS === 'web';

const TIER_COLORS: Record<string, string> = {
  free: Colors.textSecondary,
  plus: '#3498DB',
  premium: '#F39C12',
};

type SortOption = 'recent' | 'name' | 'tier';

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

function ContactItem({
  contact,
  onPress,
  onRemove,
}: {
  contact: SavedContact;
  onPress: () => void;
  onRemove: () => void;
}) {
  const initials = (contact.name || contact.cpid)
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const tierColor = TIER_COLORS[contact.tier || 'free'] || Colors.textSecondary;

  return (
    <Pressable
      style={styles.contactItem}
      onPress={onPress}
      android_ripple={{ color: Colors.primary + '10' }}
      accessibilityRole="button"
      accessibilityLabel={`View contact ${contact.name || contact.cpid}`}
    >
      <View style={[styles.contactAvatar, { borderColor: tierColor + '40' }]}>
        <Text style={[styles.contactInitials, { color: tierColor }]}>{initials}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName} numberOfLines={1}>
          {contact.name || 'CulturePass User'}
        </Text>
        <View style={styles.contactMeta}>
          <View style={styles.cpidMini}>
            <Ionicons name="finger-print" size={10} color={Colors.primary} />
            <Text style={styles.cpidMiniText}>{contact.cpid}</Text>
          </View>
          {contact.city && (
            <Text style={styles.contactLocation} numberOfLines={1}>
              {contact.city}
              {contact.country ? `, ${contact.country}` : ''}
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
        android_ripple={{ color: Colors.error + '20', radius: 16 }}
        accessibilityRole="button"
        accessibilityLabel="Remove contact"
      >
        <Ionicons name="trash-outline" size={16} color={Colors.error} />
      </Pressable>
      <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
    </Pressable>
  );
}

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  const { contacts, removeContact, clearContacts } = useContacts();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [refreshing, setRefreshing] = useState(false);

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;

    setRefreshing(true);

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Simulate refresh (in real app, re-fetch contacts or sync)
    await new Promise((resolve) => setTimeout(resolve, 800));

    setRefreshing(false);

    if (!isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [refreshing]);

  const sortedAndFilteredContacts = useMemo(() => {
    let result = [...contacts];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.cpid?.toLowerCase().includes(q) ||
          c.username?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.country?.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => {
          const nameA = (a.name || a.cpid).toLowerCase();
          const nameB = (b.name || b.cpid).toLowerCase();
          return nameA.localeCompare(nameB);
        });
        break;

      case 'tier':
        const tierOrder = { premium: 0, plus: 1, free: 2 };
        result.sort((a, b) => {
          const tierA = tierOrder[a.tier || 'free'];
          const tierB = tierOrder[b.tier || 'free'];
          if (tierA !== tierB) return tierA - tierB;
          // Secondary sort by name
          return (a.name || a.cpid).localeCompare(b.name || b.cpid);
        });
        break;

      case 'recent':
      default:
        result.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        break;
    }

    return result;
  }, [contacts, searchQuery, sortBy]);

  const handleRemove = useCallback(
    (contact: SavedContact) => {
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
            },
          },
        ]
      );
    },
    [removeContact]
  );

  const handleClearAll = useCallback(() => {
    if (contacts.length === 0) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      'Clear All Contacts',
      `Remove all ${contacts.length} saved contacts? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            if (!isWeb) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            clearContacts();
          },
        },
      ]
    );
  }, [contacts.length, clearContacts]);

  const handleContactPress = useCallback((contact: SavedContact) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/contacts/[cpid]' as any, params: { cpid: contact.cpid } });
  }, []);

  const handleScanPress = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/scanner');
  }, []);

  const handleSortChange = useCallback((newSort: SortOption) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSortBy(newSort);
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: SavedContact; index: number }) => (
      <Animated.View entering={isWeb ? undefined : FadeInDown.delay(index * 50).duration(400)}>
        <ContactItem
          contact={item}
          onPress={() => handleContactPress(item)}
          onRemove={() => handleRemove(item)}
        />
      </Animated.View>
    ),
    [handleContactPress, handleRemove]
  );

  const keyExtractor = useCallback((item: SavedContact) => item.cpid, []);

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

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
        <Text style={styles.headerTitle}>Contacts</Text>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.headerAction}
            onPress={handleScanPress}
            android_ripple={{ color: Colors.primary + '30', radius: 19 }}
            accessibilityRole="button"
            accessibilityLabel="Open scanner"
          >
            <Ionicons name="scan-outline" size={20} color={Colors.primary} />
          </Pressable>
          {contacts.length > 0 && (
            <Pressable
              style={styles.headerAction}
              onPress={handleClearAll}
              android_ripple={{ color: Colors.error + '20', radius: 19 }}
              accessibilityRole="button"
              accessibilityLabel="Clear all contacts"
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </Pressable>
          )}
        </View>
      </View>

      {contacts.length > 0 && (
        <>
          <Animated.View entering={isWeb ? undefined : FadeInDown.duration(300)} style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{contacts.length}</Text>
              <Text style={styles.statLabel}>Contacts</Text>
            </View>
            <View style={styles.statDivider} />
            <Pressable
              style={styles.scanCta}
              onPress={handleScanPress}
              android_ripple={{ color: '#FFF3' }}
              accessibilityRole="button"
              accessibilityLabel="Scan card"
            >
              <Ionicons name="camera-outline" size={18} color="#FFF" />
              <Text style={styles.scanCtaText}>Scan Card</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search contacts..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={handleSearchChange}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery !== '' && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  android_ripple={{ color: Colors.primary + '20', radius: 12 }}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                </Pressable>
              )}
            </View>

            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <View style={styles.sortButtons}>
                <Pressable
                  style={[styles.sortBtn, sortBy === 'recent' && styles.sortBtnActive]}
                  onPress={() => handleSortChange('recent')}
                  android_ripple={{ color: Colors.primary + '20' }}
                >
                  <Text style={[styles.sortBtnText, sortBy === 'recent' && styles.sortBtnTextActive]}>
                    Recent
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.sortBtn, sortBy === 'name' && styles.sortBtnActive]}
                  onPress={() => handleSortChange('name')}
                  android_ripple={{ color: Colors.primary + '20' }}
                >
                  <Text style={[styles.sortBtnText, sortBy === 'name' && styles.sortBtnTextActive]}>Name</Text>
                </Pressable>
                <Pressable
                  style={[styles.sortBtn, sortBy === 'tier' && styles.sortBtnActive]}
                  onPress={() => handleSortChange('tier')}
                  android_ripple={{ color: Colors.primary + '20' }}
                >
                  <Text style={[styles.sortBtnText, sortBy === 'tier' && styles.sortBtnTextActive]}>Tier</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </>
      )}

      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No saved contacts</Text>
          <Text style={styles.emptySub}>
            Scan CulturePass QR codes to save contacts and keep a copy of their CPID
          </Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={handleScanPress}
            android_ripple={{ color: '#FFF3' }}
            accessibilityRole="button"
            accessibilityLabel="Open scanner"
          >
            <Ionicons name="scan-outline" size={18} color="#FFF" />
            <Text style={styles.emptyBtnText}>Open Scanner</Text>
          </Pressable>
        </View>
      ) : sortedAndFilteredContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptySub}>Try a different search term</Text>
          <Pressable
            style={styles.emptyBtn}
            onPress={() => setSearchQuery('')}
            android_ripple={{ color: '#FFF3' }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text style={styles.emptyBtnText}>Clear Search</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sortedAndFilteredContacts}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 40 + bottomInset }]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
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
    ...Colors.shadow.small,
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
    ...Colors.shadow.small,
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
    ...Colors.shadow.small,
  },

  scanCtaText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },

  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 12,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Colors.shadow.small,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    paddingVertical: 0,
  },

  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  sortLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sortButtons: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },

  sortBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  sortBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  sortBtnText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },

  sortBtnTextActive: {
    color: '#FFF',
  },

  listContent: {
    paddingHorizontal: 20,
  },

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

  contactMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' },

  cpidMini: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  cpidMiniText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.primary },

  contactLocation: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },

  contactSavedAt: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },

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

  emptySub: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    ...Colors.shadow.small,
  },

  emptyBtnText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
});
