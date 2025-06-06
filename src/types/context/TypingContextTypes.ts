export type TestMode = "time" | "words";
export type TimeOption = 15 | 30 | 60 | 120;
export type WordCountOption = 10 | 25 | 50 | 100;
export type ChallengeType = "static" | "challenge";
export type DifficultyLevel = "easy" | "normal" | "hard" | "agony";

export interface InitialSettings {
  mode: TestMode;
  timeSeconds?: TimeOption;
  wordCount?: WordCountOption;
  targetBracket?: { enabled: boolean; min: number; max: number };
  challengeType: ChallengeType;
  difficultyLevel: DifficultyLevel;
}

export interface RunningSettings {
  targetBracket?: { min: number; max: number };
}
