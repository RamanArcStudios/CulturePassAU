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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { goBackOrReplace } from '@/lib/navigation';
import * as Haptics from 'expo-haptics';
import { useState, useCallback, useRef } from 'react';
import { getApiUrl } from '@/lib/query-client';
import { useContacts } from '@/contexts/ContactsContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from 'expo-camera';

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
    totalPriceCents: number | null;
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
  avatarUrl?: string;
  city?: string;
  country?: string;
  bio?: string;
  userId?: string;
};

function parseVCard(data: string): CulturePassContact | null {
  const lines = data.split(/\r?\n/);
  let name = '';
  let org = '';
  let cpid = '';

  for (const line of lines) {
    if (line.startsWith('FN:')) name = line.substring(3).trim();
    else if (line.startsWith('ORG:')) org = line.substring(4).trim();
    else if (line.startsWith('NOTE:')) {
      const cpidMatch = line.substring(5).trim().match(/CP-\w+/);
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

const TIER_DISPLAY: Record<string, { label: string; color: string; icon: string }> = {
  free: { label: 'Free', color: Colors.textSecondary, icon: 'shield-outline' },
  plus: { label: 'Plus', color: '#3498DB', icon: 'star' },
  premium: { label: 'Premium', color: '#F39C12', icon: 'diamond' },
};

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const [mode, setMode] = useState<ScanMode>('culturepass');
  const [ticketCode, setTicketCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

  const [cpInput, setCpInput] = useState('');
  const [cpContact, setCpContact] = useState<CulturePassContact | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const lastScannedRef = useRef<string>('');

  const { addContact, isContactSaved } = useContacts();

  const lookupCpid = useCallback(async (cpid: string): Promise<CulturePassContact | null> => {
    try {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/cpid/lookup/${encodeURIComponent(cpid)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.entityType === 'user' && data.targetId) {
        const userRes = await fetch(`${base}/api/users/${data.targetId}`);
        if (userRes.ok) {
          const u = await userRes.json();
          return {
            cpid,
            name: u.displayName || u.username || '',
            username: u.username,
            tier: 'free',
            avatarUrl: u.avatarUrl,
            city: u.city,
            country: u.country,
            bio: u.bio,
            userId: u.id,
          };
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  const processScannedData = useCallback(async (input: string) => {
    if (lastScannedRef.current === input) return;
    lastScannedRef.current = input;

    const contact = parseCulturePassInput(input);
    if (contact) {
      setCameraActive(false);
      setIsLookingUp(true);

      if (contact.cpid && contact.cpid !== 'Unknown') {
        const fullProfile = await lookupCpid(contact.cpid);
        if (fullProfile) {
          setCpContact(fullProfile);
        } else {
          setCpContact(contact);
        }
      } else {
        setCpContact(contact);
      }

      setIsLookingUp(false);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, [lookupCpid]);

  const handleBarcodeScanned = useCallback(({ data }: { data: string }) => {
    processScannedData(data);
  }, [processScannedData]);

  const handleTicketScan = useCallback(async () => {
    const code = ticketCode.trim();
    if (!code) {
      Alert.alert('Enter Code', 'Please enter or scan a ticket code.');
      return;
    }
    setIsScanning(true);
    Keyboard.dismiss();
    try {
      const base = getApiUrl();
      const res = await fetch(`${base}/api/tickets/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: code, scannedBy: 'staff' }),
      });
      const data = await res.json();
      if (res.ok && data.valid !== false) {
        const result: ScanResult = { valid: true, message: data.message || 'Ticket scanned successfully', ticket: data.ticket };
        setScanResult(result);
        setScanHistory(prev => [result, ...prev]);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setTicketCode('');
      } else {
        const result: ScanResult = { valid: false, message: data.error || data.message || 'Invalid ticket code', ticket: data.ticket };
        setScanResult(result);
        setScanHistory(prev => [result, ...prev]);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (e: any) {
      const result: ScanResult = { valid: false, message: e.message || 'Network error - could not scan ticket' };
      setScanResult(result);
      setScanHistory(prev => [result, ...prev]);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsScanning(false);
    }
  }, [ticketCode]);

  const handleCpManualScan = useCallback(async () => {
    const input = cpInput.trim();
    if (!input) {
      Alert.alert('Enter Data', 'Please enter a CulturePass ID, JSON, or vCard data.');
      return;
    }
    Keyboard.dismiss();
    setIsLookingUp(true);

    const contact = parseCulturePassInput(input);
    if (contact) {
      if (contact.cpid && contact.cpid !== 'Unknown') {
        const fullProfile = await lookupCpid(contact.cpid);
        if (fullProfile) {
          setCpContact(fullProfile);
        } else {
          setCpContact(contact);
        }
      } else {
        setCpContact(contact);
      }
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setCpInput('');
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Invalid Data', 'Could not parse the input. Enter a CulturePass ID (CP-123456), JSON, or vCard data.');
    }
    setIsLookingUp(false);
  }, [cpInput, lookupCpid]);

  const handleSaveContact = useCallback(() => {
    if (!cpContact) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    addContact({
      cpid: cpContact.cpid,
      name: cpContact.name,
      username: cpContact.username,
      tier: cpContact.tier,
      org: cpContact.org,
      avatarUrl: cpContact.avatarUrl,
      city: cpContact.city,
      country: cpContact.country,
      bio: cpContact.bio,
      userId: cpContact.userId,
    });
    Alert.alert('Contact Saved', `${cpContact.name || cpContact.cpid} has been saved to your CulturePass contacts.`);
  }, [cpContact, addContact]);

  const contactAlreadySaved = cpContact ? isContactSaved(cpContact.cpid) : false;

  const handleViewProfile = useCallback(() => {
    if (!cpContact) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (!contactAlreadySaved) {
      handleSaveContact();
    }
    router.push({ pathname: '/contacts/[cpid]' as any, params: { cpid: cpContact.cpid } });
  }, [cpContact, contactAlreadySaved, handleSaveContact]);

  const clearCpContact = useCallback(() => {
    setCpContact(null);
    setCpInput('');
    lastScannedRef.current = '';
  }, []);

  const clearResult = useCallback(() => {
    setScanResult(null);
    setTicketCode('');
  }, []);

  const startCamera = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera', 'Camera scanning works best on a physical device. Use manual input on web.');
      return;
    }
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Camera Permission', 'Camera access is required to scan QR codes. Please enable it in your device settings.');
        return;
      }
    }
    lastScannedRef.current = '';
    setCameraActive(true);
  }, [permission, requestPermission]);

  const handleModeChange = useCallback((newMode: ScanMode) => {
    setMode(newMode);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable 
          onPress={() => goBackOrReplace('/(tabs)')} 
          style={styles.backBtn}
          android_ripple={{ color: Colors.primary + '20', radius: 19 }}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Scanner</Text>
        <Pressable
          onPress={() => router.push('/contacts' as any)}
          style={styles.contactsBtn}
          android_ripple={{ color: Colors.primary + '30', radius: 19 }}
        >
          <Ionicons name="people-outline" size={20} color={Colors.primary} />
        </Pressable>
      </View>

      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleTab, mode === 'culturepass' && styles.toggleTabActive]}
          onPress={() => handleModeChange('culturepass')}
          android_ripple={{ color: Colors.primary + '20' }}
        >
          <Ionicons name="card-outline" size={16} color={mode === 'culturepass' ? '#FFF' : Colors.textSecondary} />
          <Text style={[styles.toggleText, mode === 'culturepass' && styles.toggleTextActive]}>CulturePass</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleTab, mode === 'tickets' && styles.toggleTabActive]}
          onPress={() => handleModeChange('tickets')}
          android_ripple={{ color: Colors.primary + '20' }}
        >
          <Ionicons name="ticket-outline" size={16} color={mode === 'tickets' ? '#FFF' : Colors.textSecondary} />
          <Text style={[styles.toggleText, mode === 'tickets' && styles.toggleTextActive]}>Tickets</Text>
        </Pressable>
      </View>

      {cameraActive && mode === 'culturepass' && (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraFrame}>
              <View style={[styles.cCorner, styles.cTL]} />
              <View style={[styles.cCorner, styles.cTR]} />
              <View style={[styles.cCorner, styles.cBL]} />
              <View style={[styles.cCorner, styles.cBR]} />
            </View>
            <Text style={styles.cameraHint}>Point at a CulturePass QR code</Text>
          </View>
          <Pressable style={styles.closeCameraBtn} onPress={() => setCameraActive(false)}>
            <Ionicons name="close-circle" size={36} color="#FFF" />
          </Pressable>
        </View>
      )}

      {isLookingUp && (
        <View style={styles.lookupOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.lookupText}>Looking up profile...</Text>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 + bottomInset }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {mode === 'culturepass' && (
          <>
            {!cameraActive && !cpContact && (
              <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.scanSection}>
                <Pressable 
                  style={styles.cameraStartBtn} 
                  onPress={startCamera}
                  android_ripple={{ color: Colors.primary + '20' }}
                >
                  <View style={styles.cameraIconCircle}>
                    <Ionicons name="camera" size={32} color="#FFF" />
                  </View>
                  <Text style={styles.cameraStartTitle}>Scan QR Code</Text>
                  <Text style={styles.cameraStartSub}>
                    {Platform.OS === 'web' ? 'Use manual input below on web' : 'Tap to open camera and scan a CulturePass card'}
                  </Text>
                </Pressable>

                <View style={styles.orDivider}>
                  <View style={styles.orLine} />
                  <Text style={styles.orText}>or enter manually</Text>
                  <View style={styles.orLine} />
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="CP-123456 or paste QR data..."
                    placeholderTextColor={Colors.textTertiary}
                    value={cpInput}
                    onChangeText={setCpInput}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="go"
                    onSubmitEditing={handleCpManualScan}
                  />
                  <Pressable
                    style={[styles.scanBtn, { backgroundColor: Colors.primary }]}
                    onPress={handleCpManualScan}
                    disabled={isLookingUp}
                    android_ripple={{ color: '#FFF', radius: 26 }}
                  >
                    <Ionicons name="search" size={22} color="#FFF" />
                  </Pressable>
                </View>
              </Animated.View>
            )}

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
                {cpContact.username && <Text style={styles.cpUsername}>@{cpContact.username}</Text>}

                <View style={styles.cpMetaRow}>
                  <View style={styles.cpIdChip}>
                    <Ionicons name="finger-print" size={13} color={Colors.primary} />
                    <Text style={styles.cpIdText}>{cpContact.cpid}</Text>
                  </View>
                  {cpContact.tier && (
                    <View style={[styles.cpTierChip, { backgroundColor: (TIER_DISPLAY[cpContact.tier]?.color ?? Colors.textSecondary) + '15' }]}>
                      <Ionicons name={(TIER_DISPLAY[cpContact.tier]?.icon ?? 'shield-outline') as any} size={12} color={TIER_DISPLAY[cpContact.tier]?.color ?? Colors.textSecondary} />
                      <Text style={[styles.cpTierText, { color: TIER_DISPLAY[cpContact.tier]?.color ?? Colors.textSecondary }]}>
                        {TIER_DISPLAY[cpContact.tier]?.label ?? 'Free'}
                      </Text>
                    </View>
                  )}
                </View>

                {cpContact.city && cpContact.country && (
                  <View style={styles.cpLocationRow}>
                    <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.cpLocationText}>{cpContact.city}, {cpContact.country}</Text>
                  </View>
                )}

                {cpContact.bio && (
                  <Text style={styles.cpBio} numberOfLines={3}>{cpContact.bio}</Text>
                )}

                {cpContact.org && (
                  <View style={styles.cpOrgRow}>
                    <Ionicons name="business-outline" size={14} color={Colors.textSecondary} />
                    <Text style={styles.cpOrgText}>{cpContact.org}</Text>
                  </View>
                )}

                <View style={styles.cpActions}>
                  <Pressable 
                    style={styles.cpActionBtn} 
                    onPress={handleViewProfile}
                    android_ripple={{ color: Colors.primary + '20' }}
                  >
                    <Ionicons name="person-outline" size={18} color={Colors.primary} />
                    <Text style={[styles.cpActionText, { color: Colors.primary }]}>View Profile</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.cpActionBtn, contactAlreadySaved && styles.cpActionBtnSaved]}
                    onPress={handleSaveContact}
                    android_ripple={{ color: contactAlreadySaved ? Colors.success + '20' : Colors.accent + '20' }}
                  >
                    <Ionicons
                      name={contactAlreadySaved ? 'checkmark-circle' : 'bookmark-outline'}
                      size={18}
                      color={contactAlreadySaved ? Colors.success : Colors.accent}
                    />
                    <Text style={[styles.cpActionText, { color: contactAlreadySaved ? Colors.success : Colors.accent }]}>
                      {contactAlreadySaved ? 'Saved' : 'Save Contact'}
                    </Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}

            {!cpContact && !cameraActive && (
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
                  onSubmitEditing={handleTicketScan}
                />
                <Pressable
                  style={[styles.scanBtn, isScanning && styles.scanBtnDisabled]}
                  onPress={handleTicketScan}
                  disabled={isScanning}
                  android_ripple={{ color: '#FFF', radius: 26 }}
                >
                  <Ionicons name={isScanning ? 'hourglass' : 'checkmark-circle'} size={22} color="#FFF" />
                </Pressable>
              </View>
            </Animated.View>

            {scanResult && (
              <Animated.View
                entering={FadeInUp.duration(400)}
                style={[styles.resultCard, scanResult.valid ? styles.resultSuccess : styles.resultError]}
              >
                <View style={styles.resultHeader}>
                  <Ionicons name={scanResult.valid ? 'checkmark-circle' : 'close-circle'} size={32} color={scanResult.valid ? '#34C759' : '#FF3B30'} />
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
                    <Ionicons name={item.valid ? 'checkmark-circle' : 'close-circle'} size={20} color={item.valid ? '#34C759' : '#FF3B30'} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyEventTitle} numberOfLines={1}>{item.ticket?.eventTitle || 'Unknown'}</Text>
                      <Text style={styles.historyMessage} numberOfLines={1}>{item.message}</Text>
                    </View>
                    {item.ticket?.ticketCode && <Text style={styles.historyCode}>{item.ticket.ticketCode}</Text>}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const CORNER = 30;
const CORNER_W = 4;

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
  contactsBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },

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
  toggleTabActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },
  toggleTextActive: { color: '#FFFFFF' },

  cameraContainer: {
    height: 300,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: { flex: 1 },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraFrame: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  cCorner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
  },
  cTL: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W, borderColor: '#FFF', borderTopLeftRadius: 8 },
  cTR: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderColor: '#FFF', borderTopRightRadius: 8 },
  cBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, borderColor: '#FFF', borderBottomLeftRadius: 8 },
  cBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderColor: '#FFF', borderBottomRightRadius: 8 },
  cameraHint: {
    marginTop: 220,
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  closeCameraBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
  },

  lookupOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background + 'F0',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  lookupText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },

  scanSection: {
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  cameraStartBtn: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    ...Colors.shadow.small,
  },
  cameraIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  cameraStartTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  cameraStartSub: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginVertical: 8,
  },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  orText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textTertiary },

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
  scanBtnDisabled: { opacity: 0.6 },

  scanIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scanTitle: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text },
  scanSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },

  resultCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  resultSuccess: { backgroundColor: '#34C759' + '10', borderWidth: 1, borderColor: '#34C759' + '30' },
  resultError: { backgroundColor: '#FF3B30' + '10', borderWidth: 1, borderColor: '#FF3B30' + '30' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  resultTitle: { fontSize: 17, fontFamily: 'Poppins_700Bold' },
  resultMessage: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  closeResultBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultDetails: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  resultEventTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },
  resultMeta: { gap: 6 },
  resultMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resultMetaText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  resultFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  tierBadge: { backgroundColor: Colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tierText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  resultQty: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },

  historySection: { marginHorizontal: 20, marginTop: 24 },
  historyTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyEventTitle: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  historyMessage: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  historyCode: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: Colors.textTertiary },

  cpCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    ...Colors.shadow.medium,
  },
  cpCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  cpAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpAvatarText: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.primary },
  cpName: { fontSize: 22, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 2 },
  cpUsername: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginBottom: 12 },
  cpMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  cpIdChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cpIdText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  cpTierChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cpTierText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
  cpLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cpLocationText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  cpBio: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginBottom: 12, lineHeight: 20 },
  cpOrgRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cpOrgText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  cpActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cpActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.background,
    paddingVertical: 12,
    borderRadius: 14,
  },
  cpActionBtnSaved: {
    backgroundColor: Colors.success + '10',
  },
  cpActionText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold' },

  cpHintSection: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  cpHintTitle: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: Colors.text },
  cpHintItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cpHintLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  cpHintExample: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary },
});
