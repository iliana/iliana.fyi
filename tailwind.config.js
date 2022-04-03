const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./{components,templates}/*.mjs", "./content/**/*.md"],
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
  plugins: [require("@tailwindcss/typography")],
};
