import { css } from "@/styled-system/css";

export const headerStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "48px 0 32px 0",
});

export const titleStyle = css({
  fontSize: "48px",
  fontWeight: "bold",
  margin: 0,
});

export const userCardStyle = css({
  display: "flex",
  alignItems: "center",
  gap: "12px",
});

export const userInfoStyle = css({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  marginRight: "auto",
});

export const nameStyle = css({
  fontSize: "14px",
  fontWeight: "600",
  color: "#1a202c",
});

export const storageStyle = css({
  fontSize: "12px",
  color: "#718096",
});

export const tracksHeaderStyle = css({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "24px",
});

export const sectionTitleStyle = css({
  fontSize: "24px",
  fontWeight: "700",
  margin: 0,
});

export const tracksGridStyle = css({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: "24px",
  marginBottom: "48px",
});

export const loadingStyle = css({
  display: "flex",
  justifyContent: "center",
  padding: "64px",
});

export const emptyStyle = css({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "24px",
  padding: "64px",
  textAlign: "center",
});

export const emptyTextStyle = css({
  fontSize: "18px",
  color: "#718096",
  margin: 0,
});
