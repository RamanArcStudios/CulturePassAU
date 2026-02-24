import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Alert, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  label: string;
  last4: string | null;
  brand: string | null;
  expiryMonth: number | null;
  expiryYear: number | null;
  isDefault: boolean | null;
  createdAt: string | null;
}

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

function getBrandIcon(brand: string | null): string {
  switch (brand?.toLowerCase()) {
    case 'visa': return 'card';
    case 'mastercard': return 'card';
    case 'amex': return 'card';
    case 'paypal': return 'logo-paypal';
    default: return 'card-outline';
  }
}

function getBrandColor(brand: string | null): string {
  switch (brand?.toLowerCase()) {
    case 'visa': return '#1A1F71';
    case 'mastercard': return '#EB001B';
    case 'amex': return '#006FCF';
    case 'paypal': return '#003087';
    default: return Colors.primary;
  }
}

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const userId = useDemoUserId();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'credit',
    label: '',
    last4: '',
    brand: 'Visa',
    expiryMonth: '',
    expiryYear: '',
  });

  const { data: methods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/payment-methods', userId],
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/payment-methods', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods', userId] });
      setShowAddForm(false);
      setFormData({ type: 'credit', label: '', last4: '', brand: 'Visa', expiryMonth: '', expiryYear: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/payment-methods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods', userId] });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (methodId: string) => {
      await apiRequest('PUT', `/api/payment-methods/${userId}/default/${methodId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods', userId] });
    },
  });

  const handleAdd = () => {
    if (!formData.label || !formData.last4 || !formData.expiryMonth || !formData.expiryYear) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createMutation.mutate({
      userId,
      type: formData.type,
      label: formData.label,
      last4: formData.last4,
      brand: formData.brand,
      expiryMonth: parseInt(formData.expiryMonth),
      expiryYear: parseInt(formData.expiryYear),
      isDefault: methods.length === 0,
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Card', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteMutation.mutate(id);
        }
      },
    ]);
  };

  const handleSetDefault = (methodId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDefaultMutation.mutate(methodId);
  };

  const brandOptions = ['Visa', 'Mastercard', 'Amex', 'PayPal'];
  const typeOptions = ['credit', 'debit', 'paypal'];

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomInset + 20 }}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : methods.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(100)} style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="card-outline" size={48} color={Colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Payment Methods</Text>
            <Text style={styles.emptySubtitle}>Add a card or PayPal to make quick payments</Text>
          </Animated.View>
        ) : (
          methods.map((method, index) => (
            <Animated.View key={method.id} entering={FadeInDown.delay(index * 80)} style={styles.cardContainer}>
              <View style={[styles.cardGradient, { borderLeftColor: getBrandColor(method.brand) }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.brandIcon, { backgroundColor: getBrandColor(method.brand) + '15' }]}>
                    <Ionicons name={getBrandIcon(method.brand) as any} size={22} color={getBrandColor(method.brand)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardLabel}>{method.label}</Text>
                    <Text style={styles.cardBrand}>{method.brand} · {method.type}</Text>
                  </View>
                  {method.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardNumber}>•••• •••• •••• {method.last4}</Text>
                  <Text style={styles.cardExpiry}>
                    {method.expiryMonth?.toString().padStart(2, '0')}/{method.expiryYear?.toString().slice(-2)}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <Pressable onPress={() => handleSetDefault(method.id)} style={styles.actionBtn}>
                      <Ionicons name="star-outline" size={16} color={Colors.primary} />
                      <Text style={styles.actionText}>Set Default</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => handleDelete(method.id)} style={[styles.actionBtn, styles.deleteBtn]}>
                    <Ionicons name="trash-outline" size={16} color={Colors.error} />
                    <Text style={[styles.actionText, { color: Colors.error }]}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          ))
        )}

        <Pressable
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddForm(true);
          }}
        >
          <Ionicons name="add-circle" size={22} color={Colors.textInverse} />
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showAddForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: bottomInset + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <Pressable onPress={() => setShowAddForm(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Card Label</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., My Visa Card"
                placeholderTextColor={Colors.textTertiary}
                value={formData.label}
                onChangeText={(v) => setFormData(p => ({ ...p, label: v }))}
              />

              <Text style={styles.fieldLabel}>Last 4 Digits</Text>
              <TextInput
                style={styles.input}
                placeholder="1234"
                placeholderTextColor={Colors.textTertiary}
                value={formData.last4}
                onChangeText={(v) => setFormData(p => ({ ...p, last4: v.replace(/\D/g, '').slice(0, 4) }))}
                keyboardType="number-pad"
                maxLength={4}
              />

              <Text style={styles.fieldLabel}>Card Brand</Text>
              <View style={styles.optionsRow}>
                {brandOptions.map(b => (
                  <Pressable
                    key={b}
                    style={[styles.optionChip, formData.brand === b && styles.optionChipActive]}
                    onPress={() => setFormData(p => ({ ...p, brand: b }))}
                  >
                    <Text style={[styles.optionChipText, formData.brand === b && styles.optionChipTextActive]}>{b}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Card Type</Text>
              <View style={styles.optionsRow}>
                {typeOptions.map(t => (
                  <Pressable
                    key={t}
                    style={[styles.optionChip, formData.type === t && styles.optionChipActive]}
                    onPress={() => setFormData(p => ({ ...p, type: t }))}
                  >
                    <Text style={[styles.optionChipText, formData.type === t && styles.optionChipTextActive]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.expiryRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Expiry Month</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.expiryMonth}
                    onChangeText={(v) => setFormData(p => ({ ...p, expiryMonth: v.replace(/\D/g, '').slice(0, 2) }))}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>Expiry Year</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY"
                    placeholderTextColor={Colors.textTertiary}
                    value={formData.expiryYear}
                    onChangeText={(v) => setFormData(p => ({ ...p, expiryYear: v.replace(/\D/g, '').slice(0, 4) }))}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              <Pressable style={styles.submitBtn} onPress={handleAdd} disabled={createMutation.isPending}>
                <Text style={styles.submitBtnText}>
                  {createMutation.isPending ? 'Adding...' : 'Add Card'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  loadingContainer: { padding: 60, alignItems: 'center' },
  loadingText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center' },
  cardContainer: { marginHorizontal: 20, marginBottom: 12 },
  cardGradient: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.cardBorder, borderLeftWidth: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  brandIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  cardBrand: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 2 },
  defaultBadge: { backgroundColor: Colors.success + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  defaultText: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: Colors.success },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardNumber: { fontSize: 15, fontFamily: 'Poppins_500Medium', color: Colors.text, letterSpacing: 1 },
  cardExpiry: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  cardActions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8 },
  deleteBtn: { marginLeft: 'auto' as any },
  actionText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.primary },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 8, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16 },
  addButtonText: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.textInverse },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: Colors.text },
  fieldLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.cardBorder },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  optionChipActive: { backgroundColor: Colors.primary + '15', borderColor: Colors.primary },
  optionChipText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  optionChipTextActive: { color: Colors.primary },
  expiryRow: { flexDirection: 'row', gap: 12 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
  submitBtnText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: Colors.textInverse },
});
