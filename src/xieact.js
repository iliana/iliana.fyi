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

/* eslint-disable prefer-rest-params */
/* global document */

// This is inspired by Xeact (https://github.com/Xe/Xeact), with a few changes to support JSX and SVG:
//
// 1. JSX (in the classic runtime) provides child elements as additional arguments, not as a list.
// 2. Most SVG attributes need to be set with `Element.setAttribute`. Fortunately, this works well for normal HTML
//    elements as well.

function apply(element, [, data, ...children]) {
  // (`data` is a plain object, so there is no prototype chain to iterate over; these lints do not apply)
  // eslint-disable-next-line guard-for-in, no-restricted-syntax
  for (const key in data) {
    element.setAttribute(key, data[key]);
  }
  element.append(...children);
  return element;
}

// Creates (or reuses) a DOM element, sets the properties of `data` as attributes, and appends all `children`.
export function h(name /* , data, ...children */) {
  return apply(name.call ? name() : document.createElement(name), arguments);
}

// Creates a DOM element with the SVG XML namespace; otherwise the same as `h()`.
export function svg(name /* , data, ...children */) {
  return apply(document.createElementNS("http://www.w3.org/2000/svg", name), arguments);
}
