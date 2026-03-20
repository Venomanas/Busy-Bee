import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-body)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        app: "var(--radius)",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,0,0,0.07)",
        card: "0 2px 12px rgba(0,0,0,0.06)",
        brand: "0 0 20px hsl(42 96% 49% / 0.30)",
      },
      colors: {
        app: {
          bg: "hsl(var(--bg))",
          fg: "hsl(var(--fg))",
          muted: "hsl(var(--muted))",
          card: "hsl(var(--card))",
          border: "hsl(var(--border))",
          brand: "hsl(var(--brand))",
          "brand-dark": "hsl(var(--brand-dark))",
          surface: "hsl(var(--surface))",
          ring: "hsl(var(--ring))",
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, hsl(38 90% 40%) 0%, hsl(42 96% 49%) 60%, hsl(46 100% 62%) 100%)",
      },
      animation: {
        "heart-burst": "heartBurst 0.4s cubic-bezier(0.36,0.07,0.19,0.97) both",
        "fade-up": "fadeUp 0.28s ease-out both",
        "slide-in": "slideIn 0.22s ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
