/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#14110F",
        cream: "#F5F5F5",
        gold: "#E31D1D",
        forest: "#1E1E1E",
        clay: "#A31219",
        brand: {
          red: "#E31D1D",
          redDeep: "#B61117",
          gray100: "#F3F4F6",
          gray200: "#E5E7EB",
          gray800: "#1F2937",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 24px 60px -32px rgba(227, 29, 29, 0.25)",
      },
    },
  },
  plugins: [],
};
