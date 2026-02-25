import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { interests, interestIcons } from '@/data/mockData';
import Colors from '@/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

const isWeb = Platform.OS === 'web';

const INTEREST_COLORS = [
  '#E85D3A', '#1A7A6D', '#F2A93B', '#9B59B6', '#3498DB',
  '#E74C3C', '#2ECC71', '#1ABC9C', '#8E44AD', '#F39C12',
  '#16A085', '#C0392B', '#2980B9', '#D35400', '#27AE60',
];

export default function InterestsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  
  const { state, setInterests: setSelectedInterests, completeOnboarding } = useOnboarding();
  const [selected, setSelected] = useState<string[]>(state.interests);
  const [isFinishing, setIsFinishing] = useState(false);

  const toggle = useCallback((interest: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelected(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  }, []);

  const handleFinish = useCallback(async () => {
    if (selected.length === 0 || isFinishing) return;
    
    setIsFinishing(true);
    
    try {
      setSelectedInterests(selected);
      await completeOnboarding();
      
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsFinishing(false);
    }
  }, [selected, isFinishing, setSelectedInterests, completeOnboarding]);

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* ✅ ADD PROGRESS BAR HERE - Right after the container View opens */}
      <View style={styles.progressBar}>
        <Animated.View 
          entering={isWeb ? undefined : FadeInDown.duration(600)}
          style={[styles.progressFill, { width: '100%' }]} 
        />
      </View>

      <View style={styles.header}>
        <Pressable 
          onPress={handleBack} 
          hitSlop={12}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.step}>3 of 3</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>What interests you?</Text>
          <Text style={styles.subtitle}>
            We&apos;ll personalize your feed with events and content that match your passions.
          </Text>
        </Animated.View>

        <Animated.View 
          entering={isWeb ? undefined : FadeInDown.delay(200).duration(600)} 
          style={styles.grid}
        >
          {interests.map((interest, idx) => {
            const isSelected = selected.includes(interest);
            const color = INTEREST_COLORS[idx % INTEREST_COLORS.length];
            const iconName = interestIcons[interest] || 'star';
            
            return (
              <Pressable
                key={interest}
                style={[
                  styles.card,
                  isSelected && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => toggle(interest)}
                android_ripple={{ color: isSelected ? '#FFF3' : color + '20' }}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${interest} interest`}
              >
                <View style={[
                  styles.iconCircle, 
                  isSelected && styles.iconCircleSelected
                ]}>
                  <Ionicons
                    name={iconName as any}
                    size={24}
                    color={isSelected ? '#FFF' : color}
                  />
                </View>
                <Text style={[
                  styles.cardText,
                  isSelected && styles.cardTextSelected,
                ]}>
                  {interest}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 16 }]}>
        <Text style={styles.selectedCount}>
          {selected.length} {selected.length === 1 ? 'interest' : 'interests'} selected
        </Text>
        <Pressable
          style={[
            styles.nextButton, 
            (selected.length === 0 || isFinishing) && styles.buttonDisabled
          ]}
          onPress={handleFinish}
          disabled={selected.length === 0 || isFinishing}
          android_ripple={{ color: '#FFF3' }}
          accessibilityRole="button"
          accessibilityState={{ disabled: selected.length === 0 || isFinishing }}
          accessibilityLabel="Start exploring CulturePass"
        >
          {isFinishing ? (
            <>
              <Ionicons name="hourglass-outline" size={20} color="#FFF" />
              <Text style={styles.nextButtonText}>Setting up...</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>Start Exploring</Text>
              <Ionicons name="sparkles" size={20} color="#FFF" />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  
  // ✅ ADD THESE PROGRESS BAR STYLES
  progressBar: {
    height: 4,
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
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
    minHeight: 120,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    textAlign: 'center',
  },
  cardTextSelected: {
    color: '#FFF',
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
