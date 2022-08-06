const typography = require("@tailwindcss/typography");
const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [".eleventy.js", "./content/**/*.html", "./src/**/*.{js,jsx}"],
  safelist: ["font-feature-case"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        purple: colors.violet,
      },
    },
  },
  plugins: [typography],
};
