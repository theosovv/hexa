import { type Component, splitProps } from "solid-js";

import { cx } from "../../styled-system/css";

interface SpinnerProps {
  class?: string;
  size?: "sm" | "md" | "lg";
}

export const Spinner: Component<SpinnerProps> = (props) => {
  const [local] = splitProps(props, ["class", "size"]);
  const size = () => local.size || "md";

  return <div class={cx("spinner", `spinner-${size()}`, local.class)} />;
};
