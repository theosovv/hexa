import { splitProps, type JSX, type ParentComponent } from "solid-js";

import { css, cx } from "../../styled-system/css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export const Button: ParentComponent<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, ["variant", "size", "fullWidth", "class", "children"]);

  const variant = () => local.variant || "primary";
  const size = () => local.size || "md";

  return (
    <button
      class={cx(
        baseStyle,
        variantStyles[variant()],
        sizeStyles[size()],
        local.fullWidth && fullWidthStyle,
        local.class,
      )}
      {...others}
    >
      {local.children}
    </button>
  );
};

const baseStyle = css({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontWeight: "600",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  "&:hover:not(:disabled)": {
    transform: "translateY(-2px)",
  },
});

const variantStyles = {
  primary: css({
    background: "#667eea",
    color: "white",
    "&:hover:not(:disabled)": {
      background: "#5a67d8",
      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
    },
  }),
  secondary: css({
    background: "white",
    color: "#1a202c",
    border: "2px solid #e2e8f0",
    "&:hover:not(:disabled)": {
      background: "#f7fafc",
      borderColor: "#cbd5e0",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
  }),
  ghost: css({
    background: "transparent",
    color: "#4a5568",
    "&:hover:not(:disabled)": {
      background: "#f7fafc",
    },
  }),
  danger: css({
    background: "#f56565",
    color: "white",
    "&:hover:not(:disabled)": {
      background: "#e53e3e",
      boxShadow: "0 4px 12px rgba(245, 101, 101, 0.4)",
    },
  }),
};

const sizeStyles = {
  sm: css({
    padding: "8px 16px",
    fontSize: "14px",
  }),
  md: css({
    padding: "12px 24px",
    fontSize: "16px",
  }),
  lg: css({
    padding: "16px 32px",
    fontSize: "18px",
  }),
};

const fullWidthStyle = css({
  width: "100%",
});
