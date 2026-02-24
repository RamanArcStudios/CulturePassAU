import { View, Text, Pressable, StyleSheet, ScrollView, Platform, TextInput, Alert, KeyboardAvoidingView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, getApiUrl, queryClient } from '@/lib/query-client';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from '@/lib/image-manipulator';
import { fetch } from 'expo/fetch';

interface UserData {
  id: string;
  username: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  location: string | null;
  avatarUrl?: string | null;
  website: string | null;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  } | null;
}

type UploadedImage = {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
};

function useDemoUserId() {
  const { data } = useQuery<{ id: string }[]>({ queryKey: ['/api/users'] });
  return data?.[0]?.id;
}

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;
  const userId = useDemoUserId();

  const { data: user } = useQuery<UserData>({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
  });

  const [form, setForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    country: '',
    website: '',
    instagram: '',
    twitter: '',
    linkedin: '',
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarRotation, setAvatarRotation] = useState(0);
  const [avatarScale, setAvatarScale] = useState<'original' | 'large' | 'medium'>('large');

  useEffect(() => {
    if (user) {
      setForm({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        city: user.city || '',
        country: user.country || '',
        website: user.website || '',
        instagram: user.socialLinks?.instagram || '',
        twitter: user.socialLinks?.twitter || '',
        linkedin: user.socialLinks?.linkedin || '',
      });
      setAvatarUri(user.avatarUrl || null);
    }
  }, [user]);

  const uploadMutation = useMutation({
    mutationFn: async (uri: string): Promise<UploadedImage> => {
      const processed = await manipulateAsync(
        uri,
        [
          { rotate: avatarRotation },
          ...(avatarScale === 'medium' ? [{ resize: { width: 1024 } }] : avatarScale === 'large' ? [{ resize: { width: 1600 } }] : []),
        ],
        { compress: 0.92, format: SaveFormat.JPEG },
      );

      const blobRes = await fetch(processed.uri);
      const blob = await blobRes.blob();
      const formData = new FormData();
      formData.append('image', blob as any, 'profile.jpg');

      const base = getApiUrl();
      const uploadRes = await fetch(`${base}api/uploads/image`, {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }
      return uploadRes.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('PUT', `/api/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Profile Updated', 'Your profile has been saved successfully.');
      router.back();
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message);
    },
  });

  const handleChoosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo access to upload your profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
      setAvatarRotation(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDropForWeb = async (event: any) => {
    if (Platform.OS !== 'web') return;
    event.preventDefault();
    const file = event?.nativeEvent?.dataTransfer?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUri(String(reader.result));
      setAvatarRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.displayName.trim()) {
      Alert.alert('Required', 'Please enter your display name.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let avatarUrl = user?.avatarUrl || null;
    if (avatarUri && avatarUri !== user?.avatarUrl) {
      try {
        const uploaded = await uploadMutation.mutateAsync(avatarUri);
        avatarUrl = uploaded.imageUrl;
        await apiRequest('POST', '/api/media/attach', {
          targetType: 'user',
          targetId: userId,
          imageUrl: uploaded.imageUrl,
          thumbnailUrl: uploaded.thumbnailUrl,
          width: uploaded.width,
          height: uploaded.height,
        });
      } catch (error) {
        Alert.alert('Upload failed', String(error));
        return;
      }
    }

    updateMutation.mutate({
      displayName: form.displayName.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      bio: form.bio.trim() || null,
      city: form.city.trim() || null,
      country: form.country.trim() || null,
      location: form.city && form.country ? `${form.city.trim()}, ${form.country.trim()}` : null,
      avatarUrl,
      website: form.website.trim() || null,
      socialLinks: {
        instagram: form.instagram.trim() || undefined,
        twitter: form.twitter.trim() || undefined,
        linkedin: form.linkedin.trim() || undefined,
      },
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <View style={[styles.container, { paddingTop: insets.top + webTop }]}> 
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Pressable onPress={handleSave} disabled={updateMutation.isPending || uploadMutation.isPending} style={styles.saveBtn}>
            <Text style={[styles.saveBtnText, (updateMutation.isPending || uploadMutation.isPending) && { opacity: 0.5 }]}> 
              {updateMutation.isPending || uploadMutation.isPending ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 + insets.bottom + webBottom }} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.avatarSection}>
            <View style={styles.avatarDropZone} {...(Platform.OS === 'web' ? { onDrop: handleDropForWeb, onDragOver: (e: any) => e.preventDefault() } : {}) as any}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={40} color={Colors.primary} />
                </View>
              )}
            </View>

            <View style={styles.photoActionsRow}>
              <Pressable style={styles.changePhotoBtn} onPress={handleChoosePhoto}>
                <Ionicons name="camera" size={16} color={Colors.primary} />
                <Text style={styles.changePhotoText}>Pick Photo</Text>
              </Pressable>
              <Pressable style={styles.changePhotoBtn} onPress={() => setAvatarRotation((p) => (p + 90) % 360)}>
                <Ionicons name="refresh" size={16} color={Colors.primary} />
                <Text style={styles.changePhotoText}>Rotate</Text>
              </Pressable>
            </View>

            <View style={styles.resizeRow}>
              {(['original', 'large', 'medium'] as const).map((preset) => (
                <Pressable key={preset} style={[styles.resizeChip, avatarScale === preset && styles.resizeChipActive]} onPress={() => setAvatarScale(preset)}>
                  <Text style={[styles.resizeChipText, avatarScale === preset && styles.resizeChipTextActive]}>{preset}</Text>
                </Pressable>
              ))}
            </View>

            {(uploadMutation.isPending || updateMutation.isPending) && <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 8 }} />}
            {Platform.OS === 'web' && <Text style={styles.dragHint}>Tip: Drag & drop image here on web.</Text>}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.formSection}>
            <Text style={styles.sectionLabel}>Personal Information</Text>

            <Text style={styles.fieldLabel}>Display Name *</Text>
            <TextInput style={styles.input} value={form.displayName} onChangeText={v => setForm(p => ({ ...p, displayName: v }))}
              placeholder="Your full name" placeholderTextColor={Colors.textTertiary} />

            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={styles.input} value={form.email} onChangeText={v => setForm(p => ({ ...p, email: v }))}
              placeholder="your@email.com" placeholderTextColor={Colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput style={styles.input} value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v }))}
              placeholder="+61 400 000 000" placeholderTextColor={Colors.textTertiary} keyboardType="phone-pad" />

            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput style={[styles.input, styles.bioInput]} value={form.bio} onChangeText={v => setForm(p => ({ ...p, bio: v }))}
              placeholder="Tell us about yourself..." placeholderTextColor={Colors.textTertiary} multiline numberOfLines={4} textAlignVertical="top" maxLength={280} />
            <Text style={styles.charCount}>{form.bio.length}/280</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.formSection}>
            <Text style={styles.sectionLabel}>Location</Text>

            <Text style={styles.fieldLabel}>City</Text>
            <TextInput style={styles.input} value={form.city} onChangeText={v => setForm(p => ({ ...p, city: v }))}
              placeholder="Sydney" placeholderTextColor={Colors.textTertiary} />

            <Text style={styles.fieldLabel}>Country</Text>
            <TextInput style={styles.input} value={form.country} onChangeText={v => setForm(p => ({ ...p, country: v }))}
              placeholder="Australia" placeholderTextColor={Colors.textTertiary} />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.formSection}>
            <Text style={styles.sectionLabel}>Social Links</Text>

            <View style={styles.socialRow}>
              <View style={[styles.socialIcon, { backgroundColor: '#E4405F15' }]}> 
                <Ionicons name="logo-instagram" size={18} color="#E4405F" />
              </View>
              <TextInput style={[styles.input, { flex: 1 }]} value={form.instagram} onChangeText={v => setForm(p => ({ ...p, instagram: v }))}
                placeholder="Instagram URL" placeholderTextColor={Colors.textTertiary} autoCapitalize="none" />
            </View>

            <View style={styles.socialRow}>
              <View style={[styles.socialIcon, { backgroundColor: '#1DA1F215' }]}> 
                <Ionicons name="logo-twitter" size={18} color="#1DA1F2" />
              </View>
              <TextInput style={[styles.input, { flex: 1 }]} value={form.twitter} onChangeText={v => setForm(p => ({ ...p, twitter: v }))}
                placeholder="Twitter URL" placeholderTextColor={Colors.textTertiary} autoCapitalize="none" />
            </View>

            <View style={styles.socialRow}>
              <View style={[styles.socialIcon, { backgroundColor: '#0A66C215' }]}> 
                <Ionicons name="logo-linkedin" size={18} color="#0A66C2" />
              </View>
              <TextInput style={[styles.input, { flex: 1 }]} value={form.linkedin} onChangeText={v => setForm(p => ({ ...p, linkedin: v }))}
                placeholder="LinkedIn URL" placeholderTextColor={Colors.textTertiary} autoCapitalize="none" />
            </View>

            <View style={styles.socialRow}>
              <View style={[styles.socialIcon, { backgroundColor: Colors.primary + '15' }]}> 
                <Ionicons name="globe-outline" size={18} color={Colors.primary} />
              </View>
              <TextInput style={[styles.input, { flex: 1 }]} value={form.website} onChangeText={v => setForm(p => ({ ...p, website: v }))}
                placeholder="Website URL" placeholderTextColor={Colors.textTertiary} autoCapitalize="none" />
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: Colors.text },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.primary },
  saveBtnText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: '#FFF' },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatarDropZone: { borderWidth: 1, borderStyle: 'dashed', borderColor: Colors.cardBorder, borderRadius: 60, padding: 6, marginBottom: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primary + '30' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  photoActionsRow: { flexDirection: 'row', gap: 10 },
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary + '10', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  changePhotoText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  resizeRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  resizeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: Colors.cardBorder },
  resizeChipActive: { backgroundColor: Colors.primary + '12', borderColor: Colors.primary },
  resizeChipText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, textTransform: 'capitalize' },
  resizeChipTextActive: { color: Colors.primary },
  dragHint: { marginTop: 8, fontSize: 11, color: Colors.textSecondary, fontFamily: 'Poppins_400Regular' },
  formSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: Colors.text, marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.cardBorder },
  bioInput: { minHeight: 100, paddingTop: 14 },
  charCount: { fontSize: 11, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary, textAlign: 'right', marginTop: 4 },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  socialIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
