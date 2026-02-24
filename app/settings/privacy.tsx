import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Switch, Alert, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

const PRIVACY_SETTINGS = [
  {
    key: 'profileVisibility',
    title: 'Profile Visibility',
    description: 'When enabled, your profile is public and visible to all users. Disable to make it private.',
    icon: 'eye' as const,
    color: '#16656E',
  },
  {
    key: 'dataSharing',
    title: 'Data Sharing',
    description: 'Allow CulturePass to share anonymized usage data to improve the platform experience',
    icon: 'analytics' as const,
    color: '#3498DB',
  },
  {
    key: 'activityStatus',
    title: 'Activity Status',
    description: 'Show other users when you are online or recently active on the platform',
    icon: 'pulse' as const,
    color: '#2EBD59',
  },
  {
    key: 'showLocation',
    title: 'Show Location',
    description: 'Display your city and country on your public profile for others to see',
    icon: 'location' as const,
    color: '#E85D3A',
  },
];

interface PrivacySettings {
  profileVisibility: boolean;
  dataSharing: boolean;
  activityStatus: boolean;
  showLocation: boolean;
}

export default function PrivacySettingsScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const { data: settings, isLoading } = useQuery<PrivacySettings>({
    queryKey: ['/api/privacy/settings', userId],
    enabled: !!userId,
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/privacy/settings/${userId}`);
      if (!res.ok) throw new Error('Failed to load privacy settings');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<PrivacySettings>) => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/privacy/settings/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update privacy settings');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/privacy/settings', userId], data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (password: string) => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/account/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Deletion failed');
      }
      return res.json();
    },
    onSuccess: () => {
      logout();
      router.replace('/(onboarding)');
    },
    onError: (e: Error) => {
      setDeleteError(e.message);
    },
  });

  const toggleSetting = (key: string) => {
    if (!settings) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newValue = !settings[key as keyof PrivacySettings];
    updateMutation.mutate({ [key]: newValue });
    queryClient.setQueryData(['/api/privacy/settings', userId], { ...settings, [key]: newValue });
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, tickets, and wallet balance will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue', style: 'destructive', onPress: () => {
            setDeletePassword('');
            setDeleteError('');
            setShowDeleteConfirm(true);
          }
        },
      ]
    );
  };

  const handleConfirmDelete = () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password to confirm.');
      return;
    }
    deleteMutation.mutate(deletePassword);
  };

  const currentSettings: PrivacySettings = settings ?? {
    profileVisibility: true,
    dataSharing: false,
    activityStatus: true,
    showLocation: true,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : insets.bottom) }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="shield-checkmark" size={32} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>Privacy Settings</Text>
          <Text style={styles.heroSub}>Control how your data and profile are shared</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          {isLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            PRIVACY_SETTINGS.map((item) => (
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
                    value={currentSettings[item.key as keyof PrivacySettings]}
                    onValueChange={() => toggleSetting(item.key)}
                    trackColor={{ false: Colors.border, true: Colors.primary + '50' }}
                    thumbColor={currentSettings[item.key as keyof PrivacySettings] ? Colors.primary : '#F4F3F4'}
                  />
                </View>
                {item.key === 'profileVisibility' && (
                  <View style={styles.statusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: currentSettings.profileVisibility ? '#2EBD59' : Colors.textTertiary }]} />
                    <Text style={styles.statusText}>{currentSettings.profileVisibility ? 'Public' : 'Private'}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.dangerSection}>
          <Text style={styles.dangerLabel}>Danger Zone</Text>
          {showDeleteConfirm ? (
            <View style={styles.deleteConfirmCard}>
              <Text style={styles.deleteConfirmTitle}>Confirm Account Deletion</Text>
              <Text style={styles.deleteConfirmDesc}>Enter your password to permanently delete your account. This cannot be undone.</Text>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry
                value={deletePassword}
                onChangeText={(v) => { setDeletePassword(v); setDeleteError(''); }}
                autoCapitalize="none"
              />
              {deleteError ? <Text style={styles.deleteErrorText}>{deleteError}</Text> : null}
              <View style={styles.deleteConfirmRow}>
                <Pressable style={styles.cancelConfirmBtn} onPress={() => setShowDeleteConfirm(false)}>
                  <Text style={styles.cancelConfirmText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.deleteConfirmBtn, deleteMutation.isPending && { opacity: 0.6 }]}
                  onPress={handleConfirmDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.deleteConfirmBtnText}>Delete Forever</Text>
                  )}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={20} color="#FFF" />
              <Text style={styles.deleteBtnText}>Delete Account</Text>
            </Pressable>
          )}
          <Text style={styles.dangerNote}>
            This will permanently delete your account and all associated data including tickets, wallet balance, and community memberships.
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
  heroCard: { marginHorizontal: 20, marginBottom: 24, backgroundColor: Colors.secondary, borderRadius: 20, padding: 24, alignItems: 'center' },
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
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, marginLeft: 52, backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  dangerSection: { paddingHorizontal: 20, marginTop: 8, marginBottom: 24 },
  dangerLabel: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.error, marginBottom: 12 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.error, borderRadius: 12, padding: 16 },
  deleteBtnText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  dangerNote: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, marginTop: 10, lineHeight: 18 },
  deleteConfirmCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.error + '40' },
  deleteConfirmTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.error, marginBottom: 6 },
  deleteConfirmDesc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginBottom: 16, lineHeight: 18 },
  passwordInput: { backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  deleteErrorText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.error, marginBottom: 8 },
  deleteConfirmRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelConfirmBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surface, borderRadius: 10, paddingVertical: 12, borderWidth: 1, borderColor: Colors.border },
  cancelConfirmText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  deleteConfirmBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.error, borderRadius: 10, paddingVertical: 12 },
  deleteConfirmBtnText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
});
