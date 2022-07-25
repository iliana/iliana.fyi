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

const { Declaration } = require("postcss");
const colors = require("tailwindcss/colors");

module.exports = () => ({
  postcssPlugin: "accent",
  AtRule(rule) {
    if (rule.name === "accent") {
      Object.entries(colors[rule.params]).forEach(([shade, hex]) => {
        rule.before(
          new Declaration({
            prop: `--color-accent-${shade}`,
            value: [1, 3, 5].map((x) => parseInt(hex.slice(x, x + 2), 16)).join(" "),
          })
        );
      });
      rule.remove();
    }
  },
});
module.exports.postcss = true;
