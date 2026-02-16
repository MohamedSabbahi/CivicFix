/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary": "#137fec",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "slate-900": "#0f172a",
        "slate-500": "#64748b",
      },
      borderRadius: {
        "DEFAULT": "4px",
        "lg": "8px",
        "xl": "12px",
        "2xl": "16px",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}