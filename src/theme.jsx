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

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "(MoonIcon|SunIcon|h)" }] */
/* global document, window */

import MoonIcon from "heroicons/outline/moon.svg";
import SunIcon from "heroicons/outline/sun.svg";
import { h } from "./xieact";

const button = (<button type="button" class="float-right text-2xl xl:text-3xl">
  <SunIcon focusable={false} class="hidden h-[1em] w-[1em] dark:block" />
  <MoonIcon focusable={false} class="h-[1em] w-[1em] dark:hidden" />
</button>)();

const changeTitle = (isDark) => {
  // eslint-disable-next-line no-multi-assign
  button.title = button.ariaLabel = isDark ? "Use light mode" : "Use dark mode";
  return isDark;
};

const handler = () => {
  let localScheme;
  try {
    localScheme = window.localStorage.color;
  } catch {
    // nothing
  }

  if (
    changeTitle(
      localScheme === "dark" || (localScheme !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    )
  ) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

handler();
document.documentElement.classList.remove("no-js");

button.addEventListener("click", () => {
  try {
    window.localStorage.color = changeTitle(document.documentElement.classList.toggle("dark")) ? "dark" : "light";
  } catch {
    // nothing
  }
});
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handler);

// we can get away with `firstChild` instead of `firstElementChild` because we minify html
document.body.firstChild.prepend(button);
