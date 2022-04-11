/* eslint-disable import/prefer-default-export, no-nested-ternary, prefer-rest-params */
/* global document */

export function h(name, data) {
  const element =
    typeof name === "string"
      ? data.fill
        ? document.createElementNS("http://www.w3.org/2000/svg", name)
        : document.createElement(name)
      : name;
  Object.entries(data).forEach((x) => element.setAttribute(...x));
  element.append(...Array.from(arguments).slice(2));
  return element;
}
