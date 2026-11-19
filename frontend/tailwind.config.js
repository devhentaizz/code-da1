/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d11',
        surface: '#0f141a',
        surfaceCard: '#131922',
        surfaceHover: '#18212c',
        borderDark: '#1b2430',
        primary: {
          DEFAULT: '#0df580',
          hover: '#0ce074',
          light: '#38f895',
          dark: '#08b85f',
          glow: 'rgba(13, 245, 128, 0.25)'
        },
        cyanHiRes: '#00d2ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
