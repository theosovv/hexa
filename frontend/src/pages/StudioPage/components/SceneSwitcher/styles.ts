import { css } from "@/styled-system/css";

export const containerStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
});

export const labelStyle = css({
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#cbd5f5",
  opacity: 0.8,
});

export const sceneListStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "8px",
});

export const sceneButtonStyle = css({
  padding: "6px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(148,163,184,0.38)",
  background: "rgba(15,23,42,0.85)",
  color: "#e2e8f0",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    background: "rgba(99,102,241,0.25)",
    borderColor: "rgba(129,140,248,0.55)",
  },
});

export const sceneButtonActiveStyle = css({
  background: "rgba(129,140,248,0.35)",
  borderColor: "rgba(99,102,241,0.85)",
  color: "#f9fafb",
});

export const emptyStateStyle = css({
  fontSize: "12px",
  color: "#94a3b8",
  fontStyle: "italic",
});
