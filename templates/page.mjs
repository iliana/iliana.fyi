import { html } from "htm/preact";
import Document from "../components/document.mjs";
import Prose from "../components/prose.mjs";
import { SkipNavContent } from "../components/skip-nav.mjs";

export default function Page() {
  return html`
    <${Document}>
      <a href="/" className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold">iliana etaoin</a>
      <${SkipNavContent}>
        <main>
          {% if page.date %}
          <time
            className="block text-sm lg:text-base xl:text-lg 2xl:text-xl my-1 lg:my-1.5 xl:my-2 2xl:my-2.5"
            datetime="{{ page.date | date }}"
          >
            {{ page.date | date(format="%B %e, %Y") }}
          </time>
          {% endif %}
          <${Prose}>
            <h1>{{ page.title }}</h1>
            {{ page.content | safe }}
          <//>
        </main>
      <//>
    <//>
  `;
}
