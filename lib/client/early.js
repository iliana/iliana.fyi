/* global document, window */

export default function early() {
  const c = document.documentElement.classList;
  const f = (event) => {
    let localScheme;
    try {
      localScheme = window.localStorage.color;
    } catch (e) {
      // nothing
    }

    if (
      event.detail
        ? !c.contains("dark")
        : localScheme === "dark" ||
          (localScheme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      c.add("dark");
    } else {
      c.remove("dark");
    }
  };
  f({});
  c.remove("no-js");
  document.addEventListener("update-color-scheme", f);
}
