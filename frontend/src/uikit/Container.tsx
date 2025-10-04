import { type ParentComponent, splitProps } from "solid-js";

import { css, cx } from "../../styled-system/css";

interface ContainerProps {
  class?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  center?: boolean;
}

export const Container: ParentComponent<ContainerProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "maxWidth", "center", "children"]);
  const maxWidth = () => local.maxWidth || "lg";

  return (
    <div
      class={cx(
        baseStyle,
        maxWidthStyles[maxWidth()],
        local.center && centerStyle,
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
  padding: "0 24px",
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
