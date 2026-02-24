import React from "react";
import { View, Pressable, StyleSheet, Linking, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface SocialLinksBarProps {
  socialLinks?: Record<string, string> | null;
  website?: string | null;
  style?: ViewStyle;
}

const SOCIAL_PLATFORMS: { key: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "instagram", icon: "logo-instagram", color: "#E1306C" },
  { key: "facebook", icon: "logo-facebook", color: "#1877F2" },
  { key: "twitter", icon: "logo-twitter", color: "#1DA1F2" },
  { key: "youtube", icon: "logo-youtube", color: "#FF0000" },
  { key: "tiktok", icon: "logo-tiktok", color: "#000000" },
  { key: "linkedin", icon: "logo-linkedin", color: "#0A66C2" },
  { key: "spotify", icon: "musical-notes", color: "#1DB954" },
  { key: "soundcloud", icon: "cloud", color: "#FF5500" },
];

export default function SocialLinksBar({ socialLinks, website, style }: SocialLinksBarProps) {
  const links = socialLinks || {};
  const activePlatforms = SOCIAL_PLATFORMS.filter(p => links[p.key]);

  if (activePlatforms.length === 0 && !website) return null;

  return (
    <View style={[styles.container, style]}>
      {activePlatforms.map(platform => (
        <Pressable
          key={platform.key}
          onPress={() => {
            const url = links[platform.key];
            if (url) Linking.openURL(url.startsWith("http") ? url : `https://${url}`);
          }}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name={platform.icon} size={22} color={platform.color} />
        </Pressable>
      ))}
      {website && (
        <Pressable
          onPress={() => Linking.openURL(website.startsWith("http") ? website : `https://${website}`)}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="globe-outline" size={22} color={Colors.secondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
});
