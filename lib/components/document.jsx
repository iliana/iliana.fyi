import c from "classnames/dedupe";
import font from "inter-ui/Inter (web)/Inter-roman.var.woff2";
import "../css/styles.css";
import React from "react";
import early from "../client/early";

export default function Document({ children }) {
  return (
    <html lang="en" className="no-js">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>
          {"{% if section.title %}"}
          {"{{ section.title | markdown(inline=true) | striptags }}"} &mdash; {"{% endif %}"}
          {"{% if page.title %}"}
          {"{{ page.title | markdown(inline=true) | striptags }}"} &mdash; {"{% endif %}"}
          iliana.fyi
        </title>
        <link rel="preload" href={font} as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="icon" href="/netscape.gif" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="alternate" type="application/atom+xml" href="/atom.xml" />
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: `!${early}();` }} />
      </head>
      <body
        className={c(
          "text-gray-700 dark:text-gray-300 bg-white dark:bg-black",
          "text-base lg:text-lg xl:text-xl 2xl:text-2xl",
          "leading-relaxed lg:leading-relaxed xl:leading-relaxed 2xl:leading-relaxed",
          "p-4 lg:p-6 xl:p-7 2xl:p-8"
        )}
      >
        <div className="2xl:container 2xl:mx-auto">{children}</div>
        <script defer src="/script.js" />
        <script defer data-domain="iliana.fyi" src="https://plausible.io/js/script.js" />
      </body>
    </html>
  );
}
