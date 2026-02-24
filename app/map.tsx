import { View, Text, Pressable, StyleSheet, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker, Callout } from 'react-native-maps';
import Colors from '@/constants/colors';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { useState, useMemo, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  'Sydney': { latitude: -33.8688, longitude: 151.2093 },
  'Melbourne': { latitude: -37.8136, longitude: 144.9631 },
  'Brisbane': { latitude: -27.4698, longitude: 153.0251 },
  'Perth': { latitude: -31.9505, longitude: 115.8605 },
  'Darwin': { latitude: -12.4634, longitude: 130.8456 },
  'Adelaide': { latitude: -34.9285, longitude: 138.6007 },
  'Auckland': { latitude: -36.8485, longitude: 174.7633 },
  'Wellington': { latitude: -41.2865, longitude: 174.7762 },
  'Dubai': { latitude: 25.2048, longitude: 55.2708 },
  'Abu Dhabi': { latitude: 24.4539, longitude: 54.3773 },
  'London': { latitude: 51.5074, longitude: -0.1278 },
  'Manchester': { latitude: 53.4808, longitude: -2.2426 },
  'Toronto': { latitude: 43.6532, longitude: -79.3832 },
  'Vancouver': { latitude: 49.2827, longitude: -123.1207 },
  'Montreal': { latitude: 45.5017, longitude: -73.5673 },
};

const CATEGORY_COLORS: Record<string, string> = {
  'Music': '#FF6B6B',
  'Dance': '#4ECDC4',
  'Food': '#FFD93D',
  'Art': '#A855F7',
  'Cultural': '#007AFF',
  'Festival': '#FF9500',
  'Workshop': '#FF9800',
  'Sport': '#34C759',
  'Theatre': '#E91E63',
  'Film': '#2196F3',
};

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[monthIndex] || ''} ${day}`;
}

export default function EventsMapScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const mapRef = useRef<MapView>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const { data: events = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/events`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const cityGroups = useMemo(() => {
    const groups: Record<string, { coords: { latitude: number; longitude: number }; events: any[]; count: number }> = {};
    events.forEach(event => {
      const city = event.city;
      if (!city || !CITY_COORDS[city]) return;
      if (!groups[city]) {
        const base = CITY_COORDS[city];
        groups[city] = { coords: { latitude: base.latitude, longitude: base.longitude }, events: [], count: 0 };
      }
      groups[city].events.push(event);
      groups[city].count++;
    });
    return groups;
  }, [events]);

  const selectedEvents = selectedCity ? (cityGroups[selectedCity]?.events || []) : [];

  const handleMarkerPress = (city: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedCity(city);
  };

  const handleEventPress = (eventId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/event/[id]', params: { id: eventId } });
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Events Map</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: -25.0,
              longitude: 134.0,
              latitudeDelta: 50,
              longitudeDelta: 80,
            }}
            customMapStyle={darkMapStyle}
          >
            {Object.entries(cityGroups).map(([city, group]) => (
              <Marker
                key={city}
                coordinate={group.coords}
                onPress={() => handleMarkerPress(city)}
              >
                <View style={[styles.markerContainer, selectedCity === city && styles.markerSelected]}>
                  <View style={[styles.markerBubble, selectedCity === city && styles.markerBubbleSelected]}>
                    <Ionicons name="calendar" size={14} color={selectedCity === city ? '#FFF' : Colors.primary} />
                    <Text style={[styles.markerCount, selectedCity === city && styles.markerCountSelected]}>{group.count}</Text>
                  </View>
                  <View style={[styles.markerArrow, selectedCity === city && styles.markerArrowSelected]} />
                </View>
                {Platform.OS === 'web' && (
                  <Callout tooltip>
                    <View style={styles.callout}>
                      <Text style={styles.calloutTitle}>{city}</Text>
                      <Text style={styles.calloutSub}>{group.count} events</Text>
                    </View>
                  </Callout>
                )}
              </Marker>
            ))}
          </MapView>

          {selectedCity && selectedEvents.length > 0 && (
            <Animated.View entering={FadeInUp.duration(300)} style={[styles.bottomSheet, { paddingBottom: bottomInset + 10 }]}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={styles.sheetCity}>{selectedCity}</Text>
                  <Text style={styles.sheetCount}>{selectedEvents.length} events</Text>
                </View>
                <Pressable onPress={() => setSelectedCity(null)} hitSlop={10}>
                  <Ionicons name="close-circle" size={28} color="#636366" />
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sheetScroll}>
                {selectedEvents.map((event: any) => (
                  <Pressable
                    key={event.id}
                    style={[styles.eventCard, Platform.OS === 'web' && { cursor: 'pointer' as any }]}
                    onPress={() => handleEventPress(event.id)}
                  >
                    {event.imageUrl ? (
                      <Image source={{ uri: event.imageUrl }} style={styles.eventImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.eventImage, { backgroundColor: CATEGORY_COLORS[event.category] || Colors.primary + '30', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name="calendar" size={24} color={CATEGORY_COLORS[event.category] || Colors.primary} />
                      </View>
                    )}
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
                      <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
                      {event.venue && (
                        <View style={styles.eventMeta}>
                          <Ionicons name="location-outline" size={11} color="#8E8E93" />
                          <Text style={styles.eventVenue} numberOfLines={1}>{event.venue}</Text>
                        </View>
                      )}
                      {event.communityTag && (
                        <View style={styles.eventTag}>
                          <Text style={styles.eventTagText}>{event.communityTag}</Text>
                        </View>
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {!selectedCity && (
            <Animated.View entering={FadeInUp.duration(300)} style={[styles.cityCount, { bottom: bottomInset + 16 }]}>
              <Ionicons name="location" size={16} color={Colors.primary} />
              <Text style={styles.cityCountText}>{Object.keys(cityGroups).length} cities · {events.length} events</Text>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'land', elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6f9ba5' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'transit', elementType: 'labels.text.fill', stylers: [{ color: '#98a5be' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4e6d70' }] },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerSelected: {},
  markerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  markerBubbleSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  markerCount: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: Colors.primary,
  },
  markerCountSelected: {
    color: '#FFF',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    marginTop: -1,
  },
  markerArrowSelected: {
    borderTopColor: Colors.primary,
  },
  callout: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  calloutTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  calloutSub: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 16,
    maxHeight: 300,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#636366',
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sheetCity: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  sheetCount: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
  },
  sheetScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  eventCard: {
    width: 220,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  eventImage: {
    width: '100%',
    height: 110,
  },
  eventInfo: {
    padding: 12,
  },
  eventDate: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 6,
  },
  eventVenue: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: '#8E8E93',
    flex: 1,
  },
  eventTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,122,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eventTagText: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: Colors.primary,
  },
  cityCount: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cityCountText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
  },
});
