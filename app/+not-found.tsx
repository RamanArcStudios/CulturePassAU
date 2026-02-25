import { Link, Stack, router } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View style={styles.container}>
        {/* Hero illustration */}
        <Animated.View entering={FadeIn.duration(800)} style={styles.hero}>
          <View style={styles.ghostWrap}>
            <View style={styles.ghostBody}>
              <View style={styles.ghostHead}>
                <View style={styles.ghostEyes}>
                  <View style={styles.ghostEye} />
                  <View style={styles.ghostEye} />
                </View>
                <View style={styles.ghostMouth} />
              </View>
              <View style={styles.ghostArms}>
                <View style={styles.ghostArm} />
                <View style={[styles.ghostArm, styles.ghostArmRight]} />
              </View>
            </View>
            <View style={styles.ghostTail} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.content}
        >
          <Text style={styles.title}>Oops!</Text>
          <Text style={styles.subtitle}>
            This screen doesn't exist.
          </Text>
          <Text style={styles.detail}>
            The page you're looking for might have been moved or no longer exists.
          </Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.actions}
        >
          <Link href="/" asChild>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <Ionicons name="home" size={18} color="#FFF" />
              <Text style={styles.primaryBtnText}>Go Home</Text>
            </Pressable>
          </Link>

          <Pressable
            style={styles.secondaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={18} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>Go Back</Text>
          </Pressable>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  hero: {
    marginBottom: 40,
  },
  ghostWrap: {
    alignItems: 'center',
  },
  ghostBody: {
    width: 120,
    height: 140,
    backgroundColor: Colors.surface,
    borderRadius: 40,
    position: 'relative',
    alignItems: 'center',
    paddingTop: 20,
    ...Colors.shadows.medium,
  },
  ghostHead: {
    width: 60,
    height: 40,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ghostEyes: {
    flexDirection: 'row',
    gap: 12,
  },
  ghostEye: {
    width: 8,
    height: 8,
    backgroundColor: Colors.textTertiary,
    borderRadius: 4,
  },
  ghostMouth: {
    width: 12,
    height: 6,
    backgroundColor: Colors.textTertiary,
    borderRadius: 3,
    marginTop: 4,
  },
  ghostArms: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  ghostArm: {
    width: 20,
    height: 20,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    transform: [{ rotate: '-20deg' }],
  },
  ghostArmRight: {
    transform: [{ rotate: '20deg' }],
  },
  ghostTail: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderTopWidth: 40,
    borderTopColor: Colors.surface,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -20,
  },
  content: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  detail: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  actions: {
    gap: 12,
    width: '100%',
    maxWidth: 340,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    ...Colors.shadows.small,
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Colors.shadows.small,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
});
