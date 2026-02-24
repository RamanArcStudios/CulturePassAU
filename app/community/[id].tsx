import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { goBackOrReplace } from '@/lib/navigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { shadows } from '@/constants/colors';
import { useSaved } from '@/contexts/SavedContext';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn, getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { Community } from '@shared/schema';

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
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
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();

  const { data: dbCommunity, isLoading } = useQuery<Community>({
    queryKey: ['/api/communities', id],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset + 20, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (dbCommunity) {
    return <DbCommunityView community={dbCommunity} topInset={topInset} bottomInset={bottomInset} />;
  }

  return (
    <View style={[styles.container, { paddingTop: topInset + 20, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={styles.errorText}>Community not found</Text>
      <Pressable onPress={() => goBackOrReplace('/(tabs)')}>
        <Text style={styles.backLink}>Go Back</Text>
      </Pressable>
    </View>
  );
}

function DbCommunityView({ community, topInset, bottomInset }: { community: Community; topInset: number; bottomInset: number }) {
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(community.id);
  const color = COMMUNITY_TYPE_COLORS[community.communityType] || Colors.primary;
  const icon = COMMUNITY_TYPE_ICONS[community.communityType] || 'people';

  const { data: allEvents = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/events`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const relatedTags = getRelatedTagsForDb(community);
  const relatedEvents = allEvents.filter((e: any) =>
    relatedTags.some((tag: string) =>
      (e.communityTag || '').toLowerCase().includes(tag) || tag.includes((e.communityTag || '').toLowerCase())
    )
  );

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { height: 240 + topInset }]}>
        <LinearGradient
          colors={[color, color + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />
        <View style={[styles.heroOverlay, { paddingTop: topInset + 8, backgroundColor: 'rgba(0,0,0,0.15)' }]}>
          <Pressable style={styles.backButton} onPress={() => goBackOrReplace('/(tabs)')}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </Pressable>
          <View style={styles.heroBottom}>
            <View style={[styles.heroIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              {community.iconEmoji ? (
                <Text style={{ fontSize: 30 }}>{community.iconEmoji}</Text>
              ) : (
                <Ionicons name={icon as any} size={28} color="#FFF" />
              )}
            </View>
            <Text style={styles.heroTitle}>{community.name}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={styles.dbTypeBadge}>
                <Text style={styles.dbTypeBadgeText}>{community.communityType}</Text>
              </View>
              {community.isIndigenous && (
                <View style={[styles.dbTypeBadge, { backgroundColor: '#8B451330' }]}>
                  <Text style={[styles.dbTypeBadgeText, { color: '#F5EDE3' }]}>Indigenous</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
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
              <Text style={[styles.statNum, { fontSize: 14 }]}>{community.countryOfOrigin}</Text>
              <Text style={styles.statLabel}>Origin</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{community.description || 'A vibrant cultural community connecting people through shared heritage and traditions.'}</Text>
        </Animated.View>

        {relatedEvents.length > 0 && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.accentBar} />
            </View>
            <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>Related Events</Text>
              {relatedEvents.slice(0, 5).map((event: any) => (
                <Pressable
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
                >
                  <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.eventDate}>{formatDate(event.date)} - {event.time}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
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
          style={({ pressed }) => [
            styles.joinButton,
            joined && styles.joinedButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleJoinCommunity(community.id);
          }}
        >
          <Ionicons
            name={joined ? 'checkmark-circle' : 'add-circle'}
            size={22}
            color={joined ? Colors.secondary : '#FFF'}
          />
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
  if (name.includes('aboriginal') || name.includes('torres strait') || name.includes('māori') || name.includes('first nations')) {
    tags.push('aboriginal', 'indigenous', 'first nations', 'aboriginal & torres strait islander');
  }
  if (name.includes('punjabi') || name.includes('sikh')) tags.push('punjabi');
  return tags;
}

function MockCommunityView({ community, topInset, bottomInset }: { community: any; topInset: number; bottomInset: number }) {
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(community.id);

  const { data: allEvents = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/events`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });
  const communityEvents = allEvents.filter((e: any) => e.organizerId === community.id);

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { height: 280 + topInset }]}>
        <Image source={{ uri: community.imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          locations={[0, 0.4, 1]}
          style={[styles.heroOverlay, { paddingTop: topInset + 8 }]}
        >
          <Pressable style={styles.backButton} onPress={() => goBackOrReplace('/(tabs)')}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </Pressable>
          <View style={styles.heroBottom}>
            <View style={[styles.heroIconWrap, { backgroundColor: community.color + '50' }]}>
              <Ionicons name={community.icon as any} size={28} color="#FFF" />
            </View>
            <Text style={styles.heroTitle}>{community.name}</Text>
            <Text style={styles.heroCategory}>{community.category}</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: Colors.primary + '12' }]}>
              <Ionicons name="people" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.statNum}>{formatNumber(community.members)}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: Colors.secondary + '12' }]}>
              <Ionicons name="calendar" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.statNum}>{community.events}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: Colors.accent + '15' }]}>
              <Ionicons name="star" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.statNum}>{community.leaders.length}</Text>
            <Text style={styles.statLabel}>Leaders</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Ionicons name="finger-print-outline" size={14} color={Colors.secondary} />
            <Text style={{ fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: Colors.secondary }}>{community.cpid}</Text>
          </View>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{community.description}</Text>
        </Animated.View>

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Community Leaders</Text>
          {community.leaders.map((leader: string, idx: number) => (
            <View key={idx} style={styles.leaderRow}>
              <View style={[styles.leaderAvatar, { backgroundColor: community.color + '15' }]}>
                <Ionicons name="person" size={18} color={community.color} />
              </View>
              <Text style={styles.leaderName}>{leader}</Text>
              <View style={styles.leaderBadge}>
                <Text style={styles.leaderRole}>Leader</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {communityEvents.length > 0 && (
          <>
            <View style={styles.sectionDivider}>
              <View style={styles.accentBar} />
            </View>
            <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Events</Text>
              {communityEvents.map((event: any) => (
                <Pressable
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
                >
                  <Image source={{ uri: event.imageUrl }} style={styles.eventImage} />
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.eventDate}>{formatDate(event.date)} - {event.time}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </Pressable>
              ))}
            </Animated.View>
          </>
        )}

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
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
          style={({ pressed }) => [
            styles.joinButton,
            joined && styles.joinedButton,
            pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleJoinCommunity(community.id);
          }}
        >
          <Ionicons
            name={joined ? 'checkmark-circle' : 'add-circle'}
            size={22}
            color={joined ? Colors.secondary : '#FFF'}
          />
          <Text style={[styles.joinText, joined && styles.joinedText]}>
            {joined ? 'Joined Community' : 'Join Community'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorText: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  backLink: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginTop: 12 },
  hero: { overflow: 'hidden' },
  heroOverlay: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
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
  heroTitle: { fontSize: 26, fontFamily: 'Poppins_700Bold', color: '#FFF', lineHeight: 32 },
  heroCategory: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.85)' },
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
  statNum: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  section: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },
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
  description: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    ...shadows.small,
  },
  leaderAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  leaderName: { flex: 1, fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  leaderBadge: { backgroundColor: Colors.secondary + '15', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  leaderRole: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: Colors.secondary },
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
  eventImage: { width: 48, height: 48, borderRadius: 14 },
  eventInfo: { flex: 1, gap: 2 },
  eventTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  eventDate: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
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
  wellbeingTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginBottom: 4 },
  wellbeingDesc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 20 },
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
  joinText: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  joinedText: { color: Colors.secondary },
  dbTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  dbTypeBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
    textTransform: 'capitalize',
  },
});
