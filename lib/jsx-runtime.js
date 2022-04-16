/* eslint-disable import/prefer-default-export, no-nested-ternary */
/* global document */

// Creates (or reuses) DOM element, sets the properties of `data` as attributes, and appends all `children`.
//
// This is inspired by xeact (https://github.com/Xe/Xeact), with a few changes to support JSX and SVG:
//
// 1. JSX provides child elements as additional arguments, not as a list. (The runtime in React 17 and later provides
//    children as a `children` prop, which means you don't need the spread operator, but whatever.)
// 2. Most SVG attributes need to be set with `Element.setAttribute`. Fortunately, this works well for normal HTML
//    elements as well.
// 3. SVG elements must be created with `document.createElementNS`, so we use that with the right namespace based on a
//    garbage heuristic (does it have `fill` or `d` attributes?).
export function h(name, data, ...children) {
  const element =
    typeof name === "string"
      ? data.fill || data.d
        ? document.createElementNS("http://www.w3.org/2000/svg", name)
        : document.createElement(name)
      : name();
  Object.entries(data).forEach((x) => element.setAttribute(...x));
  element.append(...children);
  return element;
}
