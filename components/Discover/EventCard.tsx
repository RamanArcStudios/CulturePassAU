import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[monthIndex] || ''}`;
}

export default function EventCard({ event, highlight, index = 0 }: EventCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay((index || 0) * 80 + 100).duration(500)}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          highlight && styles.highlight,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          Platform.OS === 'web' && { cursor: 'pointer' as any },
          Colors.shadows.medium,
        ]}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      >
        <Image
          source={{ uri: event.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        {Platform.OS === 'web' ? (
          <View style={styles.webOverlay}>
            <Text style={[styles.date, highlight && styles.dateHighlight]}>
              {formatDate(event.date)}
            </Text>
            <Text style={[styles.title, highlight && styles.titleHighlight]} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons name="location" size={14} color="#E5E5EA" />
              <Text style={styles.location} numberOfLines={1}>
                {event.venue || event.city}
              </Text>
            </View>
            {event.communityTag ? (
              <View style={styles.culturePill}>
                <Text style={styles.culturePillText}>{event.communityTag}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
            <Text style={[styles.date, highlight && styles.dateHighlight]}>
              {formatDate(event.date)}
            </Text>
            <Text style={[styles.title, highlight && styles.titleHighlight]} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.metaRow}>
              <Ionicons name="location" size={14} color="#E5E5EA" />
              <Text style={styles.location} numberOfLines={1}>
                {event.venue || event.city}
              </Text>
            </View>
            {event.communityTag ? (
              <View style={styles.culturePill}>
                <Text style={styles.culturePillText}>{event.communityTag}</Text>
              </View>
            ) : null}
          </BlurView>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 300,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceSecondary,
  },
  highlight: {
    width: 320,
    height: 340,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  blurContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 30,
    borderTopColor: 'rgba(255,255,255,0.1)',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  webOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(20px)',
  } as any,
  date: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFD700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateHighlight: {
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 10,
    lineHeight: 24,
  },
  titleHighlight: {
    fontSize: 22,
    lineHeight: 28,
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
    color: '#E5E5EA',
    flex: 1,
  },
  culturePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  culturePillText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
