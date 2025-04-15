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
    <div
      ref={handleRef}
      class="absolute w-4 h-4 bg-white rounded-full top-1 -ml-2 shadow-md translate-y-1"
      style={{
        left: `${props.position * 100}%`,
        cursor: props.enabled ? "pointer" : "not-allowed",
        opacity: props.enabled ? "1" : "0.5",
      }}
      onMouseDown={handleMouseDown}
    ></div>
  );
};

export default SliderHandle;
