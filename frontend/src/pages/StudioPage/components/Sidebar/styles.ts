import { css } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

export const sidebarStyle = css({
  position: "fixed",
  top: "60px",
  left: 0,
  bottom: 0,
  width: "280px",
  padding: "0 16px",
  background: "rgba(26, 26, 26, 0.95)",
  backdropFilter: "blur(20px)",
  borderRight: `1px solid ${token("colors.border.primary")}`,
  display: "flex",
  flexDirection: "column",
  zIndex: 50,
});

export const headerStyle = css({
  padding: token("spacing.lg"),
  borderBottom: `1px solid ${token("colors.border.primary")}`,
});

export const titleStyle = css({
  fontSize: token("fontSizes.md"),
  fontWeight: "700",
  margin: 0,
  color: token("colors.text.primary"),
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

export const subtitleStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.tertiary"),
  margin: `${token("spacing.xs")} 0 0 0`,
});

export const blocksListStyle = css({
  flex: 1,
  overflowY: "auto",
  padding: "16px",

  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: token("colors.surface.tertiary"),
    borderRadius: token("radii.full"),
  },
});

export const blockItemStyle = css({
  display: "flex",
  alignItems: "center",
  gap: token("spacing.sm"),
  padding: token("spacing.md"),
  background: token("colors.surface.primary"),
  border: `1px solid ${token("colors.border.primary")}`,
  borderLeft: "3px solid",
  borderRadius: token("radii.md"),
  cursor: "grab",
  transition: "all 0.2s",
  userSelect: "none",
  "&:hover": {
    background: token("colors.surface.hover"),
    transform: "translateX(4px)",
    boxShadow: token("shadows.sm"),
  },
  "&:active": {
    cursor: "grabbing",
    transform: "translateX(2px)",
  },
});

export const blockIconStyle = css({
  fontSize: token("fontSizes.2xl"),
  lineHeight: 1,
});

export const blockInfoStyle = css({
  flex: 1,
});

export const blockLabelStyle = css({
  fontSize: token("fontSizes.sm"),
  fontWeight: "600",
  color: token("colors.text.primary"),
});

export const blockDescStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.tertiary"),
});

export const helpStyle = css({
  padding: token("spacing.md"),
  borderTop: `1px solid ${token("colors.border.primary")}`,
  background: "rgba(0, 0, 0, 0.2)",
});

export const helpTitleStyle = css({
  fontSize: token("fontSizes.xs"),
  fontWeight: "700",
  color: token("colors.text.secondary"),
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: token("spacing.sm"),
});

export const helpTextStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.tertiary"),
  flex: 1,
  textAlign: "right",
});

export const kbdStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "24px",
  padding: "2px 8px",
  background: token("colors.surface.tertiary"),
  border: `1px solid ${token("colors.border.secondary")}`,
  borderRadius: token("radii.sm"),
  fontSize: token("fontSizes.xs"),
  fontFamily: token("fonts.mono"),
  fontWeight: "600",
  color: token("colors.text.secondary"),
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
});
