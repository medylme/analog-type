import { Component } from "solid-js";
import { Transition } from "solid-transition-group";
import { Odometer } from "./Odometer";
import { useTyping } from "../context/TypingContext";

export interface TypingMetrics {
  wpm: number;
  rawWpm: number;
  cpm: number;
  accuracy: number;
}

const Metrics: Component = () => {
  const { metrics, isTestActive, isTestComplete } = useTyping();
  const isVisible = () => isTestActive() || isTestComplete();

  return (
    <div class="metrics-wrapper">
      <Transition
        name="metrics"
        enterActiveClass="transition-all duration-700 ease-in-out"
        enterClass="opacity-0 transform scale-95 translate-y-10"
        enterToClass="opacity-100 transform scale-100 translate-y-0"
        exitActiveClass="transition-all duration-700 ease-in-out"
        exitClass="opacity-100 transform scale-100 translate-y-0"
        exitToClass="opacity-0 transform scale-95 translate-y-10"
        appear={true}
      >
        {isVisible() && (
          <div class="bg-stone-800 rounded-lg p-4 mt-4 text-white">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="flex flex-col items-center">
                <span class="text-3xl font-bold text-green-400">
                  <Odometer
                    number={metrics().wpm}
                    speed={50}
                    size={30}
                    width={0.65}
                    separator={false}
                  />
                </span>
                <span class="text-xs tracking-wide text-stone-400">WPM</span>
              </div>

              <div class="flex flex-col items-center">
                <span class="text-3xl font-bold text-blue-400">
                  <Odometer
                    number={metrics().rawWpm}
                    speed={50}
                    size={30}
                    width={0.65}
                    separator={false}
                  />
                </span>
                <span class="text-xs tracking-wide text-stone-400">
                  Raw WPM
                </span>
              </div>

              <div class="flex flex-col items-center">
                <span class="text-3xl font-bold text-yellow-400">
                  <Odometer
                    number={metrics().cpm}
                    speed={50}
                    size={30}
                    width={0.65}
                    separator={false}
                  />
                </span>
                <span class="text-xs tracking-wide text-stone-400">CPM</span>
              </div>

              <div class="flex flex-col items-center">
                <span class="text-3xl font-bold text-purple-400 flex flex-row items-start gap-1">
                  <Odometer
                    number={metrics().accuracy}
                    speed={50}
                    size={30}
                    width={0.65}
                    separator={false}
                  />
                  %
                </span>
                <span class="text-xs tracking-wide text-stone-400">
                  Accuracy
                </span>
              </div>
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
};

export default Metrics;
