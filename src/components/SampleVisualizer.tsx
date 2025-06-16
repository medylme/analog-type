import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

interface SampleVisualizerProps {
  min?: number;
  max?: number;
  cycleTime?: number; // Time in ms for a full animation cycle
}

const SampleVisualizer: Component<SampleVisualizerProps> = (props) => {
  const [keyValue, setKeyValue] = createSignal(0);
  const [animationFrame, setAnimationFrame] = createSignal<number | null>(null);

  // Default values
  const min = props.min ?? 0.4;
  const max = props.max ?? 0.7;
  const cycleTime = props.cycleTime ?? 4000;

  // Animation function
  const animate = (timestamp: number) => {
    // Calculate progress through the cycle (0 to 1)
    const progress = (timestamp % cycleTime) / cycleTime;

    // Define the key values at different points in the animation
    // 0-25%: 0 to min
    // 25-50%: min to max (correct zone)
    // 50-75%: max to 1.0 (too far)
    // 75-100%: 1.0 back to 0

    let value = 0;
    if (progress < 0.25) {
      // Rising from 0 to min
      value = (progress / 0.25) * min;
    } else if (progress < 0.5) {
      // Rising from min to max (correct zone)
      value = min + ((progress - 0.25) / 0.25) * (max - min);
    } else if (progress < 0.75) {
      // Rising from max to 1.0 (too far)
      value = max + ((progress - 0.5) / 0.25) * (1 - max);
    } else {
      // Falling from 1.0 back to 0
      value = 1 - (progress - 0.75) / 0.25;
    }

    setKeyValue(value);
    setAnimationFrame(requestAnimationFrame(animate));
  };

  onMount(() => {
    setAnimationFrame(requestAnimationFrame(animate));
  });

  onCleanup(() => {
    if (animationFrame()) {
      cancelAnimationFrame(animationFrame()!);
    }
  });

  return (
    <div class="flex h-20 flex-row items-center justify-center p-4">
      <div class="flex items-center gap-4">
        {/* Vertical bar - inverted to show key going down */}
        <div class="relative h-26 w-6 rounded-full bg-stone-800">
          <div
            class="bg-primary absolute top-0 w-full rounded-full transition-all duration-50 ease-in-out"
            style={{ height: `${keyValue() * 100}%` }}
          ></div>

          {/* Key cap visual element */}
          <div
            class="absolute z-10 w-full rounded-full bg-stone-800 transition-all duration-50 ease-in-out"
            style={{
              height: "0px",
              top: `${keyValue() * 100}%`,
              transform: "translateY(-2px)",
            }}
          ></div>

          {/* Triangle pointer with counter that moves with keypress */}
          <div
            class="absolute right-[-60px] flex items-center transition-all duration-50 ease-in-out"
            style={{
              top: `${keyValue() * 100}%`,
              transform: "translateY(-50%)",
            }}
          >
            <div class="flex items-center rounded-md px-2 py-1">
              <div
                class="data-[active=true]:border-r-primary mr-2 h-0 w-0 border-y-[6px] border-r-[12px] border-y-transparent border-r-stone-800 data-[incorrect=true]:border-r-red-500"
                data-active={keyValue() >= min && keyValue() <= max}
                data-incorrect={keyValue() > max}
              ></div>
              <span class="text-xs font-bold text-white">
                {keyValue().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Target bracket visualization */}
          <div class="contents">
            {/* Min line */}
            <div
              class="absolute left-[-55px] flex items-center transition-all duration-50 ease-in-out"
              style={{
                top: `${min * 100}%`,
                transform: "translateY(-50%)",
              }}
            >
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">
                  {min.toFixed(2)}
                </span>
                <div class="h-1 w-4 rounded-full bg-stone-600"></div>
              </div>
            </div>
            {/* Max line */}
            <div
              class="absolute left-[-55px] flex items-center transition-all duration-50 ease-in-out"
              style={{
                top: `${max * 100}%`,
                transform: "translateY(-50%)",
              }}
            >
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">
                  {max.toFixed(2)}
                </span>
                <div class="h-1 w-4 rounded-full bg-stone-600"></div>
              </div>
            </div>

            {/* Target bracket area */}
            <div
              class="bg-primary/40 absolute top-0 w-full overflow-hidden transition-all duration-50 ease-in-out"
              style={{
                top: `${min * 100}%`,
                height: `${(max - min) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleVisualizer;
