/* eslint-disable no-param-reassign */

module.exports = () => ({
  postcssPlugin: "syntect-bug",
  Rule(rule) {
    if (rule.selector.endsWith(")")) {
      const [open, close] = [/\(/g, /\)/g].map((m) => rule.selector.match(m)?.length ?? 0);
      if (open !== close) {
        rule.selector = rule.selector.slice(0, -1);
      }
    }
  },
});
module.exports.postcss = true;
