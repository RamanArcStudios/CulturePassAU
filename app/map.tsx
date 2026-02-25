import { View, Text, Pressable, StyleSheet, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import { getApiUrl } from '@/lib/query-client';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import NativeMapView from '@/components/NativeMapView';

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

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[monthIndex] || ''} ${day}`;
}

function WebCityList({ cityGroups, selectedCity, onSelectCity, onEventPress }: {
  cityGroups: Record<string, any>;
  selectedCity: string | null;
  onSelectCity: (city: string | null) => void;
  onEventPress: (id: string) => void;
}) {
  const selectedEvents = selectedCity ? (cityGroups[selectedCity]?.events || []) : [];
  const totalEvents = Object.values(cityGroups).reduce((sum: number, g: any) => sum + g.count, 0);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: selectedCity ? 220 : 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={webStyles.mapInfo}>
          <View style={webStyles.mapIconWrap}>
            <Ionicons name="map" size={28} color={Colors.primary} />
          </View>
          <Text style={webStyles.mapInfoTitle}>Events by City</Text>
          <Text style={webStyles.mapInfoSub}>
            {Object.keys(cityGroups).length} cities · {totalEvents} cultural events
          </Text>
        </View>
        {Object.entries(cityGroups).map(([city, group]: [string, any]) => (
          <Pressable
            key={city}
            style={[
              webStyles.cityRow, 
              selectedCity === city && webStyles.cityRowActive,
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onSelectCity(selectedCity === city ? null : city);
            }}
            android_ripple={{ color: Colors.primary + '20' }}
          >
            <View style={webStyles.cityLeft}>
              <View style={[webStyles.cityDot, selectedCity === city && webStyles.cityDotActive]}>
                <Ionicons name="location" size={18} color={selectedCity === city ? '#FFF' : Colors.primary} />
              </View>
              <View>
                <Text style={webStyles.cityName}>{city}</Text>
                <Text style={webStyles.cityCount}>{group.count} event{group.count !== 1 ? 's' : ''}</Text>
              </View>
            </View>
            <Ionicons name={selectedCity === city ? 'chevron-up' : 'chevron-forward'} size={18} color="#636366" />
          </Pressable>
        ))}
      </ScrollView>

      {selectedCity && selectedEvents.length > 0 && (
        <Animated.View entering={FadeInUp.duration(300)} style={webStyles.bottomPanel}>
          <View style={webStyles.panelHeader}>
            <View>
              <Text style={webStyles.panelCity}>{selectedCity}</Text>
              <Text style={webStyles.panelCount}>{selectedEvents.length} events</Text>
            </View>
            <Pressable 
              onPress={() => onSelectCity(null)} 
              hitSlop={10}
              android_ripple={{ color: Colors.primary + '20', radius: 20 }}
            >
              <Ionicons name="close-circle" size={26} color="#636366" />
            </Pressable>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {selectedEvents.map((event: any) => (
              <Pressable
                key={event.id}
                style={styles.eventCard}
                onPress={() => onEventPress(event.id)}
                android_ripple={{ color: Colors.primary + '20' }}
              >
                {event.imageUrl ? (
                  <Image 
                    source={{ uri: event.imageUrl }} 
                    style={styles.eventImage} 
                    resizeMode="cover" 
                  />
                ) : (
                  <View style={[styles.eventImage, styles.eventImagePlaceholder]}>
                    <Ionicons name="calendar" size={24} color={Colors.primary} />
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
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

export default function EventsMapScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const { data: events = [], isLoading, error, refetch } = useQuery<any[]>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/events`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });

  const cityGroups = useMemo(() => {
    const groups: Record<string, { coords: { latitude: number; longitude: number }; events: any[]; count: number }> = {};
    events.forEach(event => {
      const city = event.city;
      if (!city || !CITY_COORDS[city]) return;
      if (!groups[city]) {
        groups[city] = { coords: CITY_COORDS[city], events: [], count: 0 };
      }
      groups[city].events.push(event);
      groups[city].count++;
    });
    return groups;
  }, [events]);

  const selectedEvents = selectedCity ? (cityGroups[selectedCity]?.events || []) : [];

  const handleMarkerPress = (city: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedCity(city);
  };

  const handleEventPress = (eventId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/event/[id]', params: { id: eventId } });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable 
          onPress={handleBack} 
          style={styles.backBtn} 
          hitSlop={10}
          android_ripple={{ color: Colors.primary + '20', radius: 20 }}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Events Map</Text>
        <Pressable 
          onPress={() => refetch()} 
          style={styles.refreshBtn}
          hitSlop={10}
        >
          <Ionicons name="refresh-outline" size={20} color={Colors.text} />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="wifi-off-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorText}>Unable to load events</Text>
          <Pressable style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryBtnText}>Try Again</Text>
          </Pressable>
        </View>
      ) : Platform.OS === 'web' ? (
        <WebCityList
          cityGroups={cityGroups}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          onEventPress={handleEventPress}
        />
      ) : (
        <NativeMapView
          cityGroups={cityGroups}
          selectedCity={selectedCity}
          selectedEvents={selectedEvents}
          onMarkerPress={handleMarkerPress}
          onClearCity={() => setSelectedCity(null)}
          onEventPress={handleEventPress}
          bottomInset={bottomInset}
        />
      )}
    </View>
  );
}

const webStyles = StyleSheet.create({
  mapInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  mapIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  mapInfoTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  mapInfoSub: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cityRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  cityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cityDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityDotActive: {
    backgroundColor: Colors.primary,
  },
  cityName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  cityCount: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 16,
    paddingBottom: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  panelCity: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  panelCount: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
  },
});

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
  refreshBtn: {
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#636366',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryBtnText: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
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
  eventImagePlaceholder: {
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
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
});
