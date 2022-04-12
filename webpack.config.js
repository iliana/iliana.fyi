const fs = require("fs");
const path = require("path");
const evalModule = require("eval");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { renderToStaticMarkup } = require("react-dom/server");
const { sources } = require("webpack");

// This is more or less a cleaned up version of https://github.com/4Catalyzer/react-static-page-webpack-plugin.
class TeraGenerator {
  /* eslint-disable-next-line class-methods-use-this */
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("TeraGenerator", (compilation) => {
      compilation.hooks.afterOptimizeAssets.tap("TeraGenerator", (assets) => {
        Object.entries(assets)
          .filter(([file]) => file.startsWith("../templates/") && file.endsWith(".js"))
          .forEach(([file, source]) => {
            const html = renderToStaticMarkup(evalModule(source.source()).default());
            compilation.emitAsset(
              path.format({
                ...path.parse(file),
                base: "",
                ext: ".html",
              }),
              new sources.RawSource(`{% import "macros.html" as macros %}<!DOCTYPE html>${html}`)
            );
            compilation.deleteAsset(file);
          });
      });
    });
  }
}

const entry = {
  script: path.join(__dirname, "lib", "client", "defer.js"),
};
fs.readdirSync(path.join(__dirname, "lib", "templates"))
  .filter((p) => path.extname(p) === ".jsx")
  .forEach((p) => {
    entry[`../templates/${path.basename(p, ".jsx")}`] = {
      import: path.join(__dirname, "lib", "templates", p),
      library: { type: "commonjs2" },
    };
  });

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry,
  output: {
    path: path.join(__dirname, "static"),
    publicPath: "/",
    assetModuleFilename: "assets/[hash][ext][query]",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|webp)$/,
        type: "asset/resource",
      },
      {
        test: /\.svg$/,
        issuer: { not: entry.script },
        use: ["@svgr/webpack"],
      },
      {
        test: /\.svg$/,
        issuer: entry.script,
        // Ordinarily we would use the @svgr/webpack loader here, but the generated JSX is being used in our extremely
        // minimal DOM JSX runtime. @svgr/webpack does two things we don't want:
        //
        // 1. It doesn't support `jsxRuntimeImport`, so it brings in either React or Preact -- we could work around
        //    this with `template` but it's messy.
        // 2. It mangles attributes like `stroke-width` into `strokeWidth`, which React un-mangles, but our tiny JSX
        //    runtime (and also Preact) don't do.
        //
        // Using the SVGR Babel preset in this way does the part we actually want (converting SVGs to JSX) without
        // these two problems.
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { pragma: "h" }],
              [
                "@svgr/babel-preset",
                {
                  jsxRuntimeImport: { source: path.join(__dirname, "lib", "jsx-runtime.js"), specifiers: ["h"] },
                  state: { componentName: "SvgComponent" },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin({ filename: "styles.css" }), new TeraGenerator()],
  resolve: { extensions: [".js", ".jsx"] },
};
