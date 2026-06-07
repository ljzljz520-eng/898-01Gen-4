/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        hw: {
          bg: '#0A1929',
          'bg-light': '#112240',
          'bg-card': '#0D2137',
          primary: '#00FF88',
          'primary-dark': '#00CC6A',
          accent: '#FF6B35',
          'accent-dark': '#E55A2B',
          text: '#E6F1FF',
          'text-secondary': '#8892B0',
          'text-muted': '#64FFDA',
          border: '#1E3A5F',
          'border-light': '#234E70',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 136, 0.3)' },
          '100%': { boxShadow: '0 0 15px rgba(0, 255, 136, 0.6)' },
        }
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(0, 255, 136, 0.4)',
        'glow-orange': '0 0 15px rgba(255, 107, 53, 0.4)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
};
