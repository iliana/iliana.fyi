// Copyright 2022 iliana etaoin
// SPDX-License-Identifier: MIT-0
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

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
