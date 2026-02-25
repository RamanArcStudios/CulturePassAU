import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useCallback, useMemo, useState } from 'react';

const isWeb = Platform.OS === 'web';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean | null;
  metadata: Record<string, any> | null;
  createdAt: string | null;
}

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

const NOTIF_TYPE_INFO: Record<string, { icon: string; color: string }> = {
  system: { icon: 'settings', color: '#3498DB' },
  event: { icon: 'calendar', color: '#E85D3A' },
  perk: { icon: 'gift', color: '#9B59B6' },
  community: { icon: 'people', color: '#1A7A6D' },
  payment: { icon: 'wallet', color: '#34C759' },
  follow: { icon: 'person-add', color: '#F2A93B' },
  review: { icon: 'star', color: '#FF9F0A' },
  ticket: { icon: 'ticket', color: '#FF6B6B' },
  reminder: { icon: 'alarm', color: '#9C88FF' },
};

function timeAgo(date: string): string {
  try {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    return new Date(date).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return 'Recently';
  }
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webTop = isWeb ? 67 : 0;
  const userId = useDemoUserId();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery<Notification[]>({
    queryKey: ['/api/notifications', userId],
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
  });

  const markReadMutation = useMutation({
    mutationFn: async (notifId: string) => {
      const res = await apiRequest('PUT', `/api/notifications/${notifId}/read`, undefined);
      if (!res.ok) throw new Error('Failed to mark as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      console.error('Mark read error:', error);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('User ID not found');
      const res = await apiRequest('PUT', `/api/notifications/${userId}/read-all`, undefined);
      if (!res.ok) throw new Error('Failed to mark all as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    onError: (error) => {
      console.error('Mark all read error:', error);
      Alert.alert('Error', 'Failed to mark all as read. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (notifId: string) => {
      const res = await apiRequest('DELETE', `/api/notifications/${notifId}`, undefined);
      if (!res.ok) throw new Error('Failed to delete notification');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
    onError: (error) => {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete notification. Please try again.');
    },
  });

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  const handleMarkAllRead = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  const handleNotificationPress = useCallback(
    (notif: Notification) => {
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Mark as read
      if (!notif.isRead) {
        markReadMutation.mutate(notif.id);
      }

      // Navigate based on notification type and metadata
      if (notif.metadata?.eventId) {
        router.push(`/events/${notif.metadata.eventId}`);
      } else if (notif.metadata?.ticketId) {
        router.push(`/tickets/${notif.metadata.ticketId}`);
      } else if (notif.metadata?.communityId) {
        router.push(`/communities/${notif.metadata.communityId}`);
      } else if (notif.metadata?.perkId) {
        router.push(`/perks/${notif.metadata.perkId}`);
      }
    },
    [markReadMutation]
  );

  const handleNotificationLongPress = useCallback(
    (notif: Notification) => {
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      Alert.alert('Delete Notification', 'Remove this notification?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(notif.id),
        },
      ]);
    },
    [deleteMutation]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <Pressable
            onPress={handleMarkAllRead}
            style={styles.markAllBtn}
            disabled={markAllReadMutation.isPending}
            android_ripple={{ color: Colors.primary + '30' }}
            accessibilityRole="button"
            accessibilityLabel="Mark all as read"
          >
            <Text style={styles.markAllText}>
              {markAllReadMutation.isPending ? 'Reading...' : 'Read All'}
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {unreadCount > 0 && (
        <Animated.View entering={isWeb ? undefined : FadeInDown.duration(400)} style={styles.unreadBanner}>
          <Ionicons name="notifications" size={16} color={Colors.primary} />
          <Text style={styles.unreadText}>
            {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
          </Text>
        </Animated.View>
      )}

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + (isWeb ? 34 : insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>We'll let you know when something happens</Text>
          </View>
        ) : (
          notifications.map((notif, i) => {
            const typeInfo = NOTIF_TYPE_INFO[notif.type] || NOTIF_TYPE_INFO.system;
            return (
              <Animated.View
                key={notif.id}
                entering={isWeb ? undefined : FadeInDown.delay(i * 60).duration(400)}
              >
                <Pressable
                  onPress={() => handleNotificationPress(notif)}
                  onLongPress={() => handleNotificationLongPress(notif)}
                  style={[styles.notifCard, !notif.isRead && styles.notifUnread]}
                  android_ripple={{ color: typeInfo.color + '15' }}
                  accessibilityRole="button"
                  accessibilityLabel={`${notif.title}. ${notif.message}`}
                  accessibilityHint="Tap to view details, long press to delete"
                  accessibilityState={{ selected: !notif.isRead }}
                >
                  <View style={[styles.notifIcon, { backgroundColor: typeInfo.color + '15' }]}>
                    <Ionicons name={typeInfo.icon as any} size={20} color={typeInfo.color} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text
                        style={[styles.notifTitle, !notif.isRead && styles.notifTitleBold]}
                        numberOfLines={1}
                      >
                        {notif.title}
                      </Text>
                      {!notif.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMessage} numberOfLines={2}>
                      {notif.message}
                    </Text>
                    {notif.createdAt && (
                      <Text style={styles.notifTime}>{timeAgo(notif.createdAt)}</Text>
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },

  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
  },

  markAllText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },

  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
  },

  unreadText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.primary },

  list: { flex: 1, paddingHorizontal: 20 },

  scrollContent: {},

  emptyState: { alignItems: 'center', paddingTop: 80, gap: 8 },

  emptyText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },

  emptySubtext: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary },

  notifCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
  },

  notifUnread: { borderColor: Colors.primary + '30', backgroundColor: Colors.primary + '05' },

  notifIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  notifContent: { flex: 1 },

  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },

  notifTitle: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text, flex: 1 },

  notifTitleBold: { fontFamily: 'Poppins_600SemiBold' },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 8,
  },

  notifMessage: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },

  notifTime: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary },
});
