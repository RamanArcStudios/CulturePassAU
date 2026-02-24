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
import type { Profile } from "@shared/schema";

/* ---------------- API BASE ---------------- */

const getApiBase = () => {
  if (Platform.OS === "web") return "";
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "http://localhost:5000";
};

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const goBack = () =>
    navigation.canGoBack() ? router.back() : router.replace("/");

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["/api/profiles", id],
    queryFn: () =>
      fetch(`${getApiBase()}/api/profiles/${id}`).then((r) => r.json()),
  });

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const url = `https://culturepass.app/artist/${id}`;
      if (Platform.OS === "web") {
        if (navigator?.share) {
          await navigator.share({ title: profile?.name ?? "Artist on CulturePass", url });
        } else if (navigator?.clipboard) {
          await navigator.clipboard.writeText(url);
          Alert.alert("Link Copied", "Link copied to clipboard");
        }
      } else {
        await Share.share({
          title: `${profile?.name ?? 'Artist'} on CulturePass`,
          message: `Check out ${profile?.name} on CulturePass!${profile?.category ? ` ${profile.category}.` : ''}\n\n${url}`,
          url: url,
        });
      }
    } catch {}
  }, [id, profile]);

  /* ---------------- Loading ---------------- */

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  /* ---------------- Not Found ---------------- */

  if (!profile) {
    return (
      <View style={styles.notFound}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={Colors.textTertiary}
        />
        <Text style={styles.notFoundText}>Artist not found</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const heroImage = profile.coverImageUrl || profile.avatarUrl;
  const location = [profile.city, profile.country]
    .filter(Boolean)
    .join(", ");

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  /* ---------------- UI ---------------- */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View style={styles.heroContainer}>
        {heroImage ? (
          <Image
            source={{ uri: heroImage }}
            style={styles.heroImage}
            contentFit="cover"
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
        >
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={[styles.iconBtn, { right: 16, top: insets.top + webTopInset + 8 }]}
        >
          <Ionicons name="share-outline" size={22} color="#FFF" />
        </Pressable>

        {/* Hero Content */}
        <View style={styles.heroContent}>
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
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
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
              onPress={() => {
                const q = encodeURIComponent(location);
                Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
              }}
            />
          ) : (
            <StatCard
              icon="star"
              value={
                profile.rating ? profile.rating.toFixed(1) : "—"
              }
              label="Rating"
              color={Colors.accent}
            />
          )}
        </View>

        {/* CPID */}
        {profile.culturePassId && (
          <View style={styles.cpidChip}>
            <Ionicons
              name="finger-print"
              size={14}
              color={Colors.secondary}
            />
            <Text style={styles.cpidText}>
              {profile.culturePassId}
            </Text>
          </View>
        )}

        {/* About */}
        {(profile.bio || profile.description) && (
          <>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>
              {profile.bio || profile.description}
            </Text>
          </>
        )}

        {/* Tags */}
        {profile.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {profile.tags.map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Social */}
        <SocialLinksBar
          socialLinks={profile.socialLinks}
          website={profile.website}
          style={{ marginTop: 20 }}
        />
      </View>
    </ScrollView>
  );
}

/* ---------------- Components ---------------- */

function StatCard({
  icon,
  value,
  label,
  color,
  onPress,
}: any) {
  const Wrapper: any = onPress ? Pressable : View;
  return (
    <Wrapper style={styles.statCard} onPress={onPress}>
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

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
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
  },

  tagText: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: Colors.textSecondary,
  },

  notFound: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.background,
  },

  notFoundText: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: Colors.textSecondary,
  },

  backLink: {
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    color: Colors.primary,
  },
});