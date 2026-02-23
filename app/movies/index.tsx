import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sampleMovies, movieGenres } from '@/data/mockData';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocationFilter } from '@/hooks/useLocationFilter';

export default function MoviesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedGenre, setSelectedGenre] = useState('All');
  const { filterByLocation } = useLocationFilter();

  const filtered = useMemo(() => {
    if (selectedGenre === 'All') return filterByLocation(sampleMovies);
    return filterByLocation(sampleMovies).filter(m => m.genre.includes(selectedGenre));
  }, [selectedGenre, filterByLocation]);

  const trending = filterByLocation(sampleMovies).filter(m => m.isTrending);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Movies</Text>
        <Pressable hitSlop={8}>
          <Ionicons name="search-outline" size={24} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {trending.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Now Trending</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
              {trending.map((movie, i) => (
                <Animated.View key={movie.id} entering={FadeInDown.delay(i * 80).duration(400)}>
                  <Pressable style={styles.trendingCard} onPress={() => router.push({ pathname: '/movies/[id]', params: { id: movie.id } })}>
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: movie.posterUrl }} style={styles.trendingPoster} />
                      <View style={styles.trendingBadge}>
                        <Ionicons name="trending-up" size={12} color="#FFF" />
                      </View>
                    </View>
                    <Text style={styles.trendingTitle} numberOfLines={2}>{movie.title}</Text>
                    <Text style={styles.trendingLang}>{movie.language}</Text>
                    <View style={styles.trendingMeta}>
                      <Ionicons name="star" size={12} color={Colors.accent} />
                      <Text style={styles.trendingScore}>{movie.imdbScore}</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Genre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreRow}>
            {movieGenres.map(g => {
              const isActive = selectedGenre === g.label;
              return (
                <Pressable key={g.label} style={[styles.genreChip, isActive ? { backgroundColor: g.color, borderColor: g.color } : { backgroundColor: Colors.surface, borderColor: Colors.borderLight }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedGenre(g.label); }}>
                  <Ionicons name={g.icon as any} size={15} color={isActive ? '#FFF' : g.color} />
                  <Text style={[styles.genreText, isActive && { color: '#FFF' }]}>{g.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.resultCount}>{filtered.length} movies showing</Text>
          {filtered.map((movie, index) => (
            <Animated.View key={movie.id} entering={FadeInDown.delay(index * 60).duration(400)}>
              <Pressable style={styles.movieCard} onPress={() => router.push({ pathname: '/movies/[id]', params: { id: movie.id } })}>
                <Image source={{ uri: movie.posterUrl }} style={styles.moviePoster} />
                <View style={styles.movieInfo}>
                  <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
                  <Text style={styles.movieMeta}>{movie.language} | {movie.duration} | {movie.rating}</Text>
                  <View style={styles.movieGenres}>
                    {movie.genre.map(g => (
                      <View key={g} style={styles.genrePill}><Text style={styles.genrePillText}>{g}</Text></View>
                    ))}
                  </View>
                  <View style={styles.movieBottom}>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color={Colors.accent} />
                      <Text style={styles.imdbScore}>{movie.imdbScore}</Text>
                    </View>
                    <Text style={styles.moviePrice}>From ${movie.showtimes[0]?.price}</Text>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  title: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text, paddingHorizontal: 20, marginBottom: 14 },
  trendingCard: { width: 150, gap: 6 },
  trendingPoster: { width: 150, height: 200, borderRadius: 16 },
  trendingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.primary, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trendingTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  trendingLang: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  trendingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trendingScore: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.accent },
  genreRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 6 },
  genreChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, borderWidth: 1 },
  genreText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  listSection: { paddingHorizontal: 20 },
  resultCount: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginBottom: 10 },
  movieCard: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  moviePoster: { width: 100 },
  movieInfo: { flex: 1, padding: 14, gap: 4 },
  movieTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.text },
  movieMeta: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  movieGenres: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  genrePill: { backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  genrePillText: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  movieBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  imdbScore: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.accent },
  moviePrice: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.primary },
});
