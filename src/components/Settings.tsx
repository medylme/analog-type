import { Component, createSignal, Show, createEffect } from "solid-js";

import { useTyping } from "@/contexts/TypingContext";
import { useStyling } from "@/contexts/StylingContext";
import SliderHandle from "@/components/ui/SliderHandle";
import Tooltip from "@/components/ui/Tooltip";
import Button from "@/components/ui/Button";
import {
  TimeOption,
  WordCountOption,
  DifficultyLevel,
} from "@/types/context/TypingContextTypes";

const Settings: Component = () => {
  const timeOptions: TimeOption[] = [15, 30, 60, 120];
  const wordCountOptions: WordCountOption[] = [10, 25, 50, 100];
  const difficultyOptions: DifficultyLevel[] = [
    "easy",
    "normal",
    "hard",
    "agony",
  ];

  const {
    initialSettings,
    updateInitialSettings: updateTestSettings,
    runningSettings,
    updateRunningSettings,
    randomizeBracket,
  } = useTyping();

  const {
    showKeyboardVisualizer,
    setShowKeyboardVisualizer,
    primaryColor,
    setPrimaryColor,
  } = useStyling();

  // Update CSS variable when primary color changes
  createEffect(() => {
    document.documentElement.style.setProperty(
      "--color-primary",
      primaryColor()
    );
  });

  const displayMin = () =>
    runningSettings().targetBracket?.min ??
    initialSettings().targetBracket?.min ??
    0;
  const displayMax = () =>
    runningSettings().targetBracket?.max ??
    initialSettings().targetBracket?.max ??
    1;

  const handleMinChange = (newMin: number) => {
    const currentMax = initialSettings().targetBracket?.max || 1;
    const minDistance = 0.1;
    newMin = Math.max(0.01, Math.min(newMin, currentMax - minDistance));
    updateRunningSettings({
      ...runningSettings(),
      targetBracket: {
        ...runningSettings().targetBracket,
        min: newMin,
      },
    });
  };

  const handleMaxChange = (newMax: number) => {
    const currentMin = initialSettings().targetBracket?.min || 0;
    const minDistance = 0.1;
    newMax = Math.max(newMax, currentMin + minDistance);
    updateRunningSettings({
      ...runningSettings(),
      targetBracket: {
        ...runningSettings().targetBracket,
        max: newMax,
      },
    });
  };

  const handleMinDragEnd = (newMin: number) => {
    const currentMax = initialSettings().targetBracket?.max || 1;
    const minDistance = 0.1;
    newMin = Math.max(0.01, Math.min(newMin, currentMax - minDistance));

    updateTestSettings({
      ...initialSettings(),
      targetBracket: {
        enabled: initialSettings().targetBracket?.enabled || false,
        min: newMin,
        max: currentMax,
      },
    });

    updateRunningSettings({
      ...runningSettings(),
      targetBracket: {
        ...runningSettings().targetBracket,
        min: undefined,
        max: undefined,
      },
    });
  };

  const handleMaxDragEnd = (newMax: number) => {
    const currentMin = initialSettings().targetBracket?.min || 0;
    const minDistance = 0.1;
    newMax = Math.max(newMax, currentMin + minDistance);

    updateTestSettings({
      ...initialSettings(),
      targetBracket: {
        enabled: initialSettings().targetBracket?.enabled || false,
        min: currentMin,
        max: newMax,
      },
    });

    updateRunningSettings({
      ...runningSettings(),
      targetBracket: {
        ...runningSettings().targetBracket,
        min: undefined,
        max: undefined,
      },
    });
  };

  return (
    <div class="mb-6 flex flex-col gap-4 rounded-xl bg-stone-800 p-6 text-white">
      <div class="flex flex-row items-start gap-24">
        {/* Mode Selection */}
        <div>
          <h3 class="mb-2 text-lg font-medium">Test Mode</h3>
          <div class="flex gap-2">
            <Button
              selected={initialSettings().mode === "time"}
              onClick={() =>
                updateTestSettings({
                  ...initialSettings(),
                  mode: "time",
                  timeSeconds: initialSettings().timeSeconds || 30,
                })
              }
            >
              Time
            </Button>
            <Button
              selected={initialSettings().mode === "words"}
              onClick={() =>
                updateTestSettings({
                  ...initialSettings(),
                  mode: "words",
                  wordCount: initialSettings().wordCount || 25,
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
          data-visible={initialSettings().mode === "time"}
        >
          <h3 class="mb-2 text-lg font-medium">Time (seconds)</h3>
          <div class="flex flex-wrap gap-2">
            {timeOptions.map((time) => (
              <Button
                selected={initialSettings().timeSeconds === time}
                onClick={() =>
                  updateTestSettings({
                    ...initialSettings(),
                    timeSeconds: time,
                  })
                }
                disabled={initialSettings().mode !== "time"}
              >
                {time}
              </Button>
            ))}
          </div>
        </div>

        {/* Word Count Selection */}
        <div
          class="flex-1 data-[visible=false]:hidden"
          data-visible={initialSettings().mode === "words"}
        >
          <h3 class="mb-2 text-lg font-medium">Word Count</h3>
          <div class="flex flex-wrap gap-2">
            {wordCountOptions.map((count) => (
              <Button
                selected={initialSettings().wordCount === count}
                onClick={() =>
                  updateTestSettings({
                    ...initialSettings(),
                    wordCount: count,
                  })
                }
                disabled={initialSettings().mode !== "words"}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        <div class="flex flex-col gap-2">
          {/* Color Picker */}
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium">Primary Color</h3>
            <div class="flex items-center gap-2">
              <input
                type="color"
                class="h-8 w-8 cursor-pointer rounded-md border-0 bg-transparent p-0"
                value={primaryColor()}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
              <span class="text-sm text-stone-300">{primaryColor()}</span>
            </div>
          </div>
          {/* Keyboard Visualizer Toggle */}
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium">Show Keyboard</h3>
            <Tooltip
              position="bottom"
              width="200px"
              content="Shows a keyboard visualizer of your inputs. You can try turning this off if you're experiencing performance issues or find it distracting."
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
              <div class="peer-checked:bg-primary relative h-5 w-9 rounded-full bg-stone-700 after:absolute after:start-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>
        </div>
      </div>
      <div class="flex flex-row items-end gap-24">
        {/* Target Bracket */}
        <div class="flex flex-col gap-2">
          <div class="flex flex-row items-center gap-2">
            <h3 class="text-lg font-medium">Actuation</h3>
            <Tooltip
              position="bottom"
              width="300px"
              content={
                <>
                  <b>Point:</b> Normal typing.
                  <br /> <br />
                  <b>Bracket:</b> Maintain your typing force within a target
                  range. Go too far and it doesn't count!
                </>
              }
            >
              ?
            </Tooltip>
          </div>
          <div class="flex flex-row gap-2">
            <Button
              selected={!initialSettings().targetBracket?.enabled}
              onClick={() => {
                updateTestSettings({
                  ...initialSettings(),
                  targetBracket: {
                    enabled: false,
                    min: 0.4,
                    max: 0.8,
                  },
                });
              }}
            >
              Point
            </Button>
            <Button
              selected={initialSettings().targetBracket?.enabled}
              onClick={() => {
                updateTestSettings({
                  ...initialSettings(),
                  targetBracket: {
                    enabled: true,
                    min: 0.2,
                    max: 0.8,
                  },
                });
              }}
            >
              Bracket
            </Button>
          </div>
        </div>

        {/* Challenge Type Selection */}
        <div class="flex flex-col gap-2">
          <div class="flex flex-row items-center gap-2">
            <h3 class="text-lg font-medium">Mode</h3>
            <Tooltip
              position="bottom"
              width="300px"
              content={
                <>
                  <b>Static:</b> Settings stay fixed.
                  <br /> <br />
                  <b>Challenge:</b> Settings change as you type, with
                  difficulty-based randomization.
                </>
              }
            >
              ?
            </Tooltip>
          </div>
          <div class="flex flex-row gap-2">
            <Button
              selected={initialSettings().challengeType === "static"}
              onClick={() => {
                updateTestSettings({
                  ...initialSettings(),
                  challengeType: "static",
                });
              }}
            >
              Static
            </Button>
            <Button
              selected={initialSettings().challengeType === "challenge"}
              onClick={() => {
                updateTestSettings({
                  ...initialSettings(),
                  challengeType: "challenge",
                });
              }}
            >
              Challenge
            </Button>
          </div>
        </div>

        {/* Difficulty Level Selection - only shown in challenge mode */}
        <Show when={initialSettings().challengeType === "challenge"}>
          <div class="flex flex-col gap-2">
            <h3 class="text-lg font-medium">Difficulty</h3>
            <div class="flex flex-row gap-2">
              {difficultyOptions.map((level) => (
                <Button
                  selected={initialSettings().difficultyLevel === level}
                  onClick={() => {
                    updateTestSettings({
                      ...initialSettings(),
                      difficultyLevel: level,
                    });
                    randomizeBracket();
                  }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Show>
        {/* Only show slider controls in static mode */}
        <Show when={initialSettings().challengeType === "static"}>
          <div class="mt-10 flex w-64">
            <div class="relative h-8 w-full">
              {/* Slider track */}
              <div class="absolute top-3 h-2 w-full rounded-full bg-stone-700"></div>

              {initialSettings().targetBracket?.enabled ? (
                <>
                  {/* Filled area between handles in bracket mode */}
                  <div
                    class="bg-primary absolute top-3 h-2 rounded-full"
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
                    class="bg-primary absolute top-3 h-2 rounded-full"
                    style={{
                      width: `${displayMin() * 100}%`,
                    }}
                  ></div>

                  {/* Single actuation point handle */}
                  <SliderHandle
                    position={displayMin()}
                    enabled={true}
                    onPositionChange={(newPos) => {
                      newPos = Math.max(0.01, newPos);
                      updateRunningSettings({
                        ...runningSettings(),
                        targetBracket: {
                          ...runningSettings().targetBracket,
                          min: newPos,
                        },
                      });
                    }}
                    onDragEnd={(newPos) => {
                      newPos = Math.max(0.01, newPos);
                      updateTestSettings({
                        ...initialSettings(),
                        targetBracket: {
                          enabled: false,
                          min: newPos,
                          max: initialSettings().targetBracket?.max || 0.7,
                        },
                      });

                      updateRunningSettings({
                        ...runningSettings(),
                        targetBracket: {
                          ...runningSettings().targetBracket,
                          min: undefined,
                        },
                      });
                    }}
                  />

                  {/* Actuation point value indicator */}
                  <div class="flex -translate-y-2 justify-center text-xs text-stone-300">
                    <span>Actuation Point: {displayMin().toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Show>

        {/* Explanation of current settings */}
        <div class="rounded-md bg-stone-700 p-3 text-sm">
          <p class="mb-2 font-medium">
            {initialSettings().mode === "time" ? (
              <>Time ({initialSettings().timeSeconds}s)</>
            ) : (
              <>Words ({initialSettings().wordCount})</>
            )}
            {" - "}
            {initialSettings().targetBracket?.enabled ? "Bracket" : "Point"}
            {" - "}
            {initialSettings().challengeType === "challenge"
              ? "Challenge"
              : "Static"}
            <span
              class="data-[visible=false]:hidden"
              data-visible={initialSettings().challengeType === "challenge"}
            >
              {" "}
              (
              {initialSettings().difficultyLevel.charAt(0).toUpperCase() +
                initialSettings().difficultyLevel.slice(1)}
              ){" "}
            </span>
          </p>
          <p class="mb-2 font-medium"></p>
          <p class="text-stone-300">
            {initialSettings().challengeType === "static" ? (
              <>
                Set a custom{" "}
                {initialSettings().targetBracket?.enabled
                  ? "bracket"
                  : "actuation point"}{" "}
                yourself.
              </>
            ) : (
              <>
                {initialSettings().targetBracket?.enabled ? (
                  <>
                    {initialSettings().difficultyLevel === "easy"
                      ? "Large bracket sizes to get used to it."
                      : initialSettings().difficultyLevel === "normal"
                        ? "Moderate bracket sizes for a balanced challenge."
                        : initialSettings().difficultyLevel === "hard"
                          ? "Small bracket sizes that will test you."
                          : "Pure agony."}
                  </>
                ) : (
                  <>
                    {initialSettings().difficultyLevel === "easy"
                      ? "Smaller changes for an easier challenge."
                      : initialSettings().difficultyLevel === "normal"
                        ? "Moderate changes for a balanced challenge."
                        : initialSettings().difficultyLevel === "hard"
                          ? "Larger changes that will most likely annoy you."
                          : "Pure agony."}
                  </>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
