import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

const FAQ_ITEMS = [
  { q: 'What is CulturePass?', a: 'CulturePass is a lifestyle platform designed for cultural diaspora communities. It connects you with events, communities, perks, and local businesses that celebrate your culture.' },
  { q: 'How do I join a community?', a: 'Visit the Communities tab to browse cultural communities near you. Tap on any community to see its details, then tap "Join" to become a member and receive updates on their events and activities.' },
  { q: 'How do I purchase event tickets?', a: 'Browse events from the Home or Explore tab. Tap on an event to view details, select your ticket tier, and complete the purchase using your wallet or saved payment method.' },
  { q: 'What are Perks & Benefits?', a: 'Perks are exclusive discounts, free tickets, early access, and VIP upgrades offered by CulturePass and our sponsor partners. Visit the Perks page to browse and redeem available offers.' },
  { q: 'How can I list my business or organisation?', a: 'Go to the Submit page from the directory or profile section. Fill out the form with your organisation, business, or artist details and submit for review. Our team will verify and approve your listing.' },
];

const CONTACT_OPTIONS = [
  { icon: 'mail', label: 'Email Support', sub: 'support@culturepass.com', color: '#3498DB', action: () => Linking.openURL('mailto:support@culturepass.com') },
  { icon: 'call', label: 'Phone Support', sub: '1800-CULTURE (1800 285 887)', color: '#34C759', action: () => Linking.openURL('tel:1800285887') },
];

export default function SettingsHelpScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : insets.bottom) }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy" size={32} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Find answers to common questions or reach out to our support team</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_ITEMS.map((faq, i) => (
            <Pressable key={i} style={styles.faqCard} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedFaq(expandedFaq === i ? null : i);
            }}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons name={expandedFaq === i ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.textSecondary} />
              </View>
              {expandedFaq === i && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            {CONTACT_OPTIONS.map((opt, i) => (
              <View key={i}>
                <Pressable style={styles.contactItem} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); opt.action(); }}>
                  <View style={[styles.contactIcon, { backgroundColor: opt.color + '15' }]}>
                    <Ionicons name={opt.icon as any} size={20} color={opt.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactLabel}>{opt.label}</Text>
                    <Text style={styles.contactSub}>{opt.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </Pressable>
                {i < CONTACT_OPTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
          <Pressable style={styles.guidelinesCard} onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/legal/guidelines');
          }}>
            <View style={[styles.contactIcon, { backgroundColor: '#9B59B615' }]}>
              <Ionicons name="book-outline" size={20} color="#9B59B6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>Community Guidelines</Text>
              <Text style={styles.contactSub}>Read our community standards and policies</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={Colors.textTertiary} />
          </Pressable>
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
  heroCard: { marginHorizontal: 20, marginBottom: 24, backgroundColor: Colors.secondary, borderRadius: 20, padding: 24, alignItems: 'center' },
  heroIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#FFF', marginBottom: 6 },
  heroSub: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 18 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },
  faqCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: 8 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  faqQuestion: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text, flex: 1, lineHeight: 20 },
  faqAnswer: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 10, lineHeight: 20 },
  contactCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.cardBorder, overflow: 'hidden' },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  contactIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  contactLabel: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: Colors.text },
  contactSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: Colors.divider, marginLeft: 66 },
  guidelinesCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.cardBorder },
});
