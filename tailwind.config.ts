import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // channel-based so /opacity modifiers work (e.g. bg-shelf/60)
        room: "rgb(var(--color-room) / <alpha-value>)",
        shelf: "rgb(var(--color-shelf) / <alpha-value>)",
        wood: "rgb(var(--color-wood) / <alpha-value>)",
        amber: "rgb(var(--color-amber) / <alpha-value>)",
        "amber-dim": "rgb(var(--color-amber-dim) / <alpha-value>)",
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        groove: "rgb(var(--color-groove) / <alpha-value>)",
      },
      fontFamily: {
        display: "var(--font-display)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },
      boxShadow: {
        // warm glow that bleeds from beneath a lifted spine
        candle: "0 -8px 28px -6px rgba(200, 131, 42, 0.45)",
        "candle-soft": "0 0 60px -10px rgba(200, 131, 42, 0.25)",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.2s ease-in-out infinite",
        "spin-slow": "spin-slow 4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
