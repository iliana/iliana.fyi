import { transformSync, minifySync } from "@swc/core";
import { html } from "htm/preact";
import { CgDarkMode } from "react-icons/cg/index.js";
import { SkipNavLink } from "./skip-nav.mjs";

export default function Base({ children }) {
  return html`
    <html lang="en" class="no-js">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>
          {% if section.title %}{{ section.title | markdown(inline=true) | striptags }} — {% endif %}{% if page.title
          %}{{ page.title | markdown(inline=true) | striptags }} — {% endif %}iliana.fyi
        </title>
        <link rel="icon" href="/netscape.gif" />
        <link rel="stylesheet" href="/styles.css" />
        <link rel="alternate" type="application/atom+xml" href="/atom.xml" />
        <${Script}
          f=${() => {
            const c = document.documentElement.classList;
            const f = (event) => {
              const localScheme = (() => {
                try {
                  return window.localStorage.color;
                } catch (e) {
                  return undefined;
                }
              })();

              if (
                event?.detail?.toggle === true
                  ? !c.contains("dark")
                  : localScheme === "dark" ||
                    (localScheme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches)
              ) {
                c.add("dark");
              } else {
                c.remove("dark");
              }
            };
            f();
            c.remove("no-js");
            document.addEventListener("update-color-scheme", f);
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
            const ev = "update-color-scheme";
            const c = document.documentElement.classList;
            const button = document.getElementById("color-scheme-toggle");
            document.addEventListener(ev, () => {
              button.title = button.ariaLabel = c.contains("dark") ? "Light mode" : "Dark mode";
            });

            const update = (toggle) => {
              document.dispatchEvent(new CustomEvent(ev, { detail: { toggle } }));
            };

            window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", update);

            button.addEventListener("click", () => {
              update(true);
              try {
                window.localStorage.color = c.contains("dark") ? "dark" : "light";
              } catch (e) {
                // nothing
              }
            });
            button.classList.remove("hidden");
          }}
        />
        <script defer data-domain="iliana.fyi" src="https://plausible.io/js/script.js"></script>
      </body>
    </html>
  `;
}

function Script({ f }) {
  const code = transformSync(`(${f})()`, {
    jsc: {
      minify: { compress: { unsafe_arrows: true }, mangle: true },
    },
    minify: true,
  }).code;
  return html`
    <script dangerouslySetInnerHTML=${{ __html: code }} />
  `;
}
