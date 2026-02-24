import { View, Text, Pressable, StyleSheet, TextInput, Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/lib/auth';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const isValid = name.trim().length > 1 && email.includes('@') && password.length >= 6 && agreed;

  const handleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      const base = getApiUrl();
      const username = email.split('@')[0] + '_' + Date.now().toString(36);
      const res = await fetch(`${base}api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName: name.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      await login({ user: data.user, accessToken: data.token });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/(onboarding)/location');
    } catch (e: any) {
      setError('Connection error. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}><Ionicons name="arrow-back" size={24} color={Colors.text} /></Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.benefitsRow}>Free events · Community access · Exclusive perks</Text>
          <Text style={styles.subtitle}>Join thousands of community members celebrating culture together.</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={20} color={Colors.textSecondary} />
                <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor={Colors.textTertiary}
                  value={name} onChangeText={setName} autoCapitalize="words" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />
                <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={Colors.textTertiary}
                  value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />
                <TextInput style={styles.input} placeholder="Min. 6 characters" placeholderTextColor={Colors.textTertiary}
                  value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </Pressable>
              </View>
              {password.length > 0 && password.length < 6 && <Text style={styles.hint}>Password must be at least 6 characters</Text>}
              {password.length > 0 && (
                <View style={styles.strengthContainer}>
                  <View style={styles.strengthBarBg}>
                    <View style={[
                      styles.strengthBarFill,
                      {
                        width: password.length < 6 ? '33%' : password.length < 10 ? '66%' : '100%',
                        backgroundColor: password.length < 6 ? Colors.error : password.length < 10 ? Colors.warning : Colors.success,
                      },
                    ]} />
                  </View>
                  <Text style={[
                    styles.strengthLabel,
                    { color: password.length < 6 ? Colors.error : password.length < 10 ? Colors.warning : Colors.success },
                  ]}>
                    {password.length < 6 ? 'Weak' : password.length < 10 ? 'Medium' : 'Strong'}
                  </Text>
                </View>
              )}
            </View>

            <Pressable style={styles.checkRow} onPress={() => setAgreed(!agreed)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkText}>I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text></Text>
            </Pressable>
          </View>

          <Pressable style={[styles.submitBtn, !isValid && { opacity: 0.5 }]} onPress={isValid ? handleSignUp : undefined} disabled={!isValid || loading}>
            {loading ? <ActivityIndicator color="#FFF" size="small" /> : (
              <>
                <Text style={styles.submitText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </>
            )}
          </Pressable>

          <Pressable style={styles.switchRow} onPress={() => router.replace('/(onboarding)/login')}>
            <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Sign In</Text></Text>
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
  title: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 22, marginBottom: 28 },
  errorText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.error, textAlign: 'center', marginBottom: 16, backgroundColor: Colors.error + '15', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  form: { gap: 20, marginBottom: 28 },
  inputGroup: { gap: 6 },
  label: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1, borderColor: Colors.border },
  input: { flex: 1, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text },
  hint: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.warning, marginTop: 4 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  checkboxChecked: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  checkText: { flex: 1, fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  linkText: { color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  submitText: { fontSize: 17, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  switchRow: { alignItems: 'center' },
  switchText: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  switchLink: { color: Colors.primary, fontFamily: 'Poppins_600SemiBold' },
  benefitsRow: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, marginBottom: 4 },
  strengthContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  strengthBarBg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: Colors.border },
  strengthBarFill: { height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 12, fontFamily: 'Poppins_500Medium' },
});
