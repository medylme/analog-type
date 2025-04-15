import { Component } from "solid-js";

type SliderHandleProps = {
  position: number;
  enabled: boolean;
  onPositionChange: (newPosition: number) => void;
};

const SliderHandle: Component<SliderHandleProps> = (props) => {
  return (
    <button
      type="button"
      disabled={!props.enabled}
      class={`absolute w-5 h-5 rounded-full border-2 translate-y-1.5 focus:outline-none -ml-3 ${
        props.enabled
          ? "bg-white border-blurple"
          : "bg-stone-400 border-stone-600 cursor-not-allowed"
      }`}
      style={{
        left: `${props.position * 100}%`,
      }}
      onMouseDown={(e) => {
        if (!props.enabled) return;

        const slider = e.currentTarget.parentElement;
        if (!slider) return;

        const sliderRect = slider.getBoundingClientRect();
        const sliderWidth = sliderRect.width;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const newPositionX = moveEvent.clientX - sliderRect.left;
          let newPercent = Math.max(0, Math.min(1, newPositionX / sliderWidth));

          props.onPositionChange(newPercent);
        };

        const handleMouseUp = () => {
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("mouseup", handleMouseUp);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
      }}
    ></button>
  );
};

export default SliderHandle;
