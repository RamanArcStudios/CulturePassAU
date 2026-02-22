import { View, Text, Pressable, StyleSheet, TextInput, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValid = email.includes('@') && password.length >= 6;

  const handleLogin = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/(onboarding)/location');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}><Ionicons name="arrow-back" size={24} color={Colors.text} /></Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}><Ionicons name="globe-outline" size={36} color={Colors.primary} /></View>
          </View>

          <Text style={styles.title}>Welcome back CulturePass</Text>
          <Text style={styles.subtitle}>Sign in to continue your cultural journey.</Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={Colors.textTertiary}
                  value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <Pressable onPress={() => router.push('/(onboarding)/forgot-password')}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>
              </View>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                <TextInput style={styles.input} placeholder="Enter your password" placeholderTextColor={Colors.textTertiary}
                  value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>
            </View>
          </View>

          <Pressable style={[styles.submitBtn, !isValid && { opacity: 0.5 }]} onPress={isValid ? handleLogin : undefined} disabled={!isValid}>
            <Text style={styles.submitText}>Sign In</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </Pressable>

          <View style={styles.socialDivider}>
            <View style={styles.divLine} />
            <Text style={styles.divText}>or continue with</Text>
            <View style={styles.divLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton} onPress={() => router.push('/(onboarding)/location')}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialBtnText}>Google</Text>
            </Pressable>
            <Pressable style={styles.socialButton} onPress={() => router.push('/(onboarding)/location')}>
              <Ionicons name="logo-apple" size={20} color="#000" />
              <Text style={styles.socialBtnText}>Apple</Text>
            </Pressable>
          </View>

          <Pressable style={styles.switchRow} onPress={() => router.replace('/(onboarding)/signup')}>
            <Text style={styles.switchText}>Don't have an account? <Text style={styles.switchLink}>Sign Up</Text></Text>
          </Pressable>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  logoRow: { alignItems: 'center', marginBottom: 24 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  form: { gap: 20, marginBottom: 28 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  forgotText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: Colors.cardBorder },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24 },
  submitText: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  socialDivider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  divText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.card, borderRadius: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: Colors.cardBorder },
  socialBtnText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  switchRow: { alignItems: 'center' },
  switchText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  switchLink: { color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },
});
