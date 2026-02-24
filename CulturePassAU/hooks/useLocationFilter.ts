import { useMemo } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface Locatable {
  country: string;
  city: string;
}

export function useLocationFilter() {
  const { state } = useOnboarding();
  const { country, city } = state;

  const filterByLocation = useMemo(() => {
    return <T extends Locatable>(items: T[]): T[] => {
      if (!country) return items;
      const countryFiltered = items.filter(item => item.country === country);
      if (!city) return countryFiltered;
      const cityFiltered = countryFiltered.filter(item => item.city === city);
      return cityFiltered.length > 0 ? cityFiltered : countryFiltered;
    };
  }, [country, city]);

  return { filterByLocation, country, city };
}
