import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';

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
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
          Platform.OS === 'web' && { cursor: 'pointer' as any },
          Colors.shadows.small,
        ]}
        onPress={() =>
          router.push({
            pathname: '/community/[id]',
            params: { id: community.slug || community.id },
          })
        }
      >
        <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
          {community.iconEmoji ? (
            <Text style={{ fontSize: 24 }}>{community.iconEmoji}</Text>
          ) : (
            <Ionicons name="people" size={24} color={color} />
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {community.name}
        </Text>
        <Text style={styles.members}>{members.toLocaleString()} members</Text>
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
    width: 196,
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginBottom: 4,
  },
  members: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  description: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
