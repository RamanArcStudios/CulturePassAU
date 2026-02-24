import { Text, Pressable, StyleSheet, ScrollView, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

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
}

export function FilterChip({ item, isActive, onPress, size = 'medium' }: FilterChipProps) {
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
      onPress={handlePress}
      style={({ pressed }) => [
        styles.chip,
        isSmall && styles.chipSmall,
        isActive
          ? { backgroundColor: accentColor, borderColor: accentColor }
          : { backgroundColor: Colors.surface, borderColor: Colors.borderLight },
        pressed && !isActive && styles.chipPressed,
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
        isActive && styles.chipActiveShadow,
        Platform.OS === 'web' && { cursor: 'pointer' as any },
      ]}
    >
      {item.icon ? (
        <Ionicons
          name={item.icon as any}
          size={isSmall ? 14 : 16}
          color={isActive ? '#FFF' : accentColor}
          style={styles.icon}
        />
      ) : null}
      <Text
        style={[
          styles.label,
          isSmall && styles.labelSmall,
          isActive ? styles.labelActive : { color: Colors.textSecondary },
          item.color && isActive && { color: '#FFF' },
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {item.count != null && item.count > 0 ? (
        <View
          style={[
            styles.badge,
            isActive
              ? { backgroundColor: 'rgba(255,255,255,0.25)' }
              : { backgroundColor: (accentColor || Colors.primary) + '18' },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isActive ? '#FFF' : accentColor },
            ]}
          >
            {item.count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

interface FilterChipRowProps {
  items: FilterItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  size?: 'small' | 'medium';
}

export function FilterChipRow({ items, selectedId, onSelect, size = 'medium' }: FilterChipRowProps) {
  return (
    <View style={styles.rowContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        style={{ flexGrow: 0 }}
      >
        {items.map(item => (
          <FilterChip
            key={item.id}
            item={item}
            isActive={selectedId === item.id}
            onPress={() => onSelect(item.id)}
            size={size}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    marginBottom: 24,
  },
  row: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  chipSmall: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  icon: {
    marginRight: 6,
  },
  chipPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  chipActiveShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    marginBottom: Platform.OS === 'ios' ? -2 : 0,
  },
  labelSmall: {
    fontSize: 12,
  },
  labelActive: {
    color: '#FFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
  },
});
