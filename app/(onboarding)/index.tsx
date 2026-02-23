import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useCallback } from 'react';

// ─── WelcomeScreen ────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  // Stable navigation handlers — avoids creating new closures on every render
  const goToSignup = useCallback(() => router.push('/(onboarding)/signup'), []);
  const goToLogin = useCallback(() => router.push('/(onboarding)/login'), []);
  const goToLocationViaGoogle = useCallback(() => router.push('/(onboarding)/location'), []);
  const goToLocationViaApple = useCallback(() => router.push('/(onboarding)/location'), []);

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.background, '#111118', '#0D0D14']}
        style={StyleSheet.absoluteFill}
      />

      {/* Top section */}
      <View style={[styles.topSection, { paddingTop: topInset + 60 }]}>
        {/* Icon cluster */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.iconCluster}>
          <View style={[styles.orb, styles.orbPrimary]} />
          <View style={[styles.orb, styles.orbSecondary]} />
          <View style={[styles.orb, styles.orbAccent]} />
          <View style={styles.logoContainer}>
            <Ionicons name="globe-outline" size={56} color={Colors.primary} />
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={styles.title}>
          CulturePass
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(600).duration(800)} style={styles.tagline}>
          Connect. Celebrate. Belong.
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(800).duration(800)} style={styles.subtitle}>
          Discover cultural events, connect with communities, and celebrate diversity across
          Australia, New Zealand, and beyond.
        </Animated.Text>

        <View style={styles.featureList}>
          <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.primary + '18' }]}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.featureText}>Discover Events</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(1150).duration(600)} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.secondary + '18' }]}>
              <Ionicons name="people-outline" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.featureText}>Join Communities</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(1300).duration(600)} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.accent + '20' }]}>
              <Ionicons name="gift-outline" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.featureText}>Exclusive Perks</Text>
          </Animated.View>
        </View>
      </View>

      {/* Bottom section */}
      <Animated.View
        entering={FadeInUp.delay(1000).duration(800)}
        style={[styles.bottomSection, { paddingBottom: bottomInset + 16 }]}
      >
        {/* Primary CTA */}
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={goToSignup}
          accessibilityRole="button"
          accessibilityLabel="Create Account"
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>

        {/* Login link */}
        <Pressable
          style={({ pressed }) => [styles.loginButton, pressed && styles.loginButtonPressed]}
          onPress={goToLogin}
          accessibilityRole="button"
          accessibilityLabel="Log in to existing account"
        >
          <Text style={styles.loginButtonText}>I already have an account</Text>
        </Pressable>

        {/* Social divider */}
        <View style={styles.socialDivider}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>or continue with</Text>
          <View style={styles.divLine} />
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          <Pressable
            style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
            onPress={goToLocationViaGoogle}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
            onPress={goToLocationViaApple}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
          >
            {/* On Android/web, Apple logo looks best in the brand's dark colour.
                On iOS it should respect light/dark mode — use Colors.text as a proxy. */}
            <Ionicons
              name="logo-apple"
              size={20}
              color={Colors.text}
            />
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <Text style={styles.trustBar}>5 countries · 50k+ members · 1000+ events</Text>
      </Animated.View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topSection: { flex: 1, alignItems: 'center', paddingHorizontal: 32 },
  iconCluster: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  orb: { position: 'absolute', borderRadius: 100 },
  orbPrimary: {
    width: 140,
    height: 140,
    backgroundColor: Colors.primary + '15',
    top: 0,
    left: 0,
  },
  orbSecondary: {
    width: 100,
    height: 100,
    backgroundColor: Colors.secondary + '15',
    top: -10,
    right: -20,
  },
  orbAccent: {
    width: 80,
    height: 80,
    backgroundColor: Colors.accent + '20',
    bottom: -10,
    left: -10,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.primary,
    marginTop: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  bottomSection: { paddingHorizontal: 24, gap: 12 },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  primaryButtonText: { color: '#FFF', fontSize: 17, fontFamily: 'Poppins_600SemiBold' },
  loginButton: { paddingVertical: 14, alignItems: 'center' },
  // Extracted from inline `{ opacity: 0.8 }` to a stable stylesheet reference
  loginButtonPressed: { opacity: 0.8 },
  loginButtonText: { color: Colors.primary, fontSize: 15, fontFamily: 'Poppins_600SemiBold' },
  socialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
  },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.card,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  // Extracted from inline `{ opacity: 0.8 }` to a stable stylesheet reference
  socialButtonPressed: { opacity: 0.8 },
  socialText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  featureList: { marginTop: 24, gap: 12, width: '100%', paddingHorizontal: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.text },
  trustBar: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, textAlign: 'center', marginTop: 12 },
});