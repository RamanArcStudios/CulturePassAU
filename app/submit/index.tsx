import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, getApiUrl, queryClient } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from '@/lib/image-manipulator';
import { fetch } from 'expo/fetch';

const isWeb = Platform.OS === 'web';

type SubmitType = 'event' | 'organisation' | 'business' | 'artist' | 'perk';

const TABS: { key: SubmitType; label: string; icon: string }[] = [
  { key: 'event', label: 'Event', icon: 'calendar' },
  { key: 'organisation', label: 'Organisation', icon: 'people' },
  { key: 'business', label: 'Business', icon: 'business' },
  { key: 'artist', label: 'Artist', icon: 'color-palette' },
  { key: 'perk', label: 'Perk', icon: 'gift' },
];

const EVENT_CATEGORIES = [
  'Cultural',
  'Music',
  'Dance',
  'Festival',
  'Workshop',
  'Religious',
  'Food',
  'Sports',
];
const ORG_CATEGORIES = ['Cultural', 'Religious', 'Community', 'Youth', 'Professional'];
const BIZ_CATEGORIES = ['Restaurant', 'Retail', 'Services', 'Beauty', 'Tech', 'Grocery'];
const ARTIST_GENRES = ['Music', 'Dance', 'Visual Arts', 'Theatre', 'Film', 'Literature'];
const PERK_TYPES = [
  { key: 'discount_percent', label: '% Discount' },
  { key: 'discount_fixed', label: '$ Discount' },
  { key: 'free_ticket', label: 'Free Ticket' },
  { key: 'early_access', label: 'Early Access' },
  { key: 'vip_upgrade', label: 'VIP Upgrade' },
  { key: 'cashback', label: 'Cashback' },
];
const PERK_CATEGORIES = ['tickets', 'events', 'dining', 'shopping', 'wallet'];

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

const initialForm = {
  name: '',
  description: '',
  city: '',
  country: '',
  contactEmail: '',
  phone: '',
  website: '',
  category: '',
  abn: '',
  socialMedia: '',
  date: '',
  time: '',
  venue: '',
  address: '',
  price: '',
  capacity: '',
  perkType: '',
  discountValue: '',
  providerName: '',
  perkCategory: '',
};

export default function SubmitScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;
  const [activeTab, setActiveTab] = useState<SubmitType>('event');
  const [form, setForm] = useState({ ...initialForm });
  const [imageUri, setImageUri] = useState<string | null>(null);
  const userId = useDemoUserId();

  const submitProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/profiles', data);
      if (!res.ok) throw new Error('Failed to submit profile');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Submitted', 'Your listing has been submitted for review.');
      setForm({ ...initialForm });
      setImageUri(null);
    },
    onError: (err: Error) => {
      console.error('Submit error:', err);
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', err.message || 'Failed to submit. Please try again.');
    },
  });

  const submitPerkMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/perks', data);
      if (!res.ok) throw new Error('Failed to create perk');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/perks'] });
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Created', 'Your perk has been created successfully.');
      setForm({ ...initialForm });
      setImageUri(null);
    },
    onError: (err: Error) => {
      console.error('Perk creation error:', err);
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Error', err.message || 'Failed to create perk. Please try again.');
    },
  });

  const handleBack = useCallback(() => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    navigation.canGoBack() ? router.back() : router.replace('/(tabs)');
  }, [navigation]);

  const uploadImage = useCallback(async () => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
      if (!isWeb) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  }, []);

  const uploadAndAttach = useCallback(
    async (targetType: 'event' | 'profile' | 'business' | 'post', targetId: string) => {
      if (!imageUri) return;

      try {
        const processed = await manipulateAsync(
          imageUri,
          [{ resize: { width: 1600 } }],
          { compress: 0.9, format: SaveFormat.JPEG }
        );

        const blobRes = await fetch(processed.uri);
        const blob = await blobRes.blob();
        const formData = new FormData();
        formData.append('image', blob as any, 'upload.jpg');

        const base = getApiUrl();
        const uploadRes = await fetch(`${base}/api/uploads/image`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) throw new Error('Failed image upload');
        const uploaded = await uploadRes.json();

        await apiRequest('POST', '/api/media/attach', {
          targetType,
          targetId,
          imageUrl: uploaded.imageUrl,
          thumbnailUrl: uploaded.thumbnailUrl,
          width: uploaded.width,
          height: uploaded.height,
        });
      } catch (error) {
        console.error('Image upload error:', error);
      }
    },
    [imageUri]
  );

  const handleTabChange = useCallback((tab: SubmitType) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
    setForm({ ...initialForm });
    setImageUri(null);
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setForm((p) => ({ ...p, category: p.category === category ? '' : category }));
  }, []);

  const handlePerkTypeSelect = useCallback((perkType: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setForm((p) => ({ ...p, perkType: p.perkType === perkType ? '' : perkType }));
  }, []);

  const handlePerkCategorySelect = useCallback((category: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setForm((p) => ({ ...p, perkCategory: p.perkCategory === category ? '' : category }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter a name / title.');
      return;
    }

    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (activeTab === 'event') {
      if (!form.date.trim()) {
        Alert.alert('Required', 'Please enter an event date.');
        return;
      }
      submitProfileMutation.mutate({
        entityType: 'venue',
        name: form.name.trim(),
        description: form.description.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        category: form.category || 'Cultural',
        contactEmail: form.contactEmail.trim() || null,
      });
    } else if (activeTab === 'perk') {
      if (!form.perkType) {
        Alert.alert('Required', 'Please select a perk type.');
        return;
      }
      const discountVal = parseInt(form.discountValue || '0', 10);
      submitPerkMutation.mutate({
        title: form.name.trim(),
        description: form.description.trim() || null,
        perkType: form.perkType,
        discountPercent: form.perkType === 'discount_percent' ? discountVal : null,
        discountFixedCents:
          form.perkType === 'discount_fixed' || form.perkType === 'cashback'
            ? discountVal * 100
            : null,
        providerName: form.providerName.trim() || null,
        providerType: 'sponsor',
        category: form.perkCategory || null,
        isMembershipRequired: false,
        status: 'active',
      });
    } else {
      if (!form.contactEmail.trim()) {
        Alert.alert('Required', 'Please enter a contact email.');
        return;
      }
      submitProfileMutation.mutate({
        entityType: activeTab,
        name: form.name.trim(),
        description: form.description.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        contactEmail: form.contactEmail.trim(),
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        category: form.category || null,
      });
    }
  }, [form, activeTab, submitProfileMutation, submitPerkMutation]);

  useEffect(() => {
    const maybeAttach = async () => {
      const created = submitProfileMutation.data as any;
      if (!created?.id || !imageUri) return;

      const targetType =
        activeTab === 'event' ? 'event' : activeTab === 'business' ? 'business' : 'profile';

      try {
        await uploadAndAttach(targetType, created.id);
      } catch (error) {
        console.error('Failed to attach image:', error);
      }
    };
    maybeAttach();
  }, [submitProfileMutation.data, imageUri, activeTab, uploadAndAttach]);

  const getCategoryOptions = useCallback(() => {
    if (activeTab === 'event') return EVENT_CATEGORIES;
    if (activeTab === 'organisation') return ORG_CATEGORIES;
    if (activeTab === 'business') return BIZ_CATEGORIES;
    if (activeTab === 'artist') return ARTIST_GENRES;
    return [];
  }, [activeTab]);

  const getCategoryLabel = useCallback(() => {
    if (activeTab === 'artist') return 'Genre / Category';
    return 'Category';
  }, [activeTab]);

  const isPending = submitProfileMutation.isPending || submitPerkMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={topInset}
    >
      <View style={[styles.container, { paddingTop: topInset }]}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.backBtn}
            android_ripple={{ color: Colors.primary + '20', radius: 20 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Create New</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 + bottomInset }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={isWeb ? undefined : FadeInDown.delay(100).duration(400)}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabScroll}
            >
              {TABS.map((tab) => (
                <Pressable
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                  onPress={() => handleTabChange(tab.key)}
                  android_ripple={{ color: Colors.primary + '20' }}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: activeTab === tab.key }}
                  accessibilityLabel={tab.label}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={16}
                    color={activeTab === tab.key ? '#FFF' : Colors.textSecondary}
                  />
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View
            entering={isWeb ? undefined : FadeInDown.delay(200).duration(400)}
            style={styles.formSection}
          >
            <Text style={styles.sectionLabel}>Basic Information</Text>

            <Text style={styles.fieldLabel}>
              {activeTab === 'event'
                ? 'Event Title'
                : activeTab === 'perk'
                ? 'Perk Title'
                : 'Name'}{' '}
              *
            </Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder={
                activeTab === 'event'
                  ? 'e.g. Diwali Festival 2026'
                  : activeTab === 'perk'
                  ? 'e.g. 20% off event tickets'
                  : activeTab === 'artist'
                  ? 'Artist / Stage name'
                  : activeTab === 'business'
                  ? 'Business name'
                  : 'Organisation name'
              }
              placeholderTextColor={Colors.textTertiary}
              accessibilityLabel="Name or title"
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(v) => setForm((p) => ({ ...p, description: v }))}
              placeholder="Tell us more..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
              accessibilityLabel="Description"
            />

            <Pressable
              style={styles.mediaBtn}
              onPress={uploadImage}
              android_ripple={{ color: Colors.primary + '20' }}
              accessibilityRole="button"
              accessibilityLabel={imageUri ? 'Replace media' : 'Upload media'}
            >
              <Ionicons name="image-outline" size={16} color={Colors.primary} />
              <Text style={styles.mediaBtnText}>
                {imageUri ? 'Replace Media' : 'Upload Media'}
              </Text>
            </Pressable>
          </Animated.View>

          {activeTab === 'event' && (
            <Animated.View
              entering={isWeb ? undefined : FadeInDown.delay(300).duration(400)}
              style={styles.formSection}
            >
              <Text style={styles.sectionLabel}>Event Details</Text>

              <Text style={styles.fieldLabel}>Date *</Text>
              <TextInput
                style={styles.input}
                value={form.date}
                onChangeText={(v) => setForm((p) => ({ ...p, date: v }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textTertiary}
                accessibilityLabel="Event date"
              />

              <Text style={styles.fieldLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={form.time}
                onChangeText={(v) => setForm((p) => ({ ...p, time: v }))}
                placeholder="e.g. 6:00 PM"
                placeholderTextColor={Colors.textTertiary}
                accessibilityLabel="Event time"
              />

              <Text style={styles.fieldLabel}>Venue</Text>
              <TextInput
                style={styles.input}
                value={form.venue}
                onChangeText={(v) => setForm((p) => ({ ...p, venue: v }))}
                placeholder="Venue name"
                placeholderTextColor={Colors.textTertiary}
                accessibilityLabel="Venue"
              />

              <Text style={styles.fieldLabel}>Address</Text>
              <TextInput
                style={styles.input}
                value={form.address}
                onChangeText={(v) => setForm((p) => ({ ...p, address: v }))}
                placeholder="Full address"
                placeholderTextColor={Colors.textTertiary}
                accessibilityLabel="Address"
              />

              <View style={styles.rowFields}>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Price ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={form.price}
                    onChangeText={(v) => setForm((p) => ({ ...p, price: v }))}
                    placeholder="0"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    accessibilityLabel="Price"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Capacity</Text>
                  <TextInput
                    style={styles.input}
                    value={form.capacity}
                    onChangeText={(v) => setForm((p) => ({ ...p, capacity: v }))}
                    placeholder="100"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    accessibilityLabel="Capacity"
                  />
                </View>
              </View>
            </Animated.View>
          )}

          {activeTab === 'perk' && (
            <Animated.View
              entering={isWeb ? undefined : FadeInDown.delay(300).duration(400)}
              style={styles.formSection}
            >
              <Text style={styles.sectionLabel}>Perk Type *</Text>
              <View style={styles.categoryGrid}>
                {PERK_TYPES.map((pt) => (
                  <Pressable
                    key={pt.key}
                    style={[
                      styles.categoryChip,
                      form.perkType === pt.key && styles.categoryChipActive,
                    ]}
                    onPress={() => handlePerkTypeSelect(pt.key)}
                    android_ripple={{ color: Colors.primary + '20' }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: form.perkType === pt.key }}
                    accessibilityLabel={pt.label}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        form.perkType === pt.key && styles.categoryTextActive,
                      ]}
                    >
                      {pt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {(form.perkType === 'discount_percent' ||
                form.perkType === 'discount_fixed' ||
                form.perkType === 'cashback') && (
                <>
                  <Text style={styles.fieldLabel}>
                    {form.perkType === 'discount_percent' ? 'Discount (%)' : 'Amount ($)'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={form.discountValue}
                    onChangeText={(v) => setForm((p) => ({ ...p, discountValue: v }))}
                    placeholder={form.perkType === 'discount_percent' ? '20' : '10'}
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="numeric"
                    accessibilityLabel="Discount value"
                  />
                </>
              )}

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Provider Name</Text>
              <TextInput
                style={styles.input}
                value={form.providerName}
                onChangeText={(v) => setForm((p) => ({ ...p, providerName: v }))}
                placeholder="e.g. CulturePass"
                placeholderTextColor={Colors.textTertiary}
                accessibilityLabel="Provider name"
              />

              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Perk Category</Text>
              <View style={styles.categoryGrid}>
                {PERK_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryChip,
                      form.perkCategory === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => handlePerkCategorySelect(cat)}
                    android_ripple={{ color: Colors.primary + '20' }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: form.perkCategory === cat }}
                    accessibilityLabel={cat}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        form.perkCategory === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          {activeTab !== 'event' && activeTab !== 'perk' && (
            <Animated.View
              entering={isWeb ? undefined : FadeInDown.delay(300).duration(400)}
              style={styles.formSection}
            >
              <Text style={styles.sectionLabel}>Location</Text>
              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={styles.input}
                value={form.city}
                onChangeText={(v) => setForm((p) => ({ ...p, city: v }))}
                placeholder="Sydney"
                placeholderTextColor={Colors.textTertiary}
                accessibilityLabel="City"
              />
              <Text style={styles.fieldLabel}>Country</Text>
              <TextInput
                style={styles.input}
                value={form.country}
                onChangeText={(v) => setForm((p) => ({ ...p, country: v }))}
                placeholder="Australia"
                placeholderTextColor={Colors.textTertiary}
                accessibilityLabel="Country"
              />
            </Animated.View>
          )}

          {activeTab === 'event' && (
            <Animated.View
              entering={isWeb ? undefined : FadeInDown.delay(350).duration(400)}
              style={styles.formSection}
            >
              <Text style={styles.sectionLabel}>Location</Text>
              <View style={styles.rowFields}>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={form.city}
                    onChangeText={(v) => setForm((p) => ({ ...p, city: v }))}
                    placeholder="Sydney"
                    placeholderTextColor={Colors.textTertiary}
                    accessibilityLabel="City"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Country</Text>
                  <TextInput
                    style={styles.input}
                    value={form.country}
                    onChangeText={(v) => setForm((p) => ({ ...p, country: v }))}
                    placeholder="Australia"
                    placeholderTextColor={Colors.textTertiary}
                    accessibilityLabel="Country"
                  />
                </View>
              </View>
            </Animated.View>
          )}

          {activeTab !== 'perk' && (
            <Animated.View
              entering={isWeb ? undefined : FadeInDown.delay(400).duration(400)}
              style={styles.formSection}
            >
              <Text style={styles.sectionLabel}>Contact Details</Text>
              <Text style={styles.fieldLabel}>
                Contact Email {activeTab !== 'event' ? '*' : ''}
              </Text>
              <TextInput
                style={styles.input}
                value={form.contactEmail}
                onChangeText={(v) => setForm((p) => ({ ...p, contactEmail: v }))}
                placeholder="contact@example.com"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Contact email"
              />
              <Text style={styles.fieldLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
                placeholder="+61 400 000 000"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="phone-pad"
                accessibilityLabel="Phone number"
              />
              <Text style={styles.fieldLabel}>Website</Text>
              <TextInput
                style={styles.input}
                value={form.website}
                onChangeText={(v) => setForm((p) => ({ ...p, website: v }))}
                placeholder="https://example.com"
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                accessibilityLabel="Website"
              />
            </Animated.View>
          )}

          {activeTab !== 'perk' && getCategoryOptions().length > 0 && (
            <Animated.View
              entering={isWeb ? undefined : FadeInDown.delay(500).duration(400)}
              style={styles.formSection}
            >
              <Text style={styles.sectionLabel}>{getCategoryLabel()}</Text>
              <View style={styles.categoryGrid}>
                {getCategoryOptions().map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryChip,
                      form.category === cat && styles.categoryChipActive,
                    ]}
                    onPress={() => handleCategorySelect(cat)}
                    android_ripple={{ color: Colors.primary + '20' }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: form.category === cat }}
                    accessibilityLabel={cat}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        form.category === cat && styles.categoryTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
          )}

          {activeTab === 'business' && (
            <Animated.View
              entering={isWeb ? undefined : FadeInDown.delay(600).duration(400)}
              style={styles.formSection}
            >
              <Text style={styles.sectionLabel}>Business Details</Text>
              <Text style={styles.fieldLabel}>ABN (Australian Business Number)</Text>
              <TextInput
                style={styles.input}
                value={form.abn}
                onChangeText={(v) => setForm((p) => ({ ...p, abn: v }))}
                placeholder="XX XXX XXX XXX"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                accessibilityLabel="ABN"
              />
            </Animated.View>
          )}

          {activeTab === 'artist' && (
            <Animated.View
              entering={isWeb ? undefined : FadeInDown.delay(600).duration(400)}
              style={styles.formSection}
            >
              <Text style={styles.sectionLabel}>Social Media</Text>
              <Text style={styles.fieldLabel}>Social Media Links</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.socialMedia}
                onChangeText={(v) => setForm((p) => ({ ...p, socialMedia: v }))}
                placeholder="Instagram, Facebook, YouTube, etc. (one per line)"
                placeholderTextColor={Colors.textTertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                accessibilityLabel="Social media links"
              />
            </Animated.View>
          )}

          <Animated.View
            entering={isWeb ? undefined : FadeInDown.delay(700).duration(400)}
            style={styles.submitSection}
          >
            <Pressable
              style={[styles.submitBtn, isPending && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={isPending}
              android_ripple={{ color: '#FFF3' }}
              accessibilityRole="button"
              accessibilityLabel="Submit form"
            >
              <Ionicons name="checkmark-circle" size={22} color="#FFF" />
              <Text style={styles.submitBtnText}>{isPending ? 'Submitting...' : 'Submit'}</Text>
            </Pressable>
            <Text style={styles.submitNote}>
              {activeTab === 'perk'
                ? 'Your perk will be created and made available to users immediately.'
                : 'All submissions are reviewed by our team within 2-3 business days. You will receive an email notification once your listing is approved.'}
            </Text>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },

  tabScroll: { paddingHorizontal: 20, gap: 8, paddingBottom: 20 },

  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  tabText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary },

  tabTextActive: { color: '#FFF' },

  formSection: { paddingHorizontal: 20, marginBottom: 20 },

  sectionLabel: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 12,
  },

  fieldLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  textArea: { minHeight: 100, paddingTop: 14 },

  mediaBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    backgroundColor: Colors.primary + '10',
  },

  mediaBtnText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },

  rowFields: { flexDirection: 'row', gap: 12 },

  halfField: { flex: 1 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },

  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },

  categoryText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },

  categoryTextActive: { color: '#FFF' },

  submitSection: { paddingHorizontal: 20, marginTop: 8, marginBottom: 24 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
  },

  submitBtnText: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#FFF' },

  submitNote: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
