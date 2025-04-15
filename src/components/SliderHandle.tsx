import { Component, createSignal, onCleanup, onMount } from "solid-js";

interface SliderHandleProps {
  position: number;
  enabled: boolean;
  onPositionChange: (position: number) => void;
  onDragEnd?: (position: number) => void;
}

const SliderHandle: Component<SliderHandleProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  let handleRef: HTMLDivElement | undefined;

  const handleMouseDown = (e: MouseEvent) => {
    if (!props.enabled) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging() || !handleRef || !props.enabled) return;

    const parentRect = handleRef.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    const x = Math.max(
      0,
      Math.min(e.clientX - parentRect.left, parentRect.width)
    );
    const newPosition = x / parentRect.width;
    props.onPositionChange(newPosition);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging() && props.onDragEnd) {
      const parentRect = handleRef?.parentElement?.getBoundingClientRect();
      if (parentRect) {
        const x = Math.max(
          0,
          Math.min(e.clientX - parentRect.left, parentRect.width)
        );
        const finalPosition = x / parentRect.width;
        props.onDragEnd(finalPosition);
      }
    }
    setIsDragging(false);
  };

  onMount(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  });

  onCleanup(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  });

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
        cursor: props.enabled ? "pointer" : "not-allowed",
      }}
      onMouseDown={handleMouseDown}
    ></button>
  );
};

export default SliderHandle;
