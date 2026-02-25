import React, { useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  useColorScheme,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, LatLng } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  FadeInUp, 
  FadeInDown, 
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring 
} from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { Image } from 'expo-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sydney-centered region for CulturePassAU
const DEFAULT_REGION: LatLng = {
  latitude: -33.8688,
  longitude: 151.2093,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263d4d' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'landscape.natural', elementType: 'geometry.fill', stylers: [{ visibility: 'on', color: '#1e3e55' }] },
  { featureType: 'poi.attraction', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
];

interface CityEventGroup {
  coords: LatLng;
  events: any[];
  count: number;
}

interface NativeMapViewProps {
  cityGroups: Record<string, CityEventGroup>;
  selectedCity: string | null;
  selectedEvents: any[];
  onMarkerPress: (city: string) => void;
  onClearCity: () => void;
  onEventPress: (id: string) => void;
  bottomInset: number;
  testID?: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                   'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  } catch {
    return dateStr;
  }
}

const EventMarker = memo(({ 
  city, 
  count, 
  isSelected, 
  onPress 
}: { 
  city: string; 
  count: number; 
  isSelected: boolean; 
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const handleMarkerPress = useCallback(() => {
    scale.value = 1.2;
    runOnJS(onPress)();
    setTimeout(() => {
      scale.value = 1;
    }, 200);
  }, [onPress]);

  return (
    <Animated.View style={[styles.markerContainer, animatedStyle]}>
      <Pressable 
        onPress={handleMarkerPress}
        style={styles.markerPressable}
        android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 24 }}
      >
        <View style={[
          styles.markerBubble,
          isSelected && styles.markerBubbleSelected,
        ]}>
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color={isSelected ? Colors.textInverse : Colors.primary} 
          />
          <Text style={[
            styles.markerCount,
            isSelected && styles.markerCountSelected,
          ]}>
            {count > 99 ? '99+' : count}
          </Text>
        </View>
        <View style={[
          styles.markerArrow,
          isSelected && styles.markerArrowSelected,
        ]} />
      </Pressable>
    </Animated.View>
  );
});

EventMarker.displayName = 'EventMarker';

export default function NativeMapViewComponent({
  cityGroups,
  selectedCity,
  selectedEvents,
  onMarkerPress,
  onClearCity,
  onEventPress,
  bottomInset,
  testID = 'native-map-view',
}: NativeMapViewProps) {
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Auto-fit bounds on cityGroups change
  useEffect(() => {
    if (mapRef.current && Object.keys(cityGroups).length > 0) {
      const coords: LatLng[] = Object.values(cityGroups).map(group => group.coords);
      
      if (coords.length === 1) {
        mapRef.current?.animateToRegion({
          ...coords[0],
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 800);
      } else {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        }, 1000);
      }
    }
  }, [cityGroups]);

  const handleMarkerPress = useCallback((city: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onMarkerPress(city);
  }, [onMarkerPress]);

  const handleEventPress = useCallback((eventId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onEventPress(eventId);
  }, [onEventPress]);

  const handleClear = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClearCity();
  }, [onClearCity]);

  return (
    <View style={styles.container} testID={testID}>
      <MapView
        ref={mapRef}
        testID={`${testID}-map`}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={DEFAULT_REGION}
        customMapStyle={isDark ? darkMapStyle : undefined}
        userInterfaceStyle={colorScheme || 'light'}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        toolbarEnabled={false}
        zoomEnabled
        rotateEnabled={false}
        scrollEnabled
        pitchEnabled={false}
        loadingEnabled={false}
        loadingIndicatorColor={Colors.primary}
        loadingBackgroundColor={Colors.background}
      >
        {Object.entries(cityGroups).map(([city, group]) => (
          <Marker
            key={`marker-${city}`}
            testID={`marker-${city}`}
            coordinate={group.coords}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.85 }}
          >
            <EventMarker
              city={city}
              count={group.count}
              isSelected={selectedCity === city}
              onPress={() => handleMarkerPress(city)}
            />
          </Marker>
        ))}
      </MapView>

      {/* Bottom Sheet - Selected City Events */}
      {selectedCity && selectedEvents.length > 0 && (
        <Animated.View 
          entering={FadeInUp.duration(400).springify()}
          style={[styles.bottomSheet, { 
            paddingBottom: Math.max(bottomInset, 20) + 12,
            backgroundColor: Colors.surfacePrimary[colorScheme || 'light'],
            shadowColor: Colors.shadow[colorScheme || 'light'],
          }]}
        >
          <View style={styles.sheetHandle} />
          
          <View style={styles.sheetHeader}>
            <View style={styles.sheetInfo}>
              <Text style={[styles.sheetCity, { color: Colors.textPrimary[colorScheme || 'light'] }]}>
                {selectedCity}
              </Text>
              <Text style={[styles.sheetCount, { color: Colors.textSecondary[colorScheme || 'light'] }]}>
                {selectedEvents.length} events nearby
              </Text>
            </View>
            
            <Pressable 
              onPress={handleClear}
              hitSlop={16}
              style={styles.clearButton}
              android_ripple={{ color: Colors.primary + '20', radius: 24 }}
            >
              <Ionicons 
                name="close-circle-outline" 
                size={28} 
                color={Colors.textTertiary[colorScheme || 'light']}
              />
            </Pressable>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsScroll}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {selectedEvents.map((event) => (
              <Animated.View 
                key={event.id} 
                entering={FadeInUp.delay(100).duration(300)}
              >
                <Pressable
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event.id)}
                  android_ripple={{ color: 'rgba(255,255,255,0.2)', radius: 36 }}
                >
                  {event.imageUrl ? (
                    <Image
                      source={{ uri: event.imageUrl }}
                      style={styles.eventImage}
                      contentFit="cover"
                      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                      transition={300}
                    />
                  ) : (
                    <View style={[styles.eventImage, {
                      backgroundColor: Colors.primary + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }]}>
                      <Ionicons name="calendar-outline" size={28} color={Colors.primary} />
                    </View>
                  )}
                  
                  <View style={styles.eventContent}>
                    <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                    <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                    {event.venue && (
                      <View style={styles.eventVenueRow}>
                        <Ionicons name="location-outline" size={12} color={Colors.textTertiary[colorScheme || 'light']} />
                        <Text style={styles.eventVenue} numberOfLines={1}>{event.venue}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* City Count Badge */}
      {!selectedCity && Object.keys(cityGroups).length > 0 && (
        <Animated.View 
          entering={FadeInUp.duration(500)}
          style={[styles.cityBadge, { 
            bottom: Math.max(bottomInset, 20) + 16,
            backgroundColor: Colors.surfacePrimary[colorScheme || 'light'],
            borderColor: Colors.borderLight[colorScheme || 'light'],
            shadowColor: Colors.shadow[colorScheme || 'light'],
          }]}
        >
          <Ionicons name="location-outline" size={18} color={Colors.primary} />
          <Text style={[styles.cityBadgeText, { color: Colors.textPrimary[colorScheme || 'light'] }]}>
            {Object.keys(cityGroups).length} cities •{' '}
            {Object.values(cityGroups).reduce((sum, g) => sum + g.count, 0)} events
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  markerContainer: {
    alignItems: 'center',
  },
  markerPressable: {
    alignItems: 'center',
  },
  markerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfacePrimary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.primary + '66',
    minWidth: 48,
  },
  markerBubbleSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.textInverse,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  markerCount: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
  },
  markerCountSelected: {
    color: Colors.textInverse,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.surfacePrimary,
    marginTop: -1,
  },
  markerArrowSelected: {
    borderTopColor: Colors.primary,
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    maxHeight: 320,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.surfaceSecondary,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sheetInfo: {
    gap: 4,
  },
  sheetCity: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
  },
  sheetCount: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
  },
  clearButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eventsScroll: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 16,
  },
  eventCard: {
    width: 240,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 140,
  },
  eventContent: {
    padding: 16,
    gap: 6,
  },
  eventDate: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    lineHeight: 22,
  },
  eventVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventVenue: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
  },

  cityBadge: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cityBadgeText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
});
