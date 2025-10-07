import { css } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

export const cardStyle = css({
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-6px)",
    borderColor: token("colors.border.accent"),
    boxShadow: `0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px ${token("colors.border.accent")}`,
  },
});

export const titleStyle = css({
  fontSize: token("fontSizes.lg"),
  fontWeight: "700",
  margin: 0,
  color: token("colors.text.primary"),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const badgeStyle = css({
  fontSize: token("fontSizes.xs"),
  fontWeight: "700",
  padding: "6px 12px",
  background: "linear-gradient(135deg, #8b5cf6 0%, #667eea 100%)",
  color: "white",
  borderRadius: token("radii.full"),
  boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)",
  flexShrink: 0,
});

export const statStyle = css({
  display: "flex",
  alignItems: "center",
  gap: token("spacing.xs"),
});

export const statIconStyle = css({
  fontSize: token("fontSizes.md"),
  opacity: 0.7,
});

export const statTextStyle = css({
  fontSize: token("fontSizes.sm"),
  color: token("colors.text.secondary"),
  fontWeight: "500",
});

export const dateStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.tertiary"),
  fontWeight: "500",
});
