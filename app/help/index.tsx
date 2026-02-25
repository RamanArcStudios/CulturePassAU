import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState, useCallback } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

const isWeb = Platform.OS === 'web';

const FAQ_ITEMS = [
  {
    q: 'How do I purchase event tickets?',
    a: 'Browse events from the Home or Explore tab. Tap on an event to view details, select your ticket tier, and complete the purchase using your wallet or saved payment method.',
  },
  {
    q: 'How does the Ticket Wallet work?',
    a: 'Your Ticket Wallet is a digital balance you can top up using any saved payment method. Use it for quick event ticket purchases, and earn cashback on eligible transactions.',
  },
  {
    q: 'What are Perks & Benefits?',
    a: 'Perks are exclusive discounts, free tickets, early access, and VIP upgrades offered by CulturePass and our sponsor partners. Visit the Perks page to browse and redeem available offers.',
  },
  {
    q: 'How do I join a community?',
    a: 'Visit the Communities tab to browse cultural communities. Tap on any community to see its details, then tap "Join" to become a member and receive updates on their events.',
  },
  {
    q: 'Can I get a refund for a cancelled event?',
    a: 'Yes! If an event is cancelled by the organiser, you will receive a full refund to your CulturePass Wallet within 3-5 business days. For self-cancellations, refund policies vary by event.',
  },
  {
    q: 'How do I change my location?',
    a: 'Go to your Profile tab, then tap "Edit Profile" to update your city and country. You can also reset the app to go through the location selection again.',
  },
  {
    q: 'What membership tiers are available?',
    a: 'CulturePass offers Free, Plus ($4.99/mo), and Premium ($9.99/mo) tiers. Higher tiers unlock exclusive perks, early access to tickets, and VIP upgrades at partner events.',
  },
  {
    q: 'Is CulturePass available in my country?',
    a: 'CulturePass is currently available in Australia, New Zealand, UAE, UK, and Canada. We are expanding to more countries soon!',
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webTop = isWeb ? 67 : 0;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  const handleOpenEmail = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL('mailto:support@culturepass.au').catch(() => {
      Alert.alert('Error', 'Unable to open email app');
    });
  }, []);

  const handleOpenPhone = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL('tel:1800285887').catch(() => {
      Alert.alert('Error', 'Unable to make phone call');
    });
  }, []);

  const handleOpenChat = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert(
      'Live Chat',
      'Live chat is available Monday-Friday, 9am-6pm AEST. Would you like to email us instead?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: () => {
            Linking.openURL('mailto:support@culturepass.au').catch(() => {
              Alert.alert('Error', 'Unable to open email app');
            });
          },
        },
      ]
    );
  }, []);

  const handleOpenTwitter = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL('https://twitter.com/CulturePassApp').catch(() => {
      Alert.alert('Error', 'Unable to open Twitter');
    });
  }, []);

  const handleFaqToggle = useCallback(
    (index: number) => {
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setExpandedFaq(expandedFaq === index ? null : index);
    },
    [expandedFaq]
  );

  const handleTermsPress = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/legal/terms');
  }, []);

  const handlePrivacyPress = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/legal/privacy');
  }, []);

  const handleCookiesPress = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/legal/cookies');
  }, []);

  const CONTACT_OPTIONS = [
    {
      icon: 'mail' as const,
      label: 'Email Support',
      sub: 'support@culturepass.au',
      color: '#3498DB',
      action: handleOpenEmail,
    },
    {
      icon: 'call' as const,
      label: 'Phone Support',
      sub: '1800-CULTURE (1800 285 887)',
      color: '#34C759',
      action: handleOpenPhone,
    },
    {
      icon: 'chatbubbles' as const,
      label: 'Live Chat',
      sub: 'Available 9am-6pm AEST',
      color: '#9B59B6',
      action: handleOpenChat,
    },
    {
      icon: 'logo-twitter' as const,
      label: 'Twitter',
      sub: '@CulturePassApp',
      color: '#1DA1F2',
      action: handleOpenTwitter,
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTop }]}>
      <View style={styles.header}>
        <Pressable
          onPress={handleBack}
          style={styles.backBtn}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 40 + (isWeb ? 34 : insets.bottom) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(100).duration(400)}
          style={styles.heroCard}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="help-buoy" size={32} color="#FFF" />
          </View>
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>
            Find answers to common questions or reach out to our support team
          </Text>
        </Animated.View>

        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(200).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_ITEMS.map((faq, i) => (
            <Pressable
              key={i}
              style={styles.faqCard}
              onPress={() => handleFaqToggle(i)}
              android_ripple={{ color: Colors.primary + '10' }}
              accessibilityRole="button"
              accessibilityLabel={faq.q}
              accessibilityState={{ expanded: expandedFaq === i }}
              accessibilityHint="Double tap to expand answer"
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons
                  name={expandedFaq === i ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </View>
              {expandedFaq === i && (
                <Animated.Text
                  entering={isWeb ? undefined : FadeInDown.duration(300)}
                  style={styles.faqAnswer}
                >
                  {faq.a}
                </Animated.Text>
              )}
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(300).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactCard}>
            {CONTACT_OPTIONS.map((opt, i) => (
              <View key={i}>
                <Pressable
                  style={styles.contactItem}
                  onPress={opt.action}
                  android_ripple={{ color: opt.color + '15' }}
                  accessibilityRole="button"
                  accessibilityLabel={`${opt.label}: ${opt.sub}`}
                >
                  <View style={[styles.contactIcon, { backgroundColor: opt.color + '15' }]}>
                    <Ionicons name={opt.icon} size={20} color={opt.color} />
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

        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(400).duration(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.contactCard}>
            <Pressable
              style={styles.contactItem}
              onPress={handleTermsPress}
              android_ripple={{ color: '#3498DB15' }}
              accessibilityRole="button"
              accessibilityLabel="Terms of Service"
            >
              <View style={[styles.contactIcon, { backgroundColor: '#3498DB15' }]}>
                <Ionicons name="document-text-outline" size={20} color="#3498DB" />
              </View>
              <Text style={[styles.contactLabel, { flex: 1 }]}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.contactItem}
              onPress={handlePrivacyPress}
              android_ripple={{ color: '#2ECC7115' }}
              accessibilityRole="button"
              accessibilityLabel="Privacy Policy"
            >
              <View style={[styles.contactIcon, { backgroundColor: '#2ECC7115' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#2ECC71" />
              </View>
              <Text style={[styles.contactLabel, { flex: 1 }]}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.contactItem}
              onPress={handleCookiesPress}
              android_ripple={{ color: '#F2A93B15' }}
              accessibilityRole="button"
              accessibilityLabel="Data & Cookie Policy"
            >
              <View style={[styles.contactIcon, { backgroundColor: '#F2A93B15' }]}>
                <Ionicons name="finger-print-outline" size={20} color="#F2A93B" />
              </View>
              <Text style={[styles.contactLabel, { flex: 1 }]}>Data & Cookie Policy</Text>
              <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View
          entering={isWeb ? undefined : FadeInDown.delay(500).duration(400)}
          style={styles.aboutSection}
        >
          <View style={styles.aboutLogo}>
            <Ionicons name="globe" size={28} color={Colors.primary} />
          </View>
          <Text style={styles.aboutName}>CulturePass</Text>
          <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          <Text style={styles.aboutTagline}>
            Your one-stop lifestyle platform for cultural diaspora communities
          </Text>
          <Text style={styles.aboutCountries}>
            Available in Australia, New Zealand, UAE, UK & Canada
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },

  scrollContent: {},

  heroCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: Colors.secondary,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  heroTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#FFF', marginBottom: 6 },

  heroSub: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 18,
  },

  section: { paddingHorizontal: 20, marginBottom: 24 },

  sectionTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },

  faqCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: 8,
  },

  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },

  faqQuestion: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
  },

  faqAnswer: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 10,
    lineHeight: 20,
  },

  contactCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },

  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },

  contactIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  contactLabel: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: Colors.text },

  contactSub: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 1,
  },

  divider: { height: 1, backgroundColor: Colors.divider, marginLeft: 66 },

  aboutSection: { alignItems: 'center', paddingHorizontal: 40, paddingVertical: 20, marginBottom: 20 },

  aboutLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  aboutName: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },

  aboutVersion: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    marginBottom: 8,
  },

  aboutTagline: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },

  aboutCountries: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
