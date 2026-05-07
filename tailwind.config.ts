import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0d0f14",
        "bg-2": "#13151c",
        "bg-3": "#1a1d27",
        "bg-4": "#222636",
        "border-subtle": "rgba(255,255,255,0.07)",
        "border-default": "rgba(255,255,255,0.12)",
        "text-primary": "#f0f0f8",
        "text-secondary": "#9497b0",
        "text-tertiary": "#5f627a",
        accent: "#7c6aff",
        "accent-2": "#a08bff",
        gold: "#f4c430",
        "gold-2": "#fad76a",
        teal: "#2dd4bf",
        coral: "#f97060",
        green: "#4ade80",
      },
      fontFamily: {
        syne: ["Syne", "sans-serif"],
        "dm-sans": ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
      },
    },
  },
  plugins: [],
};

export default config;