import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { communities, communityIcons } from '@/data/mockData';
import Colors from '@/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

// ─── Constants ────────────────────────────────────────────────────────────────

const CHIP_COLORS = [
  '#E85D3A', '#1A7A6D', '#F2A93B', '#3498DB', '#9B59B6',
  '#E74C3C', '#2ECC71', '#1ABC9C', '#8E44AD', '#F39C12',
  '#16A085', '#C0392B', '#2980B9', '#D35400', '#27AE60',
];

// ─── CommunitiesScreen ────────────────────────────────────────────────────────

export default function CommunitiesScreen() {
  const insets = useSafeAreaInsets();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  const { state, setCommunities: setSelectedCommunities } = useOnboarding();

  // Initialize from saved onboarding state
  const [selected, setSelected] = useState<string[]>(state.communities);

  const toggle = useCallback((community: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelected(prev =>
      prev.includes(community)
        ? prev.filter(c => c !== community)
        : [...prev, community],
    );
  }, []);

  const handleNext = useCallback(() => {
    if (selected.length === 0) return;
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedCommunities(selected);
    router.push('/(onboarding)/interests');
  }, [selected, setSelectedCommunities]);

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={handleBack} 
          hitSlop={12}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.step}>2 of 3</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>Your Communities</Text>
          <Text style={styles.subtitle}>
            Select the communities you&apos;d like to connect with. You can always change these later.
          </Text>
        </Animated.View>

        <Animated.View 
          entering={isWeb ? undefined : FadeInDown.delay(200).duration(600)} 
          style={styles.chipContainer}
        >
          {communities.map((community, idx) => {
            const isSelected = selected.includes(community);
            const color = CHIP_COLORS[idx % CHIP_COLORS.length];
            const iconName = (communityIcons[community] as string | undefined) ?? 'people';

            return (
              <Pressable
                key={community}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => toggle(community)}
                android_ripple={{ color: isSelected ? '#FFF3' : color + '20' }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${community} community`}
              >
                <Ionicons
                  name={iconName as any}
                  size={18}
                  color={isSelected ? '#FFF' : color}
                />
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {community}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: bottomInset + 16 }]}>
        <Text style={styles.selectedCount}>
          {selected.length} {selected.length === 1 ? 'community' : 'communities'} selected
        </Text>
        <Pressable
          style={[styles.nextButton, selected.length === 0 && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={selected.length === 0}
          android_ripple={{ color: '#FFF3' }}
          accessibilityRole="button"
          accessibilityState={{ disabled: selected.length === 0 }}
          accessibilityLabel="Continue to interests"
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
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
  content: { 
    flex: 1, 
    paddingHorizontal: 20 
  },
  scrollContent: {
    paddingBottom: 120,
  },
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  chipTextSelected: {
    color: '#FFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
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
  buttonDisabled: { 
    opacity: 0.4 
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
  },
});
