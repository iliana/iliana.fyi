import { minifySync } from "@swc/core";
import { html } from "htm/preact";
import { CgDarkMode } from "react-icons/cg/index.js";
import { SkipNavLink } from "./skip-nav.mjs";

export default function Base({ children }) {
  return html`
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>
          {% if section.title %}{{ section.title }} — {% endif %}{% if page.title %}{{ page.title }} — {% endif
          %}iliana.fyi
        </title>
        <link rel="icon" href="/netscape.gif" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="alternate" type="application/atom+xml" href="/atom.xml" />
        <${Script}
          f=${() => {
            document.addEventListener("color-scheme-toggle", (event) => {
              const c = document.documentElement.classList;
              const localScheme = (() => {
                try {
                  return window.localStorage.getItem("color-scheme");
                } catch (e) {
                  return undefined;
                }
              })();

              if (
                event.detail?.e === true
                  ? !c.contains("dark")
                  : localScheme === "dark" ||
                    (localScheme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches)
              ) {
                c.add("dark");
              } else {
                c.remove("dark");
              }
            });
            document.dispatchEvent(new Event("color-scheme-toggle"));
          }}
        />
      </head>
      <body
        class="text-gray-700 dark:text-gray-300 bg-white dark:bg-black text-base lg:text-lg xl:text-xl 2xl:text-2xl leading-relaxed lg:leading-relaxed xl:leading-relaxed 2xl:leading-relaxed p-4 lg:p-6 xl:p-7 2xl:p-8"
      >
        <${SkipNavLink} />
        <div class="2xl:container 2xl:mx-auto">
          <button id="color-scheme-toggle" type="button" className="hidden float-right text-2xl xl:text-3xl">
            <${CgDarkMode} aria-hidden="true" focusable="false" />
          </button>
          ${children}
        </div>
        <${Script}
          f=${() => {
            const c = document.documentElement.classList;
            const button = document.getElementById("color-scheme-toggle");
            const update = (e) => {
              document.dispatchEvent(new CustomEvent("color-scheme-toggle", { detail: { e } }));
              button.title = button.ariaLabel = c.contains("dark") ? "Light mode" : "Dark mode";
            };

            window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", update);

            button.addEventListener("click", () => {
              update(true);
              try {
                window.localStorage.setItem("color-scheme", c.contains("dark") ? "dark" : "light");
              } catch (e) {
                // nothing
              }
            });
            button.classList.remove("hidden");
          }}
        />
      </body>
    </html>
  `;
}

function Script({ f }) {
  const code = minifySync(f.toString(), { mangle: true }).code;
  return html`
    <script dangerouslySetInnerHTML=${{ __html: `(${code})()` }} />
  `;
}
