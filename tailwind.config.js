const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");
const typography = require("@tailwindcss/typography");

module.exports = {
  content: ["./lib/**/*.jsx", "./content/**/*.md"],
  safelist: ["footnote-reference", "footnote-definition", "footnote-definition-label"],
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
