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
      class={`px-4 py-2 rounded-full transition-colors duration-200 ${
        local.selected
          ? "bg-blurple text-white"
          : "bg-stone-700 text-stone-300 cursor-pointer hover:bg-blurple/50"
      } ${local.class || ""}`}
      {...others}
    >
      {local.children}
    </button>
  );
};

export default Button;
