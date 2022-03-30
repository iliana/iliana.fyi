const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./{components,templates}/**/*.mjs"],
  theme: {
    extend: {
      colors: {
        purple: colors.violet,
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
