import { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SavedContextValue {
  savedEvents: string[];
  joinedCommunities: string[];
  toggleSaveEvent: (id: string) => void;
  toggleJoinCommunity: (id: string) => void;
  isEventSaved: (id: string) => boolean;
  isCommunityJoined: (id: string) => boolean;
}

const SAVED_EVENTS_KEY = '@culturepass_saved_events';
const JOINED_COMMUNITIES_KEY = '@culturepass_joined_communities';

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SAVED_EVENTS_KEY),
      AsyncStorage.getItem(JOINED_COMMUNITIES_KEY),
    ]).then(([events, communities]) => {
      if (events) setSavedEvents(JSON.parse(events));
      if (communities) setJoinedCommunities(JSON.parse(communities));
    });
  }, []);

  const toggleSaveEvent = useCallback((id: string) => {
    setSavedEvents(prev => {
      const next = prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id];
      AsyncStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleJoinCommunity = useCallback((id: string) => {
    setJoinedCommunities(prev => {
      const next = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      AsyncStorage.setItem(JOINED_COMMUNITIES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isEventSaved = useCallback((id: string) => savedEvents.includes(id), [savedEvents]);
  const isCommunityJoined = useCallback((id: string) => joinedCommunities.includes(id), [joinedCommunities]);

  const value = useMemo(() => ({
    savedEvents,
    joinedCommunities,
    toggleSaveEvent,
    toggleJoinCommunity,
    isEventSaved,
    isCommunityJoined,
  }), [savedEvents, joinedCommunities, toggleSaveEvent, toggleJoinCommunity, isEventSaved, isCommunityJoined]);

  return (
    <SavedContext.Provider value={value}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) throw new Error('useSaved must be used within SavedProvider');
  return context;
}
