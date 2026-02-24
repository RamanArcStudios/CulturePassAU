import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Image, Share, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { data: act, isLoading } = useQuery({
    queryKey: ['/api/activities', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/activities/${id}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!act) return <View style={styles.container}><Text>Activity not found</Text></View>;

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const shareUrl = `https://culturepass.app/activities/${id}`;
      await Share.share({
        title: `${act.name} on CulturePass`,
        message: `Check out ${act.name} on CulturePass! ${act.category} - ${act.duration}. ${act.location}. ${act.priceLabel}. Rating: ${act.rating}/5.\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {}
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}><Ionicons name="arrow-back" size={24} color={Colors.text} /></Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{act.name}</Text>
        <Pressable hitSlop={8} onPress={handleShare}><Ionicons name="share-outline" size={22} color={Colors.text} /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.banner]}>
          <Image source={{ uri: act.imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          {act.isPopular && <View style={styles.popularBadge}><Ionicons name="flame" size={14} color="#FFF" /><Text style={styles.popularText}>Popular</Text></View>}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{act.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaPill}><Ionicons name="compass-outline" size={14} color={Colors.textSecondary} /><Text style={styles.metaText}>{act.category}</Text></View>
            <View style={styles.metaPill}><Ionicons name="time-outline" size={14} color={Colors.textSecondary} /><Text style={styles.metaText}>{act.duration}</Text></View>
            <View style={styles.metaPill}><Ionicons name="people-outline" size={14} color={Colors.textSecondary} /><Text style={styles.metaText}>{act.ageGroup}</Text></View>
          </View>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => <Ionicons key={s} name={s <= Math.floor(act.rating) ? "star" : "star-outline"} size={20} color={Colors.accent} />)}
            <Text style={styles.ratingNum}>{act.rating}</Text>
            <Text style={styles.reviewCount}>({act.reviews} reviews)</Text>
          </View>
          <Text style={styles.desc}>{act.description}</Text>

          <View style={styles.locCard}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.locText}>{act.location}</Text>
          </View>

          <Text style={styles.subTitle}>Highlights</Text>
          <View style={styles.highlightGrid}>
            {act.highlights.map((h: string) => (
              <View key={h} style={styles.highlightItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 12 }]}>
        <View><Text style={styles.bottomPrice}>{act.priceLabel}</Text></View>
        <Pressable style={styles.bookBtn} onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Booking Confirmed!', `Your booking for ${act.name} has been confirmed.\n\nPrice: ${act.priceLabel}`);
        }}>
          <Ionicons name="ticket" size={18} color="#FFF" />
          <Text style={styles.bookText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.text, flex: 1, textAlign: 'center', marginHorizontal: 12 },
  banner: { height: 220, position: 'relative', overflow: 'hidden' },
  popularBadge: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  popularText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  info: { padding: 20, gap: 12 },
  name: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.text },
  metaRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  metaText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingNum: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.accent, marginLeft: 6 },
  reviewCount: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  desc: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  locCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder },
  locText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text },
  subTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text },
  highlightGrid: { gap: 10 },
  highlightItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  highlightText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  bottomPrice: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text },
  bookBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  bookText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
});
