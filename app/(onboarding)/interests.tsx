import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { interests, interestIcons } from '@/data/mockData';
import Colors from '@/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

const interestColors = ['#E85D3A', '#1A7A6D', '#F2A93B', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71', '#1ABC9C', '#8E44AD', '#F39C12', '#16A085', '#C0392B', '#2980B9', '#D35400', '#27AE60'];

export default function InterestsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state, setInterests: setSelectedInterests, completeOnboarding } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(state.interests);

  const toggle = (interest: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleFinish = async () => {
    if (selected.length > 0) {
      setSelectedInterests(selected);
      await completeOnboarding();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.step}>3 of 3</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>What interests you?</Text>
          <Text style={styles.subtitle}>We&apos;ll personalize your feed with events and content that match your passions.</Text>
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(200).duration(600)} style={styles.grid}>
          {interests.map((interest, idx) => {
            const isSelected = selected.includes(interest);
            const color = interestColors[idx % interestColors.length];
            const iconName = interestIcons[interest] || 'star';
            return (
              <Pressable
                key={interest}
                style={[
                  styles.card,
                  isSelected && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => toggle(interest)}
              >
                <View style={[styles.iconCircle, isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons
                    name={iconName as any}
                    size={24}
                    color={isSelected ? '#FFF' : color}
                  />
                </View>
                <Text style={[
                  styles.cardText,
                  isSelected && { color: '#FFF' },
                ]}>{interest}</Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </Animated.View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
        <Text style={styles.selectedCount}>{selected.length} selected</Text>
        <Pressable
          style={[styles.nextButton, selected.length === 0 && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={selected.length === 0}
        >
          <Text style={styles.nextButtonText}>Start Exploring</Text>
          <Ionicons name="sparkles" size={20} color="#FFF" />
        </Pressable>
      </View>
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
  step: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  content: { flex: 1, paddingHorizontal: 20 },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47%',
    flexGrow: 1,
    paddingVertical: 18,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    gap: 8,
  },
  selectedCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: { opacity: 0.4 },
  nextButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
  },
});
