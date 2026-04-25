/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#081428',
          2: '#0a1a35',
          3: '#0d2246'
        },
        sblue: { // Custom SI-PEDAS Blue
          DEFAULT: '#1e6fd9',
          2: '#3b82f6',
          h: '#1660c5',
          lo: 'rgba(30,111,217,.12)'
        },
        sgold: {
          DEFAULT: '#c9950f',
          2: '#f59e0b'
        },
        theme: {
          bg: 'var(--bg)',
          card: 'var(--card)',
          text: 'var(--text)',
          mid: 'var(--mid)',
          muted: 'var(--muted)',
          border: 'var(--border)',
          bdark: 'var(--bdark)'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31,38,135,.07)',
        'premium-0': '0 1px 4px rgba(8,18,36,.04)',
        'premium': '0 10px 25px -5px rgba(8,18,36,.1), 0 8px 10px -6px rgba(8,18,36,.1)',
        'premium-l': '0 20px 50px -12px rgba(8,18,36,.25)',
        'inner-white': 'inset 0 1px 0 rgba(255,255,255,0.8)'
      }
    },
  },
  plugins: [],
}
