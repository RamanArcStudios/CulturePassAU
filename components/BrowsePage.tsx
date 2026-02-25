import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControlProps,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors from '@/constants/colors';
import { FilterChipRow, FilterItem } from '@/components/FilterChip';

export interface CategoryFilter {
  label: string;
  icon: string;
  color: string;
  count?: number;
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
  refreshControl?: React.ReactElement<RefreshControlProps>;
  error?: string | null;
  onRefresh?: () => void;
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
  emptyMessage = 'Nothing found yet',
  emptyIcon = 'search-outline',
  refreshControl,
  error,
  onRefresh,
}: BrowsePageProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const [selectedCat, setSelectedCat] = React.useState('All');

  const filteredItems = useMemo(() => {
    if (selectedCat === 'All') return items;
    return items.filter((item) => {
      const val = item[categoryKey];
      if (Array.isArray(val)) return val.includes(selectedCat);
      return val === selectedCat;
    });
  }, [selectedCat, items, categoryKey]);

  const handleBack = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [navigation]);

  const handleSearch = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/search');
  }, []);

  const handleRefresh = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onRefresh?.();
  }, [onRefresh]);

  if (isLoading && items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]}>
        <Header 
          title={title} 
          accentColor={accentColor} 
          accentIcon={accentIcon}
          onBack={handleBack}
          onSearch={handleSearch}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <Header 
        title={title} 
        accentColor={accentColor} 
        accentIcon={accentIcon}
        onBack={handleBack}
        onSearch={handleSearch}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomInset + 100 }}
        refreshControl={refreshControl || (
          <RefreshControl
            tintColor={accentColor}
            refreshing={false}
            onRefresh={handleRefresh}
          />
        )}
      >
        {/* Promoted Section */}
        {promotedItems.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIndicator, { backgroundColor: accentColor }]} />
              <Text style={styles.sectionTitle}>{promotedTitle}</Text>
              <View style={[styles.promotedBadge, { backgroundColor: accentColor + '1A' }]}>
                <Ionicons name="sparkles" size={12} color={accentColor} />
                <Text style={[styles.badgeText, { color: accentColor }]}>Promoted</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promoScroll}
              nestedScrollEnabled
            >
              {promotedItems.map((item, i) => (
                <Animated.View 
                  key={item.id} 
                  entering={FadeInDown.delay(i * 100).duration(500)}
                >
                  <Pressable 
                    style={styles.promoCard}
                    onPress={() => {
                      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      onItemPress(item);
                    }}
                    android_ripple={{ color: 'rgba(255,255,255,0.2)', radius: 28 }}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.promoImage}
                      contentFit="cover"
                      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                      transition={300}
                    />
                    <View style={styles.promoContent}>
                      <Text style={styles.promoTitle} numberOfLines={1}>{item.title}</Text>
                      {item.subtitle && <Text style={styles.promoSubtitle} numberOfLines={1}>{item.subtitle}</Text>}
                      <View style={styles.promoFooter}>
                        {item.priceLabel && (
                          <Text style={[styles.promoPrice, { color: accentColor }]}>{item.priceLabel}</Text>
                        )}
                        {item.rating != null && (
                          <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.ratingValue}>{item.rating}</Text>
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

        {/* Filter Chips */}
        {categories.length > 0 && (
          <FilterChipRow
            items={useMemo(() => categories.map((cat) => {
              const count = cat.label === 'All' 
                ? items.length 
                : items.filter(item => {
                    const val = item[categoryKey];
                    return Array.isArray(val) ? val.includes(cat.label) : val === cat.label;
                  }).length;
              return {
                id: cat.label,
                label: cat.label,
                icon: cat.icon,
                color: cat.color,
                count,
              } as FilterItem;
            }), [categories, items, categoryKey])}
            selectedId={selectedCat}
            onSelect={setSelectedCat}
          />
        )}

        {/* Main List */}
        <View style={styles.mainList}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={20} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={handleRefresh} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.resultCount}>
            {filteredItems.length} {title.toLowerCase()}s found
          </Text>

          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name={emptyIcon as any} size={64} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySubtitle}>{emptyMessage}</Text>
            </View>
          ) : (
            filteredItems.map((item, index) => (
              <Animated.View 
                key={item.id} 
                entering={FadeInDown.delay(index * 60).duration(500)}
              >
                <Pressable
                  style={styles.itemCard}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onItemPress(item);
                  }}
                  android_ripple={{ color: Colors.surfaceSecondary + '66', radius: 24 }}
                >
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.itemImage}
                      contentFit="cover"
                      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                      transition={300}
                    />
                  ) : (
                    <View style={[styles.itemImage, { 
                      backgroundColor: accentColor + '15',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }]}>
                      <Ionicons name={accentIcon as any} size={32} color={accentColor} />
                    </View>
                  )}
                  
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                      {item.isPromoted && (
                        <View style={[styles.promoDot, { backgroundColor: accentColor }]}>
                          <Ionicons name="sparkles" size={12} color={accentColor} />
                        </View>
                      )}
                    </View>
                    
                    {item.subtitle && (
                      <Text style={styles.itemSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                    )}
                    
                    {item.description && (
                      <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
                    )}
                    
                    <View style={styles.itemFooter}>
                      {item.priceLabel && (
                        <Text style={[styles.itemPrice, { color: accentColor }]}>{item.priceLabel}</Text>
                      )}
                      
                      {item.badge && (
                        <View style={[styles.itemBadge, { backgroundColor: accentColor + '12' }]}>
                          <Text style={[styles.badgeTextSmall, { color: accentColor }]}>{item.badge}</Text>
                        </View>
                      )}
                      
                      {item.rating != null && (
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#FFD700" />
                          <Text style={styles.ratingValue}>{item.rating}</Text>
                          {item.reviews && item.reviews > 0 && (
                            <Text style={styles.reviewCount}> ({item.reviews})</Text>
                          )}
                        </View>
                      )}
                      
                      {item.meta && <Text style={styles.itemMeta}>{item.meta}</Text>}
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

interface HeaderProps {
  title: string;
  accentColor: string;
  accentIcon: string;
  onBack: () => void;
  onSearch: () => void;
}

function Header({ title, accentColor, accentIcon, onBack, onSearch }: HeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        style={styles.headerButton}
        hitSlop={12}
        android_ripple={{ color: Colors.surfaceSecondary + '66', radius: 24 }}
      >
        <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
      </Pressable>
      
      <View style={styles.headerCenter}>
        <View style={[styles.headerIcon, { backgroundColor: accentColor + '15' }]}>
          <Ionicons name={accentIcon as any} size={18} color={accentColor} />
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      </View>
      
      <Pressable
        onPress={onSearch}
        style={styles.headerButton}
        hitSlop={12}
        android_ripple={{ color: Colors.surfaceSecondary + '66', radius: 24 }}
      >
        <Ionicons name="search" size={22} color={Colors.textPrimary} />
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: Colors.surfacePrimary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  section: {
    marginHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  sectionIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  promotedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },

  promoScroll: {
    gap: 16,
    paddingHorizontal: 4,
  },
  promoCard: {
    width: 220,
    backgroundColor: Colors.card,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  promoImage: {
    width: '100%',
    height: 140,
  },
  promoContent: {
    padding: 16,
    gap: 4,
  },
  promoTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
  },
  promoSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  promoPrice: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
  },

  mainList: {
    paddingHorizontal: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.danger + '12',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.danger + '22',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: Colors.danger,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textInverse,
  },
  resultCount: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
    marginBottom: 16,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  itemCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 16,
    overflow: 'hidden',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  itemContent: {
    flex: 1,
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  promoDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSecondary,
  },
  itemSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontFamily: 'Poppins_700Bold',
  },
  itemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeTextSmall: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.textSecondary,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
  itemMeta: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
});
