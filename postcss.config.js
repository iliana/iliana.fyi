module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    [`${__dirname}/src/postcss/dark-mangle.js`]: {},
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
