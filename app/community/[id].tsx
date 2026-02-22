import React from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { useSaved } from '@/contexts/SavedContext';
import { sampleCommunities, sampleEvents } from '@/data/mockData';

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

export default function CommunityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();

  const community = sampleCommunities.find(c => c.id === id);

  if (!community) {
    return (
      <View style={[styles.container, { paddingTop: topInset + 20, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.errorText}>Community not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const joined = isCommunityJoined(community.id);
  const communityEvents = sampleEvents.filter(e => e.organizerId === community.id);

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { height: 240 + topInset }]}>
        <Image source={{ uri: community.imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
        <View style={[styles.heroOverlay, { paddingTop: topInset + 8 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </Pressable>
          <View style={styles.heroBottom}>
            <View style={[styles.heroIconWrap, { backgroundColor: community.color + '40' }]}>
              <Ionicons name={community.icon as any} size={28} color="#FFF" />
            </View>
            <Text style={styles.heroTitle}>{community.name}</Text>
            <Text style={styles.heroCategory}>{community.category}</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{formatNumber(community.members)}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{community.events}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{community.leaders.length}</Text>
            <Text style={styles.statLabel}>Leaders</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{community.description}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Community Leaders</Text>
          {community.leaders.map((leader, idx) => (
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
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {communityEvents.map(event => (
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
        )}

        <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Wellbeing & Support</Text>
          <View style={styles.wellbeingCard}>
            <Ionicons name="heart-circle" size={28} color={Colors.secondary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.wellbeingTitle}>Mental Health & Belonging</Text>
              <Text style={styles.wellbeingDesc}>
                Community support resources, cultural counselling, and wellbeing programs are available for all members.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
        <Pressable
          style={[styles.joinButton, joined && styles.joinedButton]}
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
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 16,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { gap: 4 },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  heroCategory: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.8)' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
    marginBottom: 8,
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
  statNum: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },
  statLabel: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 10 },
  description: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  leaderAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  leaderName: { flex: 1, fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  leaderBadge: { backgroundColor: Colors.secondary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  leaderRole: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: Colors.secondary },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 12,
  },
  eventImage: { width: 44, height: 44, borderRadius: 12 },
  eventInfo: { flex: 1, gap: 2 },
  eventTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  eventDate: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  wellbeingCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.secondary + '08',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.secondary + '20',
  },
  wellbeingTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginBottom: 4 },
  wellbeingDesc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  joinedButton: {
    backgroundColor: Colors.secondary + '12',
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  joinText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  joinedText: { color: Colors.secondary },
});
