import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

export interface FilterItem {
  id: string;
  label: string;
  icon?: string;
  color?: string;
  count?: number;
}

interface FilterChipProps {
  item: FilterItem;
  isActive: boolean;
  onPress: () => void;
  size?: 'small' | 'medium';
  testID?: string;
}

export function FilterChip({ 
  item, 
  isActive, 
  onPress, 
  size = 'medium',
  testID = 'filter-chip',
}: FilterChipProps) {
  const colorScheme = useColorScheme();
  const accentColor = item.color || Colors.primary;
  const isSmall = size === 'small';

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        isSmall && styles.chipSmall,
        isActive 
          ? [styles.chipActive, { 
              backgroundColor: accentColor,
              borderColor: accentColor + 'CC',
              shadowColor: accentColor,
            }]
          : [styles.chipInactive, { 
              backgroundColor: Colors.surfaceSecondary[colorScheme || 'light'],
              borderColor: Colors.borderLight[colorScheme || 'light'],
            }],
        pressed && styles.chipPressed,
        Platform.OS === 'web' && styles.webCursor,
        Colors.shadows[isActive ? 'small' : 'none'],
      ]}
      android_ripple={{ 
        color: isActive ? 'rgba(255,255,255,0.3)' : Colors.surfaceSecondary + '66',
        radius: isSmall ? 20 : 28,
        borderless: false,
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${item.label}${item.count ? ` (${item.count})` : ''}`}
      accessibilityHint="Tap to filter by category"
    >
      {item.icon && (
        <Ionicons
          name={item.icon as any}
          size={isSmall ? 16 : 18}
          color={isActive ? Colors.textInverse : accentColor}
          style={styles.icon}
        />
      )}
      
      <Text
        style={[
          styles.label,
          isSmall && styles.labelSmall,
          {
            color: isActive ? Colors.textInverse : Colors.textSecondary[colorScheme || 'light'],
            fontFamily: isActive ? 'Poppins_600SemiBold' : 'Poppins_500Medium',
          },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      
      {item.count != null && item.count > 0 && (
        <View style={[
          styles.badge,
          {
            backgroundColor: isActive 
              ? 'rgba(255,255,255,0.25)' 
              : accentColor + (Platform.OS === 'web' ? '1A' : '18'),
          },
        ]}>
          <Text style={[
            styles.badgeText,
            { color: isActive ? Colors.textInverse : accentColor },
          ]}>
            {item.count > 999 ? `${(item.count / 1000).toFixed(1)}k` : item.count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

interface FilterChipRowProps {
  items: FilterItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  size?: 'small' | 'medium';
  testID?: string;
}

export function FilterChipRow({ 
  items, 
  selectedId, 
  onSelect, 
  size = 'medium',
  testID = 'filter-row',
}: FilterChipRowProps) {
  return (
    <View style={styles.rowContainer} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.select({ 
            web: { paddingHorizontal: 24 },
            default: { paddingHorizontal: 20 },
          }),
        ]}
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        decelerationRate={Platform.OS === 'ios' ? 'normal' : 'fast'}
        accessibilityRole="tablist"
      >
        {items.map((item) => (
          <FilterChip
            key={item.id}
            item={item}
            isActive={selectedId === item.id}
            onPress={() => onSelect(item.id)}
            size={size}
            testID={`chip-${item.id}`}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    marginHorizontal: -4,
    marginBottom: 28,
    overflow: 'visible',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  
  // Chip Styles
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1.5,
    minHeight: 44,
    maxWidth: 160,
  },
  chipSmall: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 40,
    maxWidth: 140,
  },
  chipInactive: {
    borderColor: Colors.borderLight,
  },
  chipActive: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  chipPressed: {
    transform: [{ scale: 0.96 }],
  },
  webCursor: {
    cursor: 'pointer' as const,
  },
  
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    flex: 1,
    includeFontPadding: false,
  },
  labelSmall: {
    fontSize: 13,
  },
  
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    includeFontPadding: false,
  },
});
