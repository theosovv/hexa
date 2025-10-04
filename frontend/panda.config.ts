import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{js,jsx,ts,tsx}'],
  exclude: [],
  
  theme: {
    extend: {
      tokens: {
        colors: {
          primary: { value: '#3b82f6' },
          secondary: { value: '#8b5cf6' },
          background: { value: '#0a0a0a' },
          surface: { value: '#1a1a1a' },
          text: { value: '#ffffff' },
        }
      }
    }
  },
  
  outdir: 'styled-system',
})
