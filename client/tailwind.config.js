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
        // System Colors (Solo Leveling Theme - VIOLET DOMINANT)
        "primary": "#8B5CF6",
        "primary-dark": "#6D28D9",
        "primary-light": "#A78BFA",
        "primary-glow": "rgba(139, 92, 246, 0.5)",
        
        "secondary": "#06B6D4",
        "secondary-glow": "rgba(6, 182, 212, 0.5)",
        
        "accent": "#C084FC",
        "accent-glow": "rgba(192, 132, 252, 0.6)",
        
        // Background (Abyss-like)
        "void": "#0A0A0F",
        "void-light": "#0F0F1A",
        "surface": "#12121F",
        "surface-light": "#1A1A2E",
        "surface-lighter": "#252540",
        
        // Status Colors
        "system-red": "#EF4444",
        "system-green": "#10B981",
        "system-yellow": "#F59E0B",
        "system-orange": "#F97316",
        "system-blue": "#3B82F6",
        
        // Rank Colors
        "rank-e": "#6B7280",
        "rank-d": "#22C55E",
        "rank-c": "#3B82F6",
        "rank-b": "#8B5CF6",
        "rank-a": "#F97316",
        "rank-s": "#EF4444",
        
        // System Message Colors
        "system-notice": "#8B5CF6",
        "system-warning": "#F59E0B",
        "system-error": "#EF4444",
        "system-success": "#10B981",
      },
      fontFamily: {
        "display": ["'Rajdhani'", "'Space Grotesk'", "sans-serif"],
        "body": ["'Inter'", "'Noto Sans'", "sans-serif"],
        "mono": ["'JetBrains Mono'", "'Fira Code'", "monospace"],
        "system": ["'Orbitron'", "'Rajdhani'", "sans-serif"],
      },
      boxShadow: {
        "neon": "0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)",
        "neon-strong": "0 0 15px rgba(139, 92, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)",
        "neon-cyan": "0 0 10px rgba(6, 182, 212, 0.5), 0 0 20px rgba(6, 182, 212, 0.3)",
        "neon-red": "0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)",
        "neon-green": "0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)",
        "inner-glow": "inset 0 0 20px rgba(139, 92, 246, 0.1)",
        "inner-glow-strong": "inset 0 0 40px rgba(139, 92, 246, 0.2)",
        "system-panel": "0 0 0 1px rgba(139, 92, 246, 0.2), 0 0 20px rgba(139, 92, 246, 0.1)",
      },
      backgroundImage: {
        "grid-pattern": "linear-gradient(to right, rgba(139, 92, 246, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(139, 92, 246, 0.03) 1px, transparent 1px)",
        "radial-glow": "radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        "radial-glow-cyan": "radial-gradient(circle at center, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
        "gradient-violet": "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #A78BFA 100%)",
        "gradient-dark": "linear-gradient(180deg, #0A0A0F 0%, #12121F 100%)",
        "hex-pattern": "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='rgba(139,92,246,0.05)' stroke-width='1'/%3E%3C/svg%3E\")",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 8s linear infinite",
        "glitch": "glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite",
        "shimmer": "shimmer 2s linear infinite",
        "rotate-slow": "rotate 20s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        "border-pulse": "borderPulse 2s ease-in-out infinite",
        "blink": "blink 1s step-end infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        rotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        borderPulse: {
          "0%, 100%": { borderColor: "rgba(139, 92, 246, 0.3)" },
          "50%": { borderColor: "rgba(139, 92, 246, 0.8)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
}
