/* eslint-disable no-param-reassign */

function prepend(node, sel) {
  if (node.selectors) {
    node.selectors = node.selectors.map((x) => `${sel} ${x}`);
  }
}

module.exports = () => ({
  postcssPlugin: "dark-mangle",
  AtRule(rule) {
    if (rule.name === "media" && rule.params.includes("prefers-color-scheme") && rule.params.includes("dark")) {
      rule.each((child) => {
        const darkNode = child.clone();
        prepend(darkNode, ".dark");
        rule.after(darkNode);
      });
      rule.each((child) => {
        prepend(child, ".no-js");
      });
    }
  },
});
module.exports.postcss = true;
