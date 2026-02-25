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
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: string;
    venue?: string;
    city?: string;
    imageUrl?: string;
    communityTag?: string;
    attending?: number;
    priceLabel?: string;
    isFeatured?: boolean;
  };
  highlight?: boolean;
  index?: number;
  testID?: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const day = date.getDate();
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                   'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${day} ${months[date.getMonth()]}`;
  } catch {
    return dateStr;
  }
}

export default function EventCard({
  event,
  highlight = false,
  index = 0,
  testID = 'event-card',
}: EventCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/event/${event.id}`);
  };

  const location = event.venue || event.city || 'Sydney';
  const attendingCount = event.attending ?? 0;

  return (
    <Animated.View 
      entering={FadeInDown.delay((index * 120) + 200).duration(700)}
      testID={testID}
    >
      <Pressable
        testID={`${testID}-${event.id}`}
        style={({ pressed }) => [
          styles.card,
          highlight && styles.highlightCard,
          {
            shadowColor: Colors.shadow[colorScheme || 'light'],
            borderColor: Colors.borderLight[colorScheme || 'light'],
          },
          pressed && styles.pressed,
          Platform.OS === 'web' && styles.webCursor,
          Colors.shadows.medium,
        ]}
        onPress={handlePress}
        android_ripple={{ 
          color: 'rgba(255,255,255,0.2)', 
          radius: 32, 
          borderless: false 
        }}
        accessibilityLabel={`${event.title}, ${formatDate(event.date)}, ${location}`}
        accessibilityRole="button"
        accessibilityHint="Tap to view event details"
      >
        <Image
          source={{ uri: event.imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />

        <LinearGradient
          colors={[
            'transparent', 
            'rgba(0,0,0,0.2)', 
            'rgba(0,0,0,0.6)', 
            'rgba(0,0,0,0.9)'
          ]}
          locations={[0, 0.2, 0.6, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.contentContainer}>
          {event.priceLabel && (
            <View style={[
              styles.priceBadge, 
              { backgroundColor: Colors.primary + (isDark ? 'CC' : 'E6') }
            ]}>
              <Text style={styles.priceBadgeText}>{event.priceLabel}</Text>
            </View>
          )}
          
          <Text style={[
            styles.date, 
            highlight && styles.dateHighlight
          ]}>
            {formatDate(event.date)}
          </Text>
          
          <Text style={[
            styles.title, 
            highlight && styles.titleHighlight
          ]} numberOfLines={2}>
            {event.title}
          </Text>
          
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
            {attendingCount > 0 && (
              <View style={styles.attendingBadge}>
                <Ionicons name="people-outline" size={12} color="rgba(255,255,255,0.85)" />
                <Text style={styles.attendingText}>{attendingCount}</Text>
              </View>
            )}
          </View>
          
          {event.communityTag && (
            <View style={styles.culturePill}>
              <Text style={styles.culturePillText}>{event.communityTag}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 248,
    height: 280,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  highlightCard: {
    width: '100%',
    height: 340,
    borderWidth: 2,
    borderColor: Colors.accent + '66',
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  webCursor: {
    cursor: 'pointer' as const,
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
  },
  priceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  priceBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textInverse,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.accent,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    includeFontPadding: false,
  },
  dateHighlight: {
    fontSize: 14,
    color: '#FFD700',
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 22,
    includeFontPadding: false,
  },
  titleHighlight: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  location: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    includeFontPadding: false,
  },
  attendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  attendingText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255,255,255,0.95)',
  },
  culturePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  culturePillText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
