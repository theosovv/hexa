import { css } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

export const containerStyle = css({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "100vh",
  background: token("colors.background.primary"),
  overflow: "hidden",
});

export const backgroundStyle = css({
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  zIndex: 0,
});

export const gradientOrbStyle = css({
  position: "absolute",
  width: "500px",
  height: "500px",
  borderRadius: "50%",
  background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
  filter: "blur(60px)",
  animation: "pulse 8s ease-in-out infinite",
});

export const cardWrapperStyle = css({
  position: "relative",
  zIndex: 1,
  width: "100%",
  maxWidth: "440px",
  padding: "32px",
  background: "rgba(26, 26, 26, 0.8)",
  backdropFilter: "blur(20px)",
  border: `1px solid ${token("colors.border.primary")}`,
  borderRadius: token("radii.2xl"),
  boxShadow: token("shadows.xl"),
  textAlign: "center",
});

export const headingStyle = css({
  fontSize: token("fontSizes.4xl"),
  fontWeight: "800",
  margin: `0 0 ${token("spacing.sm")} 0`,
  background: "linear-gradient(135deg, #8b5cf6 0%, #667eea 100%)",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  letterSpacing: "-0.02em",
});

export const taglineStyle = css({
  fontSize: token("fontSizes.md"),
  color: token("colors.text.secondary"),
  margin: `0 0 ${token("spacing.2xl")} 0`,
  fontWeight: "500",
});

export const errorBoxStyle = css({
  display: "flex",
  alignItems: "center",
  gap: token("spacing.sm"),
  padding: token("spacing.md"),
  background: "rgba(239, 68, 68, 0.1)",
  border: "1px solid rgba(239, 68, 68, 0.3)",
  borderRadius: token("radii.lg"),
  color: "#fca5a5",
  fontSize: token("fontSizes.sm"),
  marginBottom: token("spacing.lg"),
});

export const errorIconStyle = css({
  fontSize: token("fontSizes.lg"),
});

export const actionsStyle = css({
  display: "flex",
  flexDirection: "column",
  marginTop: "32px",
  gap: token("spacing.md"),
});

export const footerStyle = css({
  marginTop: token("spacing.xl"),
  fontSize: token("fontSizes.xs"),
  color: token("colors.text.muted"),
  fontWeight: "500",
});
