const fs = require("fs");
const path = require("path");
const evalModule = require("eval");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { renderToStaticMarkup } = require("react-dom/server");
const { sources } = require("webpack");

class TeraGenerator {
  /* eslint-disable-next-line class-methods-use-this */
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("StaticPageGenerator", (compilation) => {
      compilation.hooks.afterOptimizeAssets.tap("StaticPageGenerator", (assets) => {
        Object.entries(assets)
          .filter(([file]) => file.startsWith("../templates/") && file.endsWith(".js"))
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
      {
        test: /\.svg$/,
        issuer: entry.script,
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
