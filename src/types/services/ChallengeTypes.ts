export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'agony';
export type ChallengeType = 'static' | 'challenge';

export interface BracketConfig {
  min: number;
  max: number;
}

export interface ChallengeSettings {
  actuationChangeRange: BracketConfig;
  bracketSizeRange: BracketConfig;
}
