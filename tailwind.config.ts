import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f7f5",
          100: "#e3eae5",
          200: "#c3d3c8",
          500: "#3f6b4c",
          600: "#325a3f",
          700: "#294a34",
          800: "#1e3527",
          900: "#16281c",
          950: "#0d1811",
        },
        sand: "#f7f4ee",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
