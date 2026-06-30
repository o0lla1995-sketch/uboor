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
        primary: {
          50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
          400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
          800: '#075985', 900: '#0c4a6e',
        },
        emerald: {
          50: '#ecfdf5', 100: '#d1fae5', 500: '#10b981', 600: '#059669',
        },
        rose: {
          50: '#fff1f2', 100: '#ffe4e6', 500: '#f43f5e', 600: '#e11d48',
        },
        amber: {
          50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
