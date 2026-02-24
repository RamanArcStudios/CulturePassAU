// Fallback used by TypeScript for type resolution.
// Metro bundler resolves NativeMapView.native.tsx (iOS/Android) and
// NativeMapView.web.tsx (web) at runtime.
import { View, Text, StyleSheet } from 'react-native';

interface NativeMapViewProps {
  cityGroups: Record<string, { coords: { latitude: number; longitude: number }; events: any[]; count: number }>;
  selectedCity: string | null;
  selectedEvents: any[];
  onMarkerPress: (city: string) => void;
  onClearCity: () => void;
  onEventPress: (id: string) => void;
  bottomInset: number;
}

export default function NativeMapView(_props: NativeMapViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map view is not available on this platform</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#636366' },
});
