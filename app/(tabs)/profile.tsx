import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useSaved } from '@/contexts/SavedContext';
import { sampleEvents, sampleCommunities } from '@/data/mockData';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

function ProfileMenuItem({ icon, label, value, onPress, color }: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: (color || Colors.primary) + '12' }]}>
        <Ionicons name={icon as any} size={20} color={color || Colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state, resetOnboarding } = useOnboarding();
  const { savedEvents, joinedCommunities } = useSaved();

  const savedEventsList = sampleEvents.filter(e => savedEvents.includes(e.id));
  const joinedCommunitiesList = sampleCommunities.filter(c => joinedCommunities.includes(c.id));

  const handleReset = () => {
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
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.name}>CulturePass User</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color={Colors.primary} />
            <Text style={styles.location}>{state.city}, {state.country}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{joinedCommunities.length}</Text>
            <Text style={styles.statLabel}>Communities</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{savedEvents.length}</Text>
            <Text style={styles.statLabel}>Saved Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>
        </View>

        {joinedCommunitiesList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Communities</Text>
            {joinedCommunitiesList.map(c => (
              <Pressable
                key={c.id}
                style={styles.miniCard}
                onPress={() => router.push({ pathname: '/community/[id]', params: { id: c.id } })}
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
          </View>
        )}

        {savedEventsList.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Events</Text>
            {savedEventsList.map(e => (
              <Pressable
                key={e.id}
                style={styles.miniCard}
                onPress={() => router.push({ pathname: '/event/[id]', params: { id: e.id } })}
              >
                <View style={[styles.miniIcon, { backgroundColor: e.imageColor + '15' }]}>
                  <Ionicons name="calendar" size={20} color={e.imageColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniTitle} numberOfLines={1}>{e.title}</Text>
                  <Text style={styles.miniSub}>{formatDate(e.date)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            <ProfileMenuItem icon="location-outline" label="Location" value={`${state.city}`} color={Colors.primary} />
            <View style={styles.divider} />
            <ProfileMenuItem icon="people-outline" label="My Communities" value={`${state.communities.length}`} color={Colors.secondary} />
            <View style={styles.divider} />
            <ProfileMenuItem icon="heart-outline" label="Interests" value={`${state.interests.length}`} color={Colors.accent} />
            <View style={styles.divider} />
            <ProfileMenuItem icon="card-outline" label="Payment Methods" color="#3498DB" />
            <View style={styles.divider} />
            <ProfileMenuItem icon="notifications-outline" label="Notifications" color="#9B59B6" />
            <View style={styles.divider} />
            <ProfileMenuItem icon="help-circle-outline" label="Help & Support" color="#2ECC71" />
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            style={styles.resetButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleReset();
            }}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.error} />
            <Text style={styles.resetText}>Reset Onboarding</Text>
          </Pressable>
        </View>

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
  profileHeader: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.primary + '30',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statNum: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 12,
  },
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  miniIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  miniSub: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  menuValue: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginRight: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 62,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.error + '10',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  resetText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.error,
  },
  version: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: 20,
  },
});
