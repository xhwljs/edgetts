/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#6366F1',
        'secondary': '#8B5CF6',
        'background': '#0F172A',
        'card': '#1E293B',
        'accent': '#22D3EE'
      },
      fontFamily: {
        'sans': ['Noto Sans SC', 'Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
