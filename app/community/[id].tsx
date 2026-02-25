import React, { useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, ActivityIndicator, Alert, Share, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Colors, { shadows } from '@/constants/colors';
import { useSaved } from '@/contexts/SavedContext';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { Community } from '@shared/schema';
import { confirmAndReport } from '@/lib/reporting';

const isWeb = Platform.OS === 'web';

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

const COMMUNITY_TYPE_COLORS: Record<string, string> = {
  diaspora: '#2E86C1',
  indigenous: '#8B4513',
  language: '#7B1FA2',
  religion: '#00897B',
};

const COMMUNITY_TYPE_ICONS: Record<string, string> = {
  diaspora: 'earth',
  indigenous: 'leaf',
  language: 'chatbubbles',
  religion: 'heart',
};

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const { data: dbCommunity, isLoading, error } = useQuery<Community>({
    queryKey: ['/api/communities', id],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!id,
  });

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading community...</Text>
      </View>
    );
  }

  if (dbCommunity) {
    return <DbCommunityView community={dbCommunity} topInset={topInset} bottomInset={bottomInset} />;
  }

  return (
    <View style={styles.notFound}>
      <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
      <Text style={styles.errorText}>{error ? 'Failed to load community' : 'Community not found'}</Text>
      <Pressable
        onPress={handleBack}
        android_ripple={{ color: Colors.primary + '20' }}
        style={styles.backButton}
      >
        <Text style={styles.backLink}>Go Back</Text>
      </Pressable>
    </View>
  );
}

function DbCommunityView({ community, topInset, bottomInset }: { community: Community; topInset: number; bottomInset: number }) {
  const navigation = useNavigation();
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(community.id);
  const color = COMMUNITY_TYPE_COLORS[community.communityType] || Colors.primary;
  const icon = COMMUNITY_TYPE_ICONS[community.communityType] || 'people';

  const { data: allEvents = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/events`);
      if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
      return res.json();
    },
  });

  const relatedTags = getRelatedTagsForDb(community);
  const relatedEvents = allEvents.filter((e: any) =>
    relatedTags.some((tag: string) =>
      (e.communityTag || '').toLowerCase().includes(tag) || tag.includes((e.communityTag || '').toLowerCase())
    )
  );

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const shareUrl = `https://culturepass.app/community/${community.id}`;
      const message = `Check out ${community.name} on CulturePass! ${community.communityType} community with ${formatNumber(community.memberCount ?? 0)} members.\n\n${shareUrl}`;

      if (isWeb) {
        if (navigator?.share) {
          await navigator.share({
            title: `${community.name} on CulturePass`,
            text: message,
            url: shareUrl,
          });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert('Link Copied', 'Link copied to clipboard');
        }
      } else {
        await Share.share({
          title: `${community.name} on CulturePass`,
          message,
          url: shareUrl,
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
  }, [community]);

  const handleReport = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    confirmAndReport({
      targetType: 'community',
      targetId: String(community.id),
      label: 'this community',
    });
  }, [community]);

  const handleJoinToggle = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    toggleJoinCommunity(community.id);

    if (!joined && !isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [community, joined, toggleJoinCommunity]);

  const handleEventPress = useCallback((eventId: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/event/[id]', params: { id: eventId } });
  }, []);

  const handleWebsitePress = useCallback(() => {
    if (!community.website) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Linking.openURL(community.website).catch((err) => {
      console.error('Failed to open website:', err);
      Alert.alert('Error', 'Unable to open website');
    });
  }, [community.website]);

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { height: 240 + topInset }]}>
        <LinearGradient
          colors={[color, color + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.heroOverlay, { paddingTop: topInset + 8 }]}>
          <View style={styles.heroTopRow}>
            <Pressable
              style={styles.iconButton}
              onPress={handleBack}
              android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 21 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </Pressable>

            <View style={styles.heroTopRight}>
              <Pressable
                style={styles.iconButton}
                onPress={handleShare}
                android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 21 }}
                accessibilityRole="button"
                accessibilityLabel="Share community"
              >
                <Ionicons name="share-outline" size={20} color="#FFF" />
              </Pressable>

              <Pressable
                style={styles.iconButton}
                onPress={handleReport}
                android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 21 }}
                accessibilityRole="button"
                accessibilityLabel="Report community"
              >
                <Ionicons name="flag-outline" size={20} color="#FFF" />
              </Pressable>
            </View>
          </View>

          <Animated.View entering={isWeb ? undefined : FadeIn.duration(600)} style={styles.heroBottom}>
            <View style={[styles.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              {community.iconEmoji ? (
                <Text style={styles.heroEmoji}>{community.iconEmoji}</Text>
              ) : (
                <Ionicons name={icon as any} size={28} color="#FFF" />
              )}
            </View>
            <Text style={styles.heroTitle}>{community.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.dbTypeBadge}>
                <Text style={styles.dbTypeBadgeText}>{community.communityType}</Text>
              </View>
              {community.isIndigenous && (
                <View style={[styles.dbTypeBadge, { backgroundColor: '#8B451330' }]}>
                  <Ionicons name="leaf" size={12} color="#F5EDE3" />
                  <Text style={[styles.dbTypeBadgeText, { color: '#F5EDE3' }]}>Indigenous</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: color + '12' }]}>
              <Ionicons name="people" size={18} color={color} />
            </View>
            <Text style={styles.statNum}>{formatNumber(community.memberCount ?? 0)}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: Colors.secondary + '12' }]}>
              <Ionicons name="calendar" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.statNum}>{relatedEvents.length}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>

          {community.countryOfOrigin && (
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: Colors.accent + '15' }]}>
                <Ionicons name="globe" size={18} color={Colors.accent} />
              </View>
              <Text style={[styles.statNum, { fontSize: 14 }]} numberOfLines={1}>
                {community.countryOfOrigin}
              </Text>
              <Text style={styles.statLabel}>Origin</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            {community.description || 'A vibrant cultural community connecting people through shared heritage and traditions.'}
          </Text>

          {community.website && (
            <Pressable
              style={styles.websiteButton}
              onPress={handleWebsitePress}
              android_ripple={{ color: color + '20' }}
              accessibilityRole="button"
              accessibilityLabel="Visit website"
            >
              <Ionicons name="globe-outline" size={16} color={color} />
              <Text style={[styles.websiteText, { color }]}>Visit Website</Text>
              <Ionicons name="chevron-forward" size={14} color={color} />
            </Pressable>
          )}
        </Animated.View>

        {relatedEvents.length > 0 && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.accentBar} />
            </View>

            <Animated.View entering={isWeb ? undefined : FadeInDown.delay(300).duration(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>Related Events ({relatedEvents.length})</Text>
              {relatedEvents.slice(0, 5).map((event: any) => (
                <Pressable
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event.id)}
                  android_ripple={{ color: Colors.primary + '10' }}
                  accessibilityRole="button"
                  accessibilityLabel={`View event: ${event.title}`}
                >
                  <Image source={{ uri: event.imageUrl }} style={styles.eventImage} contentFit="cover" transition={300} />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventDate}>
                      {formatDate(event.date)} - {event.time}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </Pressable>
              ))}

              {relatedEvents.length > 5 && (
                <Pressable
                  style={styles.viewAllButton}
                  onPress={() => router.push('/(tabs)/events')}
                  android_ripple={{ color: color + '20' }}
                >
                  <Text style={[styles.viewAllText, { color }]}>View All {relatedEvents.length} Events</Text>
                  <Ionicons name="arrow-forward" size={16} color={color} />
                </Pressable>
              )}
            </Animated.View>
          </>
        )}

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(400).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Wellbeing & Support</Text>
          <View style={styles.wellbeingCard}>
            <View style={styles.wellbeingIconBg}>
              <Ionicons name="heart-circle" size={28} color={Colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.wellbeingTitle}>Mental Health & Belonging</Text>
              <Text style={styles.wellbeingDesc}>
                Community support resources, cultural counselling, and wellbeing programs are available for all members.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 14 }]}>
        <Pressable
          style={({ pressed }) => [styles.joinButton, joined && styles.joinedButton, pressed && styles.buttonPressed]}
          onPress={handleJoinToggle}
          android_ripple={{ color: joined ? Colors.secondary + '20' : '#FFF3' }}
          accessibilityRole="button"
          accessibilityLabel={joined ? 'Leave community' : 'Join community'}
          accessibilityState={{ selected: joined }}
        >
          <Ionicons name={joined ? 'checkmark-circle' : 'add-circle'} size={22} color={joined ? Colors.secondary : '#FFF'} />
          <Text style={[styles.joinText, joined && styles.joinedText]}>
            {joined ? 'Joined Community' : 'Join Community'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function getRelatedTagsForDb(community: Community): string[] {
  const name = community.name.toLowerCase();
  const tags = [name];

  if (name.includes('indian')) tags.push('indian', 'tamil', 'malayalee', 'punjabi', 'bengali', 'gujarati', 'telugu');
  if (name.includes('chinese')) tags.push('chinese', 'cantonese', 'mandarin');
  if (name.includes('filipino')) tags.push('filipino');
  if (name.includes('vietnamese')) tags.push('vietnamese');
  if (name.includes('lebanese')) tags.push('lebanese', 'arabic');
  if (name.includes('greek')) tags.push('greek');
  if (name.includes('italian')) tags.push('italian');
  if (name.includes('korean')) tags.push('korean');
  if (name.includes('japanese')) tags.push('japanese');
  if (name.includes('thai')) tags.push('thai');
  if (name.includes('indonesian')) tags.push('indonesian');
  if (name.includes('malaysian')) tags.push('malaysian');
  if (name.includes('aboriginal') || name.includes('torres strait') || name.includes('māori') || name.includes('first nations')) {
    tags.push('aboriginal', 'indigenous', 'first nations', 'aboriginal & torres strait islander');
  }
  if (name.includes('punjabi') || name.includes('sikh')) tags.push('punjabi', 'sikh');
  if (name.includes('muslim') || name.includes('islamic')) tags.push('muslim', 'islamic');

  return tags;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
  },

  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },

  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
    padding: 24,
  },

  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },

  backLink: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },

  hero: { overflow: 'hidden' },

  heroOverlay: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroTopRight: {
    flexDirection: 'row',
    gap: 8,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  heroBottom: { gap: 6 },

  heroIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  heroEmoji: {
    fontSize: 30,
  },

  heroTitle: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  dbTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  dbTypeBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
    textTransform: 'capitalize',
  },

  scrollContent: {
    paddingBottom: 110,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
    marginBottom: 8,
  },

  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    ...shadows.small,
  },

  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },

  statNum: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },

  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 12,
  },

  sectionDivider: {
    paddingHorizontal: 20,
    marginTop: 24,
    alignItems: 'center',
  },

  accentBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.secondary + '25',
  },

  description: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
    ...shadows.small,
  },

  websiteText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },

  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    ...shadows.small,
  },

  eventImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },

  eventInfo: {
    flex: 1,
    gap: 2,
  },

  eventTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },

  eventDate: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 4,
  },

  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },

  wellbeingCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.secondary + '08',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.secondary + '20',
  },

  wellbeingIconBg: {
    marginTop: 2,
  },

  wellbeingTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },

  wellbeingDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
    ...shadows.medium,
  },

  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  joinedButton: {
    backgroundColor: Colors.secondary + '12',
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
    shadowOpacity: 0,
    elevation: 0,
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },

  joinText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },

  joinedText: {
    color: Colors.secondary,
  },
});
