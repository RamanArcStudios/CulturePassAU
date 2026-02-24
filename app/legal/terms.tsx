import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

const SECTIONS = [
  { title: '1. Acceptance of Terms', body: 'By downloading, accessing, or using CulturePass ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the App. CulturePass reserves the right to update or modify these Terms at any time. Continued use of the App after changes constitutes acceptance of the revised Terms.' },
  { title: '2. Eligibility', body: 'You must be at least 16 years old to create an account and use CulturePass. By using the App, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms. Users under 18 must have consent from a parent or legal guardian.' },
  { title: '3. Account Registration', body: 'To access certain features, you must create an account. You agree to provide accurate, complete, and current information. You are responsible for maintaining the confidentiality of your account credentials. CulturePass is not liable for any loss arising from unauthorized use of your account. You must notify us immediately of any breach of security.' },
  { title: '4. Services', body: 'CulturePass provides a platform to discover cultural events, connect with communities, purchase event tickets, access perks and benefits, and engage with local businesses. We act as a marketplace connecting event organisers, businesses, and users. We do not guarantee the availability, quality, or safety of third-party events or services listed on the App.' },
  { title: '5. Tickets & Payments', body: 'Event tickets purchased through CulturePass are subject to the organiser\'s terms and conditions. All payments are processed securely through our payment partners. Ticket prices are displayed in the local currency of the event. CulturePass Wallet funds are non-transferable and subject to our Wallet Policy. Refunds for cancelled events are processed within 3-5 business days to your CulturePass Wallet.' },
  { title: '6. Membership & Perks', body: 'CulturePass offers membership tiers (Free, Plus at $4.99/month, and Premium at $9.99/month). Benefits vary by tier and are subject to change with 30 days\' notice. Perks provided by third-party partners are subject to availability and partner terms. CulturePass does not guarantee the continued availability of any specific perk or benefit.' },
  { title: '7. User Conduct', body: 'You agree not to: (a) use the App for any unlawful purpose; (b) impersonate any person or entity; (c) interfere with the App\'s operation; (d) post offensive, discriminatory, or harmful content; (e) scrape, harvest, or collect user information; (f) attempt to gain unauthorized access to any part of the App. Violation may result in account suspension or termination.' },
  { title: '8. Intellectual Property', body: 'All content, features, and functionality of CulturePass, including but not limited to text, graphics, logos, icons, images, and software, are the exclusive property of CulturePass Pty Ltd and are protected by Australian and international copyright, trademark, and other intellectual property laws.' },
  { title: '9. Community Guidelines', body: 'Users participating in community features must respect cultural diversity and maintain a welcoming environment. Hate speech, discrimination, harassment, and bullying are strictly prohibited. CulturePass reserves the right to moderate content and remove posts that violate these guidelines without notice.' },
  { title: '10. Limitation of Liability', body: 'CulturePass is provided "as is" without warranties of any kind. To the maximum extent permitted by law, CulturePass Pty Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the App. Our total liability shall not exceed the amount you paid to CulturePass in the 12 months preceding the claim.' },
  { title: '11. Governing Law', body: 'These Terms are governed by the laws of New South Wales, Australia. Any disputes arising from these Terms shall be resolved in the courts of New South Wales. For users in New Zealand, UAE, UK, or Canada, local consumer protection laws may also apply.' },
  { title: '12. Contact', body: 'For questions about these Terms, contact us at:\n\nCulturePass Pty Ltd\nEmail: legal@culturepass.au\nPhone: 1800-CULTURE (1800 285 887)\nAddress: Level 10, 100 Market Street, Sydney NSW 2000, Australia' },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : insets.bottom) }} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.intro}>
          <View style={[styles.iconWrap, { backgroundColor: '#3498DB15' }]}>
            <Ionicons name="document-text" size={28} color="#3498DB" />
          </View>
          <Text style={styles.introTitle}>Terms of Service</Text>
          <Text style={styles.introDate}>Last updated: 1 February 2026</Text>
          <Text style={styles.introPara}>Please read these Terms of Service carefully before using CulturePass. These terms govern your use of our platform across Australia, New Zealand, UAE, UK, and Canada.</Text>
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
