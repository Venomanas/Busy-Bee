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
        display: ["var(--font-display)", "var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "app": "var(--radius)",
      },
      boxShadow: {
        "soft": "0 10px 30px rgba(0,0,0,0.08)",
      },
      colors: {
        app: {
          bg: "hsl(var(--bg))",
          fg: "hsl(var(--fg))",
          muted: "hsl(var(--muted))",
          card: "hsl(var(--card))",
          border: "hsl(var(--border))",
          brand: "hsl(var(--brand))",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
