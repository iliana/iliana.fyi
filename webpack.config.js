const fs = require("fs");
const path = require("path");
const evalModule = require("eval");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { renderToStaticMarkup } = require("react-dom/server");
const { sources } = require("webpack");

class StaticPageGenerator {
  /* eslint-disable-next-line class-methods-use-this */
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("StaticPageGenerator", (compilation) => {
      compilation.hooks.afterOptimizeAssets.tap("StaticPageGenerator", (assets) => {
        Object.entries(assets)
          .filter(([file]) => file.endsWith(".js"))
          .forEach(([file, source]) => {
            const html = renderToStaticMarkup(evalModule(source.source()).default()).replaceAll(
              /{[%{].*&quot;.*[%}]}/g,
              (match) => match.replaceAll("&quot;", '"')
            );
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

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry: fs
    .readdirSync(path.join(__dirname, "lib", "templates"))
    .filter((p) => path.extname(p) === ".jsx")
    .reduce(
      (acc, p) => ({
        ...acc,
        [`../templates/${path.basename(p, ".jsx")}`]: path.join(__dirname, "lib", "templates", p),
      }),
      {}
    ),
  output: {
    path: path.join(__dirname, "static"),
    library: { type: "commonjs2" },
    assetModuleFilename: "[name][ext]",
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
    ],
  },
  plugins: [new MiniCssExtractPlugin({ filename: "styles.css" }), new StaticPageGenerator()],
  resolve: { extensions: [".js", ".jsx"] },
};
