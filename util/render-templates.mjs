import fs from "fs/promises";
import path from "path";
import render from "preact-render-to-string";

(async () => {
  const dir = new URL("../templates", import.meta.url).pathname;
  const paths = await fs.readdir(dir);
  await Promise.all(
    paths
      .filter((p) => path.extname(p) === ".mjs")
      .map(async (p) => {
        const f = await import(`../templates/${p}`);
        await fs.writeFile(
          path.join(dir, path.format({ ...path.parse(p), base: "", ext: ".html" })),
          `<!DOCTYPE html>${render(f.default())}`
        );
      })
  );
})().catch((e) => {
  console.error(e);
});
