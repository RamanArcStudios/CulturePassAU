import { getApiUrl } from '@/lib/query-client';
import { fetch } from 'expo/fetch';

export type RolloutPhase = 'internal' | 'pilot' | 'half' | 'full';

export type FeatureFlagsResponse = {
  rollout: { phase: RolloutPhase; percentage: number };
  flags: Record<string, boolean>;
};

export async function fetchFeatureFlags(userId = 'guest'): Promise<FeatureFlagsResponse> {
  const base = getApiUrl();
  const res = await fetch(`${base}api/rollout/config?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) throw new Error('Unable to fetch rollout flags');
  return res.json();
}
