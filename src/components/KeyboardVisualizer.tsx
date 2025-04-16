import { Component, Show, createMemo } from "solid-js";
import { Transition } from "solid-transition-group";

import { useTyping } from "@/contexts/TypingContext";
import { useKeyboard } from "@/contexts/InputContext";
import { KeyData } from "@/types/context/InputContextTypes";

interface KeyboardVisualizerProps {
  variant: "single" | "keyboard";
}

const KeyboardVisualizer: Component<KeyboardVisualizerProps> = (props) => {
  const { isTestActive, isTestComplete, initialSettings, runningSettings } =
    useTyping();
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
              ...initialSettings().targetBracket,
              min:
                runningSettings().targetBracket?.min ??
                initialSettings().targetBracket?.min ??
                0,
              max:
                runningSettings().targetBracket?.max ??
                initialSettings().targetBracket?.max ??
                1,
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
                        class="bg-blurple/40 absolute top-0 w-full overflow-hidden transition-all duration-100 ease-in-out"
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

  // Values in rem
  const keySize = 2.8;
  const keyHeight = 2.8;
  const rowSpacing = 3.2;
  const colSpacing = 3.2;

  const getPressedKeyValue = createMemo(() => {
    const keys = pressedKeys();
    const keyMap = new Map();
    keys.forEach((key) => {
      keyMap.set(key.code, key.value);
    });

    return (code: number) => keyMap.get(code) || 0;
  });

  const KeyComponent = (props: { key: KeyData }) => {
    const keyValue = createMemo(() => getPressedKeyValue()(props.key.code));

    return (
      <div
        class="absolute flex flex-col items-center justify-start overflow-hidden rounded-sm border border-stone-600/20"
        style={{
          width: `${(props.key.width || 1) * keySize}rem`,
          height: `${keyHeight}rem`,
          left: `${props.key.col * colSpacing}rem`,
          top: `${props.key.row * rowSpacing}rem`,
          "background-color": "rgb(28, 25, 23)",
          transform: "translate3d(0, 0, 0)", // Force GPU acceleration
        }}
      >
        {/* Fill container from top to bottom - only update when value changes */}
        <div
          class="bg-blurple absolute top-0 right-0 left-0 z-0"
          style={{
            height: `${keyValue() * 100}%`,
            opacity: `${keyValue() * 100}%`,
            transition: "height 75ms ease-out, opacity 75ms ease-out",
          }}
        ></div>

        {/* Key label centered */}
        <div class="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <p
            class="text-sm font-medium text-white"
            style={{
              transform:
                keyValue() > 0 ? "translateY(-1.5px)" : "translateY(0)",
              transition: "transform 300ms ease-in-out",
            }}
          >
            {props.key.name}
          </p>

          {/* Show depth counter only when key is pressed */}
          <Show when={keyValue() > 0}>
            <p
              class="absolute text-xs text-white"
              style={{
                transform: "translateY(8px)",
                opacity: "0.9",
              }}
            >
              {keyValue().toFixed(2)}
            </p>
          </Show>
        </div>
      </div>
    );
  };

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
          <div class="relative mx-auto mb-4 h-[300px] w-[750px] max-w-5xl rounded-xl p-4 will-change-transform">
            {/* Render each key as a separate component for better performance */}
            {keyboardLayout.map((key) => (
              <KeyComponent key={key} />
            ))}
          </div>
        </div>
      </Show>
    </Transition>
  );
};

export default KeyboardVisualizer;
