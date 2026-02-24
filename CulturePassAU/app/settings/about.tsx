import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FEATURES = [
  { icon: 'calendar', label: 'Events', desc: 'Discover cultural events near you', color: '#E85D3A' },
  { icon: 'people', label: 'Communities', desc: 'Connect with your cultural communities', color: '#16656E' },
  { icon: 'gift', label: 'Perks', desc: 'Exclusive deals and benefits', color: '#9B59B6' },
  { icon: 'business', label: 'Businesses', desc: 'Support local cultural businesses', color: '#3498DB' },
];

const SOCIAL_LINKS = [
  { icon: 'logo-facebook', label: 'Facebook', url: 'https://facebook.com/CulturePassApp', color: '#1877F2' },
  { icon: 'logo-instagram', label: 'Instagram', url: 'https://instagram.com/CulturePassApp', color: '#E4405F' },
  { icon: 'logo-twitter', label: 'Twitter', url: 'https://twitter.com/CulturePassApp', color: '#1DA1F2' },
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : insets.bottom) }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="globe" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>CulturePass</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <View style={styles.missionCard}>
            <Text style={styles.missionTitle}>Our Mission</Text>
            <Text style={styles.missionText}>
              CulturePass is built to empower cultural diaspora communities by connecting people with the events, businesses, and organisations that celebrate their heritage. We believe culture is best experienced together, and our platform makes it easier to discover, engage, and thrive within your community.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                  <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialCard}>
            {SOCIAL_LINKS.map((link, i) => (
              <View key={i}>
                <Pressable style={styles.socialItem} onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Linking.openURL(link.url);
                }}>
                  <View style={[styles.socialIcon, { backgroundColor: link.color + '15' }]}>
                    <Ionicons name={link.icon as any} size={20} color={link.color} />
                  </View>
                  <Text style={styles.socialLabel}>{link.label}</Text>
                  <Ionicons name="open-outline" size={16} color={Colors.textTertiary} />
                </Pressable>
                {i < SOCIAL_LINKS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.taglineSection}>
          <Ionicons name="heart" size={20} color={Colors.primary} />
          <Text style={styles.tagline}>Made with love for cultural communities</Text>
          <Text style={styles.copyright}>2024 CulturePass. All rights reserved.</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  logoSection: { alignItems: 'center', paddingVertical: 30 },
  logoContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center', marginBottom: 14, borderWidth: 2, borderColor: Colors.primary + '25' },
  appName: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 4 },
  version: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },
  missionCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder, ...Colors.shadow.small },
  missionTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 10 },
  missionText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureCard: { width: '48%' as any, backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, ...Colors.shadow.small },
  featureIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureLabel: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginBottom: 4 },
  featureDesc: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 17 },
  socialCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden' },
  socialItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  socialIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  socialLabel: { flex: 1, fontSize: 15, fontFamily: 'Poppins_500Medium', color: Colors.text },
  divider: { height: 1, backgroundColor: Colors.divider, marginLeft: 66 },
  taglineSection: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 40 },
  tagline: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },
  copyright: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, marginTop: 6 },
});
