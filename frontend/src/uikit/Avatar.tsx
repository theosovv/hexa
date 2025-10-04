import { Show, type Component, splitProps } from "solid-js";

import { css, cx } from "../../styled-system/css";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  class?: string;
}

export const Avatar: Component<AvatarProps> = (props) => {
  const [local] = splitProps(props, ["src", "alt", "size", "class"]);
  const size = () => local.size || "md";

  return (
    <Show
      when={local.src}
      fallback={
        <div class={cx(baseStyle, sizeStyles[size()], placeholderStyle, local.class)}>
          {local.alt?.[0]?.toUpperCase() || "?"}
        </div>
      }
    >
      <img
        src={local.src!}
        alt={local.alt || "Avatar"}
        class={cx(baseStyle, sizeStyles[size()], local.class)}
      />
    </Show>
  );
};

const baseStyle = css({
  borderRadius: "50%",
  objectFit: "cover",
});

const placeholderStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#cbd5e0",
  color: "#4a5568",
  fontWeight: "600",
});

const sizeStyles = {
  sm: css({ width: "32px", height: "32px", fontSize: "14px" }),
  md: css({ width: "48px", height: "48px", fontSize: "18px" }),
  lg: css({ width: "96px", height: "96px", fontSize: "36px" }),
  xl: css({ width: "128px", height: "128px", fontSize: "48px" }),
};
