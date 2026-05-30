import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#080A0F",
        surface: "#0E1117",
        "surface-2": "#161B25",
        border: "#1E2737",
        "border-light": "#2A3447",
        "text-primary": "#E8EDF5",
        "text-secondary": "#8B9BB4",
        "text-tertiary": "#4A5568",
        accent: "#3B82F6",
        "accent-hover": "#2563EB",
        "accent-muted": "#1E3A5F",
        "vvs-murmur": "#10B981",
        "vvs-ripple": "#F59E0B",
        "vvs-wave": "#F97316",
        "vvs-surge": "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "pulse-danger": "pulse-danger 2s ease-in-out infinite",
        scan: "scan 2s linear infinite",
        shimmer: "shimmer 1.5s infinite",
        float: "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-danger": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(239, 68, 68, 0.1)" },
          "50%": { boxShadow: "0 0 25px rgba(239, 68, 68, 0.3)" },
        },
        scan: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}

export default config
