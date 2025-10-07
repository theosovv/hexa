import { css, cx } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";
import { splitProps, type ParentComponent } from "solid-js";

type Gap = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | number;
type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";
type Padding = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | number;

interface StackProps {
  gap?: Gap;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;
  padding?: Padding;
  class?: string;
  onClick?: () => void;
}

const getGapValue = (gap?: Gap): string => {
  if (typeof gap === "number") return `${gap}px`;

  return token(`spacing.${gap || "md"}`);
};

const getPaddingValue = (padding?: Padding): string => {
  if (typeof padding === "number") return `${padding}px`;

  if (!padding) return "0";

  return token(`spacing.${padding}`);
};

const getAlignValue = (align?: Align): string => {
  const map: Record<Align, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    stretch: "stretch",
    baseline: "baseline",
  };

  return map[align || "stretch"];
};

const getJustifyValue = (justify?: Justify): string => {
  const map: Record<Justify, string> = {
    start: "flex-start",
    center: "center",
    end: "flex-end",
    between: "space-between",
    around: "space-around",
    evenly: "space-evenly",
  };

  return map[justify || "start"];
};

export const Horizontal: ParentComponent<StackProps> = (props) => {
  const [local, others] = splitProps(props, [
    "gap",
    "align",
    "justify",
    "wrap",
    "fullWidth",
    "fullHeight",
    "padding",
    "class",
    "children",
    "onClick",
  ]);

  return (
    <div
      class={cx(baseStyle, local.class)}
      onClick={() => local.onClick && local.onClick()}
      style={{
        "flex-direction": "row",
        gap: getGapValue(local.gap),
        "align-items": getAlignValue(local.align),
        "justify-content": getJustifyValue(local.justify),
        "flex-wrap": local.wrap ? "wrap" : "nowrap",
        width: local.fullWidth ? "100%" : "auto",
        height: local.fullHeight ? "100%" : "auto",
        padding: getPaddingValue(local.padding),
      }}
      {...others}
    >
      {local.children}
    </div>
  );
};

export const Vertical: ParentComponent<StackProps> = (props) => {
  const [local, others] = splitProps(props, [
    "gap",
    "align",
    "justify",
    "wrap",
    "fullWidth",
    "fullHeight",
    "padding",
    "class",
    "children",
  ]);

  return (
    <div
      class={cx(baseStyle, local.class)}
      style={{
        "flex-direction": "column",
        gap: getGapValue(local.gap),
        "align-items": getAlignValue(local.align),
        "justify-content": getJustifyValue(local.justify),
        "flex-wrap": local.wrap ? "wrap" : "nowrap",
        width: local.fullWidth ? "100%" : "auto",
        height: local.fullHeight ? "100%" : "auto",
        padding: getPaddingValue(local.padding),
      }}
      {...others}
    >
      {local.children}
    </div>
  );
};

const baseStyle = css({
  display: "flex",
});
