import {
  createContext,
  createSignal,
  createEffect,
  useContext,
  JSX,
  onCleanup,
} from "solid-js";
import wordService from "../services/WordService";
import { TypingMetrics } from "../components/Metrics";
import { TestSettings } from "../components/Settings";

// Define the context type
interface TypingContextType {
  // Settings
  settings: () => TestSettings;
  updateSettings: (newSettings: TestSettings) => void;

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

  // Methods
  resetTest: () => void;
  completeTest: () => void;
  startCountdown: () => void;
  clearCountdown: () => void;
}

// Create the context with default values
const TypingContext = createContext<TypingContextType>({} as TypingContextType);

// Provider component
export function TypingProvider(props: { children: JSX.Element }) {
  // Settings state
  const [settings, setSettings] = createSignal<TestSettings>({
    mode: "time",
    timeSeconds: 30,
    wordCount: 25,
    targetBracket: { enabled: true, min: 0.2, max: 0.8 },
  });

  // Text state
  const [typingText, setTypingText] = createSignal("");

  // Test state
  const [isTestActive, setIsTestActive] = createSignal(false);
  const [isTestComplete, setIsTestComplete] = createSignal(false);

  // Timer state
  const [startTime, setStartTime] = createSignal<number | null>(null);
  const [remainingTime, setRemainingTime] = createSignal<number | null>(null);
  let countdownTimer: number;

  // Metrics state
  const [metrics, setMetrics] = createSignal<TypingMetrics>({
    wpm: 0,
    rawWpm: 0,
    cpm: 0,
    accuracy: 0,
  });

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
  const updateSettings = (newSettings: TestSettings) => {
    // Ensure min is at least 0.01
    if (newSettings.targetBracket) {
      newSettings.targetBracket.min = Math.max(
        0.01,
        newSettings.targetBracket.min
      );
    }

    setSettings(newSettings);
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
      wpm: 0,
      rawWpm: 0,
      cpm: 0,
      accuracy: 0,
    });

    // Generate new text based on current settings
    const currentSettings = settings();
    if (currentSettings.mode === "time") {
      setTypingText(wordService.generateInfiniteWordSet(200));
    } else {
      setTypingText(
        wordService.generateWordSet(currentSettings.wordCount || 25)
      );
    }
  };

  // Update metrics
  const updateMetrics = (newMetrics: TypingMetrics) => {
    setMetrics(newMetrics);
    setIsTestActive(true);
  };

  // Generate initial text based on settings
  createEffect(() => {
    const currentSettings = settings();
    if (currentSettings.mode === "time") {
      setTypingText(wordService.generateInfiniteWordSet(200));
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
    settings,
    typingText,
    isTestActive,
    isTestComplete,
    metrics,
    remainingTime,
    startTime,

    // State setters
    updateSettings,
    updateMetrics,
    setRemainingTime,
    setStartTime,

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
