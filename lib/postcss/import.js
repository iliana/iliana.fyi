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

const { readFileSync } = require("fs");
const path = require("path");

function splitOnce(str, delim) {
  const parts = str.split(delim);
  return [parts.shift(), parts.length === 0 ? undefined : parts.join(delim)];
}

module.exports = () => ({
  postcssPlugin: "import",
  AtRule(rule, { AtRule }) {
    if (rule.name === "import") {
      const [quotedPath, media] = splitOnce(rule.params, " ");
      const importPath = path.join(path.dirname(rule.root().source.input.file), quotedPath.slice(1, -1));

      let css;
      try {
        css = readFileSync(importPath, { encoding: "utf8" });
      } catch (error) {
        throw rule.error(`error reading file: ${importPath}`);
      }

      const replacement = media === undefined ? css : new AtRule({ name: "media", params: media }).append(css);
      rule.replaceWith(`${rule.raws.before}${replacement}`);
    }
  },
});
module.exports.postcss = true;
