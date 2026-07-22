import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        coral: {
          DEFAULT: "var(--abnb-coral)",
          hover: "var(--abnb-coral-hover)",
        },
        abnb: {
          bg: "var(--abnb-bg)",
          fg: "var(--abnb-fg)",
          muted: "var(--abnb-muted)",
          border: "var(--abnb-border)",
          surface: "var(--abnb-surface)",
          "surface-hover": "var(--abnb-surface-hover)",
        },
      },
      borderRadius: {
        card: "var(--abnb-radius-card)",
        pill: "var(--abnb-radius-pill)",
      },
      boxShadow: {
        elevated: "var(--abnb-elevated-shadow)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
