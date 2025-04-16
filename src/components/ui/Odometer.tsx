import { Component, Index, createMemo, Show, mergeProps } from "solid-js";

export type OdometerProps = {
  number: number;
  speed: number;
  size: number;
  separator?: boolean;
  width?: number;
  digits?: number;
  class?: string;
};

const Odometer: Component<OdometerProps> = (inProps) => {
  const props = mergeProps({ digits: 0, width: 0.9 }, inProps);
  const chars = createMemo(() => {
    let c = props.number.toString().split("");
    if (c.length > props.digits) {
      c = c.slice(-props.digits);
    }
    while (c.length < props.digits) c.unshift("0");
    return c;
  });

  return (
    <div
      class={`inline-block ${props.class || ""}`}
      style={{
        "font-size": `${props.size}px`,
        "line-height": `${props.size}px`,
      }}
    >
      <Index each={chars()}>
        {(digit, i) => (
          <>
            <Show
              when={
                props.separator && i !== 0 && (chars().length - i) % 3 === 0
              }
            >
              <div class="inline-block">,</div>
            </Show>
            <div
              class="inline-block overflow-hidden text-center"
              style={{
                width: `${props.width}em`,
                height: "1em",
              }}
            >
              <div
                class="[animation-iteration-count:1] [animation-timing-function:linear]"
                style={{
                  transform: `translateY(-${digit()}em)`,
                  "animation-name": `slide${digit()}`,
                  "animation-duration": `${
                    props.speed - (chars().length - i * 50)
                  }ms`,
                }}
              >
                0 1 2 3 4 5 6 7 8 9 0 ,
              </div>
            </div>
          </>
        )}
      </Index>
    </div>
  );
};

export default Odometer;
