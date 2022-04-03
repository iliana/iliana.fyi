const { sources } = require("webpack");
const fs = require("fs");
const path = require("path");
const evalModule = require("eval");
const { renderToStaticMarkup } = require("react-dom/server");

class StaticPageGenerator {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap("StaticPageGenerator", (compilation) => {
      compilation.hooks.afterOptimizeAssets.tap("StaticPageGenerator", (assets) => {
        Object.entries(assets)
          .filter(([file]) => file.endsWith(".js"))
          .map(([file, source]) => {
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
              new sources.RawSource(`<!DOCTYPE html>${html}`)
            );
            compilation.deleteAsset(file);
          });
      });
    });
  }
}

module.exports = {
  mode: "production",
  entry: fs
    .readdirSync(path.join(__dirname, "lib", "templates"))
    .filter((p) => path.extname(p) == ".jsx")
    .reduce((acc, p) => ({ ...acc, [path.basename(p, ".jsx")]: path.join(__dirname, "lib", "templates", p) }), {}),
  output: {
    path: path.join(__dirname, "templates"),
    library: { type: "commonjs2" },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
    ],
  },
  plugins: [new StaticPageGenerator()],
  resolve: { extensions: [".js", ".jsx"] },
};
