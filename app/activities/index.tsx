import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sampleActivities, activityCategories } from '@/data/mockData';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useLocationFilter } from '@/hooks/useLocationFilter';

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedCat, setSelectedCat] = useState('All');
  const { filterByLocation } = useLocationFilter();

  const filtered = useMemo(() => {
    if (selectedCat === 'All') return filterByLocation(sampleActivities);
    return filterByLocation(sampleActivities).filter(a => a.category === selectedCat);
  }, [selectedCat, filterByLocation]);

  const popular = filterByLocation(sampleActivities).filter(a => a.isPopular);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}><Ionicons name="arrow-back" size={24} color={Colors.text} /></Pressable>
        <Text style={styles.title}>Activities</Text>
        <Pressable hitSlop={8}><Ionicons name="search-outline" size={24} color={Colors.text} /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {popular.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Near You</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
              {popular.map((act, i) => (
                <Animated.View key={act.id} entering={FadeInDown.delay(i * 80).duration(400)}>
                  <Pressable style={styles.popularCard} onPress={() => router.push({ pathname: '/activities/[id]', params: { id: act.id } })}>
                    <View style={[styles.popularBanner]}>
                      <Image source={{ uri: act.imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
                    </View>
                    <View style={styles.popularInfo}>
                      <Text style={styles.popularName} numberOfLines={1}>{act.name}</Text>
                      <Text style={styles.popularCat}>{act.category}</Text>
                      <View style={styles.popularMeta}>
                        <Text style={styles.popularPrice}>{act.priceLabel}</Text>
                        <View style={styles.miniRating}><Ionicons name="star" size={11} color={Colors.accent} /><Text style={styles.miniRatingText}>{act.rating}</Text></View>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {activityCategories.map(c => {
              const isActive = selectedCat === c.label;
              return (
                <Pressable key={c.label} style={[styles.catChip, isActive ? { backgroundColor: c.color, borderColor: c.color } : { backgroundColor: Colors.surface, borderColor: Colors.borderLight }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedCat(c.label); }}>
                  <Ionicons name={c.icon as any} size={15} color={isActive ? '#FFF' : c.color} />
                  <Text style={[styles.catText, isActive && { color: '#FFF' }]}>{c.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.listSection}>
          <Text style={styles.resultCount}>{filtered.length} activities found</Text>
          {filtered.map((act, index) => (
            <Animated.View key={act.id} entering={FadeInDown.delay(index * 60).duration(400)}>
              <Pressable style={styles.card} onPress={() => router.push({ pathname: '/activities/[id]', params: { id: act.id } })}>
                <Image source={{ uri: act.imageUrl }} style={styles.cardIcon} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName}>{act.name}</Text>
                  <Text style={styles.cardCat}>{act.category} | {act.duration}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{act.description}</Text>
                  <View style={styles.cardBottom}>
                    <Text style={styles.cardPrice}>{act.priceLabel}</Text>
                    <View style={styles.cardRating}>
                      <Ionicons name="star" size={13} color={Colors.accent} />
                      <Text style={styles.cardRatingText}>{act.rating} ({act.reviews})</Text>
                    </View>
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
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text, paddingHorizontal: 20, marginBottom: 14 },
  popularCard: { width: 180, backgroundColor: Colors.card, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.cardBorder },
  popularBanner: { height: 100, overflow: 'hidden' },
  popularInfo: { padding: 10, gap: 2 },
  popularName: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  popularCat: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  popularMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  popularPrice: { fontSize: 13, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  miniRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniRatingText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.accent },
  catRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 6 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, borderWidth: 1 },
  catText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  listSection: { paddingHorizontal: 20 },
  resultCount: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginBottom: 10 },
  card: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: Colors.cardBorder, gap: 14 },
  cardIcon: { width: 60, height: 60, borderRadius: 16, overflow: 'hidden' },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.text },
  cardCat: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  cardDesc: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 19 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardPrice: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  cardRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardRatingText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
});
