export type TestMode = "time" | "words";
export type TimeOption = 15 | 30 | 60 | 120;
export type WordCountOption = 10 | 25 | 50 | 100;

export interface TestSettings {
  mode: TestMode;
  timeSeconds?: TimeOption;
  wordCount?: WordCountOption;
  targetBracket?: { enabled: boolean; min: number; max: number };
}

export interface DisplaySettings {
  targetBracket?: { min: number; max: number };
}
