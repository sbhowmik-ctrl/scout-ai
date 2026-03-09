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
        background: "var(--background)",
        foreground: "var(--foreground)",
        cyber: {
          black: '#0a0a0a',
          'dark-gray': '#1a1a1a',
          'gray': '#2a2a2a',
          green: '#00ff41',
          'green-dark': '#00cc33',
          'green-light': '#39ff14',
          'green-glow': '#00ff41',
          cyan: '#00ffff',
          'cyan-dark': '#00cccc',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
        cyber: ['Orbitron', 'monospace'],
      },
      boxShadow: {
        'neon-green': '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41',
        'neon-green-sm': '0 0 5px #00ff41, 0 0 10px #00ff41',
        'neon-cyan': '0 0 10px #00ffff, 0 0 20px #00ffff',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #00ff41, 0 0 10px #00ff41' },
          '50%': { boxShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
