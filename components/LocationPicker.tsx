import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { locations } from '@/data/mockData';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

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
  const colorScheme = useColorScheme();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const open = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setStep('country');
    setPendingCountry('');
    setVisible(true);
  }, []);

  const selectCountry = useCallback((country: string, countryCode: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPendingCountry(country);
    setStep('city');
  }, []);

  const selectCity = useCallback(async (city: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      await updateLocation(pendingCountry, city);
      setVisible(false);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Location update failed:', error);
      Alert.alert('Error', 'Failed to update location. Please try again.');
    }
  }, [pendingCountry, updateLocation]);

  const goBack = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (step === 'city') {
      setStep('country');
    } else {
      setVisible(false);
    }
  }, [step]);

  const selectedLocation = locations.find(l => l.country === pendingCountry);
  const shortCountry = (c: string) => {
    const map: Record<string, string> = { 
      'United Arab Emirates': 'UAE', 
      'United Kingdom': 'UK', 
      'New Zealand': 'NZ',
      'Australia': 'AU',
    };
    return map[c] || c.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const locationLabel = state.city
    ? `${state.city}, ${shortCountry(state.country)}`
    : state.country 
      ? shortCountry(state.country)
      : 'Select Location';

  return (
    <>
      {/* Trigger Button */}
      <Pressable 
        style={({ pressed }) => [
          styles.trigger,
          {
            backgroundColor: Colors.surfacePrimary[colorScheme || 'light'],
            borderColor: Colors.border[colorScheme || 'light'],
            shadowColor: Colors.shadow[colorScheme || 'light'],
          },
          pressed && styles.triggerPressed,
        ]}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={locationLabel}
        accessibilityHint="Opens location picker"
        android_ripple={{ color: Colors.primary + '20', radius: 32 }}
      >
        <View style={styles.triggerIcon}>
          <Ionicons name="location" size={16} color={Colors.primary} />
        </View>
        <Text style={[styles.triggerText, { color: Colors.textPrimary[colorScheme || 'light'] }]} numberOfLines={1}>
          {locationLabel}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={16} 
          color={Colors.textTertiary[colorScheme || 'light']} 
        />
      </Pressable>

      {/* Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={goBack}
        statusBarTranslucent
      >
        <View style={[styles.modal, { backgroundColor: Colors.background }]}>
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={[styles.modalHeader, { 
              backgroundColor: Colors.surfacePrimary[colorScheme || 'light'],
              borderBottomColor: Colors.borderLight[colorScheme || 'light'],
              shadowColor: Colors.shadow[colorScheme || 'light'],
            }]}>
              <Pressable
                onPress={goBack}
                hitSlop={16}
                android_ripple={{ color: Colors.primary + '20', radius: 28 }}
                style={styles.backButton}
              >
                <Ionicons
                  name={step === 'city' ? 'arrow-back' : 'close-outline'}
                  size={24}
                  color={Colors.textPrimary[colorScheme || 'light']}
                />
              </Pressable>
              
              <Text style={[styles.modalTitle, { color: Colors.textPrimary[colorScheme || 'light'] }]}>
                {step === 'country' ? 'Choose Country' : `${shortCountry(pendingCountry)} Cities`}
              </Text>
              
              <View style={{ width: 44, height: 44 }} /> {/* Spacer */}
            </View>
          </Animated.View>

          {/* Content */}
          <ScrollView
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {step === 'country' ? (
              <>
                <Animated.Text 
                  entering={FadeInDown.delay(100).duration(400)}
                  style={[styles.subtitle, { color: Colors.textSecondary[colorScheme || 'light'] }]}
                >
                  Where do you want to explore?
                </Animated.Text>
                
                {locations.map((loc, i) => {
                  const isCurrent = state.country === loc.country;
                  return (
                    <Animated.View 
                      key={loc.countryCode} 
                      entering={FadeInDown.delay((i + 1) * 80).duration(400)}
                    >
                      <Pressable
                        style={({ pressed }) => [
                          styles.countryCard,
                          isCurrent && styles.countryCardActive,
                          {
                            backgroundColor: Colors.surfacePrimary[colorScheme || 'light'],
                            borderColor: isCurrent ? Colors.primary : Colors.borderLight[colorScheme || 'light'],
                            shadowColor: Colors.shadow[colorScheme || 'light'],
                          },
                          pressed && styles.countryCardPressed,
                        ]}
                        onPress={() => selectCountry(loc.country, loc.countryCode)}
                        android_ripple={{ color: Colors.primary + '20', radius: 36 }}
                        accessibilityRole="button"
                        accessibilityLabel={`${loc.country} (${loc.cities.length} cities)`}
                      >
                        <Text style={styles.countryFlag}>{COUNTRY_FLAGS[loc.countryCode] || '🌍'}</Text>
                        
                        <View style={styles.countryInfo}>
                          <Text style={[
                            styles.countryName, 
                            isCurrent && styles.countryNameActive,
                            { color: Colors.textPrimary[colorScheme || 'light'] }
                          ]}>
                            {loc.country}
                          </Text>
                          <Text style={[styles.cityCount, { color: Colors.textSecondary[colorScheme || 'light'] }]}>
                            {loc.cities.length} cities
                          </Text>
                        </View>
                        
                        {isCurrent && (
                          <View style={[styles.currentIndicator, { backgroundColor: Colors.primary }]}>
                            <Text style={styles.currentText}>✓</Text>
                          </View>
                        )}
                        
                        <Ionicons 
                          name="chevron-forward" 
                          size={20} 
                          color={Colors.textTertiary[colorScheme || 'light']}
                        />
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </>
            ) : (
              <>
                {/* Selected Country Header */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.countryHeader}>
                  <Text style={styles.countryFlag}>
                    {COUNTRY_FLAGS[selectedLocation?.countryCode || ''] || '🌍'}
                  </Text>
                  <Text style={[styles.selectedCountry, { color: Colors.textPrimary[colorScheme || 'light'] }]}>
                    {pendingCountry}
                  </Text>
                </Animated.View>

                {/* Cities Grid */}
                <View style={styles.citiesGrid}>
                  {selectedLocation?.cities.map((city, i) => {
                    const isCurrentCity = state.city === city && state.country === pendingCountry;
                    return (
                      <Animated.View 
                        key={city} 
                        entering={FadeInDown.delay((i + 1) * 60).duration(350)}
                      >
                        <Pressable
                          style={({ pressed }) => [
                            styles.cityCard,
                            isCurrentCity && styles.cityCardActive,
                            {
                              backgroundColor: Colors.surfacePrimary[colorScheme || 'light'],
                              borderColor: isCurrentCity ? Colors.primary : Colors.borderLight[colorScheme || 'light'],
                              shadowColor: Colors.shadow[colorScheme || 'light'],
                            },
                            pressed && styles.cityCardPressed,
                          ]}
                          onPress={() => selectCity(city)}
                          android_ripple={{ color: Colors.primary + '20', radius: 32 }}
                          accessibilityRole="button"
                          accessibilityLabel={city}
                        >
                          <Ionicons
                            name="location-outline"
                            size={20}
                            color={isCurrentCity ? Colors.textInverse : Colors.primary}
                          />
                          
                          <Text style={[
                            styles.cityName,
                            isCurrentCity && styles.cityNameActive,
                            { color: isCurrentCity ? Colors.textInverse : Colors.textPrimary[colorScheme || 'light'] }
                          ]}>
                            {city}
                          </Text>
                          
                          {isCurrentCity && (
                            <Ionicons 
                              name="checkmark-circle" 
                              size={22} 
                              color={Colors.textInverse} 
                            />
                          )}
                        </Pressable>
                      </Animated.View>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    minHeight: 52,
  },
  triggerPressed: {
    transform: [{ scale: 0.98 }],
  },
  triggerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    flex: 1,
  },

  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },

  listContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 8,
  },

  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 24,
    lineHeight: 24,
  },

  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    minHeight: 72,
  },
  countryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '04',
  },
  countryCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  countryFlag: {
    fontSize: 32,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  countryNameActive: {
    color: Colors.primary,
  },
  cityCount: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginTop: 2,
  },
  currentIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentText: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textInverse,
  },

  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  selectedCountry: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
  },

  citiesGrid: {
    gap: 14,
  },
  cityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1.5,
    minHeight: 64,
  },
  cityCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityCardPressed: {
    transform: [{ scale: 0.97 }],
  },
  cityName: {
    flex: 1,
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
  },
  cityNameActive: {
    color: Colors.textInverse,
  },
});
