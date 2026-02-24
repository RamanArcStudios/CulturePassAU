import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

const isWeb = Platform.OS === 'web';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const { completeOnboarding } = useOnboarding();

  const goToSignup = useCallback(() => router.push('/(onboarding)/signup'), []);
  const goToLogin = useCallback(() => router.push('/(onboarding)/login'), []);
  const goToLocationViaGoogle = useCallback(() => router.push('/(onboarding)/location'), []);
  const goToLocationViaApple = useCallback(() => router.push('/(onboarding)/location'), []);

  const handleSkip = useCallback(() => {
    completeOnboarding();
    router.replace('/(tabs)');
  }, [completeOnboarding]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#F2F2F7', '#E8ECEF']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.topSection, { paddingTop: topInset + 60 }]}>
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(200).duration(800)} style={styles.iconCluster}>
          <View style={[styles.orb, styles.orbPrimary]} />
          <View style={[styles.orb, styles.orbSecondary]} />
          <View style={[styles.orb, styles.orbAccent]} />
          <View style={styles.logoContainer}>
            <Ionicons name="globe-outline" size={56} color={Colors.primary} />
          </View>
        </Animated.View>

        <Animated.Text entering={isWeb ? undefined : FadeInDown.delay(400).duration(800)} style={styles.title}>
          CulturePass
        </Animated.Text>
        <Animated.Text entering={isWeb ? undefined : FadeInDown.delay(600).duration(800)} style={styles.tagline}>
          Connect. Celebrate. Belong.
        </Animated.Text>
        <Animated.Text entering={isWeb ? undefined : FadeInDown.delay(800).duration(800)} style={styles.subtitle}>
          Discover cultural events, connect with communities, and celebrate diversity across
          Australia, New Zealand, and beyond.
        </Animated.Text>

        <View style={styles.featureList}>
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(1000).duration(600)} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.primaryGlow }]}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.featureText}>Discover Events</Text>
          </Animated.View>
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(1150).duration(600)} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: '#5856D610' }]}>
              <Ionicons name="people-outline" size={18} color={Colors.secondary} />
            </View>
            <Text style={styles.featureText}>Join Communities</Text>
          </Animated.View>
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(1300).duration(600)} style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: '#FF950010' }]}>
              <Ionicons name="gift-outline" size={18} color={Colors.accent} />
            </View>
            <Text style={styles.featureText}>Exclusive Perks</Text>
          </Animated.View>
        </View>
      </View>

      <Animated.View
        entering={isWeb ? undefined : FadeInUp.delay(1000).duration(800)}
        style={[styles.bottomSection, { paddingBottom: bottomInset + 16 }]}
      >
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={goToSignup}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={goToLogin}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </Pressable>

        <View style={styles.socialDivider}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>or continue with</Text>
          <View style={styles.divLine} />
        </View>

        <View style={styles.socialRow}>
          <Pressable
            style={({ pressed }) => [styles.socialButton, pressed && { opacity: 0.8 }]}
            onPress={goToLocationViaGoogle}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.socialButton, pressed && { opacity: 0.8 }]}
            onPress={goToLocationViaApple}
          >
            <Ionicons name="logo-apple" size={20} color="#1C1C1E" />
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip and explore</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.textTertiary} />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topSection: { flex: 1, alignItems: 'center', paddingHorizontal: 32 },
  iconCluster: {
    width: 140, height: 140,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  orb: { position: 'absolute', borderRadius: 100 },
  orbPrimary: { width: 140, height: 140, backgroundColor: 'rgba(0,122,255,0.08)', top: 0, left: 0 },
  orbSecondary: { width: 100, height: 100, backgroundColor: 'rgba(88,86,214,0.08)', top: -10, right: -20 },
  orbAccent: { width: 80, height: 80, backgroundColor: 'rgba(255,149,0,0.08)', bottom: -10, left: -10 },
  logoContainer: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#007AFF', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 24, elevation: 8,
  },
  title: { fontSize: 36, fontFamily: 'Poppins_700Bold', color: '#1C1C1E', letterSpacing: -0.5 },
  tagline: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: Colors.primary, marginTop: 4, letterSpacing: 1 },
  subtitle: {
    fontSize: 15, fontFamily: 'Poppins_400Regular', color: '#6E6E73',
    textAlign: 'center', marginTop: 16, lineHeight: 24, paddingHorizontal: 8,
  },
  featureList: { marginTop: 24, gap: 12, width: '100%', paddingHorizontal: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#1C1C1E' },
  bottomSection: { paddingHorizontal: 24, gap: 10 },
  primaryButton: {
    backgroundColor: Colors.primary, borderRadius: 14,
    height: 52, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  primaryButtonText: { color: '#FFF', fontSize: 17, fontFamily: 'Poppins_600SemiBold' },
  secondaryButton: {
    height: 52, alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, backgroundColor: Colors.primaryGlow,
  },
  secondaryButtonText: { color: Colors.primary, fontSize: 15, fontFamily: 'Poppins_600SemiBold' },
  socialDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 4 },
  divLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#D1D1D6' },
  divText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#AEAEB2' },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FFFFFF', borderRadius: 14,
    height: 52, borderWidth: 1, borderColor: '#E5E5EA',
  },
  socialText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#1C1C1E' },
  skipButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
  },
  skipText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textTertiary },
});
