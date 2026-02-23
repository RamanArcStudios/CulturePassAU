import { View, Text, Pressable, StyleSheet, ScrollView, Platform, Linking, ActivityIndicator, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';
import type { Profile, Review } from '@/shared/schema';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

const ENTITY_COLORS: Record<string, string> = {
  community: '#E85D3A',
  organisation: '#1A7A6D',
  venue: '#9B59B6',
  business: '#F2A93B',
  council: '#3498DB',
  government: '#2C3E50',
};

const ENTITY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  community: 'people',
  organisation: 'business',
  venue: 'location',
  business: 'storefront',
  council: 'shield-checkmark',
  government: 'flag',
};

const SOCIAL_ICONS: { key: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'facebook', icon: 'logo-facebook' },
  { key: 'instagram', icon: 'logo-instagram' },
  { key: 'twitter', icon: 'logo-twitter' },
  { key: 'linkedin', icon: 'logo-linkedin' },
  { key: 'youtube', icon: 'logo-youtube' },
  { key: 'tiktok', icon: 'logo-tiktok' },
];

function formatNumber(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function timeAgo(dateStr: string | Date | null) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 2592000)}mo ago`;
}

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ['/api/profiles', id as string],
    enabled: !!id,
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: ['/api/reviews', id as string],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: topInset, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Profile not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const entityColor = ENTITY_COLORS[profile.entityType] || Colors.primary;
  const entityIcon = ENTITY_ICONS[profile.entityType] || 'person';
  const socialLinks = (profile.socialLinks || {}) as Record<string, string | undefined>;
  const activeSocials = SOCIAL_ICONS.filter(s => socialLinks[s.key]);
  const tags = (profile.tags || []) as string[];
  const locationText = [profile.address, profile.city, profile.country].filter(Boolean).join(', ');
  const hasCoordinates = profile.latitude && profile.longitude;

  const profileName = (profile.name || '').toLowerCase();
  const profileCategory = (profile.category || '').toLowerCase();
  const profileTags = (profile.tags || []) as string[];
  const profileLocation = (profile.city || profile.location || '').toLowerCase();
  const { data: allEventsData = [] } = useQuery<any[]>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      const base = getApiUrl();
      const res = await fetch(`${base}api/events`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const matchedEvents = allEventsData.filter(ev => {
    const tag = (ev.communityTag || '').toLowerCase();
    const organizer = (ev.organizer || '').toLowerCase();
    const venue = (ev.venue || '').toLowerCase();
    const nameWords = profileName.split(/\s+/).filter((w: string) => w.length > 2);
    return nameWords.some((w: string) => tag.includes(w) || organizer.includes(w)) ||
      profileTags.some((t: string) => tag.includes(t.toLowerCase()) || (ev.category || '').toLowerCase().includes(t.toLowerCase())) ||
      (profileLocation && venue.includes(profileLocation));
  });
  const upcomingEvents = matchedEvents.length > 0
    ? matchedEvents.slice(0, 4)
    : allEventsData.filter(ev => ev.isFeatured || ev.price === 0).slice(0, 4);

  const stats = [
    profile.followersCount ? { label: 'Followers', value: profile.followersCount } : null,
    profile.likesCount ? { label: 'Likes', value: profile.likesCount } : null,
    profile.membersCount ? { label: 'Members', value: profile.membersCount } : null,
    profile.reviewsCount ? { label: 'Reviews', value: profile.reviewsCount } : null,
  ].filter(Boolean) as { label: string; value: number }[];

  if (stats.length === 0) {
    stats.push({ label: 'Followers', value: 0 }, { label: 'Members', value: 0 });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { backgroundColor: entityColor, paddingTop: topInset }]}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroTopRow}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </Pressable>
            <Pressable
              style={styles.shareButton}
              onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                try {
                  await Share.share({
                    title: `${profile.name} on CulturePass`,
                    message: `Check out ${profile.name} on CulturePass!${profile.category ? ` ${profile.category}.` : ''}${profile.location ? ` ${profile.location}.` : ''} Join and connect with this ${profile.entityType}!`,
                  });
                } catch {}
              }}
            >
              <Ionicons name="share-outline" size={20} color="#FFF" />
            </Pressable>
          </View>
          <View style={styles.heroBottom}>
            <View style={styles.heroIconWrap}>
              <Ionicons name={entityIcon as any} size={36} color="#FFF" />
            </View>
            <View style={styles.heroNameRow}>
              <Text style={styles.heroTitle} numberOfLines={2}>{profile.name}</Text>
              {profile.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            {profile.culturePassId && (
              <View style={styles.cpidBadge}>
                <Ionicons name="finger-print" size={13} color="rgba(255,255,255,0.9)" />
                <Text style={styles.cpidBadgeText}>{profile.culturePassId}</Text>
              </View>
            )}
            {(profile.category || profile.location) && (
              <View style={styles.heroMetaRow}>
                {profile.category && (
                  <View style={styles.heroPill}>
                    <Ionicons name="pricetag" size={12} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroPillText}>{profile.category}</Text>
                  </View>
                )}
                {profile.location && (
                  <View style={styles.heroPill}>
                    <Ionicons name="location" size={12} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.heroPillText}>{profile.location}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {stats.length > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsRow}>
            {stats.map((stat, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statNum}>{formatNumber(stat.value)}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {activeSocials.length > 0 && (
          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.socialRow}>
            {activeSocials.map(s => (
              <Pressable
                key={s.key}
                style={[styles.socialIcon, { backgroundColor: entityColor + '15' }]}
                onPress={() => {
                  const url = socialLinks[s.key];
                  if (url) Linking.openURL(url);
                }}
              >
                <Ionicons name={s.icon as any} size={22} color={entityColor} />
              </Pressable>
            ))}
          </Animated.View>
        )}

        {(profile.description || profile.bio) && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{profile.description || profile.bio}</Text>
          </Animated.View>
        )}

        {(profile.address || profile.phone || profile.email || profile.website) && (
          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactCard}>
              {profile.address && (
                <Pressable style={styles.contactRow} onPress={() => {
                  if (hasCoordinates) {
                    Linking.openURL(`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`);
                  }
                }}>
                  <Ionicons name="location-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>{profile.address}</Text>
                  {hasCoordinates && <Ionicons name="open-outline" size={14} color={Colors.textTertiary} />}
                </Pressable>
              )}
              {profile.address && (profile.phone || profile.email || profile.website) && <View style={styles.contactDivider} />}
              {profile.phone && (
                <Pressable style={styles.contactRow} onPress={() => Linking.openURL(`tel:${profile.phone}`)}>
                  <Ionicons name="call-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>{profile.phone}</Text>
                  <Ionicons name="open-outline" size={14} color={Colors.textTertiary} />
                </Pressable>
              )}
              {profile.phone && (profile.email || profile.website) && <View style={styles.contactDivider} />}
              {profile.email && (
                <Pressable style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${profile.email}`)}>
                  <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>{profile.email}</Text>
                  <Ionicons name="open-outline" size={14} color={Colors.textTertiary} />
                </Pressable>
              )}
              {profile.email && profile.website && <View style={styles.contactDivider} />}
              {profile.website && (
                <Pressable style={styles.contactRow} onPress={() => Linking.openURL(profile.website!)}>
                  <Ionicons name="globe-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.contactText} numberOfLines={1}>{profile.website}</Text>
                  <Ionicons name="open-outline" size={14} color={Colors.textTertiary} />
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}

        {profile.openingHours && (
          <Animated.View entering={FadeInDown.delay(350).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Opening Hours</Text>
            <View style={styles.hoursCard}>
              <Ionicons name="time-outline" size={20} color={entityColor} />
              <Text style={styles.hoursText}>{profile.openingHours}</Text>
            </View>
          </Animated.View>
        )}

        {tags.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.tagsRow}>
                {tags.map((tag, i) => (
                  <View key={i} style={[styles.tagPill, { backgroundColor: entityColor + '12', borderColor: entityColor + '25' }]}>
                    <Text style={[styles.tagText, { color: entityColor }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Animated.View>
        )}

        {upcomingEvents.length > 0 && (
          <Animated.View entering={FadeInDown.delay(450).duration(500)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Upcoming Events</Text>
              <Pressable onPress={() => router.push('/(tabs)/explore')}>
                <Text style={[styles.seeAllText, { color: entityColor }]}>See All</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {upcomingEvents.map((ev) => (
                <Pressable
                  key={ev.id}
                  style={styles.eventCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/event/[id]', params: { id: ev.id } });
                  }}
                >
                  <View style={[styles.eventImagePlaceholder, { backgroundColor: ev.imageColor }]}>
                    <Ionicons name="calendar" size={24} color="rgba(255,255,255,0.8)" />
                    {ev.isFeatured && (
                      <View style={styles.eventFeaturedBadge}>
                        <Ionicons name="star" size={10} color={Colors.accent} />
                      </View>
                    )}
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={styles.eventTitle} numberOfLines={2}>{ev.title}</Text>
                    <View style={styles.eventMetaRow}>
                      <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
                      <Text style={styles.eventMetaText}>{ev.date}</Text>
                    </View>
                    <View style={styles.eventMetaRow}>
                      <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
                      <Text style={styles.eventMetaText} numberOfLines={1}>{ev.venue}</Text>
                    </View>
                    <View style={styles.eventBottomRow}>
                      <Text style={[styles.eventPrice, { color: ev.price === 0 ? '#2ECC71' : entityColor }]}>
                        {ev.priceLabel}
                      </Text>
                      <View style={styles.eventAttendeesRow}>
                        <Ionicons name="people-outline" size={11} color={Colors.textTertiary} />
                        <Text style={styles.eventAttendeesText}>{ev.attending}</Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {hasCoordinates && (
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Pressable
              style={styles.mapCard}
              onPress={() => Linking.openURL(`https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`)}
            >
              <View style={[styles.mapIconWrap, { backgroundColor: entityColor + '15' }]}>
                <Ionicons name="map" size={28} color={entityColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mapTitle}>View on Google Maps</Text>
                <Text style={styles.mapAddress} numberOfLines={2}>{locationText || profile.location || 'View location'}</Text>
              </View>
              <Ionicons name="navigate" size={20} color={entityColor} />
            </Pressable>
          </Animated.View>
        )}

        {reviews && reviews.length > 0 && (
          <Animated.View entering={FadeInDown.delay(500).duration(500)} style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            {reviews.slice(0, 5).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Ionicons name="person" size={16} color={Colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewerName}>{review.userName || 'Anonymous'}</Text>
                    <View style={styles.miniStars}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Ionicons
                          key={i}
                          name={i < review.rating ? 'star' : 'star-outline'}
                          size={12}
                          color={Colors.accent}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>{timeAgo(review.createdAt)}</Text>
                </View>
                {review.comment && <Text style={styles.reviewBody}>{review.comment}</Text>}
              </View>
            ))}
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(550).duration(500)} style={styles.section}>
          <View style={styles.membersCard}>
            <View style={styles.membersInfo}>
              <Ionicons name="people" size={24} color={entityColor} />
              <View>
                <Text style={styles.membersTitle}>{formatNumber(profile.membersCount || 0)} Members</Text>
                <Text style={styles.membersSubtitle}>Join this {profile.entityType}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: bottomInset + 12 }]}>
        <Pressable
          style={[styles.likeButton, isLiked && styles.likedButton]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsLiked(!isLiked);
          }}
        >
          <Ionicons name={isLiked ? 'heart' : 'heart-outline'} size={22} color={isLiked ? Colors.error : entityColor} />
        </Pressable>
        <Pressable
          style={[styles.followButton, { backgroundColor: isFollowing ? entityColor + '12' : entityColor }, isFollowing && { borderWidth: 1, borderColor: entityColor + '30' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsFollowing(!isFollowing);
          }}
        >
          <Ionicons name={isFollowing ? 'checkmark-circle' : 'add-circle'} size={20} color={isFollowing ? entityColor : '#FFF'} />
          <Text style={[styles.followText, isFollowing && { color: entityColor }]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorText: { fontSize: 16, fontFamily: 'Poppins_500Medium', color: Colors.textSecondary },
  backLink: { fontSize: 15, fontFamily: 'Poppins_600SemiBold', color: Colors.primary, marginTop: 12 },
  hero: { height: 260 },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    padding: 16,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBottom: { gap: 6 },
  heroIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
  cpidBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 6 },
  cpidBadgeText: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: 'rgba(255,255,255,0.95)', letterSpacing: 1 },
  heroMetaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  heroPillText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.9)',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginTop: 20,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statNum: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: Colors.textSecondary,
  },
  socialRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 16,
    marginBottom: 4,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: Colors.text,
    flex: 1,
  },
  contactDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 44,
  },
  hoursCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  hoursText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
  },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  mapIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    marginBottom: 2,
  },
  mapAddress: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
  },
  miniStars: { flexDirection: 'row', gap: 1 },
  reviewDate: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
  reviewBody: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  membersCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  membersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  membersTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: Colors.text,
  },
  membersSubtitle: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  eventCard: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  eventImagePlaceholder: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventFeaturedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    padding: 10,
    gap: 4,
  },
  eventTitle: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: Colors.text,
    lineHeight: 18,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textSecondary,
  },
  eventBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  eventPrice: {
    fontSize: 13,
    fontFamily: 'Poppins_700Bold',
  },
  eventAttendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  eventAttendeesText: {
    fontSize: 10,
    fontFamily: 'Poppins_400Regular',
    color: Colors.textTertiary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  likeButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  likedButton: {
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error + '25',
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  followText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFF',
  },
});
