import { css } from "@/styled-system/css";
import { token } from "@/styled-system/tokens";

export const logoContainerStyle = css({
  display: "flex",
  justifyContent: "center",
  marginBottom: token("spacing.lg"),
});

export const logoStyle = css({
  width: "100px",
  height: "100px",
  filter: "drop-shadow(0 0 20px rgba(139, 92, 246, 0.3))",
});
