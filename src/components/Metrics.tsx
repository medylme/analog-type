import { Component, createSignal, createEffect } from "solid-js";
import { Transition } from "solid-transition-group";

import { useTyping } from "@/contexts/TypingContext";
import Odometer from "@/components/ui/Odometer";

const Metrics: Component = () => {
  const {
    metrics,
    isTestActive,
    isTestComplete,
    settings,
    remainingTime,
    startTime,
  } = useTyping();
  const isVisible = () => isTestActive() || isTestComplete();
  const [elapsedTime, setElapsedTime] = createSignal<number>(0);

  // Update elapsed time every second when in words mode and test is active
  createEffect(() => {
    if (
      settings().mode === "words" &&
      startTime() !== null &&
      isTestActive() &&
      !isTestComplete()
    ) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime()) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  });

  // When test completes, set the final elapsed time
  createEffect(() => {
    if (isTestComplete() && startTime() !== null) {
      // Calculate and freeze the final elapsed time
      setElapsedTime(Math.floor((Date.now() - startTime()) / 1000));
    }
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerText = () => {
    if (settings().mode === "time" && remainingTime() !== null) {
      return `Time: ${formatTime(remainingTime())}`;
    } else if (settings().mode === "words" && startTime() !== null) {
      return `Time Elapsed: ${formatTime(elapsedTime())}`;
    }
    return "";
  };

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
          <div class="mt-4 rounded-lg bg-stone-800 p-4 text-white">
            {/* Score Component */}
            <div class="mb-4 text-center">
              <span class="text-xl font-bold">Score: {metrics().score}</span>
            </div>

            {/* Timer Component */}
            {getTimerText() && (
              <div class="mb-4 text-center">
                <span class="text-xl font-bold">{getTimerText()}</span>
              </div>
            )}

            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                <span class="flex flex-row items-start gap-1 text-3xl font-bold text-purple-400">
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
