import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';

const RULES = [
  {
    title: 'Be respectful and inclusive',
    body: 'Treat all members with dignity. Harassment, hate speech, or discriminatory behaviour is not allowed.',
  },
  {
    title: 'Share authentic and lawful content',
    body: 'Only upload content you own or are authorised to share. Avoid misinformation, spam, and illegal content.',
  },
  {
    title: 'Protect privacy',
    body: 'Do not publish private personal information without consent. Respect community and event participant privacy.',
  },
  {
    title: 'Event and ticket integrity',
    body: 'Do not create misleading event listings or misuse tickets/perks. Fraudulent activity may result in account suspension.',
  },
  {
    title: 'Report issues responsibly',
    body: 'Use reporting/support channels for abusive content or suspicious activity. Repeated false reports are not allowed.',
  },
];

export default function CommunityGuidelinesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topInset }]}> 
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.title}>Community Guidelines</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        <Text style={styles.lead}>
          These rules help keep CulturePass safe, welcoming, and useful for everyone.
        </Text>

        {RULES.map((rule, idx) => (
          <View key={rule.title} style={styles.card}>
            <Text style={styles.cardTitle}>{idx + 1}. {rule.title}</Text>
            <Text style={styles.cardBody}>{rule.body}</Text>
          </View>
        ))}

        <View style={styles.footerCard}>
          <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
          <Text style={styles.footerText}>
            By using CulturePass, you agree to follow these guidelines together with our Terms and Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  lead: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    padding: 14,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  footerCard: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: Colors.primary + '12',
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  footerText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
});
