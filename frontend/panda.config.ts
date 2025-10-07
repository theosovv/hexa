import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],

  theme: {
    extend: {
      tokens: {
        colors: {
          // Brand colors
          brand: {
            50: { value: "#f5f3ff" },
            100: { value: "#ede9fe" },
            200: { value: "#ddd6fe" },
            300: { value: "#c4b5fd" },
            400: { value: "#a78bfa" },
            500: { value: "#8b5cf6" },
            600: { value: "#7c3aed" },
            700: { value: "#6d28d9" },
            800: { value: "#5b21b6" },
            900: { value: "#4c1d95" },
          },

          // Dark theme palette
          background: {
            primary: { value: "#0a0a0a" },
            secondary: { value: "#1a1a1a" },
            tertiary: { value: "#2a2a2a" },
            elevated: { value: "#1f1f1f" },
          },

          surface: {
            primary: { value: "#1a1a1a" },
            secondary: { value: "#2a2a2a" },
            tertiary: { value: "#3a3a3a" },
            hover: { value: "#2f2f2f" },
          },

          border: {
            primary: { value: "#3a3a3a" },
            secondary: { value: "#4a4a4a" },
            accent: { value: "#667eea" },
          },

          text: {
            primary: { value: "#ffffff" },
            secondary: { value: "#a0a0a0" },
            tertiary: { value: "#6b7280" },
            muted: { value: "#4b5563" },
          },

          // Accent colors for blocks
          accent: {
            purple: { value: "#8b5cf6" },
            blue: { value: "#3b82f6" },
            green: { value: "#10b981" },
            yellow: { value: "#f59e0b" },
            red: { value: "#ef4444" },
            cyan: { value: "#06b6d4" },
            pink: { value: "#ec4899" },
          },
        },

        fonts: {
          body: { value: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
          heading: { value: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
          mono: { value: "'JetBrains Mono', 'Fira Code', monospace" },
        },

        fontSizes: {
          xs: { value: "12px" },
          sm: { value: "14px" },
          md: { value: "16px" },
          lg: { value: "18px" },
          xl: { value: "20px" },
          "2xl": { value: "24px" },
          "3xl": { value: "32px" },
          "4xl": { value: "48px" },
          "5xl": { value: "64px" },
        },

        spacing: {
          xs: { value: "4px" },
          sm: { value: "8px" },
          md: { value: "16px" },
          lg: { value: "24px" },
          xl: { value: "32px" },
          "2xl": { value: "48px" },
          "3xl": { value: "64px" },
        },

        radii: {
          sm: { value: "4px" },
          md: { value: "8px" },
          lg: { value: "12px" },
          xl: { value: "16px" },
          "2xl": { value: "24px" },
          full: { value: "9999px" },
        },

        shadows: {
          sm: { value: "0 1px 3px rgba(0, 0, 0, 0.3)" },
          md: { value: "0 4px 12px rgba(0, 0, 0, 0.4)" },
          lg: { value: "0 8px 24px rgba(0, 0, 0, 0.5)" },
          xl: { value: "0 12px 32px rgba(0, 0, 0, 0.6)" },
          glow: { value: "0 0 20px rgba(102, 126, 234, 0.4)" },
        },
      },
    },
  },

  globalCss: {
    "*": {
      boxSizing: "border-box",
    },
    body: {
      fontFamily: "body",
      background: "background.primary",
      color: "text.primary",
      margin: 0,
      padding: 0,
      minHeight: "100vh",
    },
  },

  outdir: "styled-system",
});
