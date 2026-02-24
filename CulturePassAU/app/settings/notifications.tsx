import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

const NOTIFICATION_SETTINGS = [
  {
    key: 'eventReminders',
    title: 'Event Reminders',
    description: 'Get notified about upcoming events you\'re interested in or have tickets for',
    icon: 'calendar' as const,
    color: '#E85D3A',
  },
  {
    key: 'communityUpdates',
    title: 'Community Updates',
    description: 'Stay informed about new posts, events, and announcements from your communities',
    icon: 'people' as const,
    color: '#16656E',
  },
  {
    key: 'perkAlerts',
    title: 'Perk Alerts',
    description: 'Be the first to know about new perks, discounts, and exclusive offers',
    icon: 'gift' as const,
    color: '#9B59B6',
  },
  {
    key: 'marketingEmails',
    title: 'Marketing Emails',
    description: 'Receive newsletters, promotions, and personalized recommendations',
    icon: 'mail' as const,
    color: '#3498DB',
  },
];

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const [settings, setSettings] = useState<Record<string, boolean>>({
    eventReminders: true,
    communityUpdates: true,
    perkAlerts: true,
    marketingEmails: false,
  });

  const toggleSetting = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : insets.bottom) }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="notifications" size={32} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>Notification Preferences</Text>
          <Text style={styles.heroSub}>Choose what updates you want to receive</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          {NOTIFICATION_SETTINGS.map((item, i) => (
            <View key={item.key} style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={[styles.settingIcon, { backgroundColor: item.color + '15' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDesc}>{item.description}</Text>
                </View>
                <Switch
                  value={settings[item.key]}
                  onValueChange={() => toggleSetting(item.key)}
                  trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                  thumbColor={settings[item.key] ? Colors.primary : '#F4F3F4'}
                />
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.noteSection}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.textTertiary} />
          <Text style={styles.noteText}>
            You can change these preferences at any time. Critical account and security notifications will always be sent.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  heroCard: { marginHorizontal: 20, marginBottom: 24, backgroundColor: Colors.primary, borderRadius: 20, padding: 24, alignItems: 'center' },
  heroIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#FFF', marginBottom: 6 },
  heroSub: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  settingCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 10, ...Colors.shadow.small },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginBottom: 2 },
  settingDesc: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 17 },
  noteSection: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 24, marginTop: 8 },
  noteText: { flex: 1, fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, lineHeight: 18 },
});
