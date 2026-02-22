import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  isComplete: boolean;
  country: string;
  city: string;
  communities: string[];
  interests: string[];
}

interface OnboardingContextValue {
  state: OnboardingState;
  isLoading: boolean;
  setCountry: (country: string) => void;
  setCity: (city: string) => void;
  setCommunities: (communities: string[]) => void;
  setInterests: (interests: string[]) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
  updateLocation: (country: string, city: string) => Promise<void>;
}

const STORAGE_KEY = '@culturepass_onboarding';

const defaultState: OnboardingState = {
  isComplete: false,
  country: '',
  city: '',
  communities: [],
  interests: [],
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        setState(JSON.parse(data));
      }
      setIsLoading(false);
    });
  }, []);

  const setCountry = (country: string) => setState(prev => ({ ...prev, country }));
  const setCity = (city: string) => setState(prev => ({ ...prev, city }));
  const setCommunities = (communities: string[]) => setState(prev => ({ ...prev, communities }));
  const setInterests = (interests: string[]) => setState(prev => ({ ...prev, interests }));

  const completeOnboarding = async () => {
    const newState = { ...state, isComplete: true };
    setState(newState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const resetOnboarding = async () => {
    setState(defaultState);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const updateLocation = async (country: string, city: string) => {
    const newState = { ...state, country, city };
    setState(newState);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const value = useMemo(() => ({
    state,
    isLoading,
    setCountry,
    setCity,
    setCommunities,
    setInterests,
    completeOnboarding,
    resetOnboarding,
    updateLocation,
  }), [state, isLoading]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
  return context;
}
