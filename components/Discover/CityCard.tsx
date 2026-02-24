import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
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
}

export default function CityCard({ city, onPress }: CityCardProps) {
  const imageUri = city.imageUrl || CITY_IMAGES[city.name] || FALLBACK_IMAGE;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
        Platform.OS === 'web' && { cursor: 'pointer' as any },
        Colors.shadows.medium,
      ]}
      onPress={onPress}
    >
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      {Platform.OS === 'web' ? (
        <View style={styles.webOverlay}>
          <Text style={styles.cityName}>{city.name}</Text>
          <Text style={styles.country}>{city.country}</Text>
        </View>
      ) : (
        <BlurView intensity={60} tint="dark" style={styles.blurContent}>
          <Text style={styles.cityName}>{city.name}</Text>
          <Text style={styles.country}>{city.country}</Text>
        </BlurView>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 176,
    height: 130,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceSecondary,
  },
  blurContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  webOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(16px)',
  } as any,
  cityName: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  country: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#E5E5EA',
    marginTop: 2,
  },
});
