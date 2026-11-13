import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        editorial: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        background: "#070b12",
        surface: {
          DEFAULT: "#0d131f",
          card: "#111827",
          hover: "#172033",
          border: "#1f293d",
          muted: "#131b2c",
        },
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4", // Electric Cyan
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        accent: {
          blue: "#3b82f6",
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
    },
  },
  plugins: [],
};

export default config;
