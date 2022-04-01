const colors = require("tailwindcss/colors");

module.exports = {
  content: ["./public/**/*.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        purple: colors.violet,
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
