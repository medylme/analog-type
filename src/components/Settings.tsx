import { Component } from "solid-js";
import { useTyping } from "../context/TypingContext";
import SliderHandle from "./SliderHandle";
import Tooltip from "./Tooltip";

export type TestMode = "time" | "words";
export type TimeOption = 15 | 30 | 60 | 120;
export type WordCountOption = 10 | 25 | 50 | 100;

export interface TestSettings {
  mode: TestMode;
  timeSeconds?: TimeOption;
  wordCount?: WordCountOption;
  targetBracket?: { enabled: boolean; min: number; max: number };
}

const Settings: Component = () => {
  const timeOptions: TimeOption[] = [15, 30, 60, 120];
  const wordCountOptions: WordCountOption[] = [10, 25, 50, 100];
  const { settings, updateSettings } = useTyping();

  const handleMinChange = (newMin: number) => {
    // Ensure min doesn't go below 0.01 and doesn't go above max
    const currentMax = settings().targetBracket?.max || 1;
    newMin = Math.max(0.01, Math.min(newMin, currentMax - 0.01));

    updateSettings({
      ...settings(),
      targetBracket: {
        enabled: settings().targetBracket?.enabled || false,
        min: newMin,
        max: currentMax,
      },
    });
  };

  const handleMaxChange = (newMax: number) => {
    // Ensure max doesn't go below min
    const currentMin = settings().targetBracket?.min || 0;
    newMax = Math.max(newMax, currentMin + 0.01);

    updateSettings({
      ...settings(),
      targetBracket: {
        enabled: settings().targetBracket?.enabled || false,
        min: currentMin,
        max: newMax,
      },
    });
  };

  return (
    <div class="bg-stone-800 rounded-lg p-4 mb-6 text-white">
      <div class="flex flex-col md:flex-row gap-6">
        {/* Mode Selection */}
        <div class="flex-1">
          <h3 class="text-lg font-medium mb-2">Test Mode</h3>
          <div class="flex gap-2">
            <button
              class={`px-4 py-2 rounded-md ${
                settings().mode === "time"
                  ? "bg-blurple text-white"
                  : "bg-stone-700 text-stone-300"
              }`}
              onClick={() =>
                updateSettings({
                  ...settings(),
                  mode: "time",
                  timeSeconds: settings().timeSeconds || 30,
                })
              }
            >
              Time
            </button>
            <button
              class={`px-4 py-2 rounded-md ${
                settings().mode === "words"
                  ? "bg-blurple text-white"
                  : "bg-stone-700 text-stone-300"
              }`}
              onClick={() =>
                updateSettings({
                  ...settings(),
                  mode: "words",
                  wordCount: settings().wordCount || 25,
                })
              }
            >
              Words
            </button>
          </div>
        </div>

        {/* Time Selection */}
        <div
          class="flex-1 data-[visible=false]:hidden"
          data-visible={settings().mode === "time"}
        >
          <h3 class="text-lg font-medium mb-2">Time (seconds)</h3>
          <div class="flex gap-2 flex-wrap">
            {timeOptions.map((time) => (
              <button
                class={`px-4 py-2 rounded-md ${
                  settings().timeSeconds === time
                    ? "bg-blurple text-white"
                    : "bg-stone-700 text-stone-300"
                }`}
                onClick={() =>
                  updateSettings({
                    ...settings(),
                    timeSeconds: time,
                  })
                }
                disabled={settings().mode !== "time"}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Word Count Selection */}
        <div
          class="flex-1 data-[visible=false]:hidden"
          data-visible={settings().mode === "words"}
        >
          <h3 class="text-lg font-medium mb-2">Word Count</h3>
          <div class="flex gap-2 flex-wrap">
            {wordCountOptions.map((count) => (
              <button
                class={`px-4 py-2 rounded-md ${
                  settings().wordCount === count
                    ? "bg-blurple text-white"
                    : "bg-stone-700 text-stone-300"
                }`}
                onClick={() =>
                  updateSettings({
                    ...settings(),
                    wordCount: count,
                  })
                }
                disabled={settings().mode !== "words"}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Target Bracket */}
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-lg font-medium">Agony Mode</h3>
            <Tooltip
              position="bottom"
              width="300px"
              content="Only allows input within a customisable bracket. Press too far and it doesn't count!"
            >
              ?
            </Tooltip>
            <label class="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                class="sr-only peer"
                checked={settings().targetBracket?.enabled || false}
                onChange={(e) => {
                  updateSettings({
                    ...settings(),
                    targetBracket: {
                      enabled: e.target.checked,
                      min: e.target.checked ? 0.2 : 0.4,
                      max: 0.8,
                    },
                  });
                }}
              />
              <div class="relative w-9 h-5 bg-stone-700 peer-checked:bg-blurple rounded-full peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
          </div>
          <div class="py-2">
            <div class="relative h-8">
              {/* Slider track */}
              <div class="absolute w-full h-2 rounded-full top-3 bg-stone-700"></div>

              {settings().targetBracket?.enabled ? (
                <>
                  {/* Filled area between handles in bracket mode */}
                  <div
                    class="absolute h-2 rounded-full top-3 bg-blurple"
                    style={{
                      left: `${(settings().targetBracket?.min || 0) * 100}%`,
                      width: `${
                        ((settings().targetBracket?.max || 1) -
                          (settings().targetBracket?.min || 0)) *
                        100
                      }%`,
                    }}
                  ></div>

                  {/* Min handle */}
                  <SliderHandle
                    position={settings().targetBracket?.min || 0}
                    enabled={true}
                    onPositionChange={handleMinChange}
                  />

                  {/* Max handle */}
                  <SliderHandle
                    position={settings().targetBracket?.max || 1}
                    enabled={true}
                    onPositionChange={handleMaxChange}
                  />

                  {/* Bracket value indicators */}
                  <div class="flex justify-between text-xs text-stone-300 -translate-y-2">
                    <span>Min: {settings().targetBracket?.min.toFixed(2)}</span>
                    <span>Max: {settings().targetBracket?.max.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Filled area for actuation point mode */}
                  <div
                    class="absolute h-2 rounded-full top-3 bg-blurple"
                    style={{
                      width: `${(settings().targetBracket?.min || 0) * 100}%`,
                    }}
                  ></div>

                  {/* Single actuation point handle */}
                  <SliderHandle
                    position={settings().targetBracket?.min || 0}
                    enabled={true}
                    onPositionChange={(newPos) => {
                      // Enforce minimum of 0.01
                      newPos = Math.max(0.01, newPos);
                      updateSettings({
                        ...settings(),
                        targetBracket: {
                          enabled: false,
                          min: newPos,
                          max: settings().targetBracket?.max || 0.7,
                        },
                      });
                    }}
                  />

                  {/* Actuation point value indicator */}
                  <div class="flex justify-center text-xs text-stone-300">
                    <span>
                      Actuation: {settings().targetBracket?.min.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
