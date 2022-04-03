module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "./util/dark-mangle.js": {},
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
