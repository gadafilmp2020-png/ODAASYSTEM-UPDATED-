/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Ubuntu"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        tech: ['"Ubuntu"', 'sans-serif'],
        brand: ['"Ubuntu"', 'sans-serif'],
        mono: ['"ui-monospace"', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 15s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pop-in': 'pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'scan-line': 'scan-line 10s linear infinite',
      },
      keyframes: {
        float: {
            '0%, 100%': { transform: 'translateY(0) rotate(0)' },
            '50%': { transform: 'translateY(-5px) rotate(0.5deg)' }
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        'scan-line': {
          '0%': { top: '-100%' },
          '100%': { top: '200%' }
        }
      }
    },
  },
  plugins: [],
}