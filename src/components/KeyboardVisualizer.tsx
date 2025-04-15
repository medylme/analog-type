import { Component, Show } from "solid-js";
import { useTyping } from "../context/TypingContext";
import { useKeyboard, KeyData } from "../context/KeyboardContext";
import { Transition } from "solid-transition-group";

const KeyboardVisualizer: Component<{ variant: "single" | "keyboard" }> = (
  props
) => {
  const { isTestActive, isTestComplete, settings } = useTyping();
  const { pressedKeys, keyboardLayout, getMostPressedKey } = useKeyboard();

  if (props.variant === "single") {
    return (
      <Show when={!isTestComplete()}>
        <div class="flex flex-row items-center justify-center p-4 h-20 ">
          {/* Get the most pressed key or default to 0 */}
          {(() => {
            const mostPressedKey = getMostPressedKey();
            const keyValue = mostPressedKey ? mostPressedKey.value : 0;

            const targetBracket = settings().targetBracket;

            return (
              <div class="flex items-center gap-4">
                {/* Vertical bar - inverted to show key going down */}
                <div class="h-26 w-6 bg-stone-800 rounded-full relative">
                  <div
                    class="absolute top-0 w-full bg-blurple rounded-full transition-all duration-100 ease-in-out"
                    style={{ height: `${keyValue * 100}%` }}
                  ></div>

                  {/* Key cap visual element */}
                  <div
                    class="absolute w-full bg-stone-800 rounded-full transition-all duration-100 ease-in-out z-10"
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
                    <div class="flex items-center px-2 py-1 rounded-md">
                      <div
                        class="w-0 h-0 mr-2 border-y-[6px] border-y-transparent border-r-[12px] data-[active=true]:border-r-blurple data-[incorrect=true]:border-r-red-500 border-r-stone-800"
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
                      <span class="text-xs text-white font-bold">
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
                          <span class="text-xs text-white font-bold">
                            {targetBracket.min.toFixed(2)}
                          </span>
                          <div class="w-4 h-1 bg-stone-600 rounded-full"></div>
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
                          <span class="text-xs text-white font-bold">
                            {targetBracket.max.toFixed(2)}
                          </span>
                          <div class="w-4 h-1 bg-stone-600 rounded-full"></div>
                        </div>
                      </div>

                      {/* Target bracket area */}
                      <div
                        class="absolute top-0 w-full bg-blurple/40 transition-all duration-100 ease-in-out overflow-hidden rounded-full"
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
                          <span class="text-xs text-white font-bold">
                            {targetBracket.min.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Actuation line across bar */}
                      <div
                        class="absolute w-full h-0.5 bg-blurple/50 transition-all duration-100 ease-in-out"
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
        <div class="p-6 flex flex-col items-center">
          <div class="relative w-[750px] max-w-5xl mx-auto h-[300px] rounded-lg p-4 mb-4">
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
                  class="absolute flex flex-col items-center justify-start border border-stone-600/20 rounded-sm overflow-hidden transition-all duration-75"
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
                    class="absolute top-0 left-0 right-0 bg-blurple transition-all duration-75 z-0"
                    style={{
                      height: `${keyValue * 100}%`,
                      opacity: `${keyValue * 100}%`,
                    }}
                  ></div>

                  {/* Key label centered */}
                  <div class="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <p
                      class="text-white font-medium text-sm transition-all duration-300 ease-in-out data-[active=true]:-translate-y-1.5"
                      data-active={keyValue > 0}
                    >
                      {key.name}
                    </p>

                    {/* Depth counter with opacity transition */}
                    <p
                      class="absolute text-white text-xs translate-y-2"
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
