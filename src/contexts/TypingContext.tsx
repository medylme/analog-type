import {
  createContext,
  createSignal,
  createEffect,
  useContext,
  JSX,
  onCleanup,
} from "solid-js";

import wordService from "@/services/WordService";
import challengeService from "@/services/ChallengeService";
import { TypingMetrics } from "@/types/components/MetricsTypes";
import {
  RunningSettings,
  InitialSettings,
} from "@/types/context/TypingContextTypes";

interface TypingContextType {
  // Settings
  initialSettings: () => InitialSettings;
  updateInitialSettings: (newSettings: InitialSettings) => void;

  // Display settings
  runningSettings: () => RunningSettings;
  updateRunningSettings: (newDisplaySettings: RunningSettings) => void;

  // Text
  typingText: () => string;

  // Test state
  isTestActive: () => boolean;
  isTestComplete: () => boolean;

  // Metrics
  metrics: () => TypingMetrics;
  updateMetrics: (metrics: TypingMetrics) => void;

  // Timer
  remainingTime: () => number | null;
  startTime: () => number | null;
  setRemainingTime: (time: number | null) => void;
  setStartTime: (time: number | null) => void;

  // Challenge mode
  randomizeBracket: () => void;

  // Methods
  resetTest: () => void;
  completeTest: () => void;
  startCountdown: () => void;
  clearCountdown: () => void;
}

const TypingContext = createContext<TypingContextType>({} as TypingContextType);

export function TypingProvider(props: { children: JSX.Element }) {
  // Resets the test when modified
  const [initialSettings, setInitialSettings] = createSignal<InitialSettings>({
    mode: "time",
    timeSeconds: 30,
    wordCount: 25,
    targetBracket: { enabled: false, min: 0.4, max: 0.8 },
    challengeType: "static",
    difficultyLevel: "normal",
  });
  // Doesn't reset the test when modified
  const [runningSettings, setRunningSettings] = createSignal<RunningSettings>({
    targetBracket: {
      min: initialSettings().targetBracket?.min ?? 0.4,
      max: initialSettings().targetBracket?.max ?? 0.8,
    },
  });
  // Metrics
  const [metrics, setMetrics] = createSignal<TypingMetrics>({
    score: 0,
    wpm: 0,
    rawWpm: 0,
    cpm: 0,
    accuracy: 0,
  });

  const [typingText, setTypingText] = createSignal("");

  const [isTestActive, setIsTestActive] = createSignal(false);
  const [isTestComplete, setIsTestComplete] = createSignal(false);

  const [startTime, setStartTime] = createSignal<number | null>(null);
  const [remainingTime, setRemainingTime] = createSignal<number | null>(null);
  let countdownTimer: NodeJS.Timeout;

  // Randomize bracket settings based on challenge settings
  const randomizeBracket = () => {
    const settings = initialSettings();

    // Only apply randomization if in challenge mode
    if (settings.challengeType !== "challenge") return;

    const isAgonyMode = settings.targetBracket?.enabled || false;
    const currentMin = settings.targetBracket?.min || 0.2;
    const currentMax = settings.targetBracket?.max || 0.8;
    const difficulty = settings.difficultyLevel || "normal";

    const newBracket = challengeService.randomizeBracket(
      isAgonyMode,
      difficulty,
      currentMin,
      currentMax
    );

    if (!isTestActive()) {
      setInitialSettings({
        ...initialSettings(),
        targetBracket: {
          ...initialSettings().targetBracket,
          min: newBracket.min,
          max: newBracket.max,
        },
      });
    }

    setRunningSettings({
      ...runningSettings(),
      targetBracket: {
        min: newBracket.min,
        max: newBracket.max,
      },
    });
  };

  // Start countdown timer
  const startCountdown = () => {
    clearCountdown(); // Clear any existing timer

    countdownTimer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null || prev <= 0) {
          completeTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clear countdown timer
  const clearCountdown = () => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
  };

  // Complete test
  const completeTest = () => {
    clearCountdown();
    setIsTestComplete(true);
    setIsTestActive(false);
  };

  // Update settings
  const updateInitialSettings = (newSettings: InitialSettings) => {
    // Ensure min is at least 0.01
    if (newSettings.targetBracket) {
      newSettings.targetBracket.min = Math.max(
        0.01,
        newSettings.targetBracket.min
      );
    }

    setInitialSettings(newSettings);
    resetTest();
  };

  // Reset test
  const resetTest = () => {
    // Clear timers
    clearCountdown();

    // Reset state
    setStartTime(null);
    setRemainingTime(null);
    setIsTestComplete(false);
    setIsTestActive(false);

    // Reset metrics
    setMetrics({
      score: 0,
      wpm: 0,
      rawWpm: 0,
      cpm: 0,
      accuracy: 0,
    });

    // Reset running settings
    setRunningSettings({
      ...runningSettings(),
      targetBracket: {
        min: initialSettings().targetBracket?.min ?? 0.2,
        max: initialSettings().targetBracket?.max ?? 0.8,
      },
    });

    // Generate new text based on current settings
    const currentSettings = initialSettings();
    if (currentSettings.mode === "time") {
      setTypingText(wordService.generateWordSet(1000));
    } else {
      setTypingText(
        wordService.generateWordSet(currentSettings.wordCount || 25)
      );
    }
  };

  // Update display settings
  const updateRunningSettings = (newDisplaySettings: RunningSettings) => {
    setRunningSettings(newDisplaySettings);
  };

  // Update metrics
  const updateMetrics = (newMetrics: TypingMetrics) => {
    setMetrics(newMetrics);
    setIsTestActive(true);
  };

  // Generate initial text based on settings
  createEffect(() => {
    const currentSettings = initialSettings();
    if (currentSettings.mode === "time") {
      setTypingText(wordService.generateWordSet(1000));
    } else {
      setTypingText(
        wordService.generateWordSet(currentSettings.wordCount || 25)
      );
    }
  });

  // Cleanup timers on unmount
  onCleanup(() => {
    clearCountdown();
  });

  const contextValue: TypingContextType = {
    // State getters
    initialSettings,
    runningSettings,
    typingText,
    isTestActive,
    isTestComplete,
    metrics,
    remainingTime,
    startTime,

    // State setters
    updateInitialSettings,
    updateRunningSettings,
    updateMetrics,
    setRemainingTime,
    setStartTime,

    // Challenge methods
    randomizeBracket,

    // Methods
    resetTest,
    completeTest,
    startCountdown,
    clearCountdown,
  };

  return (
    <TypingContext.Provider value={contextValue}>
      {props.children}
    </TypingContext.Provider>
  );
}

// Hook to use the context
export function useTyping() {
  const context = useContext(TypingContext);
  if (!context) {
    throw new Error("useTyping must be used within a TypingProvider");
  }
  return context;
}
