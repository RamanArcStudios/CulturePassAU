import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
  testID?: string;
}

export default function CommunityCard({
  community,
  index = 0,
  testID = 'community-card',
}: CommunityCardProps) {
  const colorScheme = useColorScheme();
  const color = community.color || Colors.primary;
  const members = community.memberCount ?? 0;
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/community/${community.slug || community.id}`);
  };

  return (
    <Animated.View 
      entering={FadeInDown.delay((index * 100) + 150).duration(600)}
      testID={testID}
    >
      <Pressable
        testID={`${testID}-${community.id}`}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: Colors.surfacePrimary[colorScheme || 'light'],
            borderColor: Colors.border[colorScheme || 'light'],
          },
          pressed && styles.pressed,
          Platform.OS === 'web' && styles.webCursor,
          Colors.shadows.small,
        ]}
        onPress={handlePress}
        android_ripple={{ 
          color: color + '20', 
          radius: 28, 
          borderless: false 
        }}
        accessibilityLabel={`${community.name}, ${members.toLocaleString()} members`}
        accessibilityRole="button"
        accessibilityHint="Tap to view community"
      >
        <View style={[styles.iconWrap, { backgroundColor: color + (isDark ? '25' : '15') }]}>
          {community.iconEmoji ? (
            <Text style={styles.emoji} accessibilityLabel={community.iconEmoji}>
              {community.iconEmoji}
            </Text>
          ) : (
            <Ionicons name="people-outline" size={26} color={color} />
          )}
        </View>
        
        <Text style={[styles.name, { color: Colors.textPrimary[colorScheme || 'light'] }]} numberOfLines={1}>
          {community.name}
        </Text>
        
        <Text style={[styles.members, { color: Colors.textSecondary[colorScheme || 'light'] }]}>
          {members === 0 ? 'New Community' : `${members.toLocaleString()} members`}
        </Text>
        
        {community.description && (
          <Text style={[styles.description, { color: Colors.textTertiary[colorScheme || 'light'] }]} numberOfLines={2}>
            {community.description}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 140,
    maxWidth: 200,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
  webCursor: {
    cursor: 'pointer' as const,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 26,
    lineHeight: 26,
  },
  name: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 6,
    includeFontPadding: false,
  },
  members: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginBottom: 12,
    includeFontPadding: false,
  },
  description: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
    includeFontPadding: false,
  },
});
