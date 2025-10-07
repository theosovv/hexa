import { css } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

export const toolbarStyle = css({
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: "60px",
  background: "rgba(26, 26, 26, 0.95)",
  backdropFilter: "blur(20px)",
  borderBottom: `1px solid ${token("colors.border.primary")}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 32px",
  zIndex: 100,
});

export const logoContainerStyle = css({
  cursor: "pointer",
  transition: "opacity 0.2s",
  "&:hover": {
    opacity: 0.8,
  },
});

export const logoTextStyle = css({
  fontSize: token("fontSizes.lg"),
  fontWeight: "700",
  margin: 0,
  background: "linear-gradient(135deg, #8b5cf6 0%, #667eea 100%)",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
});

export const dividerStyle = css({
  width: "1px",
  height: "24px",
  background: token("colors.border.primary"),
});

export const trackTitleStyle = css({
  fontSize: token("fontSizes.sm"),
  fontWeight: "500",
  color: token("colors.text.secondary"),
});

export const savingBadgeStyle = css({
  display: "flex",
  alignItems: "center",
  gap: token("spacing.xs"),
  padding: "4px 12px",
  background: "rgba(245, 158, 11, 0.1)",
  border: "1px solid rgba(245, 158, 11, 0.3)",
  borderRadius: token("radii.full"),
  fontSize: token("fontSizes.xs"),
  fontWeight: "600",
  color: token("colors.accent.yellow"),
});
