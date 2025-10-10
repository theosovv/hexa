import { splitProps, For, type Component, type JSX } from "solid-js";

import { css, cx } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  value: string;
  onSelectChange: (value: string) => void;
}

export const Select: Component<SelectProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "options", "value", "onSelectChange", "class"]);

  const handleChange = (e: Event) => {
    const target = e.currentTarget as HTMLSelectElement;
    local.onSelectChange(target.value);
  };

  return (
    <div class={containerStyle}>
      {local.label && <label class={labelStyle}>{local.label}</label>}
      <select
        class={cx(selectStyle, local.class)}
        value={local.value ?? ""}
        onChange={handleChange}
        {...others}
      >
        <For each={local.options}>
          {(option) => (
            <option value={option.value} selected={option.value === local.value}>
              {option.label}
            </option>
          )}
        </For>
      </select>
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
  marginBottom: "8px",
});

const selectStyle = css({
  padding: `${token("spacing.sm")} ${token("spacing.md")}`,
  background: token("colors.surface.secondary"),
  border: `1px solid ${token("colors.border.primary")}`,
  borderRadius: token("radii.md"),
  color: token("colors.text.primary"),
  fontSize: token("fontSizes.sm"),
  fontWeight: "500",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    background: token("colors.surface.hover"),
    borderColor: token("colors.border.secondary"),
  },
  "&:focus": {
    outline: "none",
    borderColor: token("colors.border.accent"),
    boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)",
  },
  "& option": {
    background: token("colors.surface.primary"),
    color: token("colors.text.primary"),
  },
});
