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
 * CulturePassAU Sydney Onboarding Context v2.0
 * Kerala diaspora + Sydney community onboarding
 */

export interface OnboardingState {
  isComplete: boolean;
  country: string;
  city: string;
  communities: string[];     // Kerala cultural groups
  interests: string[];       // Events, music, networking
  notifications: boolean;    // Push preferences
  newsletter: boolean;       // Email updates
  version: string;           // Schema version
  createdAt: string;         // Onboarding timestamp
  updatedAt?: string;        // Last modification
}

interface OnboardingContextValue {
  state: OnboardingState;
  isLoading: boolean;
  
  // Core setters
  setCountry: (country: string) => void;
  setCity: (city: string) => void;
  setCommunities: (communities: string[]) => void;
  setInterests: (interests: string[]) => void;
  toggleNotifications: () => void;
  toggleNewsletter: () => void;
  
  // Actions
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  updateLocation: (country: string, city: string) => Promise<void>;
  
  // Utils
  isSydneyUser: boolean;
  isKeralaDiaspora: boolean;
  progress: number;
  canComplete: boolean;
}

const STORAGE_KEY = '@culturepassau_onboarding_v2';
const CURRENT_VERSION = '2.0';

const defaultState: OnboardingState = {
  isComplete: false,
  country: '',
  city: '',
  communities: [],
  interests: [],
  notifications: true,
  newsletter: false,
  version: CURRENT_VERSION,
  createdAt: new Date().toISOString(),
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  // Migrate from v1
  const migrateV1 = useCallback(async () => {
    try {
      const v1Key = '@culturepass_onboarding';
      const v1Data = await AsyncStorage.getItem(v1Key);
      if (v1Data) {
        const v1State = JSON.parse(v1Data) as Partial<OnboardingState>;
        const migrated: OnboardingState = {
          ...defaultState,
          ...v1State,
          notifications: true,
          newsletter: false,
          version: CURRENT_VERSION,
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        await AsyncStorage.removeItem(v1Key);
        console.log('✅ Onboarding migrated to v2');
      }
    } catch (error) {
      console.warn('Migration failed:', error);
    }
  }, []);

  // Load state
  useEffect(() => {
    const loadState = async () => {
      try {
        setIsLoading(true);
        await migrateV1();
        
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as OnboardingState;
          
          // Validate schema version
          if (parsed.version !== CURRENT_VERSION) {
            console.log('Schema mismatch, using defaults');
            setStateInternal(defaultState);
            return;
          }
          
          setStateInternal(parsed);
        }
      } catch (error) {
        console.error('Failed to load onboarding:', error);
        setStateInternal(defaultState);
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [migrateV1]);

  const persist = useCallback(async (newState: OnboardingState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.error('Persist failed:', error);
      Alert.alert('Error', 'Failed to save preferences');
    }
  }, []);

  const setState = useCallback((updates: Partial<OnboardingState>) => {
    const newState = { 
      ...state, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    setStateInternal(newState);
    persist(newState);
  }, [state, persist]);

  // Core setters
  const setCountry = useCallback((country: string) => {
    setState({ country });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [setState]);

  const setCity = useCallback((city: string) => {
    setState({ city });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [setState]);

  const setCommunities = useCallback((communities: string[]) => {
    setState({ communities });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [setState]);

  const setInterests = useCallback((interests: string[]) => {
    setState({ interests });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [setState]);

  const toggleNotifications = useCallback(() => {
    setState({ notifications: !state.notifications });
  }, [state.notifications, setState]);

  const toggleNewsletter = useCallback(() => {
    setState({ newsletter: !state.newsletter });
  }, [state.newsletter, setState]);

  // Actions
  const completeOnboarding = useCallback(async () => {
    const newState = { ...state, isComplete: true };
    setStateInternal(newState);
    await persist(newState);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [state, persist]);

  const resetOnboarding = useCallback(async () => {
    setStateInternal(defaultState);
    await AsyncStorage.removeItem(STORAGE_KEY);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  const updateLocation = useCallback(async (country: string, city: string) => {
    await setState({ country, city });
  }, [setState]);

  // Derived state
  const isSydneyUser = useMemo(() => 
    state.city.toLowerCase().includes('sydney') || 
    state.country.toLowerCase().includes('australia'),
  [state]);

  const isKeralaDiaspora = useMemo(() => 
    state.communities.some(c => 
      c.toLowerCase().includes('kerala') || 
      c.toLowerCase().includes('malayali')
    ),
  [state.communities]);

  const progress = useMemo(() => {
    const checks = [
      !!state.country,
      !!state.city,
      state.communities.length >= 1,
      state.interests.length >= 2,
    ];
    return checks.filter(Boolean).length / checks.length;
  }, [state]);

  const canComplete = useMemo(() => 
    !!state.country && !!state.city && 
    state.communities.length > 0 && 
    state.interests.length > 0,
  [state]);

  const value = useMemo(() => ({
    state,
    isLoading,
    setCountry,
    setCity,
    setCommunities,
    setInterests,
    toggleNotifications,
    toggleNewsletter,
    completeOnboarding,
    resetOnboarding,
    updateLocation,
    isSydneyUser,
    isKeralaDiaspora,
    progress,
    canComplete,
  }), [
    state, isLoading, setCountry, setCity, setCommunities, setInterests,
    toggleNotifications, toggleNewsletter, completeOnboarding, 
    resetOnboarding, updateLocation, isSydneyUser, isKeralaDiaspora,
    progress, canComplete
  ]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

// Sydney-specific hook
export function useSydneyOnboarding() {
  const onboarding = useOnboarding();
  return {
    ...onboarding,
    showSydneyWelcome: onboarding.isSydneyUser && !onboarding.state.isComplete,
  };
}

// Migration utility
export const migrateOnboardingV1 = async () => {
  try {
    const v1Key = '@culturepass_onboarding';
    const data = await AsyncStorage.getItem(v1Key);
    if (data) {
      const v1State = JSON.parse(data);
      const migrated = {
        ...defaultState,
        ...v1State,
        notifications: true,
        newsletter: false,
        version: CURRENT_VERSION,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      await AsyncStorage.removeItem(v1Key);
      console.log('✅ Onboarding v1 → v2 migration complete');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
