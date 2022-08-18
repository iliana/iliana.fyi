module.exports = {
  plugins: {
    [`${__dirname}/src/postcss/accent.js`]: {},
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
    "postcss-dark-theme-class": {
      darkSelector: '[data-theme="dark"]',
      lightSelector: '[data-theme="light"]',
    },
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
