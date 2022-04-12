const typography = require("@tailwindcss/typography");
const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./lib/**/*.{js,jsx}"],
  safelist: ["font-feature-case", "footnote-reference", "footnote-definition", "footnote-definition-label"],
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
