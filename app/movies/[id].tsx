import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Image, Share, ActivityIndicator, Linking } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { data: movie, isLoading } = useQuery({
    queryKey: ['/api/movies', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/movies/${id}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!movie) return <View style={styles.container}><Text>Movie not found</Text></View>;

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const shareUrl = `https://culturepass.app/movies/${id}`;
      await Share.share({
        title: movie.title,
        message: `Check out ${movie.title} on CulturePass! ${movie.genre.join(', ')} - ${movie.duration}. Rating: ${movie.imdbScore}/10. Book tickets now!\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {}
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}><Ionicons name="arrow-back" size={24} color={Colors.text} /></Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{movie.title}</Text>
        <Pressable hitSlop={8} onPress={handleShare}><Ionicons name="share-outline" size={22} color={Colors.text} /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.posterArea]}>
          <Image source={{ uri: movie.posterUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          <View style={styles.posterBadge}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.posterScore}>{movie.imdbScore}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.movieTitle}>{movie.title}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}><Text style={styles.metaPillText}>{movie.language}</Text></View>
            <View style={styles.metaPill}><Text style={styles.metaPillText}>{movie.duration}</Text></View>
            <View style={styles.metaPill}><Text style={styles.metaPillText}>{movie.rating}</Text></View>
          </View>
          <View style={styles.genreRow}>
            {movie.genre.map(g => (
              <View key={g} style={[styles.genrePill, { backgroundColor: movie.posterColor + '15' }]}>
                <Text style={[styles.genrePillText, { color: movie.posterColor }]}>{g}</Text>
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
            <Text style={styles.crewValue}>{movie.cast.join(', ')}</Text>
          </View>
        </View>

        {movie.showtimes && movie.showtimes.length > 0 && (
          <View style={styles.showtimeSection}>
            <Text style={styles.showtimeTitle}>Where to Watch</Text>
            {movie.showtimes.map((st: any, ci: number) => (
              <View key={ci} style={styles.cinemaBlock}>
                <View style={styles.cinemaHeader}>
                  <Ionicons name="location" size={16} color={Colors.textSecondary} />
                  <Text style={styles.cinemaName}>{st.cinema}</Text>
                  <Text style={styles.cinemaPrice}>From ${st.price}</Text>
                </View>
                <View style={styles.timesRow}>
                  {st.times.map((time: string) => (
                    <View key={time} style={styles.timeChip}>
                      <Text style={styles.timeText}>{time}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>From ${movie.showtimes?.[0]?.price || '—'}</Text>
          <Text style={styles.bottomLabel}>at nearby cinemas</Text>
        </View>
        <Pressable
          style={styles.bookButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const query = encodeURIComponent(`${movie.title} movie tickets ${movie.city || ''}`);
            Linking.openURL(`https://www.google.com/search?q=${query}`);
          }}
        >
          <Ionicons name="open-outline" size={18} color="#FFF" />
          <Text style={styles.bookButtonText}>Book Tickets</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.text, flex: 1, textAlign: 'center', marginHorizontal: 12 },
  posterArea: { height: 240, position: 'relative', overflow: 'hidden' },
  posterBadge: { position: 'absolute', bottom: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  posterScore: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  infoSection: { padding: 20, gap: 10 },
  movieTitle: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.text },
  metaRow: { flexDirection: 'row', gap: 8 },
  metaPill: { backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  metaPillText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  genreRow: { flexDirection: 'row', gap: 8 },
  genrePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  genrePillText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  description: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  crewSection: { flexDirection: 'row', gap: 8 },
  crewLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text, width: 70 },
  crewValue: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, flex: 1 },
  showtimeSection: { paddingHorizontal: 20, gap: 12 },
  showtimeTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  cinemaBlock: { gap: 10 },
  cinemaHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder },
  cinemaName: { flex: 1, fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  cinemaPrice: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  timesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingLeft: 8 },
  timeChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.cardBorder },
  timeText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  bottomPrice: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text },
  bottomLabel: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  bookButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  bookButtonText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
});
