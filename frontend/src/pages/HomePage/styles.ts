import { css } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

export const pageStyle = css({
  maxWidth: "1280px",
  margin: "0 auto",
  minHeight: "100vh",
});

export const titleStyle = css({
  fontSize: token("fontSizes.4xl"),
  fontWeight: "800",
  margin: 0,
  background: "linear-gradient(135deg, #8b5cf6 0%, #667eea 100%)",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  letterSpacing: "-0.02em",
});

export const nameStyle = css({
  fontSize: token("fontSizes.sm"),
  fontWeight: "600",
  color: token("colors.text.primary"),
});

export const storageStyle = css({
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.secondary"),
});

export const sectionTitleStyle = css({
  fontSize: token("fontSizes.2xl"),
  fontWeight: "700",
  margin: 0,
  color: token("colors.text.primary"),
});

export const tracksGridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: token("spacing.lg"),
});

export const emptyStyle = css({
  textAlign: "center",
  background: token("colors.surface.primary"),
  border: `2px dashed ${token("colors.border.primary")}`,
  borderRadius: token("radii.xl"),
});

export const emptyIconStyle = css({
  fontSize: token("fontSizes.5xl"),
  opacity: 0.3,
});

export const emptyTextStyle = css({
  fontSize: token("fontSizes.xl"),
  fontWeight: "600",
  color: token("colors.text.primary"),
  margin: 0,
});

export const emptySubtextStyle = css({
  fontSize: token("fontSizes.sm"),
  color: token("colors.text.secondary"),
  margin: 0,
});
