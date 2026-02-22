import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sampleBusinesses, businessCategories } from '@/data/mockData';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';

function BusinessCard({ business }: { business: typeof sampleBusinesses[0] }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/business/[id]', params: { id: business.id } })}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.businessIcon, { backgroundColor: business.color + '15' }]}>
          <Ionicons name={business.icon as any} size={24} color={business.color} />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>{business.name}</Text>
            {business.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color={Colors.secondary} />
            )}
          </View>
          <Text style={styles.cardCategory}>{business.category}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={13} color={Colors.accent} />
          <Text style={styles.ratingText}>{business.rating}</Text>
        </View>
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>{business.description}</Text>

      <View style={styles.serviceRow}>
        {business.services.slice(0, 3).map(service => (
          <View key={service} style={styles.servicePill}>
            <Text style={styles.serviceText}>{service}</Text>
          </View>
        ))}
        {business.services.length > 3 && (
          <Text style={styles.moreServices}>+{business.services.length - 3}</Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.locationText}>{business.location}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceRange}>{business.priceRange}</Text>
          <Text style={styles.reviewCount}>{business.reviews} reviews</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function DirectoryScreen() {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return sampleBusinesses;
    return sampleBusinesses.filter(b => b.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Business Directory</Text>
        <Text style={styles.subtitle}>Find trusted cultural businesses and services</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
        style={{ flexGrow: 0 }}
      >
        {businessCategories.map(cat => (
          <Pressable
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(cat);
            }}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === cat && styles.categoryTextActive,
            ]}>{cat}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered.map(business => (
          <BusinessCard key={business.id} business={business} />
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  categoryRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  categoryActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  categoryTextActive: { color: '#FFF' },
  list: {
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    flexShrink: 1,
  },
  cardCategory: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.accent + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: Colors.accent,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  serviceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  servicePill: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  serviceText: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  moreServices: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceRange: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
    color: Colors.secondary,
  },
  reviewCount: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
});
