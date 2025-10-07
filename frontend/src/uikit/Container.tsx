import { splitProps, type ParentComponent } from "solid-js";

import { css, cx } from "../../styled-system/css";
import { token } from "../../styled-system/tokens";

interface ContainerProps {
  class?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  center?: boolean;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export const Container: ParentComponent<ContainerProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "maxWidth", "center", "padding", "children"]);
  const maxWidth = () => local.maxWidth || "lg";
  const padding = () => local.padding || "md";

  return (
    <div
      class={cx(
        baseStyle,
        maxWidthStyles[maxWidth()],
        local.center && centerStyle,
        paddingStyles[padding()],
        local.class,
      )}
      {...others}
    >
      {local.children}
    </div>
  );
};

const baseStyle = css({
  width: "100%",
  margin: "0 auto",
});

const centerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
});

const maxWidthStyles = {
  sm: css({ maxWidth: "640px" }),
  md: css({ maxWidth: "768px" }),
  lg: css({ maxWidth: "1024px" }),
  xl: css({ maxWidth: "1280px" }),
  full: css({ maxWidth: "100%" }),
};

const paddingStyles = {
  none: css({ padding: "0" }),
  sm: css({ padding: token("spacing.sm") }),
  md: css({ padding: token("spacing.md") }),
  lg: css({ padding: token("spacing.lg") }),
  xl: css({ padding: token("spacing.xl") }),
};
