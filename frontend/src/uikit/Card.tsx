import { splitProps, type ParentComponent } from "solid-js";

import { css, cx } from "../../styled-system/css";
import { token } from "../../styled-system/tokens";

type Padding = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
type Variant = "default" | "elevated" | "glass" | "bordered";

interface CardProps {
  class?: string;
  padding?: Padding;
  variant?: Variant;
}

export const Card: ParentComponent<CardProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "padding", "variant", "children"]);
  const padding = () => local.padding || "md";
  const variant = () => local.variant || "default";

  return (
    <div
      class={cx(baseStyle, variantStyles[variant()], paddingStyles[padding()], local.class)}
      {...others}
    >
      {local.children}
    </div>
  );
};

const baseStyle = css({
  borderRadius: token("radii.lg"),
  transition: "all 0.2s",
});

const variantStyles = {
  default: css({
    background: token("colors.surface.primary"),
    border: `1px solid ${token("colors.border.primary")}`,
    boxShadow: token("shadows.sm"),
  }),
  elevated: css({
    background: token("colors.surface.secondary"),
    border: `1px solid ${token("colors.border.primary")}`,
    boxShadow: token("shadows.md"),
  }),
  glass: css({
    background: "rgba(26, 26, 26, 0.7)",
    backdropFilter: "blur(20px)",
    border: `1px solid ${token("colors.border.primary")}`,
    boxShadow: token("shadows.lg"),
  }),
  bordered: css({
    background: "transparent",
    border: `1px solid ${token("colors.border.secondary")}`,
  }),
};

const paddingStyles = {
  none: css({ padding: "0" }),
  xs: css({ padding: token("spacing.xs") }),
  sm: css({ padding: token("spacing.sm") }),
  md: css({ padding: token("spacing.md") }),
  lg: css({ padding: token("spacing.lg") }),
  xl: css({ padding: token("spacing.xl") }),
  "2xl": css({ padding: token("spacing.2xl") }),
};
