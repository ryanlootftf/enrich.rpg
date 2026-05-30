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
        "border-glow": "rgba(196,148,84,0.25)",
        "text-primary": "#f0f0f8",
        "text-secondary": "#9497b0",
        "text-tertiary": "#5f627a",
        "text-muted": "#8a8480",
        "text-dim": "#5a5650",
        accent: "#7c6aff",
        "accent-2": "#a08bff",
        gold: "#c49454",
        "gold-light": "#e8c080",
        "gold-dim": "#8a6535",
        "gold-2": "#fad76a",
        teal: "#2dd4bf",
        coral: "#e07040",
        green: "#4ab884",
        purple: "#9b7fd4",
        "purple-dim": "#6b5494",
      },
      fontFamily: {
        syne: ["Cinzel", "serif"],
        "crimson-pro": ["Crimson Pro", "serif"],
      },
      fontSize: {
        xs: ["13px", { lineHeight: "1.25rem" }],
        sm: ["15px", { lineHeight: "1.375rem" }],
        base: ["17px", { lineHeight: "1.625rem" }],
        lg: ["19px", { lineHeight: "1.75rem" }],
        xl: ["21px", { lineHeight: "1.75rem" }],
        "2xl": ["25px", { lineHeight: "2rem" }],
        "3xl": ["31px", { lineHeight: "2.25rem" }],
      },
      borderRadius: {
        "2xl": "16px",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #9b7fd4, #c49454)",
      },
      animation: {
        shimmer: "shimmer 4s linear infinite",
        bob: "bob 2s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 0%" },
          "100%": { backgroundPosition: "200% 0%" },
        },
        bob: {
          "0%, 100%": { transform: "translateX(-50%) translateY(0)" },
          "50%": { transform: "translateX(-50%) translateY(6px)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;