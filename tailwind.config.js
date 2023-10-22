const typography = require("@tailwindcss/typography");

module.exports = {
  content: [".eleventy.js", "./content/**/*.{html,md}", "./src/**/*.{js,jsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter var", "sans-serif"],
    },
    extend: {
      colors: ({ colors }) => ({
        accent: Object.fromEntries(
          Object.keys(colors.violet).map((shade) => [shade, `rgb(var(--color-accent-${shade}) / <alpha-value>)`])
        ),
      }),
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-links": "rgb(var(--color-accent-600))",
            "--tw-prose-invert-links": "rgb(var(--color-accent-400))",
            "code::before": { content: "none" },
            "code::after": { content: "none" },
          },
        },
      },
    },
  },
  plugins: [typography],
};
