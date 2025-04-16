import { Component, createSignal, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";

import localStorageService from "@/services/LocalStorageService";
import { useTyping } from "@/contexts/TypingContext";
import SampleVisualizer from "./SampleVisualizer";

const Onboarding: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const { updateInitialSettings, initialSettings, randomizeBracket } =
    useTyping();

  onMount(() => {
    // Check if user has completed onboarding
    if (!localStorageService.hasCompletedOnboarding()) {
      setIsOpen(true);
    }
  });

  const setBracketSettings = () => {
    updateInitialSettings({
      ...initialSettings(),
      challengeType: "challenge",
      difficultyLevel: "easy",
      targetBracket: { enabled: true, min: 0.4, max: 0.8 },
    });
    randomizeBracket();
    completeOnboarding();
  };

  const setNormalSettings = () => {
    updateInitialSettings({
      ...initialSettings(),
      targetBracket: { enabled: false, min: 0.4, max: 0.8 },
    });
    completeOnboarding();
  };

  const completeOnboarding = () => {
    localStorageService.setOnboardingCompleted();
    setIsOpen(false);
  };

  return (
    <Show when={isOpen()}>
      <Portal>
        <div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm select-none">
          <div class="mx-4 w-full max-w-2xl rounded-xl bg-stone-800 p-8 shadow-xl">
            <h2 class="mb-4 text-2xl font-bold text-white">
              Welcome to Analog-type!
            </h2>
            <p class="mb-6 text-stone-300">
              Looks like this is your first time, so I'll let you pick what kind
              of experience you want.
            </p>

            <button
              class="flex cursor-pointer flex-row items-center rounded-xl bg-stone-700 p-6 transition-colors hover:bg-stone-600"
              onClick={setBracketSettings}
            >
              <div class="flex w-1/2 flex-col text-left">
                <h3 class="mb-2 text-xl font-semibold text-white">
                  Bracket Mode
                </h3>
                <p class="text-sm text-stone-300">
                  Master the art of typing at night by maintaining your typing
                  force within a target range. Go too far and it doesn't count!
                </p>
              </div>
              <div class="flex w-1/2 flex-col items-end pr-16">
                <SampleVisualizer min={0.4} max={0.8} />
              </div>
            </button>

            <div class="mt-6 text-center">
              <button
                class="h-12 w-full cursor-pointer rounded-xl bg-stone-700 text-sm text-stone-300 transition-colors hover:bg-stone-600 hover:text-white"
                onClick={setNormalSettings}
              >
                That sounds terrible, just give me a normal typing test
              </button>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  );
};

export default Onboarding;
