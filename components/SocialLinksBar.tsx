import React, { memo, useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
  ViewStyle,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface SocialLinksBarProps {
  socialLinks?: Record<string, string> | null;
  website?: string | null;
  style?: ViewStyle;
  testID?: string;
}

const SOCIAL_PLATFORMS: Array<{
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  urlPrefix?: string;
}> = [
  { key: 'instagram', icon: 'logo-instagram' as const, color: '#E1306C', urlPrefix: 'https://instagram.com/' },
  { key: 'facebook', icon: 'logo-facebook' as const, color: '#1877F2', urlPrefix: 'https://facebook.com/' },
  { key: 'x', icon: 'logo-twitter' as const, color: '#000000', urlPrefix: 'https://x.com/' },
  { key: 'youtube', icon: 'logo-youtube' as const, color: '#FF0000', urlPrefix: 'https://youtube.com/' },
  { key: 'tiktok', icon: 'logo-tiktok' as const, color: '#000000', urlPrefix: 'https://tiktok.com/@' },
  { key: 'linkedin', icon: 'logo-linkedin' as const, color: '#0A66C2', urlPrefix: 'https://linkedin.com/' },
  { key: 'spotify', icon: 'logo-spotify' as const, color: '#1DB954', urlPrefix: 'https://spotify.com/' },
  { key: 'soundcloud', icon: 'logo-soundcloud' as const, color: '#FF5500', urlPrefix: 'https://soundcloud.com/' },
  { key: 'whatsapp', icon: 'logo-whatsapp' as const, color: '#25D366', urlPrefix: 'https://wa.me/' },
  { key: 'telegram', icon: 'logo-telegram' as const, color: '#0088CC', urlPrefix: 'https://t.me/' },
];

function resolveUrl(link: string, platform: string): string {
  const platformConfig = SOCIAL_PLATFORMS.find(p => p.key === platform);
  const prefix = platformConfig?.urlPrefix || 'https://';
  
  if (link.startsWith('http')) return link;
  if (platform === 'website') return `${prefix}${link}`;
  
  return `${prefix}${link.replace(/^(https?:\/\/)?/, '')}`;
}

const SocialLinkButton = memo(({ 
  platform, 
  url, 
  testID 
}: { 
  platform: typeof SOCIAL_PLATFORMS[0]; 
  url: string; 
  testID: string;
}) => {
  const handlePress = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Invalid Link', `Cannot open ${platform.key}`);
      }
    } catch (error) {
      console.error(`Failed to open ${platform.key}:`, error);
      Alert.alert('Error', `Unable to open ${platform.key}`);
    }
  }, [url, platform]);

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.iconButton,
        {
          backgroundColor: Colors.surfaceSecondary,
          borderColor: Colors.borderLight,
          shadowColor: Colors.shadow,
        },
        pressed && styles.iconButtonPressed,
      ]}
      android_ripple={{ 
        color: platform.color + '33', 
        radius: 26,
        borderless: false 
      }}
      accessibilityRole="button"
      accessibilityLabel={`Visit ${platform.key}`}
      accessibilityHint="Opens in external app or browser"
    >
      <Ionicons 
        name={platform.icon} 
        size={24} 
        color={platform.color}
      />
    </Pressable>
  );
});

SocialLinkButton.displayName = 'SocialLinkButton';

export default function SocialLinksBar({ 
  socialLinks = {}, 
  website, 
  style,
  testID = 'social-links-bar',
}: SocialLinksBarProps) {
  const activeSocials = SOCIAL_PLATFORMS.filter(({ key }) => socialLinks[key]);
  const hasWebsite = !!website && website.trim();

  if (activeSocials.length === 0 && !hasWebsite) {
    return null;
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      {activeSocials.map((platform, index) => (
        <SocialLinkButton
          key={platform.key}
          platform={platform}
          url={resolveUrl(socialLinks[platform.key]!, platform.key)}
          testID={`social-${platform.key}`}
        />
      ))}
      
      {hasWebsite && (
        <SocialLinkButton
          platform={{ key: 'website', icon: 'globe-outline' as const, color: Colors.primary }}
          url={resolveUrl(website!, 'website')}
          testID="social-website"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
});
