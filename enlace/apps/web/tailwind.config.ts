import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#800020",
        "primary-hover": "#9a0028",
        secondary: "#000000",
        "bg-base": "#1c1c1c",
        "bg-surface": "#252525",
        "bg-sidebar": "#1a1a1a",
        "bg-server": "#161616",
        "bg-input": "#2f2f2f",
        "border-subtle": "#333333",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "zoom-in-95": { from: { transform: "scale(0.95)" }, to: { transform: "scale(1)" } },
        "zoom-out-95": { from: { transform: "scale(1)" }, to: { transform: "scale(0.95)" } },
      },
      animation: {
        "in": "fade-in 0.15s ease-out, zoom-in-95 0.15s ease-out",
        "out": "fade-out 0.15s ease-in, zoom-out-95 0.15s ease-in",
      },
    },
  },
  plugins: [],
};

export default config;
