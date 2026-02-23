import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
        style={[
          styles.card,
          highlight && styles.highlight,
          Platform.OS === 'web' && { cursor: 'pointer' as any },
        ]}
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id } })}
      >
        <Image
          source={{ uri: event.imageUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.content}>
          <Text style={[styles.date, highlight && styles.dateHighlight]}>
            {formatDate(event.date)}
          </Text>
          <Text style={[styles.title, highlight && styles.titleHighlight]} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={12} color="#aaa" />
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
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 280,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#141419',
  },
  highlight: {
    width: '100%',
    height: 260,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  date: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  dateHighlight: {
    color: '#FFD700',
    fontSize: 14,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  titleHighlight: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#8E8E93',
    flex: 1,
  },
  culturePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  culturePillText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: '#007AFF',
  },
});
