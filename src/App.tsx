import type { Component } from "solid-js";
import { Show } from "solid-js";
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
import KeyboardDebug from "./components/KeyboardDebug";
import Timer from "./components/Timer";

const TypingApp: Component = () => {
  const { isTestActive, isTestComplete, resetTest } = useTyping();
  const { isConnected } = useDevice();

  return (
    <div class="min-h-screen bg-stone-900 py-8 font-display select-none">
      <Show when={isConnected()}>
        <Header />
      </Show>

      <Show when={isConnected()} fallback={<LandingPage />}>
        <div class="container mx-auto px-4 pt-6">
          {/* Settings */}
          <Settings />

          {/* Main content with transitions */}
          <div class="transition-container">
            <div class="flex flex-col items-center justify-center w-full">
              {/* Timer */}
              <Timer />

              <div class="flex flex-row items-center justify-center w-full gap-16">
                {/* Keyboard Visualizer */}
                <KeyboardVisualizer variant="single" />
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
                    class="bg-blurple hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
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
    <DeviceProvider>
      <KeyboardProvider>
        <TypingProvider>
          <TypingApp />
        </TypingProvider>
      </KeyboardProvider>
    </DeviceProvider>
  );
};

export default App;
