import React from "react";
import Document from "../components/document";
import Prose from "../components/prose";
import { SkipNavContent } from "../components/skip-nav";

export default function Page() {
  return (
    <Document>
      <a href="/" className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold">
        iliana etaoin
      </a>
      <SkipNavContent>
        <main>
          {"{% if page.date %}"}
          <time
            className="block text-sm lg:text-base xl:text-lg 2xl:text-xl my-1 lg:my-1.5 xl:my-2 2xl:my-2.5"
            dateTime="{{ page.date | date }}"
          >
            {'{{ page.date | date(format="%B %e, %Y") }}'}
          </time>
          {"{% endif %}"}
          <Prose>
            <h1>{"{{ page.title | markdown(inline=true) | safe }}"}</h1>
            {"{{ page.content | safe }}"}
          </Prose>
        </main>
      </SkipNavContent>
    </Document>
  );
}