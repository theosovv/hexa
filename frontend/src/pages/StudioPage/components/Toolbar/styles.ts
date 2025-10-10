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

export const titleInputStyle = css({
  fontSize: token("fontSizes.sm"),
  fontWeight: "600",
  color: token("colors.text.primary"),
  background: token("colors.surface.secondary"),
  border: `1px solid ${token("colors.border.accent")}`,
  borderRadius: token("radii.sm"),
  padding: `${token("spacing.xs")} ${token("spacing.sm")}`,
  outline: "none",
  minWidth: "200px",
});
export const bpmInputStyle = css({
  fontSize: token("fontSizes.xs"),
  fontWeight: "600",
  padding: `4px ${token("spacing.sm")}`,
  background: "rgba(139, 92, 246, 0.1)",
  border: "1px solid rgba(139, 92, 246, 0.3)",
  borderRadius: token("radii.full"),
  color: token("colors.accent.purple"),
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    background: "rgba(139, 92, 246, 0.2)",
  },
  "&:focus": {
    outline: "none",
    borderColor: token("colors.accent.purple"),
  },
});

export const exportMenuStyle = css({
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  zIndex: 10,
  minWidth: "220px",
});

export const exportActionsStyle = css({
  display: "grid",
  gap: "8px",
});

export const bitrateRowStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "12px",
});

export const exportButtonContainer = css({
  position: "relative",
});

export const formatButtonStyle = css({
  width: "100%",
});
