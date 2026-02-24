import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SECTIONS = [
  { title: '1. Information We Collect', body: 'We collect information you provide directly, including: name, email address, phone number, location (city and country), profile information, social media links, and payment details. We also automatically collect device information, usage data, IP address, and interaction patterns to improve our services.' },
  { title: '2. How We Use Your Information', body: 'We use your information to:\n\n• Provide and maintain CulturePass services\n• Process ticket purchases and payments\n• Personalise your experience and event recommendations\n• Send notifications about events, perks, and community updates\n• Improve our platform and develop new features\n• Comply with legal obligations\n• Prevent fraud and ensure platform security' },
  { title: '3. Information Sharing', body: 'We may share your information with:\n\n• Event organisers (when you purchase tickets)\n• Payment processors (for transaction processing)\n• Sponsor partners (anonymised analytics only)\n• Service providers who assist our operations\n• Law enforcement when required by law\n\nWe never sell your personal information to third parties.' },
  { title: '4. Data Storage & Security', body: 'Your data is stored on secure servers with encryption at rest and in transit. We implement industry-standard security measures including SSL/TLS encryption, access controls, regular security audits, and secure data backups. However, no method of transmission over the internet is 100% secure.' },
  { title: '5. Your Rights', body: 'Depending on your location, you have the right to:\n\n• Access your personal data\n• Correct inaccurate data\n• Delete your data ("right to be forgotten")\n• Export your data in a portable format\n• Opt out of marketing communications\n• Withdraw consent for data processing\n• Lodge a complaint with a supervisory authority\n\nTo exercise these rights, contact us at privacy@culturepass.com.' },
  { title: '6. Location Data', body: 'CulturePass uses your city and country selection to personalise event recommendations and community suggestions. We do not track your precise GPS location. Location data is stored locally on your device and on our servers for service delivery.' },
  { title: '7. Children\'s Privacy', body: 'CulturePass is not intended for children under 16. We do not knowingly collect personal information from children under 16. If we discover that a child under 16 has provided us with personal information, we will delete it immediately. Parents or guardians who believe their child has provided information should contact us.' },
  { title: '8. International Data Transfers', body: 'CulturePass operates across Australia, New Zealand, UAE, UK, and Canada. Your data may be transferred and processed in any of these countries. We ensure appropriate safeguards are in place for international transfers, complying with the Australian Privacy Act, GDPR (for UK users), PIPEDA (for Canadian users), and applicable UAE data protection laws.' },
  { title: '9. Data Retention', body: 'We retain your personal data for as long as your account is active or as needed to provide services. After account deletion, we retain anonymised data for analytics and legal compliance for up to 7 years. Transaction records are retained as required by financial regulations.' },
  { title: '10. Third-Party Links', body: 'CulturePass may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any personal information.' },
  { title: '11. Changes to This Policy', body: 'We may update this Privacy Policy periodically. We will notify you of material changes via email or in-app notification at least 30 days before the changes take effect. Your continued use of CulturePass after changes constitutes acceptance.' },
  { title: '12. Contact Us', body: 'For privacy inquiries or to exercise your data rights:\n\nPrivacy Officer\nCulturePass Pty Ltd\nEmail: privacy@culturepass.com\nPhone: 1800-CULTURE (1800 285 887)\nAddress: Level 10, 100 Market Street, Sydney NSW 2000, Australia\n\nFor UK users: You may also contact the ICO at ico.org.uk\nFor Canadian users: You may contact the OPC at priv.gc.ca' },
];

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : insets.bottom) }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.intro}>
          <View style={[styles.iconWrap, { backgroundColor: '#2ECC7115' }]}>
            <Ionicons name="shield-checkmark" size={28} color="#2ECC71" />
          </View>
          <Text style={styles.introTitle}>Privacy Policy</Text>
          <Text style={styles.introDate}>Last updated: 1 February 2026</Text>
          <Text style={styles.introPara}>CulturePass Pty Ltd (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information.</Text>
        </Animated.View>

        {SECTIONS.map((s, i) => (
          <Animated.View key={i} entering={FadeInDown.delay(150 + i * 30).duration(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  intro: { marginHorizontal: 20, marginBottom: 24, backgroundColor: Colors.card, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center' },
  iconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  introTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 4 },
  introDate: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.primary, marginBottom: 12 },
  introPara: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },
  sectionBody: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 21 },
});
