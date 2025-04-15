import { Component, createSignal } from "solid-js";
import { useTyping } from "../context/TypingContext";
import { useStyling } from "../context/StylingContext";
import SliderHandle from "./SliderHandle";
import Tooltip from "./Tooltip";
import Button from "./Button";
import { setCurrentMinValue, setCurrentMaxValue } from "../App";

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
  const { showKeyboardVisualizer, setShowKeyboardVisualizer } = useStyling();

  // Local state for displaying values during dragging
  const [displayMin, setDisplayMin] = createSignal(
    settings().targetBracket?.min || 0
  );
  const [displayMax, setDisplayMax] = createSignal(
    settings().targetBracket?.max || 1
  );

  const handleMinChange = (newMin: number) => {
    // For display only during dragging
    const currentMax = settings().targetBracket?.max || 1;
    const minDistance = 0.1;
    newMin = Math.max(0.01, Math.min(newMin, currentMax - minDistance));
    setDisplayMin(newMin);
    // Update the app-level signal
    setCurrentMinValue(newMin);
  };

  const handleMaxChange = (newMax: number) => {
    // For display only during dragging
    const currentMin = settings().targetBracket?.min || 0;
    const minDistance = 0.1;
    newMax = Math.max(newMax, currentMin + minDistance);
    setDisplayMax(newMax);
    // Update the app-level signal
    setCurrentMaxValue(newMax);
  };

  const handleMinDragEnd = (newMin: number) => {
    // Update actual settings when drag ends
    const currentMax = settings().targetBracket?.max || 1;
    const minDistance = 0.1;
    newMin = Math.max(0.01, Math.min(newMin, currentMax - minDistance));

    updateSettings({
      ...settings(),
      targetBracket: {
        enabled: settings().targetBracket?.enabled || false,
        min: newMin,
        max: currentMax,
      },
    });

    // Reset the app-level signals when drag ends
    setCurrentMinValue(undefined);
    setCurrentMaxValue(undefined);
  };

  const handleMaxDragEnd = (newMax: number) => {
    // Update actual settings when drag ends
    const currentMin = settings().targetBracket?.min || 0;
    const minDistance = 0.1;
    newMax = Math.max(newMax, currentMin + minDistance);

    updateSettings({
      ...settings(),
      targetBracket: {
        enabled: settings().targetBracket?.enabled || false,
        min: currentMin,
        max: newMax,
      },
    });

    // Reset the app-level signals when drag ends
    setCurrentMinValue(undefined);
    setCurrentMaxValue(undefined);
  };

  // Keep local display values in sync with settings
  if (displayMin() !== settings().targetBracket?.min) {
    setDisplayMin(settings().targetBracket?.min || 0);
  }
  if (displayMax() !== settings().targetBracket?.max) {
    setDisplayMax(settings().targetBracket?.max || 1);
  }

  return (
    <div class="mb-6 rounded-lg bg-stone-800 p-4 text-white">
      <div class="flex flex-col gap-6 md:flex-row">
        {/* Mode Selection */}
        <div class="flex-1">
          <h3 class="mb-2 text-lg font-medium">Test Mode</h3>
          <div class="flex gap-2">
            <Button
              selected={settings().mode === "time"}
              onClick={() =>
                updateSettings({
                  ...settings(),
                  mode: "time",
                  timeSeconds: settings().timeSeconds || 30,
                })
              }
            >
              Time
            </Button>
            <Button
              selected={settings().mode === "words"}
              onClick={() =>
                updateSettings({
                  ...settings(),
                  mode: "words",
                  wordCount: settings().wordCount || 25,
                })
              }
            >
              Words
            </Button>
          </div>
        </div>

        {/* Time Selection */}
        <div
          class="flex-1 data-[visible=false]:hidden"
          data-visible={settings().mode === "time"}
        >
          <h3 class="mb-2 text-lg font-medium">Time (seconds)</h3>
          <div class="flex flex-wrap gap-2">
            {timeOptions.map((time) => (
              <Button
                selected={settings().timeSeconds === time}
                onClick={() =>
                  updateSettings({
                    ...settings(),
                    timeSeconds: time,
                  })
                }
                disabled={settings().mode !== "time"}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        {/* Word Count Selection */}
        <div
          class="flex-1 data-[visible=false]:hidden"
          data-visible={settings().mode === "words"}
        >
          <h3 class="mb-2 text-lg font-medium">Word Count</h3>
          <div class="flex flex-wrap gap-2">
            {wordCountOptions.map((count) => (
              <Button
                selected={settings().wordCount === count}
                onClick={() =>
                  updateSettings({
                    ...settings(),
                    wordCount: count,
                  })
                }
                disabled={settings().mode !== "words"}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        {/* Target Bracket */}
        <div class="flex-1">
          <div class="mb-2 flex items-center gap-2">
            <h3 class="text-lg font-medium">Agony Mode</h3>
            <Tooltip
              position="bottom"
              width="300px"
              content="Only allows input within a customisable bracket. Press too far and it doesn't count!"
            >
              ?
            </Tooltip>
            <label class="inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                class="peer sr-only"
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
              <div class="peer-checked:bg-blurple relative h-5 w-9 rounded-full bg-stone-700 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>

          <div class="py-2">
            <div class="relative h-8">
              {/* Slider track */}
              <div class="absolute top-3 h-2 w-full rounded-full bg-stone-700"></div>

              {settings().targetBracket?.enabled ? (
                <>
                  {/* Filled area between handles in bracket mode */}
                  <div
                    class="bg-blurple absolute top-3 h-2 rounded-full"
                    style={{
                      left: `${displayMin() * 100}%`,
                      width: `${(displayMax() - displayMin()) * 100}%`,
                    }}
                  ></div>

                  {/* Min handle */}
                  <SliderHandle
                    position={displayMin()}
                    enabled={true}
                    onPositionChange={handleMinChange}
                    onDragEnd={handleMinDragEnd}
                  />

                  {/* Max handle */}
                  <SliderHandle
                    position={displayMax()}
                    enabled={true}
                    onPositionChange={handleMaxChange}
                    onDragEnd={handleMaxDragEnd}
                  />

                  {/* Bracket value indicators */}
                  <div class="flex -translate-y-2 justify-between text-xs text-stone-300">
                    <span>Min: {displayMin().toFixed(2)}</span>
                    <span>Max: {displayMax().toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Filled area for actuation point mode */}
                  <div
                    class="bg-blurple absolute top-3 h-2 rounded-full"
                    style={{
                      width: `${displayMin() * 100}%`,
                    }}
                  ></div>

                  {/* Single actuation point handle */}
                  <SliderHandle
                    position={displayMin()}
                    enabled={true}
                    onPositionChange={(newPos) => {
                      // Enforce minimum of 0.01
                      newPos = Math.max(0.01, newPos);
                      setDisplayMin(newPos);
                      // Update the app-level signal
                      setCurrentMinValue(newPos);
                    }}
                    onDragEnd={(newPos) => {
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
                      
                      // Reset the app-level signals when drag ends
                      setCurrentMinValue(undefined);
                    }}
                  />

                  {/* Actuation point value indicator */}
                  <div class="flex justify-center text-xs text-stone-300">
                    <span>Actuation: {displayMin().toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Keyboard Visualizer Toggle */}
          <div class="mb-2 flex items-center gap-2">
            <h3 class="text-sm font-medium">Show Keyboard</h3>
            <Tooltip
              position="bottom"
              width="200px"
              content="This might come with a small performance hit."
            >
              ?
            </Tooltip>
            <label class="inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                class="peer sr-only"
                checked={showKeyboardVisualizer()}
                onChange={(e) => setShowKeyboardVisualizer(e.target.checked)}
              />
              <div class="peer-checked:bg-blurple relative h-5 w-9 rounded-full bg-stone-700 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
