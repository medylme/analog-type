import { Component, createSignal, JSX, Show } from "solid-js";
import { Transition } from "solid-transition-group";

interface TooltipProps {
  content: string | JSX.Element;
  position?: "top" | "bottom" | "left" | "right";
  children: JSX.Element;
  className?: string;
  width?: string;
}

const Tooltip: Component<TooltipProps> = (props) => {
  const [isVisible, setIsVisible] = createSignal(false);
  const position = props.position || "top";
  const width = props.width || "fit-content";

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  return (
    <div
      class={`relative inline-block ${props.className || ""}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {props.children}

      <Transition
        enterActiveClass="transition-all duration-150 ease-out"
        exitActiveClass="transition-all duration-100 ease-in"
        enterClass="opacity-0 scale-90"
        exitToClass="opacity-0 scale-90"
      >
        <Show when={isVisible()}>
          <div
            class={`
              absolute z-50 rounded-md bg-stone-900/95 p-3 text-pretty text-white shadow-lg text-sm pointer-events-none
              ${position === "top" ? "bottom-full left-1/2 -translate-x-1/2 -translate-y-2 mb-2" : ""}
              ${position === "bottom" ? "top-full left-1/2 -translate-x-1/2 translate-y-2 mt-2" : ""}
              ${position === "left" ? "right-full top-1/2 -translate-y-1/2 -translate-x-2 mr-2" : ""}
              ${position === "right" ? "left-full top-1/2 -translate-y-1/2 translate-x-2 ml-2" : ""}
            `}
            style={{ width: width }}
            role="tooltip"
            aria-live="polite"
          >
            {props.content}
            
            {/* Tooltip arrow */}
            <div 
              class={`
                absolute w-0 h-0 border-solid
                ${position === "top" ? "bottom-[-6px] left-1/2 -translate-x-1/2 border-[6px_6px_0_6px] border-[#1c1917_transparent_transparent_transparent]" : ""}
                ${position === "bottom" ? "top-[-6px] left-1/2 -translate-y-1/2 border-[0_6px_6px_6px] border-[transparent_transparent_#1c1917_transparent]" : ""}
                ${position === "left" ? "right-[-6px] top-1/2 -translate-y-1/2 border-[6px_0_6px_6px] border-[transparent_transparent_transparent_#1c1917]" : ""}
                ${position === "right" ? "left-[-6px] top-1/2 -translate-y-1/2 border-[6px_6px_6px_0] border-[transparent_#1c1917_transparent_transparent]" : ""}
              `}
            ></div>
          </div>
        </Show>
      </Transition>
    </div>
  );
};

export default Tooltip;
