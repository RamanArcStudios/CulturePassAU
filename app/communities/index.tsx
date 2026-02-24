import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import BrowsePage, { BrowseItem, CategoryFilter } from '@/components/BrowsePage';
import Colors from '@/constants/colors';

const communityCategories: CategoryFilter[] = [
  { label: 'All', icon: 'people', color: '#1C1C1E' },
  { label: 'diaspora', icon: 'globe', color: '#3498DB' },
  { label: 'indigenous', icon: 'leaf', color: '#2ECC71' },
  { label: 'language', icon: 'chatbubbles', color: '#9B59B6' },
  { label: 'religion', icon: 'heart', color: '#E85D3A' },
];

export default function CommunitiesScreen() {
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['/api/communities'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/communities`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const items: BrowseItem[] = useMemo(() =>
    communities.map((c: any) => ({
      id: c.id,
      title: c.name,
      subtitle: c.communityType,
      description: c.description,
      imageUrl: c.coverImage,
      isPromoted: c.isPromoted,
      meta: `${c.memberCount || 0} members`,
      communityType: c.communityType,
    })),
  [communities]);

  const promoted = useMemo(() => items.filter((i) => i.isPromoted), [items]);

  return (
    <BrowsePage
      title="Communities"
      accentColor="#9B59B6"
      accentIcon="people"
      apiEndpoint="/api/communities"
      categories={communityCategories}
      categoryKey="communityType"
      items={items}
      isLoading={isLoading}
      promotedItems={promoted}
      promotedTitle="Featured Communities"
      onItemPress={(item) => router.push({ pathname: '/community/[id]', params: { id: item.id } })}
      emptyMessage="No communities found"
      emptyIcon="people-outline"
      renderItemExtra={(item) => (
        <View style={styles.memberRow}>
          <Ionicons name="people-outline" size={13} color={Colors.textSecondary} />
          <Text style={styles.memberText}>{item.meta}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  memberText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
});
