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

type ScanMode = 'tickets' | 'culturepass';

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

type CulturePassContact = {
  cpid: string;
  name: string;
  username?: string;
  tier?: string;
  org?: string;
};

function parseVCard(data: string): CulturePassContact | null {
  const lines = data.split(/\r?\n/);
  let name = '';
  let org = '';
  let cpid = '';

  for (const line of lines) {
    if (line.startsWith('FN:')) {
      name = line.substring(3).trim();
    } else if (line.startsWith('ORG:')) {
      org = line.substring(4).trim();
    } else if (line.startsWith('NOTE:')) {
      const noteVal = line.substring(5).trim();
      const cpidMatch = noteVal.match(/CP-\w+/);
      if (cpidMatch) cpid = cpidMatch[0];
    }
  }

  if (!name && !cpid) return null;
  return { cpid: cpid || 'Unknown', name: name || 'Unknown', org };
}

function parseCulturePassInput(input: string): CulturePassContact | null {
  const trimmed = input.trim();

  if (trimmed.startsWith('{')) {
    try {
      const json = JSON.parse(trimmed);
      if (json.type === 'culturepass_id') {
        return {
          cpid: json.cpid || json.id || '',
          name: json.name || json.displayName || '',
          username: json.username || '',
          tier: json.tier || 'free',
        };
      }
    } catch {}
  }

  if (trimmed.startsWith('BEGIN:VCARD')) {
    return parseVCard(trimmed);
  }

  if (/^CP-\w+$/i.test(trimmed)) {
    return { cpid: trimmed.toUpperCase(), name: '' };
  }

  return null;
}

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const [mode, setMode] = useState<ScanMode>('tickets');
  const [ticketCode, setTicketCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const [cpInput, setCpInput] = useState('');
  const [cpContact, setCpContact] = useState<CulturePassContact | null>(null);

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

  const handleCpScan = useCallback(() => {
    const input = cpInput.trim();
    if (!input) {
      Alert.alert('Enter Data', 'Please enter a CulturePass ID, JSON, or vCard data.');
      return;
    }

    Keyboard.dismiss();
    const contact = parseCulturePassInput(input);
    if (contact) {
      setCpContact(contact);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCpInput('');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Data', 'Could not parse the input. Enter a CulturePass ID (CP-123456), JSON, or vCard data.');
    }
  }, [cpInput]);

  const clearCpContact = useCallback(() => {
    setCpContact(null);
    setCpInput('');
  }, []);

  const TIER_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
    free: { label: 'Free', color: Colors.textSecondary, icon: 'shield-outline' },
    plus: { label: 'Plus', color: '#3498DB', icon: 'star' },
    premium: { label: 'Premium', color: '#F39C12', icon: 'diamond' },
  };

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Scanner</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleTab, mode === 'tickets' && styles.toggleTabActive]}
          onPress={() => {
            setMode('tickets');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons
            name="ticket-outline"
            size={16}
            color={mode === 'tickets' ? '#FFF' : Colors.textSecondary}
          />
          <Text style={[styles.toggleText, mode === 'tickets' && styles.toggleTextActive]}>
            Tickets
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleTab, mode === 'culturepass' && styles.toggleTabActive]}
          onPress={() => {
            setMode('culturepass');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Ionicons
            name="card-outline"
            size={16}
            color={mode === 'culturepass' ? '#FFF' : Colors.textSecondary}
          />
          <Text style={[styles.toggleText, mode === 'culturepass' && styles.toggleTextActive]}>
            CulturePass Card
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 + bottomInset }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {mode === 'tickets' && (
          <>
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
          </>
        )}

        {mode === 'culturepass' && (
          <>
            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.scanSection}>
              <View style={[styles.scanIconContainer, { backgroundColor: Colors.secondary + '12' }]}>
                <Ionicons name="card" size={48} color={Colors.secondary} />
              </View>
              <Text style={styles.scanTitle}>Scan CulturePass Card</Text>
              <Text style={styles.scanSubtitle}>
                Enter a CulturePass ID or paste scanned QR data (JSON / vCard)
              </Text>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.codeInput}
                  placeholder="CP-123456, JSON, or vCard..."
                  placeholderTextColor={Colors.textTertiary}
                  value={cpInput}
                  onChangeText={setCpInput}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="go"
                  onSubmitEditing={handleCpScan}
                  multiline
                />
                <Pressable
                  style={[styles.scanBtn, { backgroundColor: Colors.secondary }]}
                  onPress={handleCpScan}
                >
                  <Ionicons name="search" size={22} color="#FFF" />
                </Pressable>
              </View>
            </Animated.View>

            {cpContact && (
              <Animated.View entering={FadeInUp.duration(400)} style={styles.cpCard}>
                <View style={styles.cpCardHeader}>
                  <View style={styles.cpAvatar}>
                    <Text style={styles.cpAvatarText}>
                      {(cpContact.name || cpContact.cpid).split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Pressable onPress={clearCpContact} style={styles.closeResultBtn}>
                    <Ionicons name="close" size={20} color={Colors.textTertiary} />
                  </Pressable>
                </View>

                <Text style={styles.cpName}>{cpContact.name || 'CulturePass User'}</Text>
                {cpContact.username ? (
                  <Text style={styles.cpUsername}>@{cpContact.username}</Text>
                ) : null}

                <View style={styles.cpMetaRow}>
                  <View style={styles.cpIdChip}>
                    <Ionicons name="finger-print" size={13} color={Colors.primary} />
                    <Text style={styles.cpIdText}>{cpContact.cpid}</Text>
                  </View>
                  {cpContact.tier && (
                    <View style={[styles.cpTierChip, { backgroundColor: (TIER_DISPLAY[cpContact.tier]?.color ?? Colors.textSecondary) + '15' }]}>
                      <Ionicons
                        name={(TIER_DISPLAY[cpContact.tier]?.icon ?? 'shield-outline') as any}
                        size={12}
                        color={TIER_DISPLAY[cpContact.tier]?.color ?? Colors.textSecondary}
                      />
                      <Text style={[styles.cpTierText, { color: TIER_DISPLAY[cpContact.tier]?.color ?? Colors.textSecondary }]}>
                        {TIER_DISPLAY[cpContact.tier]?.label ?? 'Free'}
                      </Text>
                    </View>
                  )}
                </View>

                {cpContact.org ? (
                  <View style={styles.cpOrgRow}>
                    <Ionicons name="business-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.cpOrgText}>{cpContact.org}</Text>
                  </View>
                ) : null}

                <View style={styles.cpActions}>
                  <Pressable
                    style={styles.cpActionBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('View Profile', `Navigating to ${cpContact.name || cpContact.cpid}'s profile`);
                    }}
                  >
                    <Ionicons name="person-outline" size={18} color={Colors.primary} />
                    <Text style={[styles.cpActionText, { color: Colors.primary }]}>View Profile</Text>
                  </Pressable>
                  <Pressable
                    style={styles.cpActionBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Connect', `Connection request sent to ${cpContact.name || cpContact.cpid}`);
                    }}
                  >
                    <Ionicons name="people-outline" size={18} color={Colors.secondary} />
                    <Text style={[styles.cpActionText, { color: Colors.secondary }]}>Connect</Text>
                  </Pressable>
                  <Pressable
                    style={styles.cpActionBtn}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert('Saved', `${cpContact.name || cpContact.cpid} saved to contacts`);
                    }}
                  >
                    <Ionicons name="bookmark-outline" size={18} color={Colors.accent} />
                    <Text style={[styles.cpActionText, { color: Colors.accent }]}>Save Contact</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}

            {!cpContact && (
              <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.cpHintSection}>
                <Text style={styles.cpHintTitle}>Supported Formats</Text>
                <View style={styles.cpHintItem}>
                  <Ionicons name="finger-print" size={16} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cpHintLabel}>CulturePass ID</Text>
                    <Text style={styles.cpHintExample}>CP-123456</Text>
                  </View>
                </View>
                <View style={styles.cpHintItem}>
                  <Ionicons name="code-slash" size={16} color={Colors.secondary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cpHintLabel}>JSON QR Data</Text>
                    <Text style={styles.cpHintExample}>{'{"type":"culturepass_id","cpid":"CP-..."}'}</Text>
                  </View>
                </View>
                <View style={styles.cpHintItem}>
                  <Ionicons name="document-text-outline" size={16} color={Colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cpHintLabel}>vCard Data</Text>
                    <Text style={styles.cpHintExample}>BEGIN:VCARD...</Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </>
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

  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  toggleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  toggleTabActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },

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

  cpCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cpCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cpAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpAvatarText: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.secondary,
  },
  cpName: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  cpUsername: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cpMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  cpIdChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cpIdText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.primary,
    letterSpacing: 0.3,
  },
  cpTierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cpTierText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  cpOrgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  cpOrgText: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  cpActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.borderLight,
  },
  cpActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
  },
  cpActionText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },

  cpHintSection: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  cpHintTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  cpHintItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  cpHintLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  cpHintExample: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
