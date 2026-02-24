import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

export default function NativeMapViewWeb() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Map view is available on mobile devices</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#636366' },
});
