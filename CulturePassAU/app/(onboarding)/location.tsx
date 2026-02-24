import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { locations, acknowledgementOfCountry } from '@/data/mockData';
import Colors from '@/constants/colors';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';

const countryFlags: Record<string, string> = {
  AU: 'flag',
  NZ: 'flag',
  AE: 'flag',
  UK: 'flag',
  CA: 'flag',
};

export default function LocationScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const { state, setCountry, setCity } = useOnboarding();
  const [selectedCountry, setSelectedCountry] = useState(state.country);
  const [selectedCity, setSelectedCity] = useState(state.city);

  const selectedLocation = locations.find(l => l.country === selectedCountry);

  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity('');
  };

  const handleNext = () => {
    if (selectedCountry && selectedCity) {
      setCountry(selectedCountry);
      setCity(selectedCity);
      router.push('/(onboarding)/communities');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.step}>1 of 3</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <Text style={styles.title}>Where are you?</Text>
          <Text style={styles.subtitle}>Select your country and city to discover events and communities near you.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)}>
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
              >
                <Ionicons
                  name="earth"
                  size={24}
                  color={selectedCountry === loc.country ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[
                  styles.countryText,
                  selectedCountry === loc.country && styles.textSelected,
                ]}>{loc.country}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {selectedLocation && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.sectionLabel}>City</Text>
            <View style={styles.cityGrid}>
              {selectedLocation.cities.map((city) => (
                <Pressable
                  key={city}
                  style={[
                    styles.cityChip,
                    selectedCity === city && styles.cityChipSelected,
                  ]}
                  onPress={() => setSelectedCity(city)}
                >
                  <Ionicons
                    name="location"
                    size={16}
                    color={selectedCity === city ? '#FFF' : Colors.textSecondary}
                  />
                  <Text style={[
                    styles.cityText,
                    selectedCity === city && styles.cityTextSelected,
                  ]}>{city}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {selectedCountry === 'Australia' && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.acknowledgementContainer}>
            <View style={styles.acknowledgementBanner}>
              <View style={styles.acknowledgementHeader}>
                <Ionicons name="earth" size={24} color="#FFF" />
                <Text style={styles.acknowledgementTitle}>Acknowledgement of Country</Text>
              </View>
              <Text style={styles.acknowledgementText}>{acknowledgementOfCountry}</Text>
            </View>
          </Animated.View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16 }]}>
        <Pressable
          style={[styles.nextButton, (!selectedCountry || !selectedCity) && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!selectedCountry || !selectedCity}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
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
  textSelected: { color: Colors.primary },
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
  cityTextSelected: { color: '#FFF' },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
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
  acknowledgementContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  acknowledgementBanner: {
    backgroundColor: '#1A5276',
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
    color: '#FFF',
    flex: 1,
  },
  acknowledgementText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#FFF',
    opacity: 0.9,
    lineHeight: 20,
  },
});
