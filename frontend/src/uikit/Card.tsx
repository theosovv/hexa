import { splitProps, type ParentComponent } from "solid-js";

import { css, cx } from "../../styled-system/css";

interface CardProps {
  class?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "padding", "children"]);
  const padding = () => local.padding || "md";

  return (
    <div class={cx(baseStyle, paddingStyles[padding()], local.class)} {...others}>
      {local.children}
    </div>
  );
};

const baseStyle = css({
  background: "white",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
});

const paddingStyles = {
  none: css({ padding: "0" }),
  sm: css({ padding: "16px" }),
  md: css({ padding: "32px" }),
  lg: css({ padding: "48px" }),
};
