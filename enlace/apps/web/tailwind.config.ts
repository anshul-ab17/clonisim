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
        "bg-base": "#1c1c1c",
        "bg-surface": "#252525",
        "bg-sidebar": "#1a1a1a",
        "bg-server": "#161616",
        "bg-input": "#2f2f2f",
        "border-subtle": "#333333",
      },
    },
  },
  plugins: [],
};

export default config;
