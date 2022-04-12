const typography = require("@tailwindcss/typography");
const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./lib/**/*.{js,jsx}"],
  safelist: ["font-feature-case", "footnote-reference", "footnote-definition", "footnote-definition-label"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter subset", defaultTheme.fontFamily.sans],
        mono: ["Iosevka subset", defaultTheme.fontFamily.mono],
      },
      colors: {
        purple: colors.violet,
      },
    },
  },
  plugins: [typography],
};
