import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSaved } from '@/contexts/SavedContext';
import { sampleCommunities } from '@/data/mockData';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

function CommunityCard({ community }: { community: typeof sampleCommunities[0] }) {
  const { isCommunityJoined, toggleJoinCommunity } = useSaved();
  const joined = isCommunityJoined(community.id);

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/community/[id]', params: { id: community.id } })}
    >
      <View style={styles.cardTop}>
        <View style={[styles.communityIcon, { backgroundColor: community.color + '15' }]}>
          <Ionicons name={community.icon as any} size={28} color={community.color} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{community.name}</Text>
          <Text style={styles.cardCategory}>{community.category}</Text>
        </View>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{community.description}</Text>
      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <Ionicons name="people" size={14} color={Colors.textSecondary} />
          <Text style={styles.statText}>{formatNumber(community.members)} members</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="calendar" size={14} color={Colors.textSecondary} />
          <Text style={styles.statText}>{community.events} events</Text>
        </View>
      </View>
      <Pressable
        style={[styles.joinButton, joined && styles.joinedButton]}
        onPress={(e) => {
          e.stopPropagation?.();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          toggleJoinCommunity(community.id);
        }}
      >
        <Ionicons
          name={joined ? "checkmark" : "add"}
          size={18}
          color={joined ? Colors.secondary : '#FFF'}
        />
        <Text style={[styles.joinText, joined && styles.joinedText]}>
          {joined ? 'Joined' : 'Join'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

function formatNumber(num: number) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Communities</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {sampleCommunities.map(community => (
          <CommunityCard key={community.id} community={community} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  grid: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  communityIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  cardCategory: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 20,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
  },
  joinedButton: {
    backgroundColor: Colors.secondary + '12',
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },
  joinText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  joinedText: {
    color: Colors.secondary,
  },
});
