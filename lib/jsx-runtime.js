/* eslint-disable import/prefer-default-export, no-nested-ternary */
/* global document */

export function h(name, data, ...children) {
  const element =
    typeof name === "string"
      ? data.fill || data.d
        ? document.createElementNS("http://www.w3.org/2000/svg", name)
        : document.createElement(name)
      : name;
  Object.entries(data).forEach((x) => element.setAttribute(...x));
  element.append(...children);
  return element;
}
