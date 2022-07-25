module.exports = {
  plugins: {
    [`${__dirname}/src/postcss/accent.js`]: {},
    "tailwindcss/nesting": {},
    tailwindcss: {},
    autoprefixer: {},
    [`${__dirname}/src/postcss/dark-mangle.js`]: {},
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
