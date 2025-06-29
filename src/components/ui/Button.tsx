import { Component, JSX, splitProps } from "solid-js";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  selected?: boolean;
  children: JSX.Element;
}

const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "variant",
    "selected",
    "children",
    "class",
  ]);

  return (
    <button
      class={`rounded-full px-4 py-2 transition-colors duration-200 ${
        local.selected
          ? "bg-primary text-white transition-colors duration-200 ease-in-out"
          : "hover:bg-primary/50 cursor-pointer bg-stone-700 text-stone-300 duration-200 ease-in-out hover:transition-colors"
      } ${local.class || ""}`}
      {...others}
    >
      {local.children}
    </button>
  );
};

export default Button;
