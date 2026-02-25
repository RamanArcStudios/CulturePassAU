import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Linking, ActivityIndicator, Alert, Share } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors, { shadows } from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { useCallback } from 'react';

const isWeb = Platform.OS === 'web';

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const { data: business, isLoading, error } = useQuery({
    queryKey: ['/api/businesses', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/businesses/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch business: ${res.status}`);
      return res.json();
    },
    enabled: !!id,
  });

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)/explore');
  }, [navigation]);

  const handleShare = useCallback(async () => {
    if (!business) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const shareUrl = `https://culturepass.app/businesses/${id}`;
      const message = `Check out ${business.name} on CulturePass! ${business.category} - ${business.priceRange}. Rating: ${business.rating}/5.\n\n${shareUrl}`;

      if (isWeb) {
        if (navigator?.share) {
          await navigator.share({
            title: `${business.name} on CulturePass`,
            text: message,
            url: shareUrl,
          });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert('Link Copied', 'Link copied to clipboard');
        }
      } else {
        await Share.share({
          title: `${business.name} on CulturePass`,
          message,
          url: shareUrl,
        });
      }

      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      if (error?.message && !error.message.includes('cancel')) {
        console.error('Share error:', error);
      }
    }
  }, [id, business]);

  const handleCall = useCallback(() => {
    if (!business?.phone) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const phoneNumber = business.phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
      console.error('Failed to make call:', err);
      Alert.alert('Error', 'Unable to make a phone call');
    });
  }, [business]);

  const handleLocationPress = useCallback(() => {
    if (!business?.location) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const q = encodeURIComponent(business.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  }, [business]);

  const handleBookService = useCallback(() => {
    if (!business) return;

    if (!isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(
      'Book Service',
      `Would you like to book ${business.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact',
          onPress: handleCall,
        },
        {
          text: 'View Details',
          onPress: () => {
            // Navigate to booking flow or show more details
            console.log('Book service:', business.name);
          },
        },
      ]
    );
  }, [business, handleCall]);

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading business...</Text>
      </View>
    );
  }

  /* ---------------- Error / Not Found ---------------- */

  if (!business || error) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.errorText}>
          {error ? 'Failed to load business' : 'Business not found'}
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

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(business.rating));

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { backgroundColor: business.color, paddingTop: topInset }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.6)']}
          locations={[0, 0.4, 1]}
          style={styles.heroOverlay}
        >
          <View style={styles.heroTopRow}>
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
              android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 21 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </Pressable>
            <Pressable
              style={styles.shareButton}
              onPress={handleShare}
              android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 21 }}
              accessibilityRole="button"
              accessibilityLabel="Share business"
            >
              <Ionicons name="share-outline" size={22} color="#FFF" />
            </Pressable>
          </View>

          <Animated.View entering={isWeb ? undefined : FadeIn.duration(600)} style={styles.heroBottom}>
            <View style={styles.heroIconWrap}>
              <Ionicons name={business.icon as any} size={36} color="#FFF" />
            </View>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroTitle}>{business.name}</Text>
              {business.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
              {business.isIndigenousOwned && (
                <View style={[styles.verifiedBadge, { backgroundColor: 'rgba(139,69,19,0.8)' }]}>
                  <Ionicons name="earth" size={16} color="#FFF" />
                  <Text style={styles.verifiedText}>Indigenous Owned</Text>
                </View>
              )}
            </View>
            <Text style={styles.heroCategory}>
              {business.category} - {business.priceRange}
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(500)} style={styles.ratingSection}>
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {stars.map((filled, i) => (
                <Ionicons key={i} name={filled ? 'star' : 'star-outline'} size={20} color={Colors.accent} />
              ))}
            </View>
            <Text style={styles.ratingNum}>{business.rating}</Text>
            <Text style={styles.reviewText}>({business.reviews} reviews)</Text>
          </View>
        </Animated.View>

        {business.isIndigenousOwned && (
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(150).duration(500)} style={styles.section}>
            <View style={styles.indigenousCard}>
              <View style={styles.indigenousHeader}>
                <View style={styles.indigenousIconBg}>
                  <Ionicons name="earth" size={20} color="#8B4513" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.indigenousTitle}>100% Indigenous Owned</Text>
                  {business.indigenousCategory && (
                    <Text style={styles.indigenousSubtitle}>{business.indigenousCategory}</Text>
                  )}
                </View>
              </View>
              <View style={styles.indigenousBadges}>
                <View style={styles.indigenousBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#8B4513" />
                  <Text style={styles.indigenousBadgeText}>Indigenous Owned</Text>
                </View>
                {business.supplyNationRegistered && (
                  <View style={[styles.indigenousBadge, { backgroundColor: '#1A527618' }]}>
                    <Ionicons name="shield-checkmark" size={14} color="#1A5276" />
                    <Text style={[styles.indigenousBadgeText, { color: '#1A5276' }]}>Supply Nation</Text>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(200).duration(500)} style={styles.section}>
          <View style={styles.cpidRow}>
            <Ionicons name="finger-print-outline" size={14} color={Colors.secondary} />
            <Text style={styles.cpidText}>{business.cpid}</Text>
          </View>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{business.description}</Text>
        </Animated.View>

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(300).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesGrid}>
            {business.services.map((service: string, idx: number) => (
              <View key={idx} style={styles.serviceCard}>
                <View style={styles.serviceIconBg}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.secondary} />
                </View>
                <Text style={styles.serviceCardText}>{service}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(400).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactCard}>
            <Pressable
              style={styles.contactRow}
              onPress={handleLocationPress}
              android_ripple={{ color: Colors.primary + '10' }}
              accessibilityRole="button"
              accessibilityLabel={`Open location: ${business.location}`}
            >
              <View style={[styles.contactIconBg, { backgroundColor: Colors.primary + '12' }]}>
                <Ionicons name="location-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.contactText}>{business.location}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </Pressable>
            <View style={styles.contactDivider} />
            <Pressable
              style={styles.contactRow}
              onPress={handleCall}
              android_ripple={{ color: Colors.secondary + '10' }}
              accessibilityRole="button"
              accessibilityLabel={`Call ${business.phone}`}
            >
              <View style={[styles.contactIconBg, { backgroundColor: Colors.secondary + '12' }]}>
                <Ionicons name="call-outline" size={18} color={Colors.secondary} />
              </View>
              <Text style={styles.contactText}>{business.phone}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </Pressable>
          </View>
        </Animated.View>

        <View style={styles.sectionDivider}>
          <View style={styles.accentBar} />
        </View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(500).duration(500)} style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Ionicons name="person" size={16} color={Colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewerName}>Sarah M.</Text>
                <View style={styles.miniStars}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Ionicons key={i} name="star" size={12} color={Colors.accent} />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewDate}>2 weeks ago</Text>
            </View>
            <Text style={styles.reviewBody}>
              Absolutely wonderful service! They catered our community event and everyone loved the food. Highly
              recommended for any cultural celebration.
            </Text>
          </View>
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewAvatar}>
                <Ionicons name="person" size={16} color={Colors.textSecondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewerName}>Rajesh K.</Text>
                <View style={styles.miniStars}>
                  {[0, 1, 2, 3].map((i) => (
                    <Ionicons key={i} name="star" size={12} color={Colors.accent} />
                  ))}
                  <Ionicons name="star-outline" size={12} color={Colors.accent} />
                </View>
              </View>
              <Text style={styles.reviewDate}>1 month ago</Text>
            </View>
            <Text style={styles.reviewBody}>
              Great quality and professional team. Will definitely use again for our next community gathering.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 14 }]}>
        <Pressable
          style={({ pressed }) => [styles.callButton, pressed && styles.buttonPressed]}
          onPress={handleCall}
          android_ripple={{ color: Colors.secondary + '20' }}
          accessibilityRole="button"
          accessibilityLabel="Call business"
        >
          <Ionicons name="call" size={20} color={Colors.secondary} />
          <Text style={styles.callText}>Call</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.bookButton, pressed && styles.buttonPressed]}
          onPress={handleBookService}
          android_ripple={{ color: '#FFF3' }}
          accessibilityRole="button"
          accessibilityLabel="Book service"
        >
          <Ionicons name="calendar" size={20} color="#FFF" />
          <Text style={styles.bookText}>Book Service</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
  },

  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },

  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
    padding: 24,
  },

  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  shareButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  backLink: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    marginTop: 12,
  },

  hero: { height: 280 },

  heroOverlay: {
    flex: 1,
    padding: 16,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  heroBottom: { gap: 8 },

  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },

  heroTitle: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    lineHeight: 32,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  verifiedText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },

  heroCategory: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.85)',
  },

  scrollContent: {
    paddingBottom: 130,
  },

  ratingSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    ...shadows.small,
  },

  starsRow: { flexDirection: 'row', gap: 2 },

  ratingNum: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginLeft: 4,
  },

  reviewText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },

  indigenousCard: {
    backgroundColor: 'rgba(255, 149, 0, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },

  indigenousHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  indigenousIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#8B451318',
    alignItems: 'center',
    justifyContent: 'center',
  },

  indigenousTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#3E2723',
  },

  indigenousSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#6D4C41',
  },

  indigenousBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  indigenousBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8B451318',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 50,
  },

  indigenousBadgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#8B4513',
  },

  cpidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },

  cpidText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: Colors.secondary,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 12,
  },

  sectionDivider: {
    paddingHorizontal: 20,
    marginTop: 24,
    alignItems: 'center',
  },

  accentBar: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary + '25',
  },

  description: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  servicesGrid: {
    gap: 10,
  },

  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    ...shadows.small,
  },

  serviceIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.secondary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },

  serviceCardText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    flex: 1,
  },

  contactCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...shadows.small,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },

  contactIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    flex: 1,
  },

  contactDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 64,
  },

  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    gap: 10,
    ...shadows.small,
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reviewerName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },

  miniStars: { flexDirection: 'row', gap: 1 },

  reviewDate: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },

  reviewBody: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border + '40',
    ...shadows.medium,
  },

  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary + '12',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 26,
    borderWidth: 1,
    borderColor: Colors.secondary + '30',
  },

  callText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.secondary,
  },

  bookButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },

  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },

  bookText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
});
