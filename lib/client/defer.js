/* global document, window, CustomEvent */

import SunIcon from "heroicons/outline/sun.svg";
import MoonIcon from "heroicons/solid/moon.svg";
import { h } from "../jsx-runtime";

const iconAttr = { height: "1em", width: "1em", "aria-hidden": true, focusable: false };
const sun = h(SunIcon(), iconAttr);
const moon = h(MoonIcon(), iconAttr);
const button = h("button", { type: "button", class: "float-right text-2xl xl:text-3xl" }, sun, moon);
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
