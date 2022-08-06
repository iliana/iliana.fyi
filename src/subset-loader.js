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

/* eslint-disable consistent-return, func-names, no-restricted-syntax */

const { execFile } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { promisify } = require("util");
const fg = require("fast-glob");

async function subset(content) {
  const chars = new Set(`${String.fromCharCode(...Array(0x80).keys())}\u00a0–—‘’“”`);
  const files = fg.stream(["content/**/*.md", "src/**/*.{css,js,jsx}"], { cwd: path.join(__dirname, "..") });
  for await (const file of files) {
    const data = await fs.readFile(path.join(__dirname, "..", file), { encoding: "utf8" });
    [...data].forEach((c) => chars.add(c));
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "subset-loader-"));
  await fs.writeFile(path.join(dir, "font.woff2"), content);
  await promisify(execFile)("pyftsubset", [
    path.join(dir, "font.woff2"),
    "--flavor=woff2",
    `--unicodes=${[...chars].map((c) => `U+${c.codePointAt(0).toString(16)}`).join(",")}`,
    `--layout-features=locl,kern,cv05,cv08,ss03,case`,
  ]);
  const subsetted = await fs.readFile(path.join(dir, "font.subset.woff2"));
  await fs.rm(dir, { recursive: true });
  return subsetted;
}

module.exports = function (content) {
  if (this.mode !== "production") {
    return content;
  }

  const callback = this.async();
  subset(content)
    .then((c) => callback(null, c))
    .catch((e) => callback(e));
};

module.exports.raw = true;
