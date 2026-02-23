import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Linking, Image, Share, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { data: rest, isLoading } = useQuery({
    queryKey: ['/api/restaurants', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/restaurants/${id}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!rest) return <View style={styles.container}><Text>Restaurant not found</Text></View>;

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: `${rest.name} on CulturePass`,
        message: `Check out ${rest.name} on CulturePass! ${rest.cuisine} - ${rest.priceRange}. ${rest.address}. Rating: ${rest.rating}/5 (${rest.reviews} reviews).`,
      });
    } catch {}
  };

  const handleReserve = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Reservation Request', `Your reservation request at ${rest.name} has been submitted. You will receive a confirmation shortly.`, [{ text: 'OK' }]);
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}><Ionicons name="arrow-back" size={24} color={Colors.text} /></Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{rest.name}</Text>
        <Pressable hitSlop={8} onPress={handleShare}><Ionicons name="share-outline" size={22} color={Colors.text} /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={[styles.banner]}>
          <Image source={{ uri: rest.imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          {rest.isOpen && <View style={styles.openBadge}><View style={styles.openDot} /><Text style={styles.openText}>Open Now</Text></View>}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.name}>{rest.name}</Text>
          <Text style={styles.cuisine}>{rest.cuisine} | {rest.priceRange} | {rest.reviews} reviews</Text>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => (
              <Ionicons key={s} name={s <= Math.floor(rest.rating) ? "star" : s - 0.5 <= rest.rating ? "star-half" : "star-outline"} size={20} color={Colors.accent} />
            ))}
            <Text style={styles.ratingNum}>{rest.rating}</Text>
          </View>
          <Text style={styles.desc}>{rest.description}</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}><Ionicons name="time-outline" size={18} color={Colors.primary} /><Text style={styles.detailText}>{rest.hours}</Text></View>
            <View style={styles.divider} />
            <View style={styles.detailRow}><Ionicons name="location-outline" size={18} color={Colors.primary} /><Text style={styles.detailText}>{rest.address}</Text></View>
            <View style={styles.divider} />
            <Pressable style={styles.detailRow} onPress={() => Linking.openURL(`tel:${rest.phone}`)}>
              <Ionicons name="call-outline" size={18} color={Colors.primary} /><Text style={[styles.detailText, { color: Colors.primary }]}>{rest.phone}</Text>
            </Pressable>
          </View>

          <Text style={styles.subTitle}>Features</Text>
          <View style={styles.featureGrid}>
            {rest.features.map(f => (
              <View key={f} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.featureLabel}>{f}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subTitle}>Menu Highlights</Text>
          <View style={styles.menuGrid}>
            {rest.menuHighlights.map(item => (
              <View key={item} style={styles.menuItem}>
                <Ionicons name="restaurant-outline" size={16} color={rest.color} />
                <Text style={styles.menuItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 12 }]}>
        <Pressable style={styles.callButton} onPress={() => Linking.openURL(`tel:${rest.phone}`)}>
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={styles.callText}>Call</Text>
        </Pressable>
        {rest.reservationAvailable ? (
          <Pressable style={styles.reserveButton} onPress={handleReserve}>
            <Ionicons name="calendar" size={18} color="#FFF" />
            <Text style={styles.reserveText}>Make Reservation</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.reserveButton, { backgroundColor: Colors.secondary }]} onPress={() => Alert.alert('Order', 'Opening delivery options...')}>
            <Ionicons name="bicycle" size={18} color="#FFF" />
            <Text style={styles.reserveText}>Order Delivery</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.text, flex: 1, textAlign: 'center', marginHorizontal: 12 },
  banner: { height: 200, position: 'relative', overflow: 'hidden' },
  openBadge: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  openDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  openText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  infoSection: { padding: 20, gap: 12 },
  name: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.text },
  cuisine: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingNum: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.accent, marginLeft: 6 },
  desc: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  detailCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  detailText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text, flex: 1 },
  divider: { height: 1, backgroundColor: Colors.divider, marginLeft: 44 },
  subTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, marginTop: 4 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.success + '10', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  featureLabel: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.text },
  menuGrid: { gap: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  menuItemText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 14, backgroundColor: Colors.card, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  callButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14 },
  callText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  reserveButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: 14 },
  reserveText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
});
