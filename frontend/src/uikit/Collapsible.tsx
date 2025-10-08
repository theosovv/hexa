import { createSignal, Show, type ParentComponent } from "solid-js";

import { css } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  icon?: string;
}

export const Collapsible: ParentComponent<CollapsibleProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(props.defaultOpen ?? true);

  const toggle = () => setIsOpen(!isOpen());

  return (
    <div class={containerStyle}>
      <button class={headerStyle} onClick={toggle}>
        <span class={iconStyle} classList={{ [rotatedStyle]: !isOpen() }}>
          ▼
        </span>
        {props.icon && <span class={categoryIconStyle}>{props.icon}</span>}
        <span class={titleStyle}>{props.title}</span>
      </button>

      <Show when={isOpen()}>
        <div class={contentStyle}>{props.children}</div>
      </Show>
    </div>
  );
};

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  width: "100%",
});

const headerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: token("spacing.sm"),
  padding: `${token("spacing.sm")} ${token("spacing.md")}`,
  background: "transparent",
  border: "none",
  color: token("colors.text.secondary"),
  fontSize: token("fontSizes.xs"),
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  cursor: "pointer",
  transition: "all 0.2s",
  textAlign: "left",
  "&:hover": {
    color: token("colors.text.primary"),
    background: "rgba(255, 255, 255, 0.03)",
  },
});

const iconStyle = css({
  fontSize: "10px",
  transition: "transform 0.2s",
});

const rotatedStyle = css({
  transform: "rotate(-90deg)",
});

const categoryIconStyle = css({
  fontSize: token("fontSizes.md"),
});

const titleStyle = css({
  flex: 1,
});

const contentStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: token("spacing.sm"),
  padding: `${token("spacing.xs")} ${token("spacing.sm")} ${token("spacing.sm")}`,
});
