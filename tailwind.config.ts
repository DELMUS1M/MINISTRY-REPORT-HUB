import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'media',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0F2A52', 800: '#153966' },
        blue: { 700: '#1B4F91', 500: '#2E6FC4' },
        gold: { 300: '#F0CB6E', 500: '#D9A62E' },
        sky: { 50: '#EAF3FC', 100: '#DCEBFB' },
        ink: { 900: '#141C2B', 700: '#3A4658', 500: '#66748B' }
      },
      fontFamily: {
        head: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif']
      },
      borderRadius: { lg: '18px', md: '12px' },
      boxShadow: { soft: '0 10px 30px rgba(15,42,82,0.09)' }
    }
  },
  plugins: []
};

export default config;
