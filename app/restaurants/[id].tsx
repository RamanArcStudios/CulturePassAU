import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
  Linking,
  Share,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useCallback, useMemo } from 'react';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const isWeb = Platform.OS === 'web';

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  color: string;
  description: string;
  hours: string;
  address: string;
  phone: string;
  isOpen: boolean;
  reservationAvailable: boolean;
  features: string[];
  menuHighlights: string[];
  latitude?: number;
  longitude?: number;
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const {
    data: rest,
    isLoading,
    error,
  } = useQuery<Restaurant>({
    queryKey: ['/api/restaurants', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/restaurants/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch restaurant: ${res.status}`);
      return res.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (!rest) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const shareUrl = `https://culturepass.app/restaurants/${id}`;
      const message = `Check out ${rest.name} on CulturePass! ${rest.cuisine} - ${rest.priceRange}. ${rest.address}. Rating: ${rest.rating}/5 (${rest.reviews} reviews).\n\n${shareUrl}`;

      if (isWeb) {
        if (navigator?.share) {
          await navigator.share({
            title: `${rest.name} on CulturePass`,
            text: message,
            url: shareUrl,
          });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert('Link Copied', 'Restaurant link copied to clipboard');
        }
      } else {
        await Share.share({
          title: `${rest.name} on CulturePass`,
          message,
          url: shareUrl,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      if (error?.message && !error.message.includes('cancel')) {
        console.error('Share error:', error);
      }
    }
  }, [rest, id]);

  const handleCall = useCallback(() => {
    if (!rest?.phone) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Linking.openURL(`tel:${rest.phone}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  }, [rest]);

  const handleReserve = useCallback(() => {
    if (!rest) return;

    if (!isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(
      'Reservation Request',
      `Your reservation request at ${rest.name} has been submitted. You will receive a confirmation shortly.`,
      [{ text: 'OK' }]
    );
  }, [rest]);

  const handleDelivery = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert('Order Delivery', 'Opening delivery options...', [{ text: 'OK' }]);
  }, []);

  const handleDirections = useCallback(() => {
    if (!rest) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const address = encodeURIComponent(rest.address);
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
      default: `https://www.google.com/maps/search/?api=1&query=${address}`,
    });

    Linking.openURL(url!).catch(() => {
      Alert.alert('Error', 'Unable to open maps');
    });
  }, [rest]);

  const stars = useMemo(() => {
    if (!rest) return [];
    return [1, 2, 3, 4, 5].map((s) => ({
      key: s,
      name:
        s <= Math.floor(rest.rating)
          ? 'star'
          : s - 0.5 <= rest.rating
          ? 'star-half'
          : 'star-outline',
    }));
  }, [rest?.rating]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading restaurant...</Text>
      </View>
    );
  }

  if (!rest) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="restaurant-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.errorText}>
          {error ? 'Failed to load restaurant' : 'Restaurant not found'}
        </Text>
        <Pressable
          onPress={handleBack}
          android_ripple={{ color: Colors.primary + '20' }}
          style={styles.backButton}
        >
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {rest.name}
        </Text>
        <Pressable
          hitSlop={8}
          onPress={handleShare}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Share restaurant"
        >
          <Ionicons name="share-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + bottomInset }]}
      >
        <View style={styles.banner}>
          <Image
            source={{ uri: rest.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFill}
          />
          {rest.isOpen && (
            <View style={styles.openBadge}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>Open Now</Text>
            </View>
          )}
        </View>

        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(100).duration(400)}
          style={styles.infoSection}
        >
          <Text style={styles.name}>{rest.name}</Text>
          <Text style={styles.cuisine}>
            {rest.cuisine} | {rest.priceRange} | {rest.reviews} reviews
          </Text>
          <View style={styles.ratingRow}>
            {stars.map(({ key, name }) => (
              <Ionicons key={key} name={name as any} size={20} color={Colors.accent} />
            ))}
            <Text style={styles.ratingNum}>{rest.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.desc}>{rest.description}</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
              <Text style={styles.detailText}>{rest.hours}</Text>
            </View>
            <View style={styles.divider} />
            <Pressable
              style={styles.detailRow}
              onPress={handleDirections}
              android_ripple={{ color: Colors.primary + '10' }}
              accessibilityRole="button"
              accessibilityLabel="Get directions"
            >
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={[styles.detailText, { color: Colors.primary }]}>{rest.address}</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.detailRow}
              onPress={handleCall}
              android_ripple={{ color: Colors.primary + '10' }}
              accessibilityRole="button"
              accessibilityLabel="Call restaurant"
            >
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <Text style={[styles.detailText, { color: Colors.primary }]}>{rest.phone}</Text>
            </Pressable>
          </View>

          {rest.features?.length > 0 && (
            <>
              <Text style={styles.subTitle}>Features</Text>
              <View style={styles.featureGrid}>
                {rest.features.map((f: string) => (
                  <View key={f} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.featureLabel}>{f}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {rest.menuHighlights?.length > 0 && (
            <>
              <Text style={styles.subTitle}>Menu Highlights</Text>
              <View style={styles.menuGrid}>
                {rest.menuHighlights.map((item: string) => (
                  <View key={item} style={styles.menuItem}>
                    <Ionicons name="restaurant-outline" size={16} color={rest.color} />
                    <Text style={styles.menuItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={isWeb ? undefined : FadeIn.duration(300)}
        style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}
      >
        <Pressable
          style={styles.callButton}
          onPress={handleCall}
          android_ripple={{ color: Colors.primary + '20' }}
          accessibilityRole="button"
          accessibilityLabel="Call restaurant"
        >
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={styles.callText}>Call</Text>
        </Pressable>
        {rest.reservationAvailable ? (
          <Pressable
            style={styles.reserveButton}
            onPress={handleReserve}
            android_ripple={{ color: '#FFF3' }}
            accessibilityRole="button"
            accessibilityLabel="Make reservation"
          >
            <Ionicons name="calendar" size={18} color="#FFF" />
            <Text style={styles.reserveText}>Make Reservation</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.reserveButton, { backgroundColor: Colors.secondary }]}
            onPress={handleDelivery}
            android_ripple={{ color: '#FFF3' }}
            accessibilityRole="button"
            accessibilityLabel="Order delivery"
          >
            <Ionicons name="bicycle" size={18} color="#FFF" />
            <Text style={styles.reserveText}>Order Delivery</Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },

  scrollContent: {},

  banner: { height: 240, position: 'relative', overflow: 'hidden' },

  openBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  openDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },

  openText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },

  infoSection: { padding: 20, gap: 12 },

  name: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.text },

  cuisine: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  ratingNum: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.accent,
    marginLeft: 6,
  },

  desc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  detailCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },

  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },

  detailText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text, flex: 1 },

  divider: { height: 1, backgroundColor: Colors.divider, marginLeft: 44 },

  subTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginTop: 4,
  },

  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  featureLabel: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.text },

  menuGrid: { gap: 8 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  menuItemText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },

  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
  },

  callText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },

  reserveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },

  reserveText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    gap: 12,
  },

  loadingText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },

  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 40,
    gap: 12,
  },

  errorText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },

  backButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },

  backLink: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.textInverse },
});
