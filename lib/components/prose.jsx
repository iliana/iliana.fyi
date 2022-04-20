import c from "classnames/dedupe";
import React from "react";

export default function Prose({ className, children }) {
  return (
    <div className={c("prose dark:prose-invert lg:prose-lg xl:prose-xl 2xl:prose-2xl prose-a:anchor", className)}>
      {children}
    </div>
  );
}
