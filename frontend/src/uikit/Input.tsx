import { splitProps, type Component, type JSX } from "solid-js";

import { css, cx } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "error", "class"]);

  return (
    <div class={containerStyle}>
      {local.label && <label class={labelStyle}>{local.label}</label>}
      <input class={cx(inputStyle, local.error && errorInputStyle, local.class)} {...others} />
      {local.error && <span class={errorTextStyle}>{local.error}</span>}
    </div>
  );
};

const containerStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: token("spacing.xs"),
  width: "100%",
});

const labelStyle = css({
  fontSize: token("fontSizes.xs"),
  fontWeight: "600",
  color: token("colors.text.secondary"),
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

const inputStyle = css({
  padding: `${token("spacing.sm")} ${token("spacing.md")}`,
  background: token("colors.surface.secondary"),
  border: `1px solid ${token("colors.border.primary")}`,
  borderRadius: token("radii.md"),
  color: token("colors.text.primary"),
  fontSize: token("fontSizes.sm"),
  fontWeight: "500",
  transition: "all 0.2s",
  "&::placeholder": {
    color: token("colors.text.muted"),
  },
  "&:hover": {
    borderColor: token("colors.border.secondary"),
  },
  "&:focus": {
    outline: "none",
    borderColor: token("colors.border.accent"),
    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
  },
});

const errorInputStyle = css({
  borderColor: token("colors.accent.red"),
});

const errorTextStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.accent.red"),
});
