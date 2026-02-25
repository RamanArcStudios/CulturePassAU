import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Link } from 'expo-router';

interface NativeMapViewProps {
  cityGroups: Record<string, { 
    coords: { latitude: number; longitude: number }; 
    events: any[]; 
    count: number 
  }>;
  selectedCity: string | null;
  selectedEvents: any[];
  onMarkerPress: (city: string) => void;
  onClearCity: () => void;
  onEventPress: (id: string) => void;
  bottomInset: number;
}

export default function NativeMapView({
  cityGroups,
  selectedCity,
  selectedEvents,
  onMarkerPress,
  onClearCity,
  onEventPress,
  bottomInset,
}: NativeMapViewProps) {
  const totalCities = Object.keys(cityGroups).length;
  const totalEvents = Object.values(cityGroups).reduce((sum, group) => sum + group.count, 0);
  const isSydneyFocused = Object.keys(cityGroups).includes('Sydney');

  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Ionicons name="map-outline" size={64} color={Colors.primary} />
        <Text style={styles.heroTitle}>Events Map</Text>
        <Text style={styles.heroSubtitle}>
          {totalCities} cities • {totalEvents.toLocaleString()} events
        </Text>
        
        {isSydneyFocused && (
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.sydneyBadge}>
            <Text style={styles.sydneyText}>🎪 Sydney Focus</Text>
          </Animated.View>
        )}
      </View>

      {/* Action Cards */}
      <ScrollView 
        style={styles.actionsScroll}
        contentContainerStyle={styles.actionsContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Explore Cities */}
        <Animated.View entering={FadeIn.delay(300).duration(400)} style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Ionicons name="location" size={24} color={Colors.primary} />
            <Text style={styles.actionTitle}>Explore Cities</Text>
          </View>
          <Text style={styles.actionDescription}>
            Tap cities on the map to discover events near you
          </Text>
          <Pressable 
            style={styles.actionButton}
            onPress={() => Alert.alert('Map View', 'Available on mobile app')}
          >
            <Text style={styles.actionButtonText}>Open Map (Mobile)</Text>
          </Pressable>
        </Animated.View>

        {/* Selected City Events */}
        {selectedCity && selectedEvents.length > 0 && (
          <Animated.View entering={FadeIn.delay(400).duration(400)} style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.actionTitle}>{selectedCity} Events</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.eventsPreview}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 8 }}
            >
              {selectedEvents.slice(0, 4).map((event: any) => (
                <Pressable
                  key={event.id}
                  style={styles.eventPreview}
                  onPress={() => onEventPress(event.id)}
                >
                  {event.imageUrl ? (
                    <Image
                      source={{ uri: event.imageUrl }}
                      style={styles.eventPreviewImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.eventPreviewImage, { 
                      backgroundColor: Colors.primary + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }]}>
                      <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
                    </View>
                  )}
                  <Text style={styles.eventPreviewTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                </Pressable>
              ))}
              {selectedEvents.length > 4 && (
                <Pressable style={styles.moreEvents}>
                  <Text style={styles.moreEventsText}>+{selectedEvents.length - 4} more</Text>
                </Pressable>
              )}
            </ScrollView>
            <Pressable 
              style={styles.actionButton}
              onPress={onClearCity}
            >
              <Text style={styles.actionButtonText}>Clear Selection</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View entering={FadeIn.delay(500).duration(400)} style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Ionicons name="sparkles" size={24} color={Colors.accent} />
            <Text style={styles.actionTitle}>Quick Explore</Text>
          </View>
          <View style={styles.quickActions}>
            <Link href="/events/sydney" asChild>
              <Pressable style={styles.quickButton}>
                <Text style={styles.quickButtonText}>🎪 Sydney Events</Text>
              </Pressable>
            </Link>
            <Link href="/events/featured" asChild>
              <Pressable style={styles.quickButton}>
                <Text style={styles.quickButtonText}>⭐ Featured</Text>
              </Pressable>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom CTA */}
      <Animated.View 
        entering={FadeIn.delay(600).duration(400)}
        style={[styles.ctaBar, { 
          paddingBottom: Math.max(bottomInset, 20),
          backgroundColor: Colors.surfacePrimary[colorScheme || 'light'],
          shadowColor: Colors.shadow[colorScheme || 'light'],
        }]}
      >
        <Pressable 
          style={styles.ctaButton}
          onPress={() => Alert.alert('Map View', 'Download the CulturePass app for interactive maps!')}
        >
          <Ionicons name="map" size={20} color={Colors.primary} />
          <Text style={[styles.ctaText, { color: Colors.primary }]}>View on Map (App)</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 32,
    gap: 16,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 17,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  sydneyBadge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sydneyText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },

  actionsScroll: {
    flex: 1,
  },
  actionsContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 24,
  },
  
  actionCard: {
    backgroundColor: Colors.surfacePrimary,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Colors.shadows.medium,
    gap: 16,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  actionDescription: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    ...Colors.shadows.medium,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textInverse,
  },

  eventsPreview: {
    maxHeight: 140,
  },
  eventPreview: {
    width: 140,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventPreviewImage: {
    width: '100%',
    height: 100,
  },
  eventPreviewTitle: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textPrimary,
    padding: 8,
  },
  moreEvents: {
    width: 140,
    height: 100,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreEventsText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickButton: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  quickButtonText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textPrimary,
  },

  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    paddingHorizontal: 24,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceSecondary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});
