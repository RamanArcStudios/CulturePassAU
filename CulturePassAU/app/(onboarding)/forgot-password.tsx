import { View, Text, Pressable, StyleSheet, TextInput, Platform, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const isValid = email.includes('@') && email.includes('.');

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSent(true);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}><Ionicons name="arrow-back" size={24} color={Colors.text} /></Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          {!sent ? (
            <>
              <View style={styles.iconRow}>
                <View style={styles.iconCircle}><Ionicons name="lock-open-outline" size={36} color={Colors.primary} /></View>
              </View>

              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter the email address associated with your account. We'll send you a link to reset your password.</Text>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrap}>
                    <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                    <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={Colors.textTertiary}
                      value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
                  </View>
                </View>
              </View>

              <Pressable style={[styles.submitBtn, !isValid && { opacity: 0.5 }]} onPress={isValid ? handleSubmit : undefined} disabled={!isValid}>
                <Ionicons name="send" size={18} color="#FFF" />
                <Text style={styles.submitText}>Send Reset Link</Text>
              </Pressable>

              <Pressable style={styles.backRow} onPress={() => router.back()}>
                <Text style={styles.backText}>Back to Sign In</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}><Ionicons name="checkmark-circle" size={64} color={Colors.success} /></View>
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successSubtitle}>We've sent a password reset link to:</Text>
              <Text style={styles.emailDisplay}>{email}</Text>
              <Text style={styles.successHint}>If you don't see it, check your spam folder. The link expires in 24 hours.</Text>

              <Pressable style={styles.submitBtn} onPress={() => router.replace('/(onboarding)/login')}>
                <Ionicons name="arrow-back" size={18} color="#FFF" />
                <Text style={styles.submitText}>Back to Sign In</Text>
              </Pressable>

              <Pressable style={styles.resendRow} onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert('Email Resent', 'A new reset link has been sent to your email.');
              }}>
                <Text style={styles.resendText}>Didn't receive it? <Text style={styles.resendLink}>Resend</Text></Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, flex: 1 },
  iconRow: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  form: { gap: 20, marginBottom: 28 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: Colors.cardBorder },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  submitText: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  backRow: { alignItems: 'center' },
  backText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  successIcon: { marginBottom: 20 },
  successTitle: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },
  successSubtitle: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  emailDisplay: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginTop: 4, marginBottom: 16 },
  successHint: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 32, paddingHorizontal: 16 },
  resendRow: { alignItems: 'center', marginTop: 8 },
  resendText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  resendLink: { color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },
});
