import { InitialSettings } from "@/types/context/TypingContextTypes";

const KEYS = {
  ONBOARDING_COMPLETED: "analog-type:onboarding-completed",
  USER_PREFERENCES: "analog-type:user-preferences",
};

class LocalStorageService {
  /**
   * Check if the user has completed onboarding
   */
  hasCompletedOnboarding(): boolean {
    return localStorage.getItem(KEYS.ONBOARDING_COMPLETED) === "true";
  }

  /**
   * Mark onboarding as completed
   */
  setOnboardingCompleted(): void {
    localStorage.setItem(KEYS.ONBOARDING_COMPLETED, "true");
  }
}

const localStorageService = new LocalStorageService();
export default localStorageService; 