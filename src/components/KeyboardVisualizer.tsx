import { Component, Show } from "solid-js";
import { useTyping } from "../context/TypingContext";
import { useKeyboard, KeyData } from "../context/KeyboardContext";
import { Transition } from "solid-transition-group";

interface KeyboardVisualizerProps {
  variant: "single" | "keyboard";
  // Add optional min and max props to override settings values during dragging
  minValue?: number;
  maxValue?: number;
}

const KeyboardVisualizer: Component<KeyboardVisualizerProps> = (props) => {
  const { isTestActive, isTestComplete, settings } = useTyping();
  const { pressedKeys, keyboardLayout, getMostPressedKey } = useKeyboard();

  if (props.variant === "single") {
    return (
      <Show when={!isTestComplete()}>
        <div class="flex h-20 flex-row items-center justify-center p-4">
          {/* Get the most pressed key or default to 0 */}
          {(() => {
            const mostPressedKey = getMostPressedKey();
            const keyValue = mostPressedKey ? mostPressedKey.value : 0;

            // Get the target bracket from either props (if provided) or settings
            const targetBracket = {
              ...settings().targetBracket,
              min:
                props.minValue !== undefined
                  ? props.minValue
                  : settings().targetBracket?.min || 0,
              max:
                props.maxValue !== undefined
                  ? props.maxValue
                  : settings().targetBracket?.max || 1,
            };

            return (
              <div class="flex items-center gap-4">
                {/* Vertical bar - inverted to show key going down */}
                <div class="relative h-26 w-6 rounded-full bg-stone-800">
                  <div
                    class="bg-blurple absolute top-0 w-full rounded-full transition-all duration-100 ease-in-out"
                    style={{ height: `${keyValue * 100}%` }}
                  ></div>

                  {/* Key cap visual element */}
                  <div
                    class="absolute z-10 w-full rounded-full bg-stone-800 transition-all duration-100 ease-in-out"
                    style={{
                      height: "0px",
                      top: `${keyValue * 100}%`,
                      transform: "translateY(-2px)",
                    }}
                  ></div>

                  {/* Triangle pointer with counter that moves with keypress */}
                  <div
                    class="absolute right-[-60px] flex items-center transition-all duration-100 ease-in-out"
                    style={{
                      top: `${keyValue * 100}%`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    <div class="flex items-center rounded-md px-2 py-1">
                      <div
                        class="data-[active=true]:border-r-blurple mr-2 h-0 w-0 border-y-[6px] border-r-[12px] border-y-transparent border-r-stone-800 data-[incorrect=true]:border-r-red-500"
                        data-active={
                          targetBracket.enabled
                            ? keyValue >= targetBracket.min &&
                              keyValue <= targetBracket.max
                            : keyValue >= targetBracket.min
                        }
                        data-incorrect={
                          targetBracket.enabled && keyValue > targetBracket.max
                        }
                      ></div>
                      <span class="text-xs font-bold text-white">
                        {keyValue.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Target bracket visualization */}
                  {targetBracket.enabled ? (
                    <>
                      {/* Min line */}
                      <div
                        class="absolute left-[-55px] flex items-center transition-all duration-100 ease-in-out"
                        style={{
                          top: `${targetBracket.min * 100}%`,
                          transform: "translateY(-50%)",
                        }}
                      >
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-white">
                            {targetBracket.min.toFixed(2)}
                          </span>
                          <div class="h-1 w-4 rounded-full bg-stone-600"></div>
                        </div>
                      </div>
                      {/* Max line */}
                      <div
                        class="absolute left-[-55px] flex items-center transition-all duration-100 ease-in-out"
                        style={{
                          top: `${targetBracket.max * 100}%`,
                          transform: "translateY(-50%)",
                        }}
                      >
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-white">
                            {targetBracket.max.toFixed(2)}
                          </span>
                          <div class="h-1 w-4 rounded-full bg-stone-600"></div>
                        </div>
                      </div>

                      {/* Target bracket area */}
                      <div
                        class="bg-blurple/40 absolute top-0 w-full overflow-hidden rounded-full transition-all duration-100 ease-in-out"
                        style={{
                          top: `${targetBracket.min * 100}%`,
                          height: `${
                            (targetBracket.max - targetBracket.min) * 100
                          }%`,
                        }}
                      ></div>
                    </>
                  ) : (
                    <>
                      {/* Actuation point line */}
                      <div
                        class="absolute left-[-30px] flex items-center transition-all duration-100 ease-in-out"
                        style={{
                          top: `${targetBracket.min * 100}%`,
                          transform: "translateY(-50%)",
                        }}
                      >
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-bold text-white">
                            {targetBracket.min.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Actuation line across bar */}
                      <div
                        class="bg-blurple/50 absolute h-0.5 w-full transition-all duration-100 ease-in-out"
                        style={{
                          top: `${targetBracket.min * 100}%`,
                        }}
                      ></div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </Show>
    );
  }

  return (
    <Transition
      name="keyboard-visualizer"
      enterActiveClass="transition-all duration-500 ease-in-out"
      enterClass="opacity-0 transform translate-y-8"
      enterToClass="opacity-100 transform translate-y-0"
      exitActiveClass="transition-all duration-500 ease-in-out"
      exitClass="opacity-100 transform translate-y-0"
      exitToClass="opacity-0 transform translate-y-8"
      appear={true}
    >
      <Show when={isTestActive()}>
        <div class="flex flex-col items-center p-6">
          <div class="relative mx-auto mb-4 h-[300px] w-[750px] max-w-5xl rounded-lg p-4">
            {/* Static keyboard layout */}
            {keyboardLayout.map((key) => {
              const keySize = 2.8; // Smaller base size
              const keyHeight = 2.8; // Key height (in rem)
              const rowSpacing = 3.2; // Much larger vertical spacing
              const colSpacing = 3.2; // Fixed column spacing
              const pressedKey = getPressedKey(pressedKeys(), key.code);
              const keyValue = pressedKey ? pressedKey.value : 0;

              return (
                <div
                  class="absolute flex flex-col items-center justify-start overflow-hidden rounded-sm border border-stone-600/20 transition-all duration-75"
                  style={{
                    width: `${(key.width || 1) * keySize}rem`,
                    height: `${keyHeight}rem`,
                    left: `${key.col * colSpacing}rem`,
                    top: `${key.row * rowSpacing}rem`,
                    "background-color": "rgb(28, 25, 23)",
                  }}
                >
                  {/* Fill container from top to bottom */}
                  <div
                    class="bg-blurple absolute top-0 right-0 left-0 z-0 transition-all duration-75"
                    style={{
                      height: `${keyValue * 100}%`,
                      opacity: `${keyValue * 100}%`,
                    }}
                  ></div>

                  {/* Key label centered */}
                  <div class="absolute inset-0 z-10 flex flex-col items-center justify-center">
                    <p
                      class="text-sm font-medium text-white transition-all duration-300 ease-in-out data-[active=true]:-translate-y-1.5"
                      data-active={keyValue > 0}
                    >
                      {key.name}
                    </p>

                    {/* Depth counter with opacity transition */}
                    <p
                      class="absolute translate-y-2 text-xs text-white"
                      style={{
                        opacity: keyValue > 0 ? 0.9 : 0,
                        transition:
                          "opacity 200ms ease-in-out, transform 200ms ease-in-out",
                      }}
                    >
                      {keyValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Show>
    </Transition>
  );
};

// Helper function to get a pressed key by code
function getPressedKey(pressedKeys: KeyData[], code: number) {
  return pressedKeys.find((key) => key.code === code);
}

export default KeyboardVisualizer;
