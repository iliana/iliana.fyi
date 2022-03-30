import { html } from "htm/preact";
import { SkipNavLink } from "./skip-nav.mjs";

export default function Base({ title, children }) {
  return html`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title !== undefined ? html`<>{title} &mdash; iliana.fyi</>` : "iliana.fyi"}</title>
        <link rel="icon" href="/netscape.gif" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body
        class="text-gray-700 dark:text-gray-300 bg-white dark:bg-black text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-relaxed lg:leading-relaxed xl:leading-relaxed 2xl:leading-relaxed p-4 lg:p-6 xl:p-7 2xl:p-8"
      >
        <${SkipNavLink} />
        <div class="2xl:container 2xl:mx-auto">${children}</div>
      </body>
    </html>
  `;
}
