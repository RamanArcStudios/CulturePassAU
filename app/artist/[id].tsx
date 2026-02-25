import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Share,
  Alert,
  Linking,
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
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import type { Profile } from "@shared/schema";

const isWeb = Platform.OS === "web";

/* ---------------- API BASE ---------------- */

const getApiBase = () => {
  if (isWeb) return "";
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "http://localhost:5000";
};

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webTopInset = isWeb ? 67 : 0;

  const goBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace("/");
  }, [navigation]);

  const { data: profile, isLoading, error } = useQuery<Profile>({
    queryKey: ["/api/profiles", id],
    queryFn: () =>
      fetch(`${getApiBase()}/api/profiles/${id}`).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch profile");
        return r.json();
      }),
    enabled: !!id,
  });

  const handleShare = useCallback(async () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const url = `https://culturepass.app/artist/${id}`;
      const title = profile?.name ?? "Artist on CulturePass";
      const message = `Check out ${profile?.name ?? "this artist"} on CulturePass!${profile?.category ? ` ${profile.category}.` : ""}\n\n${url}`;

      if (isWeb) {
        if (navigator?.share) {
          await navigator.share({ title, text: message, url });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(url);
          Alert.alert("Link Copied", "Link copied to clipboard");
        }
      } else {
        await Share.share({
          title,
          message,
          url,
        });
      }

      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      if (error?.message && !error.message.includes("cancel")) {
        console.error("Share error:", error);
      }
    }
  }, [id, profile]);

  const handleLocationPress = useCallback(() => {
    if (!profile?.city && !profile?.country) return;

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const location = [profile.city, profile.country].filter(Boolean).join(", ");
    const q = encodeURIComponent(location);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  }, [profile]);

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading artist...</Text>
      </View>
    );
  }

  /* ---------------- Not Found ---------------- */

  if (!profile || error) {
    return (
      <View style={styles.notFound}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={Colors.textTertiary}
        />
        <Text style={styles.notFoundText}>
          {error ? "Failed to load artist" : "Artist not found"}
        </Text>
        <Pressable 
          onPress={goBack}
          android_ripple={{ color: Colors.primary + '20' }}
          style={styles.backButton}
        >
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const heroImage = profile.coverImageUrl || profile.avatarUrl;
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  /* ---------------- UI ---------------- */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View style={styles.heroContainer}>
        {heroImage ? (
          <Image
            source={{ uri: heroImage }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={styles.heroImage}
          />
        )}

        <LinearGradient
          colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.75)"]}
          style={StyleSheet.absoluteFill}
        />

        {/* Top buttons */}
        <Pressable
          onPress={goBack}
          style={[styles.iconBtn, { left: 16, top: insets.top + webTopInset + 8 }]}
          android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 21 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={[styles.iconBtn, { right: 16, top: insets.top + webTopInset + 8 }]}
          android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 21 }}
          accessibilityRole="button"
          accessibilityLabel="Share artist"
        >
          <Ionicons name="share-outline" size={22} color="#FFF" />
        </Pressable>

        {/* Hero Content */}
        <Animated.View 
          entering={isWeb ? undefined : FadeIn.duration(600)}
          style={styles.heroContent}
        >
          {profile.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#FFF" />
              <Text style={styles.verifiedText}>Verified Artist</Text>
            </View>
          )}

          <Text style={styles.artistName}>{profile.name}</Text>

          {profile.category && (
            <Text style={styles.artistGenre}>{profile.category}</Text>
          )}
        </Animated.View>
      </View>

      {/* CONTENT */}
      <Animated.View 
        entering={isWeb ? undefined : FadeInDown.delay(200).duration(600)}
        style={styles.content}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="people"
            value={profile.followersCount ?? 0}
            label="Followers"
            color={Colors.primary}
          />
          {location ? (
            <StatCard
              icon="location"
              value={profile.city ?? "—"}
              label={profile.country ?? "Location"}
              color={Colors.secondary}
              onPress={handleLocationPress}
            />
          ) : (
            <StatCard
              icon="star"
              value={profile.rating ? profile.rating.toFixed(1) : "—"}
              label="Rating"
              color={Colors.accent}
            />
          )}
        </View>

        {/* CPID */}
        {profile.culturePassId && (
          <View style={styles.cpidChip}>
            <Ionicons name="finger-print" size={14} color={Colors.secondary} />
            <Text style={styles.cpidText}>{profile.culturePassId}</Text>
          </View>
        )}

        {/* About */}
        {(profile.bio || profile.description) && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio || profile.description}</Text>
          </>
        )}

        {/* Tags */}
        {(profile.tags?.length ?? 0) > 0 && (
          <View style={styles.tagsRow}>
            {(profile.tags ?? []).map((tag: string, idx: number) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Social */}
        {(profile.socialLinks || profile.website) && (
          <SocialLinksBar
            socialLinks={profile.socialLinks}
            website={profile.website}
            style={styles.socialLinks}
          />
        )}
      </Animated.View>
    </ScrollView>
  );
}

/* ---------------- Components ---------------- */

function StatCard({ icon, value, label, color, onPress }: any) {
  const Wrapper: any = onPress ? Pressable : View;
  
  const handlePress = useCallback(() => {
    if (onPress) {
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  }, [onPress]);

  return (
    <Wrapper 
      style={styles.statCard} 
      onPress={handlePress}
      android_ripple={onPress ? { color: color + '20' } : undefined}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? `${label}: ${value}` : undefined}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Wrapper>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContent: {
    paddingBottom: 120,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.background,
  },

  loadingText: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
  },

  heroContainer: {
    height: 360,
  },

  heroImage: {
    width: "100%",
    height: "100%",
  },

  iconBtn: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  heroContent: {
    position: "absolute",
    bottom: 28,
    left: 24,
    right: 24,
  },

  verifiedBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  verifiedText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: "#FFF",
  },

  artistName: {
    fontSize: 30,
    fontFamily: "Poppins_700Bold",
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  artistGenre: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },

  content: {
    padding: 24,
  },

  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 24,
  },

  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 18,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    ...Colors.shadow.small,
  },

  statValue: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: Colors.text,
    marginTop: 4,
  },

  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
  },

  cpidChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.secondary + "12",
    alignSelf: "flex-start",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.secondary + "30",
  },

  cpidText: {
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.secondary,
    letterSpacing: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.text,
    marginBottom: 10,
  },

  bio: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },

  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  tagText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.textSecondary,
  },

  socialLinks: {
    marginTop: 20,
  },

  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.background,
    padding: 24,
  },

  notFoundText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: Colors.textSecondary,
    textAlign: "center",
  },

  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },

  backLink: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.primary,
  },
});

