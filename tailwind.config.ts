import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pulse Studio Dark Theme - Enhanced
        'ps-bg': {
          950: '#080808',
          900: '#0d0d0d',
          850: '#111111',
          800: '#141414',
          750: '#181818',
          700: '#1a1a1a',
          600: '#242424',
          500: '#2d2d2d',
          400: '#3a3a3a',
          300: '#4a4a4a',
        },
        'ps-accent': {
          primary: '#ff7a4a',
          'primary-hover': '#ff8f66',
          'primary-muted': 'rgba(255, 122, 74, 0.3)',
          secondary: '#4ecdc4',
          tertiary: '#ffe66d',
          purple: '#9b59b6',
          blue: '#3498db',
          green: '#27ae60',
          red: '#e74c3c',
        },
        'ps-ai': {
          accent: '#6366f1',
          'accent-hover': '#818cf8',
          glow: 'rgba(99, 102, 241, 0.2)',
        },
        'ps-text': {
          primary: '#f0f0f0',
          secondary: '#a8a8a8',
          muted: '#666666',
          dim: '#4a4a4a',
        },
        'ps-grid': {
          line: '#1e1e1e',
          beat: '#2a2a2a',
          bar: '#3a3a3a',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.8125rem',
      },
      spacing: {
        '0.5': '2px',
        '18': '4.5rem',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'meter': 'meter 50ms linear',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'ai-pulse': 'ai-pulse 1.4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'fadeIn': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slideUp': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'ai-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow-orange': '0 0 10px rgba(255, 122, 74, 0.5)',
        'glow-cyan': '0 0 10px rgba(78, 205, 196, 0.5)',
        'glow-ai': '0 0 20px rgba(99, 102, 241, 0.3)',
        'inner-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.5)',
        'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 8px rgba(0, 0, 0, 0.4)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.5)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [],
};

export default config;

