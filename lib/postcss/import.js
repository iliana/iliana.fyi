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
