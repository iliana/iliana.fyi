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

/* eslint-disable import/prefer-default-export, no-nested-ternary, prefer-rest-params */
/* global document */

// Creates (or reuses) DOM element, sets the properties of `data` as attributes, and appends all `children`.
//
// This is inspired by xeact (https://github.com/Xe/Xeact), with a few changes to support JSX and SVG:
//
// 1. JSX provides child elements as additional arguments, not as a list.
// 2. Most SVG attributes need to be set with `Element.setAttribute`. Fortunately, this works well for normal HTML
//    elements as well.
// 3. SVG elements must be created with `document.createElementNS`, so we track data.xmlns and pass it to child elements
//    and use `document.createElementNS` when set.
export function h() {
  return (xmlnsParent) => {
    const [name, data, ...children] = arguments;
    const xmlns = data.xmlns || xmlnsParent;
    const element = name.call
      ? name()(xmlns)
      : xmlns
      ? document.createElementNS(xmlns, name)
      : document.createElement(name);
    Object.entries(data).forEach((datum) => element.setAttribute(...datum));
    children.forEach((child) => element.append(child(xmlns)));
    return element;
  };
}
