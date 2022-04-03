module.exports = () => ({
  postcssPlugin: "dark-mangle",
  AtRule(rule, { Rule }) {
    if (rule.name === "media" && rule.params.includes("prefers-color-scheme") && rule.params.includes("dark")) {
      rule.each((child) => {
        const darkNode = child.clone();
        darkNode.selector = `.dark ${darkNode.selector}`;
        rule.after(darkNode);
      });
      rule.each((child) => {
        child.selector = `.no-js ${child.selector}`;
      });
    }
  },
});
module.exports.postcss = true;
