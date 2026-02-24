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
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }, [navigation]);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['/api/profiles', id],
    queryFn: () => fetch(`${getApiBase()}/api/profiles/${id}`).then(r => r.json()),
  });

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const url = `https://culturepass.replit.app/venue/${id}`;
      const location = [profile?.city, profile?.country].filter(Boolean).join(", ");
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title: profile?.name ?? "Venue on CulturePass", url });
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          Alert.alert("Link Copied", "Link copied to clipboard");
        }
      } else {
        await Share.share({
          title: `${profile?.name ?? 'Venue'} on CulturePass`,
          message: `Check out ${profile?.name} on CulturePass!${location ? ` Located in ${location}.` : ''} ${url}`,
        });
      }
    } catch {}
  }, [id, profile]);

  const openDirections = useCallback(() => {
    if (!profile) return;
    const addr = profile.address || [profile.city, profile.country].filter(Boolean).join(", ");
    if (!addr) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(addr)}`,
      android: `geo:0,0?q=${encodeURIComponent(addr)}`,
      default: `https://maps.google.com/?q=${encodeURIComponent(addr)}`,
    });
    Linking.openURL(url);
  }, [profile]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.light.textTertiary} />
          <Text style={styles.errorText}>Venue not found</Text>
          <Pressable onPress={goBack} style={styles.backLinkBtn}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const heroImage = profile.coverImageUrl || (profile.images && profile.images.length > 0 ? profile.images[0] : null) || profile.avatarUrl;
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={styles.heroContainer}>
          {heroImage ? (
            <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" transition={300} />
          ) : (
            <LinearGradient
              colors={[Colors.light.secondary, Colors.light.primary]}
              style={styles.heroImage}
            />
          )}
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent", "rgba(0,0,0,0.7)"]}
            locations={[0, 0.4, 1]}
            style={styles.heroGradient}
          />
          <View style={[styles.heroTopBar, { top: insets.top + webTopInset + 8 }]}>
            <Pressable onPress={goBack} style={styles.heroBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={handleShare} style={styles.heroBtn}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </Pressable>
              {profile.address && (
                <Pressable onPress={openDirections} style={styles.heroBtn}>
                  <Ionicons name="navigate" size={22} color="#fff" />
                </Pressable>
              )}
            </View>
          </View>
          <View style={styles.heroInfo}>
            {profile.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.light.success} />
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            )}
            <Text style={styles.heroTitle}>{profile.name}</Text>
            {location ? (
              <View style={styles.heroLocationRow}>
                <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.85)" />
                <Text style={styles.heroLocation}>{location}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={22} color={Colors.light.secondary} />
              <Text style={styles.statValue}>{profile.followersCount ?? 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={22} color={Colors.light.accent} />
              <Text style={styles.statValue}>{profile.rating ? profile.rating.toFixed(1) : "—"}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            {profile.membersCount != null && profile.membersCount > 0 && (
              <View style={styles.statCard}>
                <Ionicons name="person-add" size={22} color={Colors.light.primary} />
                <Text style={styles.statValue}>{profile.membersCount}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
            )}
          </View>

          {profile.culturePassId && (
            <View style={styles.cpidRow}>
              <Ionicons name="finger-print" size={16} color={Colors.light.secondary} />
              <Text style={styles.cpidText}>{profile.culturePassId}</Text>
            </View>
          )}

          {profile.address && (
            <Pressable onPress={openDirections} style={styles.addressCard}>
              <Ionicons name="location" size={20} color={Colors.light.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.addressText}>{profile.address}</Text>
              </View>
              <View style={styles.directionsBtn}>
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.directionsBtnText}>Directions</Text>
              </View>
            </Pressable>
          )}

          {(profile.bio || profile.description) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.descriptionText}>{profile.bio || profile.description}</Text>
            </View>
          )}

          {profile.tags && profile.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsGrid}>
                {profile.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tagChip}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profile.openingHours && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Opening Hours</Text>
              <Text style={styles.descriptionText}>{profile.openingHours}</Text>
            </View>
          )}

          {(profile.email || profile.phone || profile.website) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              {profile.email && (
                <Pressable
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(`mailto:${profile.email}`)}
                >
                  <Ionicons name="mail-outline" size={20} color={Colors.light.secondary} />
                  <Text style={styles.contactText}>{profile.email}</Text>
                </Pressable>
              )}
              {profile.phone && (
                <Pressable
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(`tel:${profile.phone}`)}
                >
                  <Ionicons name="call-outline" size={20} color={Colors.light.secondary} />
                  <Text style={styles.contactText}>{profile.phone}</Text>
                </Pressable>
              )}
              {profile.website && (
                <Pressable
                  style={styles.contactRow}
                  onPress={() => Linking.openURL(profile.website!)}
                >
                  <Ionicons name="globe-outline" size={20} color={Colors.light.secondary} />
                  <Text style={styles.contactText}>{profile.website}</Text>
                </Pressable>
              )}
            </View>
          )}

          {(profile.socialLinks && Object.values(profile.socialLinks).some(Boolean)) && (
            <View style={styles.section}>
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
  container: { flex: 1, backgroundColor: Colors.light.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  errorText: { fontFamily: "Poppins_500Medium", fontSize: 16, color: Colors.light.textSecondary },
  backLinkBtn: { marginTop: 12, padding: 12 },
  backLinkText: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: Colors.light.primary },

  heroContainer: { height: 320, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  heroGradient: { ...StyleSheet.absoluteFillObject },
  heroTopBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroInfo: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  verifiedBadgeText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: Colors.light.success,
  },
  heroTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 26,
    color: "#fff",
    marginBottom: 4,
  },
  heroLocationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroLocation: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
  },

  content: { padding: 16 },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  statValue: {
    fontFamily: "Poppins_700Bold",
    fontSize: 20,
    color: Colors.light.text,
    marginTop: 6,
  },
  statLabel: {
    fontFamily: "Poppins_400Regular",
    fontSize: 12,
    color: Colors.light.textSecondary,
  },

  cpidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.light.secondary + "10",
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  cpidText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: Colors.light.secondary,
  },

  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    marginBottom: 20,
  },
  addressText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  directionsBtnText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 13,
    color: "#fff",
  },

  section: { marginBottom: 24 },
  sectionTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },

  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    backgroundColor: Colors.light.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tagText: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: Colors.light.text,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  contactText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: Colors.light.secondary,
  },
});
