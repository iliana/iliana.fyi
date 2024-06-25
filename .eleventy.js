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

const fs = require("fs");
const path = require("path");
const Image = require("@11ty/eleventy-img");
const dayjs = require("dayjs");
const htmlmin = require("html-minifier-terser");
const { optimize } = require("svgo");
const resolveConfig = require("tailwindcss/resolveConfig");

dayjs.extend(require("dayjs/plugin/utc"));

function rehypeMultiShikiDrifting({ themes }) {
  const highlightersPromise = import("shiki").then(({ getHighlighter }) =>
    Promise.all(
      Object.entries(themes).map(async ([label, theme]) => ({
        label,
        highlighter: await getHighlighter({ theme }),
      })),
    ),
  );

  return async (tree) => {
    const { selectAll } = await import("hast-util-select");
    const { toString } = await import("hast-util-to-string");
    const highlighters = await highlightersPromise;
    selectAll("code[class*=language-]", tree).forEach((node) => {
      const language = node.properties.className.find((c) => c.startsWith("language-"))?.slice("language-".length);
      if (!language) {
        return;
      }
      const tokenized = [];
      highlighters.forEach(({ label, highlighter }) => {
        highlighter.codeToThemedTokens(toString(node), language).forEach((line, i) => {
          if (!tokenized[i]) {
            tokenized[i] = { content: line.map(({ content }) => content).join(""), themes: {} };
          }
          let pos = 0;
          tokenized[i].themes[label] = line.map((token) => {
            const newToken = { pos, ...token };
            pos += token.content.length;
            return newToken;
          });
        });
      });
      // eslint-disable-next-line no-param-reassign
      node.children = tokenized.flatMap((line) => {
        const allStarts = Object.values(line.themes).flatMap((tokens) => tokens.map(({ pos }) => pos));
        const starts = [...new Set(allStarts)].sort((a, b) => a - b);
        return [
          ...starts.map((pos, i) => {
            const style = Object.entries(line.themes)
              .flatMap(([label, tokens]) => {
                const token = tokens
                  .slice()
                  .reverse()
                  .find((t) => t.pos <= pos);
                return [
                  `--hl-color-${label}:${token.color}`,
                  // eslint-disable-next-line no-bitwise
                  ...(token.fontStyle & 1 ? [`--hl-italic-${label}:italic`] : []),
                  // eslint-disable-next-line no-bitwise
                  ...(token.fontStyle & 2 ? [`--hl-bold-${label}:bold`] : []),
                  // eslint-disable-next-line no-bitwise
                  ...(token.fontStyle & 4 ? [`--hl-underline-${label}:underline`] : []),
                ];
              })
              .sort()
              .join(";");
            return {
              type: "element",
              tagName: "span",
              properties: { style },
              children: [{ type: "text", value: line.content.slice(pos, starts[i + 1]) }],
            };
          }),
          { type: "text", value: "\n" },
        ];
      });
      node.children.pop();
      // eslint-disable-next-line no-param-reassign
      node.properties.dataSyntaxHighlighted = true;
    });
  };
}

module.exports = (eleventyConfig) => {
  ["jpg", "png", "txt", "patch"].forEach((ext) => eleventyConfig.addPassthroughCopy(`content/**/*.${ext}`));
  eleventyConfig.addPassthroughCopy("dist");
  eleventyConfig.addPassthroughCopy({ static: "." });
  eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

  // use unified to process our markdown content
  eleventyConfig.addExtension("md", {
    init: async () => {
      const { unified } = await import("unified");
      const { selectAll } = await import("hast-util-select");
      this.pipeline = unified()
        .use((await import("remark-parse")).default)
        .use((await import("remark-smartypants")).default)
        .use((await import("remark-gfm")).default)
        .use((await import("remark-rehype")).default, { allowDangerousHtml: true })
        .use((await import("rehype-raw")).default)
        .use(rehypeMultiShikiDrifting, { themes: { dark: "github-dark", light: "github-light" } })
        .use(() => async (tree) => {
          selectAll("ili-callout, ili-tangent", tree).forEach((node) => {
            // eslint-disable-next-line no-param-reassign
            node.properties.role = "note";
          });
        })
        .use((await import("rehype-stringify")).default);
    },
    compile: (input) => async () => this.pipeline.process(input),
  });

  // used in atom.njk
  eleventyConfig.addNunjucksFilter("absolute", (url) => new URL(url, "https://iliana.fyi").toString());

  // generate avatar thumbnails and a shortcode for the <picture> tag
  const avatarMetadata = Image(path.join(__dirname, "static", "iliana.png"), {
    widths: [48, 64, 96],
    formats: ["webp", "png"],
    urlPath: "/dist/",
    outputDir: path.join(__dirname, "dist"),
    sharpWebpOptions: {
      effort: 6,
      lossless: true,
      quality: 100,
    },
  });
  eleventyConfig.on("eleventy.before", async () => avatarMetadata);
  eleventyConfig.addNunjucksAsyncShortcode("avatar", async (className) => {
    // eslint-disable-next-line import/extensions
    const { screens } = resolveConfig(await import("./tailwind.config.js")).theme;
    const sizes = className.split(" ").flatMap((cl) => {
      if (!cl.match(/h-/)) {
        return [];
      }
      const [a, b] = cl.split(":");
      const px = `${parseInt((b ?? a).split("-")[1], 10) * 4}px`;
      return [b === undefined ? px : `(min-width: ${screens[a]}) ${px}`];
    });
    sizes.reverse();
    return Image.generateHTML(await avatarMetadata, {
      class: `inline rounded-full align-top ${className}`,
      alt: "",
      sizes: sizes.join(", "),
    });
  });

  // date formatting a la tera
  eleventyConfig.addNunjucksFilter("date", (value, formatString) =>
    dayjs(value)
      .utc()
      .format(formatString ?? "YYYY-MM-DDTHH:mm:ssZ"),
  );

  // SVG icon loader, with svgo. this should be async but you can't use async shortcodes in macros
  eleventyConfig.addNunjucksShortcode("svg", (svgPath, fillCurrent, className) => {
    const realPath = svgPath.includes("/")
      ? path.join(__dirname, "node_modules", svgPath)
      : path.join(__dirname, "content", "_includes", svgPath);
    return optimize(fs.readFileSync(realPath, "utf8"), {
      plugins: [
        { name: "preset-default" },
        {
          name: "removeAttrs",
          params: { attrs: "class" },
        },
        {
          name: "addAttributesToSVGElement",
          params: {
            attribute: {
              class: `mr-1.5 inline h-[1em] w-[1em] ${fillCurrent ? "fill-current" : ""} lg:mr-2 ${className ?? ""}`,
              "aria-hidden": true,
              focusable: false,
            },
          },
        },
      ],
    }).data;
  });

  // minify output HTML
  eleventyConfig.addTransform("htmlmin", async (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) {
      return content;
    }
    const minified = await htmlmin.minify(content, {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      decodeEntities: true,
      removeAttributeQuotes: true,
      removeComments: true,
      removeOptionalTags: true,
      sortAttributes: true,
      sortClassName: true,
      useShortDoctype: true,
    });
    // fix footnote backref emojification
    return minified.replace(/\u21a9/g, "\u21a9\ufe0e");
  });

  return {
    dir: {
      input: "content",
      output: "public",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
