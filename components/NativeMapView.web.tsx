import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';

interface NativeMapViewWebProps {
  cityGroups?: Record<string, any>;
  selectedCity?: string | null;
  selectedEvents?: any[];
  totalCities?: number;
  totalEvents?: number;
}

export default function NativeMapViewWeb({
  cityGroups,
  selectedCity,
  selectedEvents = [],
  totalCities = 0,
  totalEvents = 0,
}: NativeMapViewWebProps) {
  const isSydneyFocused = cityGroups && Object.keys(cityGroups).includes('Sydney');

  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Animated.View entering={FadeInUp.duration(500)}>
          <Ionicons name="map" size={80} color={Colors.primary} />
        </Animated.View>
        
        <Animated.View entering={FadeIn.delay(200).duration(500)}>
          <Text style={styles.heroTitle}>Interactive Events Map</Text>
          <Text style={styles.heroSubtitle}>
            Discover {totalCities} cities with {totalEvents.toLocaleString()} events
          </Text>
        </Animated.View>

        {isSydneyFocused && (
          <Animated.View entering={FadeIn.delay(400).duration(400)} style={styles.sydneyHighlight}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.sydneyText}>Sydney Events Ready</Text>
          </Animated.View>
        )}
      </View>

      {/* Action Grid */}
      <ScrollView 
        style={styles.actions}
        contentContainerStyle={styles.actionsContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Primary Actions */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <View style={styles.actionGroup}>
            <Link href="/events" asChild>
              <Pressable style={styles.actionButton}>
                <Ionicons name="calendar-outline" size={28} color={Colors.primary} />
                <Text style={styles.actionTitle}>All Events</Text>
                <Text style={styles.actionCount}>{totalEvents.toLocaleString()}</Text>
              </Pressable>
            </Link>

            <Link href="/events/sydney" asChild>
              <Pressable style={[styles.actionButton, styles.sydneyButton]}>
                <Ionicons name="location" size={28} color="#FFF" />
                <Text style={styles.actionTitleSydney}>Sydney Events</Text>
                <Text style={styles.actionCountSydney}>
                  {cityGroups?.Sydney?.count || 0} events
                </Text>
              </Pressable>
            </Link>
          </View>
        </Animated.View>

        {/* Secondary Actions */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)}>
          <View style={styles.actionGroup}>
            <Link href="/events/featured" asChild>
              <Pressable style={styles.actionButton}>
                <Ionicons name="sparkles-outline" size={28} color={Colors.accent} />
                <Text style={styles.actionTitle}>Featured</Text>
                <Text style={styles.actionSubtitle}>Curated events</Text>
              </Pressable>
            </Link>

            <Link href="/events/nearby" asChild>
              <Pressable style={styles.actionButton}>
                <Ionicons name="navigate-outline" size={28} color={Colors.primary} />
                <Text style={styles.actionTitle}>Nearby</Text>
                <Text style={styles.actionSubtitle}>Your location</Text>
              </Pressable>
            </Link>
          </View>
        </Animated.View>

        {/* Selected City Preview */}
        {selectedCity && selectedEvents.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.previewSection}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>{selectedCity}</Text>
              <Text style={styles.previewCount}>{selectedEvents.length} events</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.previewScroll}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
            >
              {selectedEvents.slice(0, 5).map((event: any) => (
                <Pressable
                  key={event.id}
                  style={styles.previewEvent}
                  onPress={() => {}}
                >
                  <View style={styles.previewEventImage} />
                  <Text style={styles.previewEventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>
                </Pressable>
              ))}
              {selectedEvents.length > 5 && (
                <Pressable style={styles.morePreview}>
                  <Text style={styles.morePreviewText}>+{selectedEvents.length - 5}</Text>
                </Pressable>
              )}
            </ScrollView>
          </Animated.View>
        )}
      </ScrollView>

      {/* App Download CTA */}
      <Animated.View entering={FadeIn.delay(700).duration(500)} style={styles.ctaContainer}>
        <View style={styles.ctaContent}>
          <Ionicons name="map" size={24} color={Colors.primary} />
          <Text style={styles.ctaTitle}>Full Map Experience</Text>
          <Text style={styles.ctaText}>Interactive maps available in the mobile app</Text>
        </View>
        <Pressable style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>Get Mobile App</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  hero: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 32,
    gap: 20,
  },
  heroTitle: {
    fontSize: 34,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 42,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  sydneyHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  sydneyText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },

  actions: {
    flex: 1,
  },
  actionsContent: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    gap: 32,
  },

  actionGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surfacePrimary,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Colors.shadows.medium,
    gap: 8,
  },
  sydneyButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  actionTitleSydney: {
    color: Colors.textInverse,
  },
  actionCount: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  actionCountSydney: {
    color: Colors.textInverse,
  },
  actionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },

  previewSection: {
    backgroundColor: Colors.surfacePrimary,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Colors.shadows.medium,
  },
  previewHeader: {
    gap: 4,
  },
  previewTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
  },
  previewCount: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  previewScroll: {
    maxHeight: 140,
  },
  previewEvent: {
    width: 120,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewEventImage: {
    width: '100%',
    height: 90,
    backgroundColor: Colors.surfaceTertiary,
  },
  previewEventTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textPrimary,
    padding: 8,
  },
  morePreview: {
    width: 120,
    height: 90,
    backgroundColor: Colors.surfaceTertiary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  morePreviewText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },

  ctaContainer: {
    backgroundColor: Colors.surfacePrimary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    marginTop: 'auto',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Colors.shadows.large,
    gap: 16,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ctaTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  ctaText: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    ...Colors.shadows.medium,
  },
  ctaButtonText: {
    fontSize: 17,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textInverse,
  },
});
