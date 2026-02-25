import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

import type { IconName } from '@expo/vector-icons/build/Icon';

interface CategoryCardProps {
  item: {
    id: string;
    label: string;
    icon?: IconName; // Proper typing for Ionicons
    color?: string;
    emoji?: string;
  };
  onPress?: () => void;
  testID?: string;
}

export default function CategoryCard({
  item,
  onPress,
  testID = 'category-card',
}: CategoryCardProps) {
  const colorScheme = useColorScheme();
  const color = item.color || Colors.primary;
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.();
  };

  return (
    <Pressable
      testID={testID}
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
      android_ripple={{ color: color + '20', radius: 25, borderless: false }}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + (isDark ? '25' : '15') }]}>
        {item.emoji ? (
          <Text style={styles.emoji} accessibilityLabel={item.emoji}>
            {item.emoji}
          </Text>
        ) : item.icon ? (
          <Ionicons name={item.icon} size={24} color={color} />
        ) : null}
      </View>
      <Text style={[styles.label, { color: Colors.textPrimary[colorScheme || 'light'] }]} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 100,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.97 }],
  },
  webCursor: {
    cursor: 'pointer' as const,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    lineHeight: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
