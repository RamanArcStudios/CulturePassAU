import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useCallback } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

const FEATURES = [
  { icon: 'calendar' as const, color: Colors.primary, bg: Colors.primaryGlow, text: 'Discover cultural events near you' },
  { icon: 'people' as const, color: Colors.secondary, bg: 'rgba(88,86,214,0.1)', text: 'Join vibrant communities' },
  { icon: 'gift' as const, color: Colors.accent, bg: 'rgba(255,149,0,0.1)', text: 'Unlock exclusive member perks' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  const { completeOnboarding } = useOnboarding();

  const goToSignup = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(onboarding)/signup');
  }, []);

  const goToLogin = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(onboarding)/login');
  }, []);

  const goToLocationViaGoogle = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // TODO: Implement Google OAuth
    router.push('/(onboarding)/location');
  }, []);

  const goToLocationViaApple = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // TODO: Implement Apple Sign In
    router.push('/(onboarding)/location');
  }, []);

  const handleSkip = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    completeOnboarding();
    router.replace('/(tabs)');
  }, [completeOnboarding]);

  return (
    <View style={styles.container}>
      {/* Hero gradient background */}
      <LinearGradient
        colors={['#0A1628', '#0D2147', '#1A1F5C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <View style={[styles.orb, styles.orbTop]} pointerEvents="none" />
      <View style={[styles.orb, styles.orbMid]} pointerEvents="none" />
      <View style={[styles.orb, styles.orbBottom]} pointerEvents="none" />

      <View style={[styles.topSection, { paddingTop: topInset + 48 }]}>
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(800)} style={styles.logoRow}>
          <View style={styles.logoContainer}>
            <Ionicons name="earth" size={40} color="#FFFFFF" />
          </View>
        </Animated.View>

        <Animated.Text entering={isWeb ? undefined : FadeInDown.delay(300).duration(800)} style={styles.title}>
          CulturePass
        </Animated.Text>
        <Animated.Text entering={isWeb ? undefined : FadeInDown.delay(500).duration(800)} style={styles.tagline}>
          Connect · Celebrate · Belong
        </Animated.Text>
        <Animated.Text entering={isWeb ? undefined : FadeInDown.delay(700).duration(800)} style={styles.subtitle}>
          Discover cultural events, connect with communities, and celebrate diversity across Australia and beyond.
        </Animated.Text>

        <View style={styles.featureList}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.text}
              entering={isWeb ? undefined : FadeInDown.delay(900 + i * 120).duration(600)}
              style={styles.featureRow}
            >
              <View style={[styles.featureIcon, { backgroundColor: f.bg }]}>
                <Ionicons name={f.icon} size={18} color={f.color} />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <Animated.View
        entering={isWeb ? undefined : FadeInUp.delay(900).duration(800)}
        style={[styles.bottomSection, { paddingBottom: bottomInset + 16 }]}
      >
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={goToSignup}
          android_ripple={{ color: 'rgba(10, 22, 40, 0.1)' }}
          accessibilityRole="button"
          accessibilityLabel="Create Account"
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
          <Ionicons name="arrow-forward" size={20} color="#0A1628" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={goToLogin}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
          accessibilityRole="button"
          accessibilityLabel="Sign in to existing account"
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
            style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
            onPress={goToLocationViaGoogle}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.socialText}>Google</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
            onPress={goToLocationViaApple}
            android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
            accessibilityRole="button"
            accessibilityLabel="Continue with Apple"
          >
            <Ionicons name="logo-apple" size={20} color="#FFFFFF" />
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <Pressable 
          onPress={handleSkip} 
          style={styles.skipButton}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.05)', radius: 100 }}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipText}>Skip and explore</Text>
          <Ionicons name="arrow-forward" size={14} color="rgba(255,255,255,0.4)" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A1628' 
  },

  orb: { 
    position: 'absolute', 
    borderRadius: 300 
  },
  orbTop: {
    width: 300, 
    height: 300,
    top: -80, 
    right: -80,
    backgroundColor: 'rgba(0,122,255,0.18)',
  },
  orbMid: {
    width: 200, 
    height: 200,
    top: '35%', 
    left: -60,
    backgroundColor: 'rgba(88,86,214,0.14)',
  },
  orbBottom: {
    width: 180, 
    height: 180,
    bottom: '20%', 
    right: -50,
    backgroundColor: 'rgba(255,149,0,0.10)',
  },

  topSection: { 
    flex: 1, 
    alignItems: 'center', 
    paddingHorizontal: 32 
  },

  logoRow: { 
    marginBottom: 28 
  },
  logoContainer: {
    width: 88, 
    height: 88, 
    borderRadius: 28,
    backgroundColor: 'rgba(0,122,255,0.25)',
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0,122,255,0.5)',
  },

  title: {
    fontSize: 38, 
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF', 
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14, 
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.55)', 
    marginTop: 6, 
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 15, 
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center', 
    marginTop: 16, 
    lineHeight: 24, 
    paddingHorizontal: 8,
  },

  featureList: { 
    marginTop: 28, 
    gap: 14, 
    width: '100%' 
  },
  featureRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14, 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth, 
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  featureText: { 
    fontSize: 14, 
    fontFamily: 'Poppins_500Medium', 
    color: 'rgba(255,255,255,0.85)', 
    flex: 1 
  },

  bottomSection: { 
    paddingHorizontal: 24, 
    gap: 10 
  },

  primaryButton: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 16,
    height: 54, 
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
  },
  buttonPressed: { 
    opacity: 0.9, 
    transform: [{ scale: 0.98 }] 
  },
  primaryButtonText: { 
    color: '#0A1628', 
    fontSize: 17, 
    fontFamily: 'Poppins_700Bold' 
  },

  secondaryButton: {
    height: 54, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1.5, 
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  secondaryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontFamily: 'Poppins_600SemiBold' 
  },

  socialDivider: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    paddingHorizontal: 4,
    marginVertical: 4,
  },
  divLine: { 
    flex: 1, 
    height: StyleSheet.hairlineWidth, 
    backgroundColor: 'rgba(255,255,255,0.15)' 
  },
  divText: { 
    fontSize: 13, 
    fontFamily: 'Poppins_400Regular', 
    color: 'rgba(255,255,255,0.4)' 
  },

  socialRow: { 
    flexDirection: 'row', 
    gap: 12 
  },
  socialButton: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16, 
    height: 52,
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.15)',
  },
  socialButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  socialText: { 
    fontSize: 14, 
    fontFamily: 'Poppins_600SemiBold', 
    color: '#FFFFFF' 
  },

  skipButton: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 6, 
    paddingVertical: 12,
    marginTop: 4,
  },
  skipText: { 
    fontSize: 14, 
    fontFamily: 'Poppins_500Medium', 
    color: 'rgba(255,255,255,0.4)' 
  },
});
