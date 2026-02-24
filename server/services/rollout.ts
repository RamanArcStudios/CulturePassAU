export type RolloutPhase = 'internal' | 'pilot' | 'half' | 'full';

export type RolloutConfig = {
  phase: RolloutPhase;
  percentage: number;
};

const phaseConfig: Record<RolloutPhase, number> = {
  internal: 10,
  pilot: 25,
  half: 50,
  full: 100,
};

function hashToPercent(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash % 100;
}

export function getRolloutConfig(): RolloutConfig {
  const phase = (process.env.ROLLOUT_PHASE as RolloutPhase) || 'internal';
  return {
    phase,
    percentage: phaseConfig[phase] ?? 10,
  };
}

export function isFeatureEnabledForUser(featureKey: string, userId = 'guest'): boolean {
  const config = getRolloutConfig();
  if (config.percentage >= 100) return true;
  const bucket = hashToPercent(`${featureKey}:${userId}`);
  return bucket < config.percentage;
}
