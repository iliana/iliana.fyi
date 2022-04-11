import React from "react";
import Avatar from "../components/avatar";
import Document from "../components/document";
import Prose from "../components/prose";

export default function Page() {
  return (
    <Document>
      <a href="/" className="text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold">
        <Avatar page />
        iliana etaoin
      </a>

      <main>
        {"{% if page.date %}"}
        <time
          className="block text-sm lg:text-base xl:text-lg 2xl:text-xl my-1 lg:my-1.5 xl:my-2 2xl:my-2.5"
          dateTime="{{ page.date | date }}"
        >
          {"{{ page.date | date(format=`%B %e, %Y`) }}"}
        </time>
        {"{% endif %}"}
        <Prose>
          <h1>{"{{ page.title | markdown(inline=true) | safe }}"}</h1>
          {"{{ macros::markdown_hacks(input=page.content) }}"}
        </Prose>
      </main>
    </Document>
  );
}
