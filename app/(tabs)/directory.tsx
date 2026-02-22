import { View, Text, Pressable, StyleSheet, ScrollView, Platform, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import type { Profile } from '@shared/schema';

const TYPE_COLORS: Record<string, string> = {
  business: '#F2A93B',
  venue: '#9B59B6',
  council: '#3498DB',
  government: '#2C3E50',
  organisation: '#1A7A6D',
};

const TYPE_ICONS: Record<string, string> = {
  business: 'storefront',
  venue: 'location',
  council: 'shield-checkmark',
  government: 'flag',
  organisation: 'business',
};

const entityFilters = [
  { label: 'All', icon: 'grid', color: Colors.primary },
  { label: 'business', icon: 'storefront', color: '#F2A93B', display: 'Businesses' },
  { label: 'venue', icon: 'location', color: '#9B59B6', display: 'Venues' },
  { label: 'organisation', icon: 'business', color: '#1A7A6D', display: 'Organisations' },
  { label: 'council', icon: 'shield-checkmark', color: '#3498DB', display: 'Councils' },
  { label: 'government', icon: 'flag', color: '#2C3E50', display: 'Government' },
];

function DirectoryCard({ profile, index }: { profile: Profile; index: number }) {
  const color = TYPE_COLORS[profile.entityType] || Colors.primary;
  const icon = TYPE_ICONS[profile.entityType] || 'business';

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: '/profile/[id]', params: { id: profile.id } })}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.businessIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon as any} size={26} color={color} />
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.cardName} numberOfLines={1}>{profile.name}</Text>
              {profile.isVerified && <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />}
            </View>
            <Text style={styles.cardCategory}>{profile.category || profile.entityType}</Text>
          </View>
          {profile.rating ? (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color={Colors.accent} />
              <Text style={styles.ratingText}>{profile.rating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.cardDesc} numberOfLines={2}>{profile.description}</Text>

        {(profile.tags as string[] || []).length > 0 && (
          <View style={styles.serviceRow}>
            {(profile.tags as string[]).slice(0, 3).map(tag => (
              <View key={tag} style={styles.servicePill}>
                <Text style={styles.serviceText}>{tag}</Text>
              </View>
            ))}
            {(profile.tags as string[]).length > 3 && (
              <Text style={styles.moreServices}>+{(profile.tags as string[]).length - 3}</Text>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          {profile.city && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.locationText}>{profile.city}, {profile.country}</Text>
            </View>
          )}
          <View style={styles.statsRow}>
            <Text style={styles.followersText}>{formatNumber(profile.followersCount || 0)} followers</Text>
            {(profile.reviewsCount || 0) > 0 && <Text style={styles.reviewCount}>{profile.reviewsCount} reviews</Text>}
          </View>
        </View>

        <Pressable style={styles.cardAction}>
          <Text style={styles.cardActionText}>View Details</Text>
          <Ionicons name="arrow-forward-circle" size={20} color={Colors.primary} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

export default function DirectoryScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');

  const { data: allProfiles, isLoading } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
  });

  const nonCommunityProfiles = useMemo(() => {
    return (allProfiles || []).filter(p => p.entityType !== 'community');
  }, [allProfiles]);

  const filtered = useMemo(() => {
    let results = nonCommunityProfiles;
    if (selectedType !== 'All') {
      results = results.filter(p => p.entityType === selectedType);
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.tags as string[] || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return results;
  }, [selectedType, search, nonCommunityProfiles]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Directory</Text>
        <Text style={styles.subtitle}>Businesses, venues, organisations & more</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search directory..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      <View style={styles.categorySection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          {entityFilters.map(filter => (
            <Pressable
              key={filter.label}
              style={[
                styles.categoryChip,
                selectedType === filter.label && { backgroundColor: filter.color, borderColor: filter.color, ...styles.categoryChipActive },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(filter.label);
              }}
            >
              <View style={[
                styles.categoryIconWrap,
                selectedType === filter.label ? { backgroundColor: 'rgba(255,255,255,0.25)' } : { backgroundColor: filter.color + '12' },
              ]}>
                <Ionicons name={filter.icon as any} size={18} color={selectedType === filter.label ? '#FFF' : filter.color} />
              </View>
              <Text style={[styles.categoryText, selectedType === filter.label && styles.categoryTextActive]}>
                {filter.display || filter.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <Text style={styles.resultCount}>
            {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} found
          </Text>
          {filtered.map((profile, index) => (
            <DirectoryCard key={profile.id} profile={profile} index={index} />
          ))}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={52} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtext}>Try a different filter or search term</Text>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginTop: 2, marginBottom: 4 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderWidth: 0.5, borderColor: Colors.cardBorder, marginBottom: 6, ...Colors.shadow.small },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Poppins_400Regular', color: Colors.text, padding: 0 },
  categorySection: { paddingTop: 8, paddingBottom: 4 },
  categoryRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 14 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder },
  categoryChipActive: { ...Colors.shadow.small },
  categoryIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  categoryText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.text },
  categoryTextActive: { color: '#FFF' },
  resultCount: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, marginBottom: 10 },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  card: { backgroundColor: Colors.card, borderRadius: 18, padding: 18, borderWidth: 0.5, borderColor: Colors.cardBorder, gap: 10, marginBottom: 14, ...Colors.shadow.medium },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  businessIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardName: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: Colors.text, flexShrink: 1 },
  cardCategory: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.accent + '18', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  ratingText: { fontSize: 14, fontFamily: 'Poppins_700Bold', color: Colors.accent },
  cardDesc: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, lineHeight: 21 },
  serviceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  servicePill: { backgroundColor: Colors.backgroundSecondary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  serviceText: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  moreServices: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  followersText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: Colors.secondary },
  reviewCount: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: Colors.textTertiary },
  cardAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, marginTop: 4, borderRadius: 12, backgroundColor: Colors.primaryGlow },
  cardActionText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: Colors.primary },
  emptyState: { alignItems: 'center', paddingVertical: 80, gap: 14 },
  emptyTitle: { fontSize: 18, fontFamily: 'Poppins_600SemiBold', color: Colors.text, marginTop: 4 },
  emptySubtext: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
});
