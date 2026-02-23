import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface CommunityCardProps {
  community: {
    id: string;
    name: string;
    description?: string;
    memberCount?: number;
    iconEmoji?: string;
    color?: string;
    slug?: string;
  };
  index?: number;
}

export default function CommunityCard({ community, index = 0 }: CommunityCardProps) {
  const color = community.color || '#007AFF';
  const members = community.memberCount || 0;

  return (
    <Animated.View entering={FadeInDown.delay((index || 0) * 80 + 100).duration(500)}>
      <Pressable
        style={[styles.card, Platform.OS === 'web' && { cursor: 'pointer' as any }]}
        onPress={() =>
          router.push({
            pathname: '/community/[id]',
            params: { id: community.slug || community.id },
          })
        }
      >
        <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
          {community.iconEmoji ? (
            <Text style={{ fontSize: 22 }}>{community.iconEmoji}</Text>
          ) : (
            <Ionicons name="people" size={22} color={color} />
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {community.name}
        </Text>
        <Text style={styles.members}>{members} members</Text>
        {community.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {community.description}
          </Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    backgroundColor: '#1A1A22',
    borderRadius: 18,
    padding: 16,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  members: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#8E8E93',
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
    lineHeight: 17,
  },
});
