module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    [`${__dirname}/lib/dark-mangle.js`]: {},
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
