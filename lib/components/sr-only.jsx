import React from "react";

export default function SrOnly({ children }) {
  return <span className="sr-only">{children}</span>;
}
