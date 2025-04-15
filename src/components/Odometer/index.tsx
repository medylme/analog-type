import { Component, Index, createMemo, Show, mergeProps } from "solid-js";
import "./styles.css";

export type OdometerProps = {
  number: number;
  speed: number;
  size: number;
  separator?: boolean;
  width?: number;
  digits?: number;
  class?: string;
};

export const Odometer: Component<OdometerProps> = (inProps) => {
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
      class="odometer"
      classList={{
        [`${props.class}`]: !!props.class,
      }}
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
              <div class="separator">,</div>
            </Show>
            <div class="digit" style={{ width: `${props.width}em` }}>
              <div
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
