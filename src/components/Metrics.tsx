import { Component, createSignal, createEffect } from "solid-js";
import { Transition } from "solid-transition-group";

import { useTyping } from "@/contexts/TypingContext";
import Odometer from "@/components/ui/Odometer";

const Metrics: Component = () => {
  const {
    metrics,
    isTestActive,
    isTestComplete,
    initialSettings,
    remainingTime,
    startTime,
  } = useTyping();
  const isVisible = () => isTestActive() || isTestComplete();
  const [elapsedTime, setElapsedTime] = createSignal<number>(0);

  // Update elapsed time every second when in words mode and test is active
  createEffect(() => {
    if (
      initialSettings().mode === "words" &&
      startTime() !== null &&
      isTestActive() &&
      !isTestComplete()
    ) {
      const timer = setInterval(() => {
        if (isTestComplete()) return;
        setElapsedTime(Math.floor((Date.now() - startTime()) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimerText = () => {
    if (initialSettings().mode === "time" && remainingTime() !== null) {
      return formatTime(remainingTime());
    } else if (initialSettings().mode === "words" && startTime() !== null) {
      return formatTime(elapsedTime());
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
          <div class="mt-4 flex flex-col gap-y-4 rounded-xl bg-stone-800 p-4 text-white">
            <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div class="flex flex-col items-center">
                <span class="text-primary text-3xl font-bold">
                  <Odometer
                    number={metrics().wpm}
                    speed={100}
                    size={30}
                    width={0.65}
                    separator={false}
                  />
                </span>
                <span class="text-xs tracking-wide text-stone-400">WPM</span>
              </div>

              <div class="flex flex-col items-center">
                <span class="text-primary text-3xl font-bold">
                  <Odometer
                    number={metrics().rawWpm}
                    speed={100}
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
                <span class="text-primary text-3xl font-bold">
                  <Odometer
                    number={metrics().cpm}
                    speed={100}
                    size={30}
                    width={0.65}
                    separator={false}
                  />
                </span>
                <span class="text-xs tracking-wide text-stone-400">CPM</span>
              </div>

              <div class="flex flex-col items-center">
                <span class="text-primary flex flex-row items-start gap-1 text-3xl font-bold">
                  <Odometer
                    number={metrics().accuracy}
                    speed={100}
                    size={30}
                    width={0.65}
                    separator={false}
                  />
                  <span class="-translate-y-0.5">%</span>
                </span>
                <span class="text-xs tracking-wide text-stone-400">
                  Accuracy
                </span>
              </div>
            </div>
          </div>
        )}
      </Transition>
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
          <div class="mt-4 flex flex-col gap-y-4 rounded-xl bg-stone-800 p-4 text-white">
            <div class="flex w-full flex-row items-center justify-center gap-16">
              {initialSettings().mode === "time" && (
                <div class="flex flex-col items-center">
                  <span class="text-primary text-3xl font-bold">
                    <Odometer
                      number={metrics().score}
                      speed={100}
                      size={30}
                      width={0.65}
                      separator={false}
                    />
                  </span>
                  <span class="text-xs tracking-wide text-stone-400">
                    Score
                  </span>
                </div>
              )}

              {getTimerText() && (
                <div class="flex flex-col items-center">
                  <span class="text-primary -translate-y-1 text-3xl font-bold">
                    {getTimerText()}
                  </span>
                  <span class="text-xs tracking-wide text-stone-400">Time</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Transition>
    </div>
  );
};

export default Metrics;
