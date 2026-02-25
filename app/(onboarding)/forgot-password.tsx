import { View, Text, Pressable, StyleSheet, TextInput, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { getApiUrl } from '@/lib/query-client';

const isWeb = Platform.OS === 'web';

// Email validation helper
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = validateEmail(email);

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to send reset link');
      }
      
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      setSent(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset link. Please try again.');
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isValid, isSubmitting]);

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, []);

  const handleResend = useCallback(async () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    try {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      
      if (!res.ok) throw new Error('Failed to resend reset link');
      
      Alert.alert('Email Resent', 'A new reset link has been sent to your email.');
      
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend reset link. Please try again.');
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [email]);

  const handleBackToSignIn = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.replace('/(onboarding)/login');
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardView} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      keyboardVerticalOffset={0}
    >
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable 
            onPress={handleBack} 
            hitSlop={12}
            android_ripple={{ color: Colors.primary + '20', radius: 20 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled" 
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 40 }]}
        >
          {!sent ? (
            <Animated.View entering={FadeIn.duration(400)}>
              <View style={styles.iconRow}>
                <View style={styles.iconCircle}>
                  <Ionicons name="lock-open-outline" size={36} color={Colors.primary} />
                </View>
              </View>

              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter the email address associated with your account. We&apos;ll send you a link to reset your password.
              </Text>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={[
                    styles.inputWrap,
                    email.length > 0 && !isValid && styles.inputWrapError
                  ]}>
                    <Ionicons 
                      name="mail-outline" 
                      size={20} 
                      color={email.length > 0 && !isValid ? Colors.error : Colors.textSecondary} 
                    />
                    <TextInput 
                      style={styles.input} 
                      placeholder="you@example.com" 
                      placeholderTextColor={Colors.textTertiary}
                      value={email} 
                      onChangeText={setEmail} 
                      autoCapitalize="none" 
                      keyboardType="email-address"
                      autoComplete="email"
                      textContentType="emailAddress"
                      returnKeyType="send"
                      onSubmitEditing={handleSubmit}
                      editable={!isSubmitting}
                      accessibilityLabel="Email address input"
                    />
                    {email.length > 0 && (
                      <Ionicons 
                        name={isValid ? "checkmark-circle" : "close-circle"} 
                        size={20} 
                        color={isValid ? Colors.success : Colors.error} 
                      />
                    )}
                  </View>
                  {email.length > 0 && !isValid && (
                    <Text style={styles.errorText}>Please enter a valid email address</Text>
                  )}
                </View>
              </View>

              <Pressable 
                style={[
                  styles.submitBtn, 
                  (!isValid || isSubmitting) && styles.submitBtnDisabled
                ]} 
                onPress={handleSubmit} 
                disabled={!isValid || isSubmitting}
                android_ripple={{ color: '#FFF3' }}
                accessibilityRole="button"
                accessibilityState={{ disabled: !isValid || isSubmitting }}
                accessibilityLabel="Send reset link"
              >
                {isSubmitting ? (
                  <>
                    <Ionicons name="hourglass-outline" size={18} color="#FFF" />
                    <Text style={styles.submitText}>Sending...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#FFF" />
                    <Text style={styles.submitText}>Send Reset Link</Text>
                  </>
                )}
              </Pressable>

              <Pressable 
                style={styles.backRow} 
                onPress={handleBack}
                android_ripple={{ color: Colors.primary + '20' }}
                accessibilityRole="button"
                accessibilityLabel="Back to sign in"
              >
                <Text style={styles.backText}>Back to Sign In</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View 
              entering={FadeIn.duration(400)} 
              exiting={FadeOut.duration(300)}
              style={styles.successContainer}
            >
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
              </View>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successSubtitle}>We&apos;ve sent a password reset link to:</Text>
              <Text style={styles.emailDisplay}>{email}</Text>
              <Text style={styles.successHint}>
                If you don&apos;t see it, check your spam folder. The link expires in 24 hours.
              </Text>

              <Pressable 
                style={styles.submitBtn} 
                onPress={handleBackToSignIn}
                android_ripple={{ color: '#FFF3' }}
                accessibilityRole="button"
                accessibilityLabel="Back to sign in"
              >
                <Ionicons name="arrow-back" size={18} color="#FFF" />
                <Text style={styles.submitText}>Back to Sign In</Text>
              </Pressable>

              <Pressable 
                style={styles.resendRow} 
                onPress={handleResend}
                android_ripple={{ color: Colors.primary + '20' }}
                accessibilityRole="button"
                accessibilityLabel="Resend reset link"
              >
                <Text style={styles.resendText}>
                  Didn&apos;t receive it? <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { 
    flex: 1 
  },
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingVertical: 12 
  },
  scrollContent: { 
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  iconRow: { 
    alignItems: 'center', 
    marginBottom: 24, 
    marginTop: 20 
  },
  iconCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: Colors.primary + '12', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  title: { 
    fontSize: 28, 
    fontFamily: 'Poppins_700Bold', 
    color: Colors.text, 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 15, 
    fontFamily: 'Poppins_400Regular', 
    color: Colors.textSecondary, 
    lineHeight: 22, 
    marginBottom: 28 
  },
  form: { 
    gap: 20, 
    marginBottom: 28 
  },
  inputGroup: { 
    gap: 6 
  },
  label: { 
    fontSize: 14, 
    fontFamily: 'Poppins_600SemiBold', 
    color: Colors.text 
  },
  inputWrap: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    backgroundColor: Colors.card, 
    borderRadius: 14, 
    paddingHorizontal: 14, 
    paddingVertical: 14, 
    borderWidth: 1.5, 
    borderColor: Colors.cardBorder 
  },
  inputWrapError: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '08',
  },
  input: { 
    flex: 1, 
    fontSize: 15, 
    fontFamily: 'Poppins_400Regular', 
    color: Colors.text 
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.error,
    marginTop: 2,
  },
  submitBtn: { 
    backgroundColor: Colors.primary, 
    borderRadius: 16, 
    paddingVertical: 18, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginBottom: 16 
  },
  submitBtnDisabled: { 
    opacity: 0.5 
  },
  submitText: { 
    fontSize: 17, 
    fontFamily: 'Poppins_600SemiBold', 
    color: '#FFF' 
  },
  backRow: { 
    alignItems: 'center',
    paddingVertical: 8,
  },
  backText: { 
    fontSize: 14, 
    fontFamily: 'Poppins_600SemiBold', 
    color: Colors.primary 
  },
  successContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: 40 
  },
  successIcon: { 
    marginBottom: 20 
  },
  successTitle: { 
    fontSize: 24, 
    fontFamily: 'Poppins_700Bold', 
    color: Colors.text, 
    marginBottom: 8 
  },
  successSubtitle: { 
    fontSize: 15, 
    fontFamily: 'Poppins_400Regular', 
    color: Colors.textSecondary 
  },
  emailDisplay: { 
    fontSize: 16, 
    fontFamily: 'Poppins_600SemiBold', 
    color: Colors.primary, 
    marginTop: 4, 
    marginBottom: 16 
  },
  successHint: { 
    fontSize: 13, 
    fontFamily: 'Poppins_400Regular', 
    color: Colors.textSecondary, 
    textAlign: 'center', 
    lineHeight: 20, 
    marginBottom: 32, 
    paddingHorizontal: 16 
  },
  resendRow: { 
    alignItems: 'center', 
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: { 
    fontSize: 14, 
    fontFamily: 'Poppins_400Regular', 
    color: Colors.textSecondary 
  },
  resendLink: { 
    color: Colors.primary, 
    fontFamily: 'Poppins_600SemiBold' 
  },
});
