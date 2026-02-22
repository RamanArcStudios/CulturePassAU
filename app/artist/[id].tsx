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
import type { Profile } from "@shared/schema";

const getApiBase = () => {
  if (Platform.OS === 'web') return '';
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : 'http://localhost:5000';
};

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const goBack = () => navigation.canGoBack() ? router.back() : router.replace("/");

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['/api/profiles', id],
    queryFn: () => fetch(`${getApiBase()}/api/profiles/${id}`).then(r => r.json()),
  });

  const handleShare = useCallback(async () => {
    try {
      const url = `https://culturepass.replit.app/artist/${id}`;
      if (Platform.OS === "web") {
        if (typeof navigator !== "undefined" && navigator.share) {
          await navigator.share({ title: profile?.name ?? "", url });
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          Alert.alert("Link Copied", "Link copied to clipboard");
        }
      } else {
        await Share.share({ message: `Check out ${profile?.name} on CulturePass! ${url}` });
      }
    } catch {}
  }, [id, profile]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle" size={48} color={Colors.light.textTertiary} />
        <Text style={styles.notFoundText}>Artist not found</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const heroImage = profile.coverImageUrl || profile.avatarUrl;
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.imageContainer}>
        {heroImage ? (
          <Image source={{ uri: heroImage }} style={styles.heroImage} contentFit="cover" transition={300} />
        ) : (
          <LinearGradient
            colors={[Colors.light.secondary, Colors.light.primary]}
            style={styles.heroImage}
          />
        )}
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.8)"]}
          style={StyleSheet.absoluteFill}
        />
        <Pressable
          onPress={goBack}
          style={[styles.backBtn, { top: insets.top + webTopInset + 8 }]}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={[styles.shareBtn, { top: insets.top + webTopInset + 8 }]}
        >
          <Ionicons name="share-outline" size={22} color="#fff" />
        </Pressable>
        {profile.isVerified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.light.success} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
        <View style={styles.heroContent}>
          <Text style={styles.artistName}>{profile.name}</Text>
          {profile.category && (
            <Text style={styles.artistGenre}>{profile.category}</Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={20} color={Colors.light.primary} />
            <Text style={styles.statValue}>{profile.followersCount ?? 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          {location ? (
            <Pressable
              style={styles.statCard}
              onPress={() => {
                const q = encodeURIComponent(location);
                const url = Platform.select({
                  ios: `http://maps.apple.com/?q=${q}`,
                  default: `https://www.google.com/maps/search/?api=1&query=${q}`,
                });
                Linking.openURL(url);
              }}
            >
              <Ionicons name="location" size={20} color={Colors.light.secondary} />
              <Text style={styles.statValue}>{profile.city || "—"}</Text>
              <Text style={styles.statLabel}>{profile.country || "Location"}</Text>
            </Pressable>
          ) : (
            <View style={styles.statCard}>
              <Ionicons name="star" size={20} color={Colors.light.accent} />
              <Text style={styles.statValue}>{profile.rating ? profile.rating.toFixed(1) : "—"}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          )}
        </View>

        {profile.culturePassId && (
          <View style={styles.cpidRow}>
            <Ionicons name="finger-print" size={14} color={Colors.light.secondary} />
            <Text style={styles.cpidText}>{profile.culturePassId}</Text>
          </View>
        )}

        {(profile.bio || profile.description) && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>{profile.bio || profile.description}</Text>
          </>
        )}

        {profile.tags && profile.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {profile.tags.map((tag, idx) => (
              <View key={idx} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <SocialLinksBar socialLinks={profile.socialLinks} website={profile.website} style={{ marginTop: 16 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  imageContainer: {
    height: 320,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  shareBtn: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    top: 16,
    right: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  verifiedText: {
    color: Colors.light.success,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
  },
  heroContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  artistName: {
    fontSize: 28,
    fontFamily: "Poppins_700Bold",
    color: "#fff",
  },
  artistGenre: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
  },
  cpidRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.secondary + "10",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  cpidText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.secondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
    color: Colors.light.text,
    marginTop: 24,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  tagChip: {
    backgroundColor: Colors.light.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: Colors.light.background,
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: Colors.light.textSecondary,
  },
  backLink: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.light.primary,
  },
});
