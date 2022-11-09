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

import MoonIcon from "heroicons/24/outline/moon.svg";
import SunIcon from "heroicons/24/outline/sun.svg";
import { h } from "./xieact";

const select = (
  <select
    id="theme-selector"
    class="absolute h-full w-full cursor-pointer appearance-none bg-transparent text-base text-transparent"
  >
    <option class="bg-inherit text-inherit" value="light">
      Light theme
    </option>
    <option class="bg-inherit text-inherit" value="dark">
      Dark theme
    </option>
    <option class="bg-inherit text-inherit" value="system">
      System theme
    </option>
  </select>
);

try {
  select.value = window.localStorage.color;
} catch {
  // nothing
}
// eslint-disable-next-line no-multi-assign
document.documentElement.dataset.theme = select.value ||= "system";

select.addEventListener("change", () => {
  document.documentElement.dataset.theme = select.value;
  try {
    window.localStorage.color = select.value;
  } catch {
    // nothing
  }
});

document.body.firstElementChild.prepend(
  <div class="relative float-right">
    <label for="theme-selector" class="sr-only">
      Switch theme
    </label>
    {select}
    <SunIcon focusable={false} class="h-5 dark:hidden lg:h-6 xl:h-7" />
    <MoonIcon focusable={false} class="hidden h-5 dark:block lg:h-6 xl:h-7" />
  </div>
);
