import path from "path";

import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      "@/styled-system": path.resolve(__dirname, "./styled-system"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

