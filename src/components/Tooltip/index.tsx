import { Component, createSignal, JSX, Show } from "solid-js";
import { Transition } from "solid-transition-group";

import "./styles.css";

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
      class={`tooltip-container relative inline-block ${props.className || ""}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {props.children}

      <Transition
        name="tooltip"
        enterActiveClass="tooltip-enter-active"
        exitActiveClass="tooltip-exit-active"
        enterClass="tooltip-enter"
        exitToClass="tooltip-exit"
      >
        <Show when={isVisible()}>
          <div
            class={`tooltip tooltip-${position} absolute z-50 rounded-md bg-stone-900/95 p-3 text-pretty text-white shadow-lg text-sm`}
            style={{ width: width }}
            role="tooltip"
            aria-live="polite"
          >
            {props.content}
            <div class={`tooltip-arrow tooltip-arrow-${position}`}></div>
          </div>
        </Show>
      </Transition>
    </div>
  );
};

export default Tooltip;
