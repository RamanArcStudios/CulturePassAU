import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Platform,
  Alert,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/query-client';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type ScanResult = {
  valid: boolean;
  message: string;
  ticket?: {
    id: string;
    eventTitle: string;
    eventDate: string | null;
    eventTime: string | null;
    eventVenue: string | null;
    tierName: string | null;
    quantity: number | null;
    totalPrice: number | null;
    status: string | null;
    ticketCode: string | null;
    scannedAt: string | null;
  };
};

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const [ticketCode, setTicketCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const handleScan = useCallback(async () => {
    const code = ticketCode.trim();
    if (!code) {
      Alert.alert('Enter Code', 'Please enter or scan a ticket code.');
      return;
    }

    setIsScanning(true);
    Keyboard.dismiss();

    try {
      const res = await apiRequest('POST', '/api/tickets/scan', {
        ticketCode: code,
        scannedBy: 'staff',
      });
      const data = await res.json();
      const result: ScanResult = {
        valid: true,
        message: data.message || 'Ticket scanned successfully',
        ticket: data.ticket,
      };
      setScanResult(result);
      setScanHistory(prev => [result, ...prev]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTicketCode('');
    } catch (e: any) {
      let errorData: any = {};
      try {
        const errorText = e.message || '';
        const jsonMatch = errorText.match(/\d+: (.*)/);
        if (jsonMatch) {
          errorData = JSON.parse(jsonMatch[1]);
        }
      } catch {}

      const result: ScanResult = {
        valid: false,
        message: errorData.error || e.message || 'Failed to scan ticket',
        ticket: errorData.ticket,
      };
      setScanResult(result);
      setScanHistory(prev => [result, ...prev]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsScanning(false);
    }
  }, [ticketCode]);

  const clearResult = useCallback(() => {
    setScanResult(null);
    setTicketCode('');
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Ticket Scanner</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 + bottomInset }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.scanSection}>
          <View style={styles.scanIconContainer}>
            <Ionicons name="scan" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.scanTitle}>Scan Ticket</Text>
          <Text style={styles.scanSubtitle}>Enter the ticket code to check in an attendee</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter ticket code (e.g. CP-...)"
              placeholderTextColor={Colors.textTertiary}
              value={ticketCode}
              onChangeText={setTicketCode}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={handleScan}
            />
            <Pressable
              style={[styles.scanBtn, isScanning && styles.scanBtnDisabled]}
              onPress={handleScan}
              disabled={isScanning}
            >
              <Ionicons name={isScanning ? 'hourglass' : 'checkmark-circle'} size={22} color="#FFF" />
            </Pressable>
          </View>
        </Animated.View>

        {scanResult && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            style={[
              styles.resultCard,
              scanResult.valid ? styles.resultSuccess : styles.resultError,
            ]}
          >
            <View style={styles.resultHeader}>
              <Ionicons
                name={scanResult.valid ? 'checkmark-circle' : 'close-circle'}
                size={32}
                color={scanResult.valid ? '#34C759' : '#FF3B30'}
              />
              <View style={{ flex: 1 }}>
                <Text style={[styles.resultTitle, { color: scanResult.valid ? '#34C759' : '#FF3B30' }]}>
                  {scanResult.valid ? 'Valid Ticket' : 'Invalid'}
                </Text>
                <Text style={styles.resultMessage}>{scanResult.message}</Text>
              </View>
              <Pressable onPress={clearResult} style={styles.closeResultBtn}>
                <Ionicons name="close" size={20} color={Colors.textTertiary} />
              </Pressable>
            </View>

            {scanResult.ticket && (
              <View style={styles.resultDetails}>
                <Text style={styles.resultEventTitle}>{scanResult.ticket.eventTitle}</Text>
                <View style={styles.resultMeta}>
                  {scanResult.ticket.eventDate && (
                    <View style={styles.resultMetaItem}>
                      <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.resultMetaText}>{scanResult.ticket.eventDate}</Text>
                    </View>
                  )}
                  {scanResult.ticket.eventVenue && (
                    <View style={styles.resultMetaItem}>
                      <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.resultMetaText}>{scanResult.ticket.eventVenue}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.resultFooter}>
                  {scanResult.ticket.tierName && (
                    <View style={styles.tierBadge}>
                      <Text style={styles.tierText}>{scanResult.ticket.tierName}</Text>
                    </View>
                  )}
                  <Text style={styles.resultQty}>{scanResult.ticket.quantity || 1}x ticket{(scanResult.ticket.quantity || 1) > 1 ? 's' : ''}</Text>
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {scanHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent Scans ({scanHistory.length})</Text>
            {scanHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <Ionicons
                  name={item.valid ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={item.valid ? '#34C759' : '#FF3B30'}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyEventTitle} numberOfLines={1}>
                    {item.ticket?.eventTitle || 'Unknown'}
                  </Text>
                  <Text style={styles.historyMessage} numberOfLines={1}>
                    {item.message}
                  </Text>
                </View>
                {item.ticket?.ticketCode && (
                  <Text style={styles.historyCode}>{item.ticket.ticketCode}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  scanSection: {
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  scanIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scanTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  scanSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  codeInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  scanBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnDisabled: {
    opacity: 0.6,
  },
  resultCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  resultSuccess: {
    backgroundColor: '#34C759' + '10',
    borderWidth: 1,
    borderColor: '#34C759' + '30',
  },
  resultError: {
    backgroundColor: '#FF3B30' + '10',
    borderWidth: 1,
    borderColor: '#FF3B30' + '30',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
  },
  resultMessage: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  closeResultBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultDetails: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderLight,
  },
  resultEventTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 8,
  },
  resultMeta: {
    gap: 6,
  },
  resultMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultMetaText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  resultFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  tierBadge: {
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.accent,
  },
  resultQty: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  historySection: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  historyEventTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  historyMessage: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  historyCode: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
});
