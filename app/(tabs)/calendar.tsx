import React, { useState, useMemo } from 'react';
import {
  StyleSheet, Text, View, ScrollView, Pressable, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { EVENTS, getEventsByDate } from '@/lib/data';

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

  const eventDates = useMemo(() => {
    const dates = new Set<string>();
    EVENTS.forEach(e => dates.add(e.date));
    return dates;
  }, []);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedEvents = selectedDate ? getEventsByDate(selectedDate) : [];

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

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.headerTitle}>Calendar</Text>

        <View style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <Pressable onPress={prevMonth} hitSlop={12}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.monthText}>{MONTHS[currentMonth]} {currentYear}</Text>
            <Pressable onPress={nextMonth} hitSlop={12}>
              <Ionicons name="chevron-forward" size={24} color={Colors.text} />
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
                <Ionicons name="calendar-outline" size={40} color={Colors.textTertiary} />
                <Text style={styles.noEventsText}>No events on this day</Text>
              </View>
            ) : (
              selectedEvents.map(event => (
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
                    <Text style={styles.eventRowTime}>{event.time} - {event.endTime}</Text>
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
            {EVENTS.slice(0, 4).map(event => (
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
                  <Text style={styles.eventRowVenue} numberOfLines={1}>{event.venue}, {event.city}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
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
  headerTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    color: Colors.text,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  calendarCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: Colors.text,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Poppins_500Medium',
    fontSize: 12,
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
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayCellToday: {
    backgroundColor: Colors.surfaceSecondary,
  },
  dayText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: Colors.text,
  },
  dayTextSelected: {
    color: '#fff',
  },
  dayTextToday: {
    color: Colors.primary,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 2,
  },
  eventDotSelected: {
    backgroundColor: '#fff',
  },
  eventsSection: {
    padding: 24,
  },
  eventsSectionTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  noEvents: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  noEventsText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: Colors.textTertiary,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    gap: 12,
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
    fontSize: 14,
    color: Colors.text,
  },
  eventRowTime: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  eventRowVenue: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  eventRowPrice: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  eventRowPriceText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    color: Colors.primary,
  },
});
