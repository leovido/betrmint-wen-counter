/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#070a14",
        panel: "#0f1428",
        cyan: "#00eaff",
        pink: "#ff2bd6",
        yellow: "#ffe600",
        red: "#ff3b3b",
        muted: "#96a0c2",
        white: "#e8f6ff",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      animation: {
        "glow-pulse": "glowPulse 2.2s ease-in-out infinite",
        scan: "scan 8s linear infinite",
        "wheel-spin": "wheelSpin 4s cubic-bezier(0.23, 1, 0.32, 1)",
        "confetti-fall": "confettiFall 3s linear forwards",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": {
            filter:
              "drop-shadow(0 0 2px currentColor) drop-shadow(0 0 6px currentColor)",
          },
          "50%": {
            filter:
              "drop-shadow(0 0 2px currentColor) drop-shadow(0 0 14px currentColor)",
          },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        wheelSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(var(--final-rotation))" },
        },
        confettiFall: {
          "0%": {
            transform: "translateY(-100vh) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(100vh) rotate(720deg)",
            opacity: "0",
          },
        },
      },
      boxShadow: {
        "neon-cyan":
          "0 0 6px rgba(0, 234, 255, 0.8), 0 0 16px rgba(0, 234, 255, 0.5)",
        "neon-pink": "0 0 10px rgba(255, 43, 214, 0.6)",
        "neon-yellow":
          "0 0 8px rgba(255, 230, 0, 0.55), 0 0 18px rgba(255, 230, 0, 0.35)",
      },
      spacing: {
        15: "3.75rem",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};
