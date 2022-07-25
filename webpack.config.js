// Copyright 2022 iliana etaoin
// SPDX-License-Identifier: MIT-0
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");

const entry = {
  theme: path.join(__dirname, "src", "theme.jsx"),
  styles: path.join(__dirname, "src", "styles.css"),
};

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  entry,
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/dist/",
    assetModuleFilename: (pathData) => {
      if (pathData.filename.endsWith(".woff2")) {
        return `${pathData.filename.includes("italic") ? "italic" : "roman"}.woff2`;
      }
      return "[name][ext]";
    },
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
        test: /\.woff2$/,
        use: [path.join(__dirname, "src", "subset-loader.js")],
        type: "asset/resource",
      },
      {
        test: /\.svg$/,
        issuer: entry.theme,
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
                  jsxRuntimeImport: { source: path.join(__dirname, "src", "xieact.js"), specifiers: ["h"] },
                  state: { componentName: "SvgComponent" },
                },
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: [new RemoveEmptyScriptsPlugin(), new MiniCssExtractPlugin()],
};
