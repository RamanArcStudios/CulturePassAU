import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, Share, ActivityIndicator, Linking } from 'react-native';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { Image } from 'expo-image';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useCallback } from 'react';

const isWeb = Platform.OS === 'web';

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  const { data: act, isLoading, error } = useQuery({
    queryKey: ['/api/activities', id],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/activities/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch activity: ${res.status}`);
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
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const shareUrl = `https://culturepass.app/activities/${id}`;
      const message = `Check out ${act.name} on CulturePass! ${act.category} - ${act.duration}. ${act.location}. ${act.priceLabel}. Rating: ${act.rating}/5.\n\n${shareUrl}`;

      if (isWeb) {
        if (navigator?.share) {
          await navigator.share({
            title: `${act.name} on CulturePass`,
            text: message,
            url: shareUrl,
          });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          Alert.alert('Link Copied', 'Link copied to clipboard');
        }
      } else {
        await Share.share({
          title: `${act.name} on CulturePass`,
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
  }, [id, act]);

  const handleLocationPress = useCallback(() => {
    if (!act?.location) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const q = encodeURIComponent(act.location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  }, [act]);

  const handleBookNow = useCallback(() => {
    if (!isWeb) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Alert.alert(
      'Booking Confirmed!',
      `Your booking for ${act.name} has been confirmed.\n\nPrice: ${act.priceLabel}`,
      [
        { text: 'OK', style: 'default' },
        { text: 'View Bookings', onPress: () => router.push('/(tabs)/profile') },
      ]
    );
  }, [act]);

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading activity...</Text>
      </View>
    );
  }

  /* ---------------- Error / Not Found ---------------- */

  if (!act || error) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.notFoundText}>
          {error ? 'Failed to load activity' : 'Activity not found'}
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
          hitSlop={12}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {act.name}
        </Text>
        <Pressable
          hitSlop={12}
          onPress={handleShare}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Share activity"
        >
          <Ionicons name="share-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.banner}>
          <Image
            source={{ uri: act.imageUrl }}
            style={styles.bannerImage}
            contentFit="cover"
            transition={300}
          />
          {act.isPopular && (
            <Animated.View 
              entering={isWeb ? undefined : FadeIn.duration(600)}
              style={styles.popularBadge}
            >
              <Ionicons name="flame" size={14} color="#FFF" />
              <Text style={styles.popularText}>Popular</Text>
            </Animated.View>
          )}
        </View>

        <Animated.View 
          entering={isWeb ? undefined : FadeInDown.delay(200).duration(600)}
          style={styles.info}
        >
          <Text style={styles.name}>{act.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}>
              <Ionicons name="compass-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{act.category}</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{act.duration}</Text>
            </View>
            <View style={styles.metaPill}>
              <Ionicons name="people-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{act.ageGroup}</Text>
            </View>
          </View>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= Math.floor(act.rating) ? 'star' : 'star-outline'}
                size={20}
                color={Colors.accent}
              />
            ))}
            <Text style={styles.ratingNum}>{act.rating}</Text>
            <Text style={styles.reviewCount}>({act.reviews} reviews)</Text>
          </View>

          <Text style={styles.desc}>{act.description}</Text>

          <Pressable
            style={styles.locCard}
            onPress={handleLocationPress}
            android_ripple={{ color: Colors.primary + '10' }}
            accessibilityRole="button"
            accessibilityLabel={`Open location: ${act.location}`}
          >
            <Ionicons name="location" size={20} color={Colors.primary} />
            <Text style={styles.locText}>{act.location}</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </Pressable>

          <Text style={styles.subTitle}>Highlights</Text>
          <View style={styles.highlightGrid}>
            {act.highlights.map((h: string) => (
              <View key={h} style={styles.highlightItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
        <View>
          <Text style={styles.bottomPrice}>{act.priceLabel}</Text>
          <Text style={styles.priceSubtext}>Per person</Text>
        </View>
        <Pressable
          style={styles.bookBtn}
          onPress={handleBookNow}
          android_ripple={{ color: '#FFF3' }}
          accessibilityRole="button"
          accessibilityLabel={`Book ${act.name} for ${act.priceLabel}`}
        >
          <Ionicons name="ticket" size={18} color="#FFF" />
          <Text style={styles.bookText}>Book Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

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

  notFoundText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },

  backLink: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },

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

  scrollContent: {
    paddingBottom: 120,
  },

  banner: {
    height: 220,
    position: 'relative',
    overflow: 'hidden',
  },

  bannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  popularBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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

  popularText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },

  info: {
    padding: 20,
    gap: 12,
  },

  name: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },

  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  metaText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  ratingNum: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.accent,
    marginLeft: 6,
  },

  reviewCount: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },

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

  locText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    flex: 1,
  },

  subTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginTop: 8,
  },

  highlightGrid: {
    gap: 10,
  },

  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  highlightText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    flex: 1,
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
    paddingTop: 14,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  bottomPrice: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },

  priceSubtext: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },

  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },

  bookText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
});
