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

// This script is run at the end of page load. It creates and wires up the color scheme toggle button.

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "h" }] */
/* eslint-disable react/jsx-props-no-spreading, react/no-unknown-property, react/react-in-jsx-scope */
/* global document, window, CustomEvent */

import MoonIcon from "heroicons/outline/moon.svg";
import SunIcon from "heroicons/outline/sun.svg";
import { h } from "../xieact";

const button = (<button type="button" class="float-right text-2xl xl:text-3xl">
  <SunIcon class="hidden dark:block h-[1em] w-[1em]" focusable={false} />
  <MoonIcon class="dark:hidden h-[1em] w-[1em]" focusable={false} />
</button>)();
const dispatch = (toggle) => {
  document.dispatchEvent(new CustomEvent("update-color-scheme", { detail: toggle }));
};

// update the button title/aria-label when the color scheme changes
document.addEventListener("update-color-scheme", () => {
  button.title = button.ariaLabel = document.documentElement.classList.contains("dark") ? "Light mode" : "Dark mode";
});
// ensure this listener runs once
dispatch();

// when the color scheme system preference changes, dispatch an event
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", dispatch);

// event handler for explicit user toggle
button.addEventListener("click", () => {
  dispatch(true);

  // try to set the user's explicit preference in local storage
  try {
    window.localStorage.color = document.documentElement.classList.contains("dark") ? "dark" : "light";
  } catch (e) {
    // nothing
  }
});

document.querySelector("body>div").prepend(button);
