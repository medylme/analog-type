import { DifficultyLevel } from "@/types/context/TypingContextTypes";
import { ChallengeSettings, BracketConfig } from "@/types/services/ChallengeTypes";

class ChallengeService {
  private difficultySettings: Record<DifficultyLevel, ChallengeSettings> = {
    easy: {
      actuationChangeRange: { min: 0.1, max: 0.2 },
      bracketSizeRange: { min: 0.8, max: 0.9 }
    },
    normal: {
      actuationChangeRange: { min: 0.2, max: 0.4 },
      bracketSizeRange: { min: 0.7, max: 0.8 }
    },
    hard: {
      actuationChangeRange: { min: 0.4, max: 0.7 },
      bracketSizeRange: { min: 0.5, max: 0.6 }
    },
    agony: {
      actuationChangeRange: { min: 0.8, max: 0.9 },
      bracketSizeRange: { min: 0.2, max: 0.4 }
    }
  };

  /**
   * Randomizes the bracket configuration based on difficulty level and mode
   * @param isAgonyMode Whether the challenge is in agony mode (bracket) or normal mode (actuation point)
   * @param difficulty The selected difficulty level
   * @param currentMin Current min value
   * @param currentMax Current max value
   * @returns New bracket configuration
   */
  randomizeBracket(
    isAgonyMode: boolean,
    difficulty: DifficultyLevel,
    currentMin: number,
    currentMax: number
  ): BracketConfig {
    const settings = this.difficultySettings[difficulty];

    if (isAgonyMode) {
      // For agony mode, we randomize both min and max to create a moving bracket
      // The bracket size decreases with difficulty
      const bracketSize = this.getRandomInRange(
        settings.bracketSizeRange.min,
        settings.bracketSizeRange.max
      );

      // Calculate a new minimum position that ensures the bracket stays within 0-1 range
      const minPosition = this.getRandomInRange(
        0.1,  // Absolute minimum position
        0.9 - bracketSize  // Maximum position that ensures bracket fits
      );

      return {
        min: minPosition,
        max: minPosition + bracketSize
      };
    }

    // For normal mode, we just move the actuation point within bounds
    let newActuationPoint = this.calculateNewActuationPoint(currentMin, settings.actuationChangeRange);

    while (newActuationPoint === currentMin) {
      newActuationPoint = this.calculateNewActuationPoint(currentMin, settings.actuationChangeRange);
    }

    return {
      min: newActuationPoint,
      max: currentMax
    };

  }

  private calculateNewActuationPoint(
    current: number,
    changeRange: BracketConfig,
  ): number {
    let direction = current > 0.5 ? -1 : 1;

    const changeAmount = this.getRandomInRange(
      changeRange.min,
      changeRange.max
    );

    let newActuationPoint = current + (changeAmount * direction);

    // Additional safety check
    newActuationPoint = Math.max(0.01, Math.min(1, newActuationPoint));

    return newActuationPoint;
  }

  private getRandomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}

const challengeService = new ChallengeService();
export default challengeService;
