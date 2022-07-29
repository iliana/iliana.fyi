well hey it's my website's source code.

**please don't use this as a template for your website**; there are some ideas in this repository that could be useful to you, but don't just make a website with the same exact design as mine. see [COPYING.md](./COPYING.md) for more details

---

beyond this readme is a rube goldberg machine; here is a brief description:

- webpack runs, generating CSS (via tailwind and postcss), munching javascript, and subsetting fonts;
- webpack also compiles some react components into tera templates (yes, you read that right);
- which are handed off to zola, which parses all the markdown and creates the actual website.

this is clearly a terrible idea but it works and nobody can stop me.
