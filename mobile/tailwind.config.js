/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: This points to where we use Tailwind classes.
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {},
    },
    plugins: [],
}
