import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { locations } from '@/data/mockData';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const COUNTRY_FLAGS: Record<string, string> = {
  AU: '🇦🇺',
  NZ: '🇳🇿',
  AE: '🇦🇪',
  UK: '🇬🇧',
  CA: '🇨🇦',
};

export function LocationPicker() {
  const { state, updateLocation } = useOnboarding();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<'country' | 'city'>('country');
  const [pendingCountry, setPendingCountry] = useState('');
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const open = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep('country');
    setPendingCountry('');
    setVisible(true);
  }, []);

  const selectCountry = useCallback((country: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingCountry(country);
    setStep('city');
  }, []);

  const selectCity = useCallback(async (city: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateLocation(pendingCountry, city);
    setVisible(false);
  }, [pendingCountry, updateLocation]);

  const selectedLocation = locations.find(l => l.country === pendingCountry);

  const locationLabel = state.city
    ? `${state.city}, ${state.country}`
    : state.country || 'Select Location';

  return (
    <>
      <Pressable style={styles.trigger} onPress={open}>
        <View style={styles.triggerDot}>
          <Ionicons name="location" size={14} color="#FFF" />
        </View>
        <Text style={styles.triggerText} numberOfLines={1}>{locationLabel}</Text>
        <Ionicons name="chevron-down" size={14} color={Colors.textTertiary} />
      </Pressable>

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVisible(false)}
      >
        <View style={[styles.modal, { paddingTop: topInset + 10 }]}>
          <View style={styles.modalHeader}>
            <Pressable
              onPress={() => {
                if (step === 'city') {
                  setStep('country');
                } else {
                  setVisible(false);
                }
              }}
              hitSlop={12}
            >
              <Ionicons
                name={step === 'city' ? 'arrow-back' : 'close'}
                size={24}
                color={Colors.text}
              />
            </Pressable>
            <Text style={styles.modalTitle}>
              {step === 'country' ? 'Select Country' : 'Select City'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {step === 'country' ? (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.subtitle}>Where would you like to explore?</Text>
              {locations.map((loc, i) => {
                const isCurrentCountry = state.country === loc.country;
                return (
                  <Animated.View key={loc.countryCode} entering={FadeInDown.delay(i * 60).duration(300)}>
                    <Pressable
                      style={[styles.countryCard, isCurrentCountry && styles.countryCardActive]}
                      onPress={() => selectCountry(loc.country)}
                    >
                      <Text style={styles.flag}>{COUNTRY_FLAGS[loc.countryCode] || '🌍'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.countryName, isCurrentCountry && styles.countryNameActive]}>
                          {loc.country}
                        </Text>
                        <Text style={styles.cityCount}>{loc.cities.length} cities</Text>
                      </View>
                      {isCurrentCountry && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                      )}
                      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.selectedCountryRow}>
                <Text style={styles.flag}>
                  {COUNTRY_FLAGS[selectedLocation?.countryCode || ''] || '🌍'}
                </Text>
                <Text style={styles.selectedCountryText}>{pendingCountry}</Text>
              </View>
              <View style={styles.cityGrid}>
                {selectedLocation?.cities.map((city, i) => {
                  const isCurrentCity = state.city === city && state.country === pendingCountry;
                  return (
                    <Animated.View key={city} entering={FadeInDown.delay(i * 40).duration(250)}>
                      <Pressable
                        style={[styles.cityCard, isCurrentCity && styles.cityCardActive]}
                        onPress={() => selectCity(city)}
                      >
                        <Ionicons
                          name="location"
                          size={18}
                          color={isCurrentCity ? '#FFF' : Colors.primary}
                        />
                        <Text style={[styles.cityName, isCurrentCity && styles.cityNameActive]}>
                          {city}
                        </Text>
                        {isCurrentCity && (
                          <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  triggerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    maxWidth: 170,
  },
  modal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  listContent: {
    padding: 20,
    paddingBottom: 60,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Colors.shadow.small,
  },
  countryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryGlow,
  },
  flag: {
    fontSize: 28,
  },
  countryName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  countryNameActive: {
    color: Colors.primary,
  },
  cityCount: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  currentBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  currentBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  selectedCountryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedCountryText: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  cityGrid: {
    gap: 10,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Colors.shadow.small,
  },
  cityCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  cityNameActive: {
    color: '#FFF',
  },
});
