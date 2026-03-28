/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        brutal: {
          yellow: '#E2F000',
          pink: '#FF90E8',
          blue: '#23A094',
          orange: '#FF5722',
          green: '#90FF90',
          bg: '#F4F4F0',
        }
      }
    },
  },
  plugins: [],
}
