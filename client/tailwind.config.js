/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E87458',
          hover: '#C85D45',
          dark: '#A84736',
        },
        airbnb: {
          black: '#222222',
          gray: '#717171',
          lightGray: '#B0B0B0',
          border: '#DDDDDD',
          borderLight: '#EBEBEB',
          bgSubtle: '#F7F7F7',
        }
      },
      fontFamily: {
        sans: [
          'DM Sans',
          'Avenir Next',
          'sans-serif'
        ],
      },
      boxShadow: {
        card: '0 6px 16px rgba(0, 0, 0, 0.12)',
        floating: '0 12px 28px rgba(0, 0, 0, 0.18)',
        dropdown: '0 4px 16px rgba(0, 0, 0, 0.15)',
      }
    },
  },
  plugins: [],
}
