const fs = require("fs");
const path = require("path");
const Image = require("@11ty/eleventy-img");
const dayjs = require("dayjs");
const htmlmin = require("html-minifier");
const { optimize } = require("svgo");
const resolveConfig = require("tailwindcss/resolveConfig");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy({ dist: "dist" });
  eleventyConfig.addPassthroughCopy({ static: "." });

  // use unified to process our markdown content
  eleventyConfig.addExtension("md", {
    init: async () => {
      const { unified } = await import("unified");
      this.pipeline = unified()
        .use((await import("remark-parse")).default)
        .use((await import("remark-smartypants")).default)
        .use((await import("remark-gfm")).default)
        .use((await import("remark-rehype")).default, { allowDangerousHtml: true })
        .use((await import("rehype-raw")).default)
        .use((await import("rehype-pretty-code")).default, {
          theme: {
            dark: "github-dark",
            light: "github-light",
          },
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
    const sizes = className
      .split(" ")
      .filter((cl) => cl.match(/h-/))
      .map((cl) => {
        const [a, b] = cl.split(":");
        const px = `${parseInt((b ?? a).split("-")[1], 10) * 4}px`;
        return b === undefined ? px : `(min-width: ${screens[a]}) ${px}`;
      });
    sizes.reverse();
    return Image.generateHTML(await avatarMetadata, {
      class: `inline rounded-full align-top ${className}`,
      alt: "",
      sizes: sizes.join(", "),
    });
  });

  // date formatting filter, similar to tera
  eleventyConfig.addNunjucksFilter("date", (value, formatString) =>
    dayjs(value).format(formatString ?? "YYYY-MM-DDTHH:mm:ssZ")
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
  eleventyConfig.addTransform("htmlmin", (content, outputPath) =>
    outputPath && outputPath.endsWith(".html")
      ? htmlmin.minify(content, {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          decodeEntities: true,
          removeAttributeQuotes: true,
          removeComments: true,
          removeOptionalTags: true,
          sortAttributes: true,
          sortClassName: true,
          useShortDoctype: true,
        })
      : content
  );

  return {
    dir: {
      input: "content",
      output: "public",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
