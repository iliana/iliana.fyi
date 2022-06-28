/* eslint-disable consistent-return, func-names, no-restricted-syntax */

const { execFile } = require("child_process");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { promisify } = require("util");
const fg = require("fast-glob");

async function subset(content) {
  const chars = new Set(`${String.fromCharCode(...Array(0x80).keys())}\u00a0–—‘’“”`);
  const files = fg.stream(["content/**/*.md", "lib/**/*.{css,js,jsx}"], { cwd: path.join(__dirname, "..") });
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
