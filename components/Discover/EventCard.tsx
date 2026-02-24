import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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

function CardContent({ event, highlight }: Pick<EventCardProps, 'event' | 'highlight'>) {
  return (
    <>
      {event.priceLabel && (
        <View style={styles.priceBadge}>
          <Text style={styles.priceBadgeText}>{event.priceLabel}</Text>
        </View>
      )}
      <Text style={[styles.date, highlight && styles.dateHighlight]}>
        {formatDate(event.date)}
      </Text>
      <Text style={[styles.title, highlight && styles.titleHighlight]} numberOfLines={2}>
        {event.title}
      </Text>
      <View style={styles.metaRow}>
        <Ionicons name="location" size={13} color="rgba(255,255,255,0.75)" />
        <Text style={styles.location} numberOfLines={1}>
          {event.venue || event.city}
        </Text>
        {event.attending != null && event.attending > 0 && (
          <View style={styles.attendingBadge}>
            <Ionicons name="people" size={11} color="rgba(255,255,255,0.75)" />
            <Text style={styles.attendingText}>{event.attending}</Text>
          </View>
        )}
      </View>
      {event.communityTag ? (
        <View style={styles.culturePill}>
          <Text style={styles.culturePillText}>{event.communityTag}</Text>
        </View>
      ) : null}
    </>
  );
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
        accessibilityLabel={`${event.title}, ${formatDate(event.date)}`}
      >
        <Image
          source={{ uri: event.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.75)']}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {Platform.OS !== 'web' ? (
          <BlurView intensity={0} tint="dark" style={styles.contentContainer}>
            <CardContent event={event} highlight={highlight} />
          </BlurView>
        ) : (
          <View style={styles.contentContainer}>
            <CardContent event={event} highlight={highlight} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 240,
    height: 260,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceSecondary,
  },
  highlight: {
    width: '100%',
    height: 320,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 32,
  },
  priceBadge: {
    position: 'absolute',
    top: -80,
    right: 0,
    backgroundColor: 'rgba(255,215,0,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_700Bold',
    color: '#1C1C1E',
  },
  date: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFD700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateHighlight: {
    fontSize: 12,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 21,
  },
  titleHighlight: {
    fontSize: 18,
    lineHeight: 25,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 10,
  },
  location: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  attendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  attendingText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: 'rgba(255,255,255,0.85)',
  },
  culturePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  culturePillText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
