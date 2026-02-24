import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Linking, Image, Share, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';

export default function ShoppingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { data: store, isLoading } = useQuery({
    queryKey: ['/api/shopping', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/shopping/${id}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  if (!store) return <View style={styles.container}><Text>Store not found</Text></View>;

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const shareUrl = `https://culturepass.app/shopping/${id}`;
      await Share.share({
        title: `${store.name} on CulturePass`,
        message: `Check out ${store.name} on CulturePass! ${store.category} - ${store.location}. Rating: ${store.rating}/5 (${store.reviews} reviews).${store.deals.length > 0 ? ` ${store.deals.length} deals available!` : ''}\n\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {}
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}><Ionicons name="arrow-back" size={24} color={Colors.text} /></Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{store.name}</Text>
        <Pressable hitSlop={8} onPress={handleShare}><Ionicons name="share-outline" size={22} color={Colors.text} /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.banner]}>
          <Image source={{ uri: store.imageUrl }} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          {store.isOpen && <View style={styles.openBadge}><View style={styles.openDot} /><Text style={styles.openText}>Open Now</Text></View>}
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.cat}>{store.category}</Text>
          <View style={styles.ratingRow}>
            {[1,2,3,4,5].map(s => <Ionicons key={s} name={s <= Math.floor(store.rating) ? "star" : "star-outline"} size={20} color={Colors.accent} />)}
            <Text style={styles.ratingNum}>{store.rating}</Text>
            <Text style={styles.reviewCount}>({store.reviews} reviews)</Text>
          </View>
          <Text style={styles.desc}>{store.description}</Text>

          <View style={styles.locCard}>
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.locText}>{store.location}</Text>
          </View>

          <View style={styles.featureRow}>
            {store.deliveryAvailable && (
              <View style={styles.featurePill}><Ionicons name="bicycle" size={16} color={Colors.secondary} /><Text style={styles.featureText}>Delivery Available</Text></View>
            )}
            {store.isOpen && (
              <View style={styles.featurePill}><Ionicons name="checkmark-circle" size={16} color={Colors.success} /><Text style={styles.featureText}>Open Now</Text></View>
            )}
          </View>

          {store.deals.length > 0 && (
            <>
              <Text style={styles.subTitle}>Current Deals & Offers</Text>
              {store.deals.map((deal, i) => (
                <View key={i} style={styles.dealCard}>
                  <View style={styles.dealHeader}>
                    <Ionicons name="pricetag" size={18} color={Colors.primary} />
                    <Text style={styles.dealTitle}>{deal.title}</Text>
                  </View>
                  <View style={styles.dealBody}>
                    <View style={styles.discountBadge}><Text style={styles.discountText}>{deal.discount}</Text></View>
                    <Text style={styles.dealValid}>Valid till {new Date(deal.validTill).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.text, flex: 1, textAlign: 'center', marginHorizontal: 12 },
  banner: { height: 180, position: 'relative', overflow: 'hidden' },
  openBadge: { position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  openDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  openText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  info: { padding: 20, gap: 12 },
  name: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.text },
  cat: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingNum: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.accent, marginLeft: 6 },
  reviewCount: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  desc: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  locCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder },
  locText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text },
  featureRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  featurePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.success + '10', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  featureText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.text },
  subTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, marginTop: 4 },
  dealCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.primary + '30', overflow: 'hidden' },
  dealHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  dealTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  dealBody: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  discountBadge: { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  discountText: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  dealValid: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
});
