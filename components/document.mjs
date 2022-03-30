import { minifySync } from "@swc/core";
import { html } from "htm/preact";
import { CgDarkMode } from "react-icons/cg/index.js";
import { SkipNavLink } from "./skip-nav.mjs";

export default function Base({ title, children }) {
  return html`
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title !== undefined ? html`<>{title} &mdash; iliana.fyi</>` : "iliana.fyi"}</title>
        <link rel="icon" href="/netscape.gif" />
        <link rel="stylesheet" href="/styles.css" />
        <${Script}
          f=${() => {
            (window.iliana = {
              c: document.documentElement.classList,
              m: window.matchMedia("(prefers-color-scheme: dark)"),
              s: (explicit) => {
                const { c, m } = window.iliana;
                const localScheme = (() => {
                  try {
                    return window.localStorage.getItem("color-scheme");
                  } catch (e) {
                    return undefined;
                  }
                })();

                if (explicit ? !c.contains("dark") : localScheme === "dark" || (localScheme !== "light" && m.matches)) {
                  c.add("dark");
                } else {
                  c.remove("dark");
                }
              },
            }).s();
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
            const { c, s, m } = window.iliana;
            const button = document.getElementById("color-scheme-toggle");
            const currentlyDark = c.contains("dark");

            const updateButton = () => {
              button.title = button.ariaLabel = currentlyDark ? "Light mode" : "Dark mode";
            };
            updateButton();

            m.addEventListener("change", () => {
              s();
              updateButton();
            });

            button.addEventListener("click", () => {
              try {
                window.localStorage.setItem("color-scheme", currentlyDark ? "light" : "dark");
              } catch (e) {
                // nothing
              }
              s(true);
              updateButton();
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
