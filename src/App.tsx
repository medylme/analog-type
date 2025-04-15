import type { Component } from "solid-js";
import { Show, createSignal } from "solid-js";
import { Transition } from "solid-transition-group";
import TypeRacer from "./components/TypeRacer";
import Metrics from "./components/Metrics";
import Settings from "./components/Settings";
import { TypingProvider, useTyping } from "./context/TypingContext";
import { DeviceProvider, useDevice } from "./context/DeviceContext";
import { KeyboardProvider } from "./context/KeyboardContext";
import LandingPage from "./components/LandingPage";
import Header from "./components/Header";
import KeyboardVisualizer from "./components/KeyboardVisualizer";
import { MetaProvider, Title } from "@solidjs/meta";

// Create signals for min/max values at the app level to be shared
export const [currentMinValue, setCurrentMinValue] = createSignal<
  number | undefined
>(undefined);
export const [currentMaxValue, setCurrentMaxValue] = createSignal<
  number | undefined
>(undefined);

const Main: Component = () => {
  const { isTestActive, isTestComplete, resetTest } = useTyping();
  const { isConnected } = useDevice();

  return (
    <div class="font-display min-h-screen bg-stone-900 py-8 select-none">
      <Title>Analog-ony</Title>
      <Show when={isConnected()}>
        <Header />
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
                <KeyboardVisualizer
                  variant="single"
                  minValue={currentMinValue()}
                  maxValue={currentMaxValue()}
                />
                {/* Typing test */}
                <TypeRacer />
              </div>
            </div>

            {/* Keyboard Visualizer */}
            <KeyboardVisualizer variant="keyboard" />

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
};

const App: Component = () => {
  return (
    <MetaProvider>
      <DeviceProvider>
        <KeyboardProvider>
          <TypingProvider>
            <Main />
          </TypingProvider>
        </KeyboardProvider>
      </DeviceProvider>
    </MetaProvider>
  );
};

export default App;
