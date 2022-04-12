import c from "classnames/dedupe";
import React from "react";

export default function Prose({ className, margins, children }) {
  return (
    <div
      className={c(
        "prose dark:prose-invert lg:prose-lg xl:prose-xl 2xl:prose-2xl prose-a:anchor",
        { "my-5 lg:my-6 xl:my-7 2xl:my-8": margins ?? true },
        className
      )}
    >
      {children}
    </div>
  );
}
