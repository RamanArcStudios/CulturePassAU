import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';

const CITY_IMAGES: Record<string, string> = {
  'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80',
  'Melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=400&q=80',
  'Brisbane': 'https://images.unsplash.com/photo-1524293568345-75d62c3664f7?w=400&q=80',
  'Auckland': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&q=80',
  'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
  'London': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80',
  'Toronto': 'https://images.unsplash.com/photo-1517090504332-eac354861490?w=400&q=80',
  'Vancouver': 'https://images.unsplash.com/photo-1559511260-66a68e7c3764?w=400&q=80',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80';

interface CityCardProps {
  city: {
    name: string;
    country: string;
    imageUrl?: string;
  };
  onPress?: () => void;
  width?: number;
}

export default function CityCard({ city, onPress, width }: CityCardProps) {
  const imageUri = city.imageUrl || CITY_IMAGES[city.name] || FALLBACK_IMAGE;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        width ? { width } : null,
        pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
        Platform.OS === 'web' && { cursor: 'pointer' as any },
        Colors.shadows.medium,
      ]}
      onPress={onPress}
      accessibilityLabel={`Explore ${city.name}, ${city.country}`}
    >
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']}
        locations={[0.3, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        <Text style={styles.cityName}>{city.name}</Text>
        <Text style={styles.country}>{city.country}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 170,
    height: 130,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceSecondary,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  cityName: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
  },
  country: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
});
