/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // System Colors (Solo Leveling Theme)
        "primary": "#25aff4",
        "primary-glow": "rgba(37, 175, 244, 0.5)",
        "secondary": "#a855f7",
        "secondary-glow": "rgba(168, 85, 247, 0.5)",
        
        // Background
        "void": "#0a0f14",
        "surface": "#131b23",
        "surface-light": "#1e2933",
        
        // Status Colors
        "system-red": "#ef4444",
        "system-green": "#22c55e",
        "system-yellow": "#eab308",
        "system-orange": "#f97316",
        
        // Rank Colors
        "rank-e": "#94a3b8",
        "rank-d": "#22c55e",
        "rank-c": "#3b82f6",
        "rank-b": "#a855f7",
        "rank-a": "#f97316",
        "rank-s": "#facc15",
      },
      fontFamily: {
        "display": ["Space Grotesk", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "neon": "0 0 10px rgba(37, 175, 244, 0.5), 0 0 20px rgba(37, 175, 244, 0.3)",
        "neon-strong": "0 0 15px rgba(37, 175, 244, 0.8), 0 0 30px rgba(37, 175, 244, 0.5)",
        "neon-purple": "0 0 10px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)",
        "neon-red": "0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)",
        "inner-glow": "inset 0 0 20px rgba(37, 175, 244, 0.1)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, #1e2933 1px, transparent 1px), linear-gradient(to bottom, #1e2933 1px, transparent 1px)",
        "radial-glow": "radial-gradient(circle at center, rgba(37, 175, 244, 0.1) 0%, transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "scan": "scan 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "from": { boxShadow: "0 0 10px rgba(37, 175, 244, 0.3)" },
          "to": { boxShadow: "0 0 20px rgba(37, 175, 244, 0.6)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
}
