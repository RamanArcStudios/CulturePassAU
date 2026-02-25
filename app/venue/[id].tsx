import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  Linking,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import SocialLinksBar from "@/components/SocialLinksBar";
import * as Haptics from "expo-haptics";
import type { Profile } from "@shared/schema";

const getApiBase = () => {
  if (Platform.OS === 'web') return '';
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : 'http://localhost:5000';
};

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const goBack = useCallback(() => {
    if (!Platform.OS === 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace("/(tabs)");
  }, [navigation]);

  const { 
    data: profile, 
    isLoading, 
    error,
    refetch 
  } = useQuery<Profile>({
    queryKey: ['profile', id],
    queryFn: async () => {
      const base = getApiBase();
      const res = await fetch(`${base}/api/profiles/${id}`);
      if (!res.ok) throw new Error(`Failed to fetch venue: ${res.status}`);
      return res.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const handleShare = useCallback(async () => {
    if (!profile) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const url = `https://culturepass.app/venue/${id}`;
      const location = [profile.city, profile.country].filter(Boolean).join(", ");
      const message = `Check out "${profile.name}" on CulturePass!${location ? `\n📍 ${location}` : ''}\n\n${url}`;

      if (Platform.OS === "web") {
        if (navigator?.share) {
          await navigator.share({ 
            title: `${profile.name} on CulturePass`, 
            text: message, 
            url 
          });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(url);
          Alert.alert("✅ Link Copied", "Venue link copied to clipboard!");
          return;
        }
      } else {
        await Share.share({
          title: `${profile.name} - CulturePass`,
          message,
          url,
        });
      }

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err: any) {
      if (!err.message?.includes('cancel')) {
        console.error('Share error:', err);
      }
    }
  }, [id, profile]);

  const openDirections = useCallback(() => {
    if (!profile?.address && !profile?.city) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const addr = profile.address || [profile.city, profile.country].filter(Boolean).join(", ");
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(addr)}`).catch(() => {
      Alert.alert('Directions', 'Unable to open maps');
    });
  }, [profile]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading venue...</Text>
        </View>
      </View>
    );
  }

  if (!profile || error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={64} color={Colors.light.textTertiary} />
          <Text style={styles.errorTitle}>Venue Not Found</Text>
          <Text style={styles.errorText}>This venue may have been removed or ID is invalid</Text>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Venues</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const heroImage = profile.coverImageUrl || 
                   (profile.images?.[0]) || 
                   profile.avatarUrl;
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        refreshControl={
          <Pressable onPress={refetch}>
            <ActivityIndicator size="small" color={Colors.light.primary} />
          </Pressable>
        }
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          {heroImage ? (
            <Image 
              source={{ uri: heroImage }} 
              style={styles.heroImage} 
              contentFit="cover" 
              transition={400}
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3ayofWBadR4M|WB' }}
            />
          ) : (
            <LinearGradient
              colors={[Colors.light.secondary, Colors.light.primary, Colors.light.accent]}
              style={styles.heroImage}
            />
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0.6)", "transparent", "rgba(0,0,0,0.8)"]}
            locations={[0, 0.3, 1]}
            style={styles.heroGradient}
          />
          <View style={[styles.heroTopBar, { top: insets.top + webTopInset + 12 }]}>
            <Pressable onPress={goBack} style={styles.heroBtn}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <View style={styles.heroActions}>
              <Pressable onPress={handleShare} style={styles.heroBtn}>
                <Ionicons name="share-outline" size={24} color="#fff" />
              </Pressable>
              {(profile.address || profile.city) && (
                <Pressable onPress={openDirections} style={styles.heroBtn}>
                  <Ionicons name="navigate" size={24} color="#fff" />
                </Pressable>
              )}
            </View>
          </View>
          
          <View style={styles.heroInfo}>
            {profile.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
                <Text style={styles.verifiedText}>Verified Venue</Text>
              </View>
            )}
            <Text style={styles.heroTitle} numberOfLines={2}>{profile.name}</Text>
            {location && (
              <View style={styles.heroLocationRow}>
                <Ionicons name="location-outline" size={18} color="rgba(255,255,255,0.9)" />
                <Text style={styles.heroLocation}>{location}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="people-outline" size={24} color={Colors.light.secondary} />
              <Text style={styles.statValue}>{profile.followersCount?.toLocaleString() ?? '0'}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star-outline" size={24} color={Colors.light.accent} />
              <Text style={styles.statValue}>
                {profile.rating ? `${profile.rating.toFixed(1)}⭐` : '—'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            {profile.membersCount && profile.membersCount > 0 && (
              <View style={styles.statCard}>
                <Ionicons name="person-add-outline" size={24} color={Colors.light.primary} />
                <Text style={styles.statValue}>{profile.membersCount.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
            )}
          </View>

          {/* CulturePass ID */}
          {profile.culturePassId && (
            <View style={styles.cpidContainer}>
              <Ionicons name="finger-print-outline" size={18} color={Colors.light.secondary} />
              <Text style={styles.cpidLabel}>CulturePass ID:</Text>
              <Text style={styles.cpidValue}>{profile.culturePassId}</Text>
            </View>
          )}

          {/* Address */}
          {(profile.address || profile.city) && (
            <Pressable style={styles.addressCard} onPress={openDirections} android_ripple={{color: Colors.light.primary + '20'}}>
              <Ionicons name="location" size={22} color={Colors.light.primary} />
              <View style={styles.addressContent}>
                <Text style={styles.addressTitle}>{profile.address || profile.city}</Text>
                {profile.country && <Text style={styles.addressSubtitle}>{profile.country}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
            </Pressable>
          )}

          {/* About */}
          {(profile.bio || profile.description) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{profile.bio || profile.description}</Text>
            </View>
          )}

          {/* Tags */}
          {profile.tags?.length ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
                {profile.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tagChip}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {/* Hours */}
          {profile.openingHours && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opening Hours</Text>
              <Text style={styles.hoursText}>{profile.openingHours}</Text>
            </View>
          )}

          {/* Contact */}
          {(profile.email || profile.phone || profile.website) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {profile.email && (
                <Pressable 
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`mailto:${profile.email}`)}
                  android_ripple={{color: Colors.light.primary + '15'}}
                >
                  <Ionicons name="mail-outline" size={20} color={Colors.light.secondary} />
                  <Text style={styles.contactLabel}>{profile.email}</Text>
                </Pressable>
              )}
              {profile.phone && (
                <Pressable 
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(`tel:${profile.phone}`)}
                  android_ripple={{color: Colors.light.primary + '15'}}
                >
                  <Ionicons name="call-outline" size={20} color={Colors.light.secondary} />
                  <Text style={styles.contactLabel}>{profile.phone}</Text>
                </Pressable>
              )}
              {profile.website && (
                <Pressable 
                  style={styles.contactItem}
                  onPress={() => Linking.openURL(profile.website!)}
                  android_ripple={{color: Colors.light.primary + '15'}}
                >
                  <Ionicons name="globe-outline" size={20} color={Colors.light.secondary} />
                  <Text style={styles.contactLabel} numberOfLines={1}>{profile.website}</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Social */}
          {profile.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
            <View style={[styles.section, { paddingBottom: 24 }]}>
              <Text style={styles.sectionTitle}>Follow Us</Text>
              <SocialLinksBar socialLinks={profile.socialLinks} website={profile.website} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.light.background 
  },
  
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    gap: 16 
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.light.text,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 32,
  },
  errorTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.light.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  backButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.light.primary,
  },

  heroContainer: { height: 340, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroTopBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  heroBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroActions: { flexDirection: "row", gap: 12 },
  heroInfo: {
    position: "absolute",
    bottom: 28,
    left: 20,
    right: 20,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
    backdropFilter: "blur(10px)",
  },
  verifiedText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#fff",
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 28,
    color: "#fff",
    lineHeight: 34,
  },
  heroLocationRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  heroLocation: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
  },

  content: { padding: 20 },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    ...Colors.shadows.small,
  },
  statValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 24,
    color: Colors.light.text,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },

  cpidContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 16,
    marginBottom: 20,
  },
  cpidLabel: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  cpidValue: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: Colors.light.text,
  },

  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: 24,
  },
  addressContent: { flex: 1 },
  addressTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
    color: Colors.light.text,
  },
  addressSubtitle: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },

  section: { marginBottom: 28 },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: Colors.light.text,
    marginBottom: 14,
  },
  bioText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 26,
  },
  hoursText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
  },

  tagsContainer: {
    paddingVertical: 8,
  },
  tagChip: {
    backgroundColor: Colors.light.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  tagText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 14,
    color: Colors.light.text,
  },

  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderLight,
  },
  contactLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: Colors.light.textSecondary,
    flex: 1,
  },
});
