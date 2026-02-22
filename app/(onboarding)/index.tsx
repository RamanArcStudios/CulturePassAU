import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, '#F5EDE4', '#EDE0D4']}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.topSection, { paddingTop: topInset + 60 }]}>
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
          Discover cultural events, connect with communities, and celebrate diversity across Australia, New Zealand, and beyond.
        </Animated.Text>
      </View>

      <Animated.View entering={FadeInUp.delay(1000).duration(800)} style={[styles.bottomSection, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/(onboarding)/location')}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && { opacity: 0.7 }]}
          onPress={() => router.push('/(onboarding)/location')}
        >
          <Text style={styles.secondaryButtonText}>I already have an account</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCluster: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  orb: {
    position: 'absolute',
    borderRadius: 100,
  },
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
  bottomSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
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
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
});
