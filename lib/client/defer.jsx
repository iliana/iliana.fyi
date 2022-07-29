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

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "h" }] */
/* eslint-disable react/no-unknown-property, react/react-in-jsx-scope */
/* global document, window, CustomEvent */

import MoonIcon from "heroicons/outline/moon.svg";
import SunIcon from "heroicons/outline/sun.svg";
import { h } from "../jsx-runtime";

const sun = <SunIcon height="1em" width="1em" aria-hidden focusable={false} />;
const moon = <MoonIcon height="1em" width="1em" aria-hidden focusable={false} />;
const button = (
  <button type="button" class="float-right text-2xl xl:text-3xl">
    {sun}
    {moon}
  </button>
);

const ev = "update-color-scheme";
const isDark = () => document.documentElement.classList.contains("dark");
const update = (toggle) => {
  document.dispatchEvent(new CustomEvent(ev, { detail: toggle }));
};

document.addEventListener(ev, () => {
  (isDark() ? sun : moon).classList.remove("hidden");
  (isDark() ? moon : sun).classList.add("hidden");
  button.title = button.ariaLabel = isDark() ? "Light mode" : "Dark mode";
});
update();

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", update);
button.addEventListener("click", () => {
  update(true);
  try {
    window.localStorage.color = isDark() ? "dark" : "light";
  } catch (e) {
    // nothing
  }
});

document.querySelector("body>div").prepend(button);
