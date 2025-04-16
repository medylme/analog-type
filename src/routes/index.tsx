import { Show } from "solid-js";
import { Transition } from "solid-transition-group";

import { useTyping } from "@/contexts/TypingContext";
import { useDevice } from "@/contexts/DeviceContext";
import { useStyling } from "@/contexts/StylingContext";

import Header from "@/components/Header";
import LandingPage from "@/components/LandingPage";
import Settings from "@/components/Settings";
import TextParagraph from "@/components/TextParagraph";
import Metrics from "@/components/Metrics";
import KeyboardVisualizer from "@/components/KeyboardVisualizer";
import Onboarding from "@/components/Onboarding";

export default function IndexPage() {
  const { isTestActive, isTestComplete, resetTest } = useTyping();
  const { isConnected } = useDevice();
  const { showKeyboardVisualizer } = useStyling();

  return (
    <div class="font-display min-h-screen bg-stone-900 py-8 select-none">
      <Show when={isConnected()}>
        <Header />
        <Onboarding />
      </Show>

      <Show when={isConnected()} fallback={<LandingPage />}>
        <div class="container mx-auto px-4 pt-6">
          {/* Settings */}
          <Settings />

          {/* Main content with transitions */}
          <div class="transition-container">
            <div class="flex w-full flex-col items-center justify-center">
              <div class="flex w-full flex-row items-center justify-center gap-16">
                {/* Keyboard Visualizer - pass the current min/max values */}
                <KeyboardVisualizer variant="single" />
                {/* Typing test */}
                <TextParagraph />
              </div>
            </div>

            {/* Keyboard Visualizer - only show if enabled in settings */}
            {showKeyboardVisualizer() && (
              <KeyboardVisualizer variant="keyboard" />
            )}

            {/* Metrics */}
            <Metrics />

            {/* Reset button */}
            <Transition
              name="reset-button"
              enterActiveClass="transition-all duration-700 ease-in-out"
              enterClass="opacity-0 transform scale-95 translate-y-10"
              enterToClass="opacity-100 transform scale-100 translate-y-0"
              exitActiveClass="transition-all duration-700 ease-in-out"
              exitClass="opacity-100 transform scale-100 translate-y-0"
              exitToClass="opacity-0 transform scale-95 translate-y-10"
              appear={true}
            >
              {(isTestActive() || isTestComplete()) && (
                <div class="mt-6 text-center">
                  <button
                    class="bg-blurple rounded-lg px-6 py-2 font-bold text-white hover:bg-blue-600"
                    onClick={resetTest}
                  >
                    {isTestComplete() ? "New Test" : "Reset"}
                  </button>
                </div>
              )}
            </Transition>
          </div>
        </div>
      </Show>
    </div>
  );
}
