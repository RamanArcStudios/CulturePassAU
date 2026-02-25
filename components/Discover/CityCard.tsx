import React, { memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Platform,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CITY_IMAGES: Record<string, string> = {
  Sydney: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80',
  Melbourne: 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=400&q=80',
  Brisbane: 'https://images.unsplash.com/photo-1524293568345-75d62c3664f7?w=400&q=80',
  Auckland: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&q=80',
  Dubai: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80',
  London: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80',
  Toronto: 'https://images.unsplash.com/photo-1517090504332-eac354861490?w=400&q=80',
  Vancouver: 'https://images.unsplash.com/photo-1559511260-66a68e7c3764?w=400&q=80',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1477959858617-67f4a6f4a1de?w=400&q=80';

interface CityCardProps {
  city: {
    name: string;
    country: string;
    imageUrl?: string;
  };
  onPress?: () => void;
  width?: number;
  testID?: string;
}

function CityCardComponent({ city, onPress, width, testID = 'city-card' }: CityCardProps) {
  const colorScheme = useColorScheme();
  const imageUri = city.imageUrl || CITY_IMAGES[city.name as keyof typeof CITY_IMAGES] || FALLBACK_IMAGE;
  const cardWidth = width || Math.min(170, SCREEN_WIDTH * 0.42);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable
      testID={testID}
      style={({ pressed }) => [
        styles.card,
        { width: cardWidth },
        pressed && styles.pressed,
        Platform.OS === 'web' && styles.webCursor,
        Colors.shadows.medium,
      ]}
      onPress={handlePress}
      android_ripple={{ color: 'rgba(255,255,255,0.2)', radius: 25, borderless: false }}
      accessibilityLabel={`Explore ${city.name}, ${city.country}`}
      accessibilityHint="Tap to view city details"
      accessibilityRole="button"
    >
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        defaultSource={{ uri: FALLBACK_IMAGE }}
        fadeDuration={300}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        locations={[0.2, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.cityName} numberOfLines={1}>
          {city.name}
        </Text>
        <Text style={styles.country} numberOfLines={1}>
          {city.country}
        </Text>
      </View>
    </Pressable>
  );
}

export default memo(CityCardComponent);

const styles = StyleSheet.create({
  card: {
    height: 130,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
  webCursor: {
    cursor: 'pointer' as const,
  },
  content: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  cityName: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    includeFontPadding: false,
  },
  country: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },
});
