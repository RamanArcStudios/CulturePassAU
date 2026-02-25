import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Share,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';  // ✅ FIXED: vector-icons
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useCallback } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const isWeb = Platform.OS === 'web';

interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  posterColor: string;
  imdbScore: number;
  language: string;
  duration: string;
  rating: string;
  genre: string[];
  description: string;
  director: string;
  cast: string[];
  city?: string;
  showtimes?: Array<{
    cinema: string;
    price: number;
    times: string[];
  }>;
}

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const {
    data: movie,
    isLoading,
    error,
  } = useQuery<Movie>({
    queryKey: ['movie', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/movies/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch movie: ${res.status}`);
      return res.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (!movie) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const shareUrl = `https://culturepass.app/movies/${id}`;
      const message = `Check out "${movie.title}" on CulturePass! 🎬\n${movie.genre.join(', ')} • ${movie.duration}\n⭐ ${movie.imdbScore}/10\n\n${shareUrl}`;

      if (isWeb && navigator?.share) {
        await navigator.share({ title: movie.title, text: message, url: shareUrl });
      } else if (isWeb && navigator?.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        Alert.alert('Link Copied!', 'Movie link copied to clipboard 🎥');
      } else {
        await Share.share({ title: movie.title, message });
      }

      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      if (error?.message && !error.message.includes('cancel')) {
        console.error('Share error:', error);
      }
    }
  }, [movie, id]);

  const handleBookTickets = useCallback(() => {
    if (!movie) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const query = encodeURIComponent(`${movie.title} tickets ${movie.city || 'Sydney'}`);
    Linking.openURL(`https://www.google.com/search?q=${query}`).catch((err) => {
      console.error('Failed to open link:', err);
      Alert.alert('Error', 'Unable to open ticket booking');
    });
  }, [movie]);

  const handleShowtimePress = useCallback((cinema: string, time: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Alert.alert(
      'Book Ticket',
      `"${movie?.title}"\n📍 ${cinema}\n🕒 ${time}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Find Tickets',
          onPress: () => {
            const query = encodeURIComponent(`${movie?.title} ${cinema} ${time} tickets`);
            Linking.openURL(`https://www.google.com/search?q=${query}`).catch(() => {
              Alert.alert('Error', 'Unable to open search');
            });
          },
        },
      ]
    );
  }, [movie]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading movie details...</Text>
      </View>
    );
  }

  if (!movie || error) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="film-outline" size={64} color={Colors.textTertiary} />
        <Text style={styles.errorTitle}>Movie Not Found</Text>
        <Text style={styles.errorText}>{error?.message || 'Movie details unavailable'}</Text>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backLink}>← Go Back to Movies</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={12}
          android_ripple={{ color: Colors.primary + '20', radius: 24 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {movie.title}
        </Text>
        <Pressable
          onPress={handleShare}
          hitSlop={12}
          android_ripple={{ color: Colors.primary + '20', radius: 24 }}
          accessibilityRole="button"
          accessibilityLabel="Share movie"
        >
          <Ionicons name="share-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 + bottomInset }]}
      >
        {/* Poster */}
        <View style={styles.posterArea}>
          <Image
            source={{ uri: movie.posterUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={400}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.posterBadge}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.posterScore}>{movie.imdbScore.toFixed(1)}</Text>
          </View>
        </View>

        {/* Info Section */}
        <Animated.View
          entering={FadeInDown.delay(150).duration(500)}
          style={styles.infoSection}
        >
          <Text style={styles.movieTitle}>{movie.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{movie.language}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{movie.duration}</Text>
            </View>
            <View style={styles.metaPill}>
              <Text style={styles.metaPillText}>{movie.rating}</Text>
            </View>
          </View>

          <View style={styles.genreRow}>
            {movie.genre.slice(0, 3).map((genre) => (
              <View key={genre} style={[styles.genrePill, { backgroundColor: movie.posterColor + '12' }]}>
                <Text style={[styles.genrePillText, { color: movie.posterColor }]}>{genre}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>{movie.description}</Text>

          <View style={styles.crewSection}>
            <Text style={styles.crewLabel}>Director</Text>
            <Text style={styles.crewValue}>{movie.director}</Text>
          </View>

          <View style={styles.crewSection}>
            <Text style={styles.crewLabel}>Cast</Text>
            <Text style={styles.crewValue} numberOfLines={1}>
              {movie.cast.slice(0, 3).join(', ')}
              {movie.cast.length > 3 && ' + more'}
            </Text>
          </View>
        </Animated.View>

        {/* Showtimes */}
        {movie.showtimes?.length ? (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.showtimeSection}>
            <Text style={styles.showtimeTitle}>Showtimes Nearby</Text>
            {movie.showtimes.map((showtime, index) => (
              <View key={index} style={styles.cinemaBlock}>
                <View style={styles.cinemaHeader}>
                  <Ionicons name="location-outline" size={18} color={Colors.primary} />
                  <View style={styles.cinemaInfo}>
                    <Text style={styles.cinemaName}>{showtime.cinema}</Text>
                    <Text style={styles.cinemaPrice}>From ${showtime.price}</Text>
                  </View>
                </View>
                <View style={styles.timesRow}>
                  {showtime.times.slice(0, 6).map((time) => (
                    <Pressable
                      key={time}
                      style={styles.timeChip}
                      onPress={() => handleShowtimePress(showtime.cinema, time)}
                      android_ripple={{ color: Colors.primary + '20' }}
                    >
                      <Text style={styles.timeText}>{time}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </Animated.View>
        ) : null}
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View entering={FadeIn.duration(600)} style={[styles.bottomBar, { paddingBottom: bottomInset }]}>
        <View style={styles.priceSection}>
          <Text style={styles.bottomPrice}>From ${movie.showtimes?.[0]?.price ?? '--'}</Text>
          <Text style={styles.bottomLabel}>Sydney Cinemas</Text>
        </View>
        <Pressable
          style={[styles.bookButton, Colors.shadows.medium]}
          onPress={handleBookTickets}
          android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <Ionicons name="ticket-outline" size={20} color="#FFF" />
          <Text style={styles.bookButtonText}>Book Tickets</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },

  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  backLink: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surfacePrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 24,
  },

  scrollContent: { paddingBottom: 20 },

  posterArea: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  posterBadge: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  posterScore: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },

  infoSection: { padding: 20, gap: 16 },
  movieTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    lineHeight: 34,
  },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaPill: {
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  metaPillText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  genreRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  genrePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  genrePillText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  description: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  crewSection: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  crewLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    minWidth: 70,
  },
  crewValue: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    flex: 1,
  },

  showtimeSection: { paddingHorizontal: 20, gap: 16 },
  showtimeTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  cinemaBlock: { backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.borderLight },
  cinemaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  cinemaInfo: { flex: 1 },
  cinemaName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  cinemaPrice: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
    marginTop: 2,
  },
  timesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 12,
    paddingTop: 8,
  },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  timeText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.surfacePrimary,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  priceSection: {},
  bottomPrice: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  bottomLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  bookButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
});
