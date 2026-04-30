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
        primary: '#1B3A4B',
        'primary-dark': '#0f2430',
        accent: '#C9A96E',
        'accent-dark': '#a8854e',
        'site-bg': '#FAFAF7',
        'section-bg': '#F0EFEB',
        'site-border': '#e2e0da',
        'text-light': '#5a6475',
      },
      fontFamily: {
        brand: ['"DM Serif Display"', 'serif'],
        'heading-hy': ['"Noto Serif Armenian"', 'serif'],
        'body-hy': ['"Noto Sans Armenian"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        sm: '8px',
      },
    },
  },
  plugins: [],
}

export default config
