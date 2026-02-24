import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface CategoryFilter {
  label: string;
  icon: string;
  color: string;
}

export interface BrowseItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  reviews?: number;
  priceLabel?: string;
  badge?: string;
  isPromoted?: boolean;
  meta?: string;
  [key: string]: any;
}

interface BrowsePageProps {
  title: string;
  accentColor?: string;
  accentIcon?: string;
  apiEndpoint: string;
  categories: CategoryFilter[];
  categoryKey?: string;
  items: BrowseItem[];
  isLoading: boolean;
  promotedItems?: BrowseItem[];
  promotedTitle?: string;
  onItemPress: (item: BrowseItem) => void;
  renderItemExtra?: (item: BrowseItem) => React.ReactNode;
  emptyMessage?: string;
  emptyIcon?: string;
}

export default function BrowsePage({
  title,
  accentColor = Colors.primary,
  accentIcon = 'compass',
  categories,
  categoryKey = 'category',
  items,
  isLoading,
  promotedItems = [],
  promotedTitle = 'Popular',
  onItemPress,
  renderItemExtra,
  emptyMessage = 'Nothing found',
  emptyIcon = 'search-outline',
}: BrowsePageProps) {
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const [selectedCat, setSelectedCat] = useState('All');

  const filtered = useMemo(() => {
    if (selectedCat === 'All') return items;
    return items.filter((item) => {
      const val = item[categoryKey];
      if (Array.isArray(val)) return val.includes(selectedCat);
      return val === selectedCat;
    });
  }, [selectedCat, items, categoryKey]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <Header title={title} accentColor={accentColor} accentIcon={accentIcon} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <Header title={title} accentColor={accentColor} accentIcon={accentIcon} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 100 }}
      >
        {promotedItems.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionDot, { backgroundColor: accentColor }]} />
              <Text style={styles.sectionTitle}>{promotedTitle}</Text>
              <View style={[styles.promotedBadge, { backgroundColor: accentColor + '15' }]}>
                <Ionicons name="star" size={10} color={accentColor} />
                <Text style={[styles.promotedBadgeText, { color: accentColor }]}>Promoted</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
            >
              {promotedItems.map((item, i) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(i * 80).duration(400)}>
                  <Pressable style={styles.promoCard} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onItemPress(item); }}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.promoImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.promoImage, { backgroundColor: accentColor + '15', alignItems: 'center', justifyContent: 'center' }]}>
                        <Ionicons name={accentIcon as any} size={28} color={accentColor} />
                      </View>
                    )}
                    <View style={styles.promoInfo}>
                      <Text style={styles.promoName} numberOfLines={1}>{item.title}</Text>
                      {item.subtitle && <Text style={styles.promoSub} numberOfLines={1}>{item.subtitle}</Text>}
                      <View style={styles.promoBottom}>
                        {item.priceLabel && <Text style={[styles.promoPrice, { color: accentColor }]}>{item.priceLabel}</Text>}
                        {item.rating != null && (
                          <View style={styles.ratingRow}>
                            <Ionicons name="star" size={11} color="#FFB347" />
                            <Text style={styles.ratingText}>{item.rating}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionDot, { backgroundColor: accentColor }]} />
              <Text style={styles.sectionTitle}>Browse</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catRow}
            >
              {categories.map((c) => {
                const isActive = selectedCat === c.label;
                return (
                  <Pressable
                    key={c.label}
                    style={[
                      styles.catChip,
                      isActive
                        ? { backgroundColor: c.color, borderColor: c.color }
                        : { backgroundColor: Colors.surface, borderColor: Colors.borderLight },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCat(c.label);
                    }}
                  >
                    <Ionicons name={c.icon as any} size={15} color={isActive ? '#FFF' : c.color} />
                    <Text style={[styles.catText, isActive && { color: '#FFF' }]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.listSection}>
          <Text style={styles.resultCount}>
            {filtered.length} {title.toLowerCase()} found
          </Text>

          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name={emptyIcon as any} size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          ) : (
            filtered.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).duration(400)}>
                <Pressable style={styles.card} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onItemPress(item); }}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.cardImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.cardImage, { backgroundColor: accentColor + '15', alignItems: 'center', justifyContent: 'center' }]}>
                      <Ionicons name={accentIcon as any} size={24} color={accentColor} />
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardName} numberOfLines={1}>{item.title}</Text>
                      {item.isPromoted && (
                        <View style={[styles.miniPromoBadge, { backgroundColor: accentColor + '15' }]}>
                          <Ionicons name="star" size={8} color={accentColor} />
                        </View>
                      )}
                    </View>
                    {item.subtitle && <Text style={styles.cardSub} numberOfLines={1}>{item.subtitle}</Text>}
                    {item.description && <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>}
                    <View style={styles.cardBottom}>
                      {item.priceLabel && <Text style={[styles.cardPrice, { color: accentColor }]}>{item.priceLabel}</Text>}
                      {item.badge && (
                        <View style={[styles.cardBadge, { backgroundColor: accentColor + '12' }]}>
                          <Text style={[styles.cardBadgeText, { color: accentColor }]}>{item.badge}</Text>
                        </View>
                      )}
                      {item.rating != null && (
                        <View style={styles.ratingRow}>
                          <Ionicons name="star" size={12} color="#FFB347" />
                          <Text style={styles.ratingText}>{item.rating}{item.reviews ? ` (${item.reviews})` : ''}</Text>
                        </View>
                      )}
                      {item.meta && <Text style={styles.cardMeta}>{item.meta}</Text>}
                    </View>
                    {renderItemExtra?.(item)}
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Header({ title, accentColor, accentIcon }: { title: string; accentColor: string; accentIcon: string }) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/'); }}
        style={styles.backBtn}
        hitSlop={10}
      >
        <Ionicons name="chevron-back" size={22} color={Colors.text} />
      </Pressable>
      <View style={styles.headerCenter}>
        <View style={[styles.headerIcon, { backgroundColor: accentColor + '15' }]}>
          <Ionicons name={accentIcon as any} size={16} color={accentColor} />
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <Pressable
        style={styles.backBtn}
        hitSlop={10}
        onPress={() => router.push('/search')}
      >
        <Ionicons name="search-outline" size={20} color={Colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionDot: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    flex: 1,
  },
  promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  promotedBadgeText: {
    fontSize: 10,
    fontFamily: 'Poppins_600SemiBold',
  },
  promoCard: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  promoImage: {
    width: '100%',
    height: 120,
  },
  promoInfo: {
    padding: 12,
    gap: 3,
  },
  promoName: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  promoSub: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  promoBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  promoPrice: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  catRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 6,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
  },
  catText: {
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  listSection: {
    paddingHorizontal: 20,
  },
  resultCount: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textTertiary,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 14,
    overflow: 'hidden',
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardName: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    flex: 1,
  },
  miniPromoBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSub: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  cardPrice: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
  },
  cardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardBadgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
  },
  cardMeta: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
});
