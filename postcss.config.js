module.exports = {
  plugins: {
    tailwindcss: {},
    [`${__dirname}/lib/postcss/import.js`]: {},
    [`${__dirname}/lib/postcss/syntect-bug.js`]: {},
    autoprefixer: {},
    [`${__dirname}/lib/postcss/dark-mangle.js`]: {},
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
