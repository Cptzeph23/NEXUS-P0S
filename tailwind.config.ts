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
        brand: {
          50: '#f5f0ff',
          100: '#ede0ff',
          200: '#d8bfff',
          300: '#be93ff',
          400: '#a16af8',
          500: '#8b45ef',
          600: '#7c3aed',
          700: '#6729d4',
          800: '#5520b0',
          900: '#461d8e',
          950: '#2c0f61',
        },
        surface: {
          50: '#f0f0f8',
          100: '#e0e0f0',
          200: '#c0c0e0',
          300: '#9090c0',
          400: '#6060a0',
          500: '#404080',
          600: '#2a2a50',
          700: '#1e1e3c',
          800: '#14141f',
          900: '#0d0d1a',
          950: '#07070f',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease',
        'fade-in': 'fadeIn 0.15s ease',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;