/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian: {
          900: '#06060b',
          800: '#0d0d14',
          700: '#111119',
          600: '#16161f',
          500: '#1e1e2a',
        },
        cyan: {
          DEFAULT: '#00e5ff',
          dim: 'rgba(0, 229, 255, 0.15)',
        },
        gold: {
          DEFAULT: '#fbbf24',
          dim: 'rgba(251, 191, 36, 0.15)',
        },
      },
    },
  },
  plugins: [],
}
