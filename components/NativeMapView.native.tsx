import { View, Text, Pressable, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRef } from 'react';

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[monthIndex] || ''} ${day}`;
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#283d6a' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#304a7d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
];

interface NativeMapViewProps {
  cityGroups: Record<string, { coords: { latitude: number; longitude: number }; events: any[]; count: number }>;
  selectedCity: string | null;
  selectedEvents: any[];
  onMarkerPress: (city: string) => void;
  onClearCity: () => void;
  onEventPress: (id: string) => void;
  bottomInset: number;
}

export default function NativeMapViewComponent({
  cityGroups, selectedCity, selectedEvents, onMarkerPress, onClearCity, onEventPress, bottomInset
}: NativeMapViewProps) {
  const mapRef = useRef<MapView>(null);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
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
            onPress={() => onMarkerPress(city)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerBubble, selectedCity === city && styles.markerBubbleSelected]}>
                <Ionicons name="calendar" size={14} color={selectedCity === city ? '#FFF' : Colors.primary} />
                <Text style={[styles.markerCount, selectedCity === city && styles.markerCountSelected]}>{group.count}</Text>
              </View>
              <View style={[styles.markerArrow, selectedCity === city && styles.markerArrowSelected]} />
            </View>
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
            <Pressable onPress={onClearCity} hitSlop={10}>
              <Ionicons name="close-circle" size={28} color="#636366" />
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {selectedEvents.map((event: any) => (
              <Pressable key={event.id} style={styles.eventCard} onPress={() => onEventPress(event.id)}>
                {event.imageUrl ? (
                  <Image source={{ uri: event.imageUrl }} style={styles.eventImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.eventImage, { backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' }]}>
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

      {!selectedCity && (
        <Animated.View entering={FadeInUp.duration(300)} style={[styles.cityCountBadge, { bottom: bottomInset + 16 }]}>
          <Ionicons name="location" size={16} color={Colors.primary} />
          <Text style={styles.cityCountText}>{Object.keys(cityGroups).length} cities · {Object.values(cityGroups).reduce((sum, g) => sum + g.count, 0)} events</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  markerContainer: { alignItems: 'center' },
  markerBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 2, borderColor: Colors.primary,
  },
  markerBubbleSelected: { backgroundColor: Colors.primary },
  markerCount: { fontSize: 13, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  markerCountSelected: { color: '#FFF' },
  markerArrow: {
    width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: Colors.primary, marginTop: -1,
  },
  markerArrowSelected: { borderTopColor: Colors.primary },
  bottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 8, paddingBottom: 16, maxHeight: 300,
  },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#636366', alignSelf: 'center', marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 14 },
  sheetCity: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },
  sheetCount: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: '#636366' },
  eventCard: { width: 220, backgroundColor: Colors.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  eventImage: { width: '100%', height: 110 },
  eventInfo: { padding: 12 },
  eventDate: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginBottom: 4 },
  eventTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text, lineHeight: 20, marginBottom: 6 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  eventVenue: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: '#8E8E93', flex: 1 },
  cityCountBadge: {
    position: 'absolute', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.surface, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cityCountText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.text },
});
