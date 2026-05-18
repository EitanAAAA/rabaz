import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "canvas-ice": "#f4f4f1",
        "adaline-ink": "#080808",
        "mist-gray": "#b9b9b4",
        "deep-earth": "#1b1b1b",
        "valley-green": "#2d2d2d",
        "stone-moss": "#d7d7d2",
        "amber-seed": "#050505",
        "forest-dew": "#e9e9e4",
        "blackest-night": "#000000"
      },
      fontFamily: {
        assistant: [
          "var(--font-akkurat)"
        ],
        "assistant-bold": [
          "var(--font-akkurat)"
        ],
        pixel: [
          "var(--font-fragmentmono)"
        ],
        sans: [
          "var(--font-akkurat)"
        ]
      }
    }
  },
  plugins: []
};

export default config;
