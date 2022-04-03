import React from "react";

export function SkipNavLink() {
  return (
    <a
      href="#start-of-content"
      className="sr-only focus:not-sr-only no-underline focus:absolute focus:top-0 focus:left-0 bg-purple-600 dark:bg-purple-400 text-white dark:text-black focus:p-2 focus:lg:p-3 focus:xl:p-3.5 focus:2xl:p-4"
    >
      Skip to content
    </a>
  );
}

export function SkipNavContent({ children }) {
  return (
    <>
      <div id="start-of-content" tabIndex={-1} aria-hidden="true" />
      {children}
    </>
  );
}