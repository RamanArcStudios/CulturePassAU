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
      style={[styles.card, Platform.OS === 'web' && { cursor: 'pointer' as any }]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
        {item.emoji ? (
          <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
        ) : (
          <Ionicons name={item.icon as any} size={22} color={color} />
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
    width: 100,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
