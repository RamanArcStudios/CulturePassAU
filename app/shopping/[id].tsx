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

interface Deal {
  title: string;
  discount: string;
  validTill: string;
}

interface Store {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  color?: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  description: string;
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  deliveryAvailable: boolean;
  deals: Deal[];
  latitude?: number;
  longitude?: number;
}

export default function ShoppingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const {
    data: store,
    isLoading,
    error,
  } = useQuery<Store>({
    queryKey: ['/api/shopping', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/shopping/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch store: ${res.status}`);
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
    if (!store) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const shareUrl = `https://culturepass.app/shopping/${id}`;
      const dealsInfo =
        store.deals.length > 0 ? ` ${store.deals.length} deals available!` : '';
      const message = `Check out ${store.name} on CulturePass! ${store.category} - ${store.location}. Rating: ${store.rating}/5 (${store.reviews} reviews).${dealsInfo}\n\n${shareUrl}`;

      if (isWeb) {
        if (navigator?.share) {
          await navigator.share({
            title: `${store.name} on CulturePass`,
            text: message,
            url: shareUrl,
          });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert('Link Copied', 'Store link copied to clipboard');
        }
      } else {
        await Share.share({
          title: `${store.name} on CulturePass`,
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
  }, [store, id]);

  const handleDirections = useCallback(() => {
    if (!store) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const address = encodeURIComponent(store.address || store.location);
    const url = Platform.select({
      ios: `maps:0,0?q=${address}`,
      android: `geo:0,0?q=${address}`,
      default: `https://www.google.com/maps/search/?api=1&query=${address}`,
    });

    Linking.openURL(url!).catch(() => {
      Alert.alert('Error', 'Unable to open maps');
    });
  }, [store]);

  const handleCall = useCallback(() => {
    if (!store?.phone) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Linking.openURL(`tel:${store.phone}`).catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  }, [store]);

  const handleWebsite = useCallback(() => {
    if (!store?.website) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Linking.openURL(store.website).catch(() => {
      Alert.alert('Error', 'Unable to open website');
    });
  }, [store]);

  const stars = useMemo(() => {
    if (!store) return [];
    return [1, 2, 3, 4, 5].map((s) => ({
      key: s,
      name: s <= Math.floor(store.rating) ? 'star' : 'star-outline',
    }));
  }, [store?.rating]);

  const formatDate = useCallback((dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading store...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="bag-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.errorText}>
          {error ? 'Failed to load store' : 'Store not found'}
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
          {store.name}
        </Text>
        <Pressable
          hitSlop={8}
          onPress={handleShare}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Share store"
        >
          <Ionicons name="share-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + bottomInset }]}
      >
        <View style={styles.banner}>
          <Image
            source={{ uri: store.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
            style={StyleSheet.absoluteFill}
          />
          {store.isOpen && (
            <View style={styles.openBadge}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>Open Now</Text>
            </View>
          )}
        </View>

        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(100).duration(400)}
          style={styles.info}
        >
          <Text style={styles.name}>{store.name}</Text>
          <Text style={styles.cat}>{store.category}</Text>
          <View style={styles.ratingRow}>
            {stars.map(({ key, name }) => (
              <Ionicons key={key} name={name as any} size={20} color={Colors.accent} />
            ))}
            <Text style={styles.ratingNum}>{store.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({store.reviews} reviews)</Text>
          </View>
          <Text style={styles.desc}>{store.description}</Text>

          <Pressable
            style={styles.locCard}
            onPress={handleDirections}
            android_ripple={{ color: Colors.primary + '10' }}
            accessibilityRole="button"
            accessibilityLabel="Get directions"
          >
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={[styles.locText, { color: Colors.primary }]}>{store.location}</Text>
          </Pressable>

          {(store.phone || store.website) && (
            <View style={styles.contactRow}>
              {store.phone && (
                <Pressable
                  style={styles.contactBtn}
                  onPress={handleCall}
                  android_ripple={{ color: Colors.primary + '20' }}
                  accessibilityRole="button"
                  accessibilityLabel="Call store"
                >
                  <Ionicons name="call" size={18} color={Colors.primary} />
                  <Text style={styles.contactBtnText}>Call</Text>
                </Pressable>
              )}
              {store.website && (
                <Pressable
                  style={styles.contactBtn}
                  onPress={handleWebsite}
                  android_ripple={{ color: Colors.primary + '20' }}
                  accessibilityRole="button"
                  accessibilityLabel="Visit website"
                >
                  <Ionicons name="globe" size={18} color={Colors.primary} />
                  <Text style={styles.contactBtnText}>Website</Text>
                </Pressable>
              )}
            </View>
          )}

          {(store.deliveryAvailable || store.isOpen) && (
            <View style={styles.featureRow}>
              {store.deliveryAvailable && (
                <View style={styles.featurePill}>
                  <Ionicons name="bicycle" size={16} color={Colors.secondary} />
                  <Text style={styles.featureText}>Delivery Available</Text>
                </View>
              )}
              {store.isOpen && (
                <View style={[styles.featurePill, { backgroundColor: Colors.success + '10' }]}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.featureText}>Open Now</Text>
                </View>
              )}
            </View>
          )}

          {store.deals && store.deals.length > 0 && (
            <>
              <Text style={styles.subTitle}>Current Deals & Offers</Text>
              {store.deals.map((deal, i) => (
                <Animated.View
                  key={i}
                  entering={isWeb ? undefined : FadeInDown.delay(200 + i * 50).duration(400)}
                >
                  <View style={styles.dealCard}>
                    <View style={styles.dealHeader}>
                      <Ionicons name="pricetag" size={18} color={Colors.primary} />
                      <Text style={styles.dealTitle}>{deal.title}</Text>
                    </View>
                    <View style={styles.dealBody}>
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{deal.discount}</Text>
                      </View>
                      <Text style={styles.dealValid}>Valid till {formatDate(deal.validTill)}</Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </>
          )}
        </Animated.View>
      </ScrollView>
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

  banner: { height: 220, position: 'relative', overflow: 'hidden' },

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

  info: { padding: 20, gap: 12 },

  name: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.text },

  cat: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },

  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },

  ratingNum: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.accent,
    marginLeft: 6,
  },

  reviewCount: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },

  desc: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  locCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  locText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text, flex: 1 },

  contactRow: { flexDirection: 'row', gap: 10 },

  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  contactBtnText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },

  featureRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },

  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.secondary + '10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  featureText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.text },

  subTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginTop: 4,
  },

  dealCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    overflow: 'hidden',
    marginTop: 8,
  },

  dealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  dealTitle: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text },

  dealBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },

  discountBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },

  discountText: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: '#FFF' },

  dealValid: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },

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
