import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform, ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useQuery } from '@tanstack/react-query';
import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';
import { useOnboarding } from '@/contexts/OnboardingContext';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { state } = useOnboarding();

  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ['/api/events', state.country, state.city],
    queryFn: async () => {
      const base = getApiUrl();
      const params = new URLSearchParams();
      if (state.country) params.set('country', state.country);
      if (state.city) params.set('city', state.city);
      const qs = params.toString();
      const res = await fetch(`${base}api/events${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    allEvents.forEach((e: any) => dates.add(e.date));
    return dates;
  }, [allEvents]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedEvents = selectedDate ? allEvents.filter((e: any) => e.date === selectedDate) : [];

  function prevMonth() {
    Haptics.selectionAsync();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  }

  function nextMonth() {
    Haptics.selectionAsync();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + webTopInset, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Calendar</Text>
          {(currentMonth !== today.getMonth() || currentYear !== today.getFullYear()) && (
            <Pressable
              style={styles.todayBtn}
              onPress={() => {
                Haptics.selectionAsync();
                setCurrentMonth(today.getMonth());
                setCurrentYear(today.getFullYear());
                setSelectedDate(null);
              }}
            >
              <Text style={styles.todayBtnText}>Today</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Ionicons name="calendar" size={14} color={Colors.primary} />
            <Text style={styles.summaryChipText}>
              {allEvents.length} events
            </Text>
          </View>
          <View style={styles.summaryChip}>
            <Ionicons name="today" size={14} color={Colors.accent} />
            <Text style={styles.summaryChipText}>
              {eventDates.size} days with events
            </Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <Pressable onPress={prevMonth} hitSlop={12}>
              <Ionicons name="chevron-back" size={22} color={Colors.textSecondary} />
            </Pressable>
            <Text style={styles.monthText}>{MONTHS[currentMonth]} {currentYear}</Text>
            <Pressable onPress={nextMonth} hitSlop={12}>
              <Ionicons name="chevron-forward" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.dayHeaders}>
            {DAYS.map(d => (
              <Text key={d} style={styles.dayHeaderText}>{d}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, idx) => {
              if (day === null) return <View key={`empty-${idx}`} style={styles.dayCell} />;
              const dateKey = formatDateKey(currentYear, currentMonth, day);
              const hasEvent = eventDates.has(dateKey);
              const isSelected = selectedDate === dateKey;
              const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

              return (
                <Pressable
                  key={dateKey}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDate(isSelected ? null : dateKey);
                  }}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                >
                  <Text style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    isToday && !isSelected && styles.dayTextToday,
                  ]}>
                    {day}
                  </Text>
                  {hasEvent && (
                    <View style={[
                      styles.eventDot,
                      isSelected && styles.eventDotSelected,
                    ]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {selectedDate && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>
              Events on {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long' })}
            </Text>
            {selectedEvents.length === 0 ? (
              <View style={styles.noEvents}>
                <Ionicons name="calendar-outline" size={44} color={Colors.textTertiary} />
                <Text style={styles.noEventsText}>No events on this day</Text>
              </View>
            ) : (
              selectedEvents.map((event: any) => (
                <Pressable
                  key={event.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/event/[id]', params: { id: event.id } });
                  }}
                  style={styles.eventRow}
                >
                  <Image source={{ uri: event.imageUrl }} style={styles.eventRowImage} contentFit="cover" />
                  <View style={styles.eventRowInfo}>
                    <Text style={styles.eventRowTitle} numberOfLines={1}>{event.title}</Text>
                    <Text style={styles.eventRowTime}>{event.time}</Text>
                    <Text style={styles.eventRowVenue} numberOfLines={1}>{event.venue}</Text>
                  </View>
                  <View style={styles.eventRowPrice}>
                    <Text style={styles.eventRowPriceText}>
                      {event.price === 0 ? 'Free' : `$${event.price}`}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        )}

        {!selectedDate && (
          <View style={styles.eventsSection}>
            <Text style={styles.eventsSectionTitle}>Upcoming Events</Text>
            {allEvents.slice(0, 4).map((event: any) => (
              <Pressable
                key={event.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/event/[id]', params: { id: event.id } });
                }}
                style={styles.eventRow}
              >
                <Image source={{ uri: event.imageUrl }} style={styles.eventRowImage} contentFit="cover" />
                <View style={styles.eventRowInfo}>
                  <Text style={styles.eventRowTitle} numberOfLines={1}>{event.title}</Text>
                  <Text style={styles.eventRowTime}>
                    {new Date(event.date + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} {event.time}
                  </Text>
                  <Text style={styles.eventRowVenue} numberOfLines={1}>{event.venue}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 34,
    color: Colors.text,
    letterSpacing: 0.37,
  },
  todayBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
  },
  todayBtnText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: '#FFF',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  summaryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    ...Colors.shadow.small,
  },
  summaryChipText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  calendarCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 18,
    ...Colors.shadow.small,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  monthText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 17,
    color: Colors.text,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: Colors.textTertiary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
    transform: [{ scale: 1.05 }],
  },
  dayCellToday: {
    backgroundColor: Colors.primaryGlow,
  },
  dayText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: Colors.text,
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  dayTextToday: {
    color: Colors.primary,
    fontFamily: 'Poppins_600SemiBold',
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },
  eventDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  eventsSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  eventsSectionTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 22,
    color: Colors.text,
    letterSpacing: 0.35,
    marginBottom: 20,
  },
  noEvents: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  noEventsText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    gap: 14,
    ...Colors.shadow.small,
  },
  eventRowImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  eventRowInfo: {
    flex: 1,
  },
  eventRowTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    color: Colors.text,
  },
  eventRowTime: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 13,
    color: Colors.primary,
    marginTop: 3,
  },
  eventRowVenue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  eventRowPrice: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primarySoft,
  },
  eventRowPriceText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
});
