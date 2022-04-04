module.exports = {
  plugins: {
    tailwindcss: {},
    [`${__dirname}/lib/import.js`]: {},
    [`${__dirname}/lib/syntect-bug.js`]: {},
    autoprefixer: {},
    [`${__dirname}/lib/dark-mangle.js`]: {},
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
