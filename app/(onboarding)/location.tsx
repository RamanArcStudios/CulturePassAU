import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { locations, acknowledgementOfCountry } from '@/data/mockData';
import Colors from '@/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

const isWeb = Platform.OS === 'web';

export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  
  const { state, setCountry, setCity } = useOnboarding();
  const [selectedCountry, setSelectedCountry] = useState(state.country);
  const [selectedCity, setSelectedCity] = useState(state.city);
  const [isDetecting, setIsDetecting] = useState(false);

  const selectedLocation = locations.find(l => l.country === selectedCountry);

  const handleCountrySelect = useCallback((country: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCountry(country);
    setSelectedCity('');
  }, []);

  const handleCitySelect = useCallback((city: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedCity(city);
  }, []);

  const handleAutoDetect = useCallback(async () => {
    if (isWeb) {
      Alert.alert('Not Available', 'Auto-detect location is only available on mobile devices.');
      return;
    }

    setIsDetecting(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Location permission is needed to auto-detect your location.');
        setIsDetecting(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.country && address.city) {
        // Match country
        const matchedLocation = locations.find(l => 
          l.country.toLowerCase().includes(address.country!.toLowerCase()) ||
          l.countryCode.toLowerCase() === address.isoCountryCode?.toLowerCase()
        );
        
        if (matchedLocation) {
          handleCountrySelect(matchedLocation.country);
          
          // Match city
          const matchedCity = matchedLocation.cities.find(c => 
            c.toLowerCase().includes(address.city!.toLowerCase()) ||
            address.city!.toLowerCase().includes(c.toLowerCase())
          );
          
          if (matchedCity) {
            handleCitySelect(matchedCity);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Location Detected', `Found: ${matchedCity}, ${matchedLocation.country}`);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert(
              'City Not Found', 
              `We detected ${address.city}, ${matchedLocation.country}, but it's not in our list. Please select a city manually.`
            );
          }
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          Alert.alert(
            'Country Not Supported', 
            `We detected ${address.country}, but it's not currently supported. Please select manually.`
          );
        }
      } else {
        throw new Error('Unable to determine location');
      }
    } catch (error: any) {
      console.error('Location detection error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Detection Failed', 
        'Unable to detect your location. Please check your location settings and try again, or select manually.'
      );
    } finally {
      setIsDetecting(false);
    }
  }, [handleCountrySelect, handleCitySelect]);

  const handleNext = useCallback(() => {
    if (!selectedCountry || !selectedCity) return;
    
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setCountry(selectedCountry);
    setCity(selectedCity);
    router.push('/(onboarding)/communities');
  }, [selectedCountry, selectedCity, setCountry, setCity]);

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <Animated.View 
          entering={isWeb ? undefined : FadeInDown.duration(600)}
          style={[styles.progressFill, { width: '33%' }]} 
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
        <Text style={styles.step}>1 of 3</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>Where are you?</Text>
          <Text style={styles.subtitle}>
            Select your country and city to discover events and communities near you.
          </Text>

          {/* Auto-detect Button */}
          {!isWeb && (
            <Pressable 
              style={[styles.autoDetectBtn, isDetecting && styles.autoDetectBtnDisabled]} 
              onPress={handleAutoDetect}
              disabled={isDetecting}
              android_ripple={{ color: Colors.primary + '20' }}
              accessibilityRole="button"
              accessibilityLabel="Auto-detect location"
            >
              <Ionicons 
                name={isDetecting ? "hourglass-outline" : "locate"} 
                size={16} 
                color={isDetecting ? Colors.textTertiary : Colors.primary} 
              />
              <Text style={[styles.autoDetectText, isDetecting && styles.autoDetectTextDisabled]}>
                {isDetecting ? 'Detecting location...' : 'Auto-detect location'}
              </Text>
            </Pressable>
          )}
        </Animated.View>

        <Animated.View entering={isWeb ? undefined : FadeInDown.delay(200).duration(600)}>
          <Text style={styles.sectionLabel}>Country</Text>
          <View style={styles.grid}>
            {locations.map((loc) => (
              <Pressable
                key={loc.countryCode}
                style={[
                  styles.countryCard,
                  selectedCountry === loc.country && styles.cardSelected,
                ]}
                onPress={() => handleCountrySelect(loc.country)}
                android_ripple={{ 
                  color: selectedCountry === loc.country ? Colors.primary + '30' : Colors.primary + '10' 
                }}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedCountry === loc.country }}
                accessibilityLabel={`Select ${loc.country}`}
              >
                <Ionicons
                  name="earth"
                  size={24}
                  color={selectedCountry === loc.country ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[
                  styles.countryText,
                  selectedCountry === loc.country && styles.textSelected,
                ]}>
                  {loc.country}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {selectedLocation && (
          <Animated.View entering={isWeb ? undefined : FadeInDown.duration(400)}>
            <Text style={styles.sectionLabel}>City</Text>
            <View style={styles.cityGrid}>
              {selectedLocation.cities.map((city) => (
                <Pressable
                  key={city}
                  style={[
                    styles.cityChip,
                    selectedCity === city && styles.cityChipSelected,
                  ]}
                  onPress={() => handleCitySelect(city)}
                  android_ripple={{ 
                    color: selectedCity === city ? '#FFF3' : Colors.primary + '20' 
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedCity === city }}
                  accessibilityLabel={`Select ${city}`}
                >
                  <Ionicons
                    name="location"
                    size={16}
                    color={selectedCity === city ? '#FFF' : Colors.textSecondary}
                  />
                  <Text style={[
                    styles.cityText,
                    selectedCity === city && styles.cityTextSelected,
                  ]}>
                    {city}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {selectedCountry === 'Australia' && (
          <Animated.View 
            entering={isWeb ? undefined : FadeInDown.duration(500)} 
            style={styles.acknowledgementContainer}
          >
            <View style={styles.acknowledgementBanner}>
              <View style={styles.acknowledgementHeader}>
                <Ionicons name="earth" size={24} color="#8B4513" />
                <Text style={styles.acknowledgementTitle}>Acknowledgement of Country</Text>
              </View>
              <Text style={styles.acknowledgementText}>{acknowledgementOfCountry}</Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomInset + 16 }]}>
        <Pressable
          style={[
            styles.nextButton, 
            (!selectedCountry || !selectedCity) && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!selectedCountry || !selectedCity}
          android_ripple={{ color: '#FFF3' }}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selectedCountry || !selectedCity }}
          accessibilityLabel="Continue to communities"
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
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
    marginBottom: 12,
  },
  
  autoDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary + '10',
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  autoDetectBtnDisabled: {
    opacity: 0.5,
  },
  autoDetectText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  autoDetectTextDisabled: {
    color: Colors.textTertiary,
  },
  
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
    minWidth: '47%',
    flexGrow: 1,
  },
  cardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  countryText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    flexShrink: 1,
  },
  textSelected: { 
    color: Colors.primary 
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.cardBorder,
  },
  cityChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
  cityTextSelected: { 
    color: '#FFF' 
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
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
  acknowledgementContainer: {
    marginTop: 20,
  },
  acknowledgementBanner: {
    backgroundColor: 'rgba(139, 69, 19, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B4513',
  },
  acknowledgementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  acknowledgementTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: '#3E2723',
    flex: 1,
  },
  acknowledgementText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#5D4037',
    lineHeight: 20,
  },
});

