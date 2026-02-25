import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  ReactNode 
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform, Alert } from 'react-native';

/**
 * CulturePassAU Sydney Saved Context v2.0
 * Events + Communities w/ haptic feedback
 * Kerala events + Sydney networking
 */

export interface SavedContextValue {
  savedEvents: string[];
  joinedCommunities: string[];
  isLoading: boolean;
  
  // Core toggles
  toggleSaveEvent: (id: string) => Promise<void>;
  toggleJoinCommunity: (id: string) => Promise<void>;
  
  // Checkers
  isEventSaved: (id: string) => boolean;
  isCommunityJoined: (id: string) => boolean;
  
  // Bulk operations
  saveMultipleEvents: (ids: string[]) => Promise<void>;
  leaveMultipleCommunities: (ids: string[]) => Promise<void>;
  
  // Utils
  savedEventsCount: number;
  joinedCommunitiesCount: number;
  clearSavedEvents: () => Promise<void>;
  clearJoinedCommunities: () => Promise<void>;
}

const SAVED_EVENTS_KEY = '@culturepassau_saved_events_v2';
const JOINED_COMMUNITIES_KEY = '@culturepassau_joined_communities_v2';
const STORAGE_VERSION = '2.0';

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Migrate from v1
  const migrateV1 = useCallback(async () => {
    try {
      const v1Events = await AsyncStorage.getItem('@culturepass_saved_events');
      const v1Communities = await AsyncStorage.getItem('@culturepass_joined_communities');
      
      if (v1Events) {
        await AsyncStorage.setItem(SAVED_EVENTS_KEY, v1Events);
        await AsyncStorage.removeItem('@culturepass_saved_events');
      }
      
      if (v1Communities) {
        await AsyncStorage.setItem(JOINED_COMMUNITIES_KEY, v1Communities);
        await AsyncStorage.removeItem('@culturepass_joined_communities');
      }
    } catch (error) {
      console.warn('Migration warning:', error);
    }
  }, []);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await migrateV1();
        
        const [eventsData, communitiesData] = await Promise.all([
          AsyncStorage.getItem(SAVED_EVENTS_KEY),
          AsyncStorage.getItem(JOINED_COMMUNITIES_KEY),
        ]);
        
        if (eventsData) {
          try {
            const events = JSON.parse(eventsData) as string[];
            setSavedEvents(events.filter(Boolean).slice(0, 500)); // Limit 500
          } catch {
            setSavedEvents([]);
          }
        }
        
        if (communitiesData) {
          try {
            const communities = JSON.parse(communitiesData) as string[];
            setJoinedCommunities(communities.filter(Boolean).slice(0, 100)); // Limit 100
          } catch {
            setJoinedCommunities([]);
          }
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [migrateV1]);

  const persistEvents = useCallback(async (events: string[]) => {
    try {
      await AsyncStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(events));
    } catch (error) {
      console.error('Events persist failed:', error);
    }
  }, []);

  const persistCommunities = useCallback(async (communities: string[]) => {
    try {
      await AsyncStorage.setItem(JOINED_COMMUNITIES_KEY, JSON.stringify(communities));
    } catch (error) {
      console.error('Communities persist failed:', error);
    }
  }, []);

  const toggleSaveEvent = useCallback(async (id: string) => {
    setSavedEvents(prev => {
      const isSaved = prev.includes(id);
      const next = isSaved 
        ? prev.filter(e => e !== id)
        : [...prev.slice(0, 499), id]; // 500 max
      
      persistEvents(next);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(
          isSaved 
            ? Haptics.ImpactFeedbackStyle.Light 
            : Haptics.ImpactFeedbackStyle.Medium
        );
      }
      
      return next;
    });
  }, [persistEvents]);

  const toggleJoinCommunity = useCallback(async (id: string) => {
    setJoinedCommunities(prev => {
      const isJoined = prev.includes(id);
      const next = isJoined 
        ? prev.filter(c => c !== id)
        : [...prev.slice(0, 99), id]; // 100 max
      
      persistCommunities(next);
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(
          isJoined 
            ? Haptics.ImpactFeedbackStyle.Light 
            : Haptics.ImpactFeedbackStyle.Medium
        );
      }
      
      return next;
    });
  }, [persistCommunities]);

  const saveMultipleEvents = useCallback(async (ids: string[]) => {
    setSavedEvents(prev => {
      const unique = [...new Set([...prev, ...ids])];
      const limited = unique.slice(0, 500);
      persistEvents(limited);
      return limited;
    });
  }, [persistEvents]);

  const leaveMultipleCommunities = useCallback(async (ids: string[]) => {
    setJoinedCommunities(prev => {
      const remaining = prev.filter(c => !ids.includes(c));
      persistCommunities(remaining);
      return remaining;
    });
  }, [persistCommunities]);

  const clearSavedEvents = useCallback(async () => {
    setSavedEvents([]);
    await AsyncStorage.removeItem(SAVED_EVENTS_KEY);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  const clearJoinedCommunities = useCallback(async () => {
    setJoinedCommunities([]);
    await AsyncStorage.removeItem(JOINED_COMMUNITIES_KEY);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  // Memoized checkers + utils
  const isEventSaved = useCallback((id: string) => savedEvents.includes(id), [savedEvents]);
  const isCommunityJoined = useCallback((id: string) => joinedCommunities.includes(id), [joinedCommunities]);
  
  const savedEventsCount = savedEvents.length;
  const joinedCommunitiesCount = joinedCommunities.length;

  const value = useMemo(() => ({
    savedEvents,
    joinedCommunities,
    isLoading,
    toggleSaveEvent,
    toggleJoinCommunity,
    saveMultipleEvents,
    leaveMultipleCommunities,
    isEventSaved,
    isCommunityJoined,
    savedEventsCount,
    joinedCommunitiesCount,
    clearSavedEvents,
    clearJoinedCommunities,
  }), [
    savedEvents, joinedCommunities, isLoading, toggleSaveEvent, 
    toggleJoinCommunity, saveMultipleEvents, leaveMultipleCommunities,
    isEventSaved, isCommunityJoined, savedEventsCount, joinedCommunitiesCount,
    clearSavedEvents, clearJoinedCommunities
  ]);

  return (
    <SavedContext.Provider value={value}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within SavedProvider');
  }
  return context;
}

// Sydney-specific hook
export function useSydneySaved() {
  const saved = useSaved();
  return {
    ...saved,
    sydneyEvents: saved.savedEvents.filter(id => id.includes('sydney')),
    sydneyCommunities: saved.joinedCommunities.filter(id => id.includes('sydney')),
  };
}

// Bulk migration utility
export const migrateSavedV1 = async () => {
  try {
    const v1Events = await AsyncStorage.getItem('@culturepass_saved_events');
    const v1Communities = await AsyncStorage.getItem('@culturepass_joined_communities');
    
    if (v1Events) {
      await AsyncStorage.setItem('@culturepassau_saved_events_v2', v1Events);
      await AsyncStorage.removeItem('@culturepass_saved_events');
    }
    
    if (v1Communities) {
      await AsyncStorage.setItem('@culturepassau_joined_communities_v2', v1Communities);
      await AsyncStorage.removeItem('@culturepass_joined_communities');
    }
    
    console.log('✅ Saved data migrated to v2');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
