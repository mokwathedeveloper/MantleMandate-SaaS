import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        page:    '#0D1117',
        card:    '#161B22',
        surface: '#1C2128',

        // Borders
        border: '#21262D',

        // Brand
        primary: { DEFAULT: '#0066FF', hover: '#0052CC' },
        accent:  '#00C2FF',
        orange:  '#F97316',

        // Semantic
        success: { DEFAULT: '#22C55E', bg: '#0D2818' },
        error:   { DEFAULT: '#EF4444', bg: '#2D0F0F' },
        warning: { DEFAULT: '#F5C542', bg: '#2A2000' },

        // Text
        text: {
          primary:   '#F0F6FC',
          secondary: '#8B949E',
          disabled:  '#484F58',
          link:      '#58A6FF',
          'link-hover': '#79B8FF',
        },

        // Form inputs
        input: { DEFAULT: '#0D1117', focus: '#161B22' },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '16px', letterSpacing: '0.05em' }],
      },
      borderRadius: {
        sm:  '4px',
        DEFAULT: '6px',
        md:  '6px',
        lg:  '8px',
        xl:  '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,0.4)',
        modal: '0 20px 60px 0 rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 2s linear infinite',
        'pulse-dot':  'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.3)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
export default config
