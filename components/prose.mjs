import { html } from "htm/preact";

export default function Prose({ children }) {
  return html`
    <div
      className="prose dark:prose-invert prose-a:tag-equiv-a lg:prose-lg xl:prose-xl 2xl:prose-2xl my-5 lg:my-6 xl:my-7 2xl:my-8"
    >
      ${children}
    </div>
  `;
}
