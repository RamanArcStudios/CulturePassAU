import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

interface CategoryCardProps {
  item: {
    id: string;
    label: string;
    icon: string;
    color?: string;
    emoji?: string;
  };
  onPress?: () => void;
}

export default function CategoryCard({ item, onPress }: CategoryCardProps) {
  const color = item.color || '#007AFF';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] },
        Platform.OS === 'web' && { cursor: 'pointer' as any },
        Colors.shadows.small,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        {item.emoji ? (
          <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
        ) : (
          <Ionicons name={item.icon as any} size={24} color={color} />
        )}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.borderLight,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    textAlign: 'center',
  },
});
